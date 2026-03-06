from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

from app.database.db import get_db
from app.models.intake_and_output.intake_and_output import IntakeAndOutput
from app.models.patient import Patient
from app.core.cdss_engine import CDSSEngine
from app.routers.doctor import create_doctor_update

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

    model_config = ConfigDict(extra="ignore")


class AssessmentUpdate(BaseModel):
    """Update Assessment fields"""
    oral_intake: Optional[int] = None      # oral intake in mL
    iv_fluids: Optional[int] = None        # IV fluids in mL
    urine_output: Optional[int] = None     # urine output in mL

    model_config = ConfigDict(extra="ignore")


class DiagnosisUpdate(BaseModel):
    """Step 2: Add Diagnosis"""
    diagnosis: str

    model_config = ConfigDict(extra="ignore")


class PlanningUpdate(BaseModel):
    """Step 3: Add Planning"""
    planning: str

    model_config = ConfigDict(extra="ignore")


class InterventionUpdate(BaseModel):
    """Step 4: Add Intervention"""
    intervention: str

    model_config = ConfigDict(extra="ignore")


class EvaluationUpdate(BaseModel):
    """Step 5: Add Evaluation"""
    evaluation: str

    model_config = ConfigDict(extra="ignore")


class IntakeAndOutputRead(BaseModel):
    """Complete ADPIE record"""
    id: int
    patient_id: int
    # Assessment
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
    """
    Run CDSS on assessment inputs using NUMERICAL COMPARISON.
    Evaluates combined fluid intake vs output to determine hydration status.
    """
    oral = data.get("oral_intake") or 0
    iv = data.get("iv_fluids") or 0
    urine = data.get("urine_output") or 0
    total_intake = oral + iv
    
    # Numerical comparison-based alert generation
    alerts = []
    severity = "info"
    
    # CRITICAL: Oliguria (urine output <400 mL in 24hr, <200 mL in 8hr)
    if 0 < urine < 400:
        alerts.append(f"🔴 OLIGURIA ALERT: Urine output {urine}mL (<400mL). Risk of acute kidney injury (AKI).")
        severity = "critical"
    
    # CRITICAL: Anuria (urine output near zero)
    elif urine == 0 and (oral > 0 or iv > 0):
        alerts.append(f"🔴 ANURIA ALERT: No urine output detected despite intake. Risk of acute renal failure.")
        severity = "critical"
    
    # CRITICAL: Severe dehydration (very low intake + very low output)
    elif total_intake < 500 and urine < 500 and (total_intake > 0 or urine > 0):
        alerts.append(f"🔴 SEVERE DEHYDRATION: Intake {total_intake}mL is critically low, output {urine}mL also decreased.")
        severity = "critical"
    
    # WARNING: Fluid overload (high intake + inadequate output)
    elif total_intake > 2500 and urine < 1500:
        alerts.append(f"🟠 FLUID OVERLOAD WARNING: High intake {total_intake}mL vs output {urine}mL.")
        severity = "warning"
    
    # WARNING: Output significantly exceeds intake (potential dehydration or excessive losses)
    elif total_intake > 0 and urine > (total_intake * 1.5):
        alerts.append(f"🟠 OUTPUT EXCEEDS INTAKE: Output {urine}mL >> Intake {total_intake}mL.")
        severity = "warning"
    
    # INFO: Adequate hydration (balanced intake/output)
    elif 1200 <= total_intake <= 2500 and 800 <= urine <= 1500:
        alerts.append(f"✓ Hydration ADEQUATE: Intake {total_intake}mL, Output {urine}mL (balanced).")
        severity = "info"
    
    # INFO: No data yet
    elif total_intake == 0 and urine == 0:
        alerts.append("⚠️ Awaiting intake and output data for assessment.")
        severity = "info"
    
    else:
        alerts.append(f"Intake {total_intake}mL, Output {urine}mL. Continue monitoring I&O trends.")
        severity = "info"
    
    # Combine alerts into single string
    combined_alert = " | ".join(alerts)
    return {"assessment_alert": f"[{severity.upper()}] {combined_alert}"}


# ──────────────── STEP 1: ASSESSMENT ────────────────

@router.post("/", response_model=IntakeAndOutputRead)
def create_intake_and_output(payload: AssessmentCreate, db: Session = Depends(get_db)):
    """Step 1: Create or Update Intake and Output (Assessment). CDSS alerts are auto-generated."""
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.patient_id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    data = payload.model_dump()

    # Run CDSS to generate alerts
    alerts = _run_assessment_cdss(data)

    now = datetime.utcnow()
    # Check for existing record for this patient from today
    today = now.date()
    existing_record = db.query(IntakeAndOutput).filter(
        IntakeAndOutput.patient_id == payload.patient_id,
        func.date(IntakeAndOutput.created_at) == today
    ).first()

    if existing_record:
        # Update
        for key, value in data.items():
            if key != "patient_id":
                setattr(existing_record, key, value)
        for key, value in alerts.items():
            setattr(existing_record, key, value)
        existing_record.updated_at = now
        record = existing_record
    else:
        # Create
        record = IntakeAndOutput(
            **data,
            **alerts,
            created_at=now,
            updated_at=now,
        )
        db.add(record)
        db.flush()

    create_doctor_update(db, payload.patient_id, "Intake and Output", "intake_output", record.id)
    db.commit()
    db.refresh(record)
    return record


@router.post("/check-alerts")
def check_io_alerts(payload: AssessmentCreate):
    """Simulate CDSS alerts for I&O without saving to DB (for real-time UI)."""
    data = payload.model_dump()
    alerts = _run_assessment_cdss(data)
    return alerts


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
    """Get a single record (complete ADPIE) by ID."""
    record = db.query(IntakeAndOutput).filter(IntakeAndOutput.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Intake and output record not found")
    return record


@router.delete("/{record_id}")
def delete_record(record_id: int, db: Session = Depends(get_db)):
    """Delete a record."""
    record = db.query(IntakeAndOutput).filter(IntakeAndOutput.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Intake and output record not found")
    db.delete(record)
    db.commit()
    return {"detail": "Intake and output record deleted"}
