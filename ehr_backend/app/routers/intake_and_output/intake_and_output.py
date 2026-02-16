from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

from app.database.db import get_db
from app.models.intake_and_output.intake_and_output import IntakeAndOutput
from app.models.patient import Patient
from app.core.cdss_engine import CDSSEngine

router = APIRouter(prefix="/intake-output", tags=["Intake and Output"])

# Initialize the CDSS engines
assessment_engine = CDSSEngine("cdss_rules/intake_and_output/assessment.yaml")
diagnosis_engine = CDSSEngine("cdss_rules/dpie/diagnosis.yaml")
planning_engine = CDSSEngine("cdss_rules/dpie/planning.yaml")
intervention_engine = CDSSEngine("cdss_rules/dpie/intervention.yaml")
evaluation_engine = CDSSEngine("cdss_rules/dpie/evaluation.yaml")


# ──────────────── Pydantic Schemas ────────────────

class AssessmentCreate(BaseModel):
    """Step 1: Create Intake and Output (Assessment)"""
    patient_id: int
    oral_intake: Optional[int] = None      # oral intake in mL
    iv_fluids: Optional[int] = None        # IV fluids in mL
    urine_output: Optional[int] = None     # urine output in mL

    model_config = ConfigDict(extra="forbid")


class AssessmentUpdate(BaseModel):
    """Update Assessment fields"""
    oral_intake: Optional[int] = None      # oral intake in mL
    iv_fluids: Optional[int] = None        # IV fluids in mL
    urine_output: Optional[int] = None     # urine output in mL

    model_config = ConfigDict(extra="forbid")


class DiagnosisUpdate(BaseModel):
    """Step 2: Add Diagnosis"""
    diagnosis: str

    model_config = ConfigDict(extra="forbid")


class PlanningUpdate(BaseModel):
    """Step 3: Add Planning"""
    planning: str

    model_config = ConfigDict(extra="forbid")


class InterventionUpdate(BaseModel):
    """Step 4: Add Intervention"""
    intervention: str

    model_config = ConfigDict(extra="forbid")


class EvaluationUpdate(BaseModel):
    """Step 5: Add Evaluation"""
    evaluation: str

    model_config = ConfigDict(extra="forbid")


class IntakeAndOutputRead(BaseModel):
    """Complete ADPIE record"""
    id: int
    patient_id: int
    # Assessment (combined inputs + combined alert)
    oral_intake: Optional[int] = None
    iv_fluids: Optional[int] = None
    urine_output: Optional[int] = None
    assessment_alert: Optional[str] = None
    # Diagnosis
    diagnosis: Optional[str] = None
    diagnosis_alert: Optional[str] = None
    # Planning
    planning: Optional[str] = None
    planning_alert: Optional[str] = None
    # Intervention
    intervention: Optional[str] = None
    intervention_alert: Optional[str] = None
    # Evaluation
    evaluation: Optional[str] = None
    evaluation_alert: Optional[str] = None
    # Metadata
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ──────────────── Helper ────────────────

def _run_assessment_cdss(data: dict) -> dict:
    """Run CDSS on all 3 assessment inputs and return combined alert."""
    oral = data.get("oral_intake") or 0
    iv = data.get("iv_fluids") or 0
    urine = data.get("urine_output") or 0
    total_intake = oral + iv
    
    # Determine severity and alert based on combination of inputs
    alerts = {}
    
    # Check for oliguria (critical)
    if urine > 0 and urine < 400:
        alerts["severity"] = "critical"
        alerts["alert"] = f"⚠️ OLIGURIA: Urine output {urine}mL (< 400mL). Risk of acute kidney injury. Monitor vital signs and assess hydration status."
    
    # Check for dehydration (low intake + low output)
    elif total_intake < 500 and urine < 800:
        alerts["severity"] = "critical"
        alerts["alert"] = f"⚠️ DEHYDRATION RISK: Total intake {total_intake}mL is low and urine output {urine}mL is decreased. Increase fluid intake and monitor closely."
    
    # Check for fluid overload (high intake + adequate output)
    elif total_intake > 2000 and urine < 1500:
        alerts["severity"] = "warning"
        alerts["alert"] = f"⚠️ FLUID OVERLOAD RISK: High intake ({total_intake}mL) vs lower output ({urine}mL). Monitor for edema, dyspnea, and weight gain."
    
    # Check for adequate hydration
    elif 1000 <= total_intake <= 2000 and 800 <= urine <= 1500:
        alerts["severity"] = "info"
        alerts["alert"] = f"✓ Hydration status adequate: Intake {total_intake}mL, Output {urine}mL. Continue current regimen."
    
    # Low intake but adequate output (may indicate dehydration or catch-up)
    elif total_intake < 1000 and urine > 1000:
        alerts["severity"] = "warning"
        alerts["alert"] = f"⚠️ OUTPUT EXCEEDS INTAKE: Output {urine}mL exceeds intake {total_intake}mL. Increase fluid replacement."
    
    # No data yet
    elif total_intake == 0 and urine == 0:
        alerts["severity"] = "info"
        alerts["alert"] = "Awaiting intake and output data."
    
    else:
        alerts["severity"] = "info"
        alerts["alert"] = f"Intake {total_intake}mL, Output {urine}mL. Continue monitoring."
    
    # Map to database field
    return {"assessment_alert": f"[{alerts['severity'].upper()}] {alerts['alert']}"}


# ──────────────── STEP 1: ASSESSMENT ────────────────

@router.post("/", response_model=IntakeAndOutputRead)
def create_intake_and_output(payload: AssessmentCreate, db: Session = Depends(get_db)):
    """Step 1: Create Intake and Output (Assessment). CDSS alerts are auto-generated."""
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.patient_id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    data = payload.model_dump()

    # Run CDSS to generate alerts
    alerts = _run_assessment_cdss(data)

    # Build the record
    now = datetime.utcnow()
    record = IntakeAndOutput(
        **data,
        **alerts,
        created_at=now,
        updated_at=now,
    )

    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.put("/{record_id}/assessment", response_model=IntakeAndOutputRead)
def update_assessment(record_id: int, payload: AssessmentUpdate, db: Session = Depends(get_db)):
    """Update Assessment fields. CDSS alerts are re-generated."""
    record = db.query(IntakeAndOutput).filter(IntakeAndOutput.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Intake and output record not found")

    update_data = payload.model_dump(exclude_unset=True)

    # Apply updates
    for key, value in update_data.items():
        setattr(record, key, value)

    # Re-run CDSS with latest values
    current_data = {
        "oral_intake": record.oral_intake,
        "iv_fluids": record.iv_fluids,
        "urine_output": record.urine_output,
    }
    alerts = _run_assessment_cdss(current_data)
    for key, value in alerts.items():
        setattr(record, key, value)

    record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(record)
    return record


# ──────────────── STEP 2: DIAGNOSIS ────────────────

@router.put("/{record_id}/diagnosis", response_model=IntakeAndOutputRead)
def add_diagnosis(record_id: int, payload: DiagnosisUpdate, db: Session = Depends(get_db)):
    """Step 2: Add Diagnosis. CDSS alert is auto-generated."""
    record = db.query(IntakeAndOutput).filter(IntakeAndOutput.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Intake and output record not found")

    record.diagnosis = payload.diagnosis
    record.diagnosis_alert = diagnosis_engine.evaluate_single(payload.diagnosis) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── STEP 3: PLANNING ────────────────

@router.put("/{record_id}/planning", response_model=IntakeAndOutputRead)
def add_planning(record_id: int, payload: PlanningUpdate, db: Session = Depends(get_db)):
    """Step 3: Add Planning. CDSS alert is auto-generated."""
    record = db.query(IntakeAndOutput).filter(IntakeAndOutput.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Intake and output record not found")

    record.planning = payload.planning
    record.planning_alert = planning_engine.evaluate_single(payload.planning) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── STEP 4: INTERVENTION ────────────────

@router.put("/{record_id}/intervention", response_model=IntakeAndOutputRead)
def add_intervention(record_id: int, payload: InterventionUpdate, db: Session = Depends(get_db)):
    """Step 4: Add Intervention. CDSS alert is auto-generated."""
    record = db.query(IntakeAndOutput).filter(IntakeAndOutput.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Intake and output record not found")

    record.intervention = payload.intervention
    record.intervention_alert = intervention_engine.evaluate_single(payload.intervention) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── STEP 5: EVALUATION ────────────────

@router.put("/{record_id}/evaluation", response_model=IntakeAndOutputRead)
def add_evaluation(record_id: int, payload: EvaluationUpdate, db: Session = Depends(get_db)):
    """Step 5: Add Evaluation. CDSS alert is auto-generated."""
    record = db.query(IntakeAndOutput).filter(IntakeAndOutput.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Intake and output record not found")

    record.evaluation = payload.evaluation
    record.evaluation_alert = evaluation_engine.evaluate_single(payload.evaluation) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── READ ENDPOINTS ────────────────

@router.get("/patient/{patient_id}", response_model=List[IntakeAndOutputRead])
def list_by_patient(patient_id: int, db: Session = Depends(get_db)):
    """Get all intake and output records for a patient."""
    records = (
        db.query(IntakeAndOutput)
        .filter(IntakeAndOutput.patient_id == patient_id)
        .order_by(IntakeAndOutput.created_at.desc())
        .all()
    )
    return records


@router.get("/{record_id}", response_model=IntakeAndOutputRead)
def get_record(record_id: int, db: Session = Depends(get_db)):
    """Get a single intake and output record (complete ADPIE) by ID."""
    record = db.query(IntakeAndOutput).filter(IntakeAndOutput.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Intake and output record not found")
    return record


@router.get("/{record_id}/extract-adpie")
def extract_adpie(record_id: int, db: Session = Depends(get_db)):
    """
    Extract complete ADPIE record and return formatted output.
    Nurse can use this to view/print the full intake and output workflow.
    """
    record = db.query(IntakeAndOutput).filter(IntakeAndOutput.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Intake and output record not found")

    # Get patient info
    patient = db.query(Patient).filter(Patient.patient_id == record.patient_id).first()

    return {
        "patient": {
            "id": patient.patient_id,
            "name": f"{patient.first_name} {patient.last_name}",
            "age": patient.age,
            "admission_date": patient.admission_date,
        },
        "record_id": record.id,
        "adpie": {
            "assessment": {
                "oral_intake": record.oral_intake,
                "iv_fluids": record.iv_fluids,
                "urine_output": record.urine_output,
                "assessment_alert": record.assessment_alert,
            },
            "diagnosis": {
                "input": record.diagnosis,
                "alert": record.diagnosis_alert,
            },
            "planning": {
                "input": record.planning,
                "alert": record.planning_alert,
            },
            "intervention": {
                "input": record.intervention,
                "alert": record.intervention_alert,
            },
            "evaluation": {
                "input": record.evaluation,
                "alert": record.evaluation_alert,
            },
        },
        "created_at": record.created_at,
        "updated_at": record.updated_at,
    }


@router.delete("/{record_id}")
def delete_record(record_id: int, db: Session = Depends(get_db)):
    """Delete an intake and output record."""
    record = db.query(IntakeAndOutput).filter(IntakeAndOutput.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Intake and output record not found")
    db.delete(record)
    db.commit()
    return {"detail": "Intake and output record deleted"}
