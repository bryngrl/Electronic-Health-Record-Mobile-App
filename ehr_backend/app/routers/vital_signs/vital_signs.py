from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime, date, time

from app.database.db import get_db
from app.models.vital_signs.vital_signs import VitalSigns
from app.models.patient import Patient
from app.core.cdss_engine import CDSSEngine

router = APIRouter(prefix="/vital-signs", tags=["Vital Signs"])

# Initialize the CDSS engines
assessment_engine = CDSSEngine("cdss_rules/vital_signs/assessment.yaml")
diagnosis_engine = CDSSEngine("cdss_rules/dpie/diagnosis.yaml")
planning_engine = CDSSEngine("cdss_rules/dpie/planning.yaml")
intervention_engine = CDSSEngine("cdss_rules/dpie/intervention.yaml")
evaluation_engine = CDSSEngine("cdss_rules/dpie/evaluation.yaml")


# ──────────────── Pydantic Schemas ────────────────

class AssessmentCreate(BaseModel):
    """Step 1: Create Vital Signs (Assessment)"""
    patient_id: int
    date: date
    time: time
    day_no: Optional[int] = None
    temperature: Optional[str] = None
    hr: Optional[str] = None
    rr: Optional[str] = None
    bp: Optional[str] = None
    spo2: Optional[str] = None

    model_config = ConfigDict(extra="forbid")


class AssessmentUpdate(BaseModel):
    """Update Assessment fields"""
    date: Optional[date] = None
    time: Optional[time] = None
    day_no: Optional[int] = None
    temperature: Optional[str] = None
    hr: Optional[str] = None
    rr: Optional[str] = None
    bp: Optional[str] = None
    spo2: Optional[str] = None

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


class VitalSignsRead(BaseModel):
    """Complete ADPIE record"""
    id: int
    patient_id: int
    # Assessment
    date: date
    time: time
    day_no: Optional[int] = None
    temperature: Optional[str] = None
    hr: Optional[str] = None
    rr: Optional[str] = None
    bp: Optional[str] = None
    spo2: Optional[str] = None
    temperature_alert: Optional[str] = None
    hr_alert: Optional[str] = None
    rr_alert: Optional[str] = None
    bp_alert: Optional[str] = None
    spo2_alert: Optional[str] = None
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
    """Run CDSS on assessment fields and return alert values."""
    input_fields = {
        "temperature": data.get("temperature"),
        "hr": data.get("hr"),
        "rr": data.get("rr"),
        "bp": data.get("bp"),
        "spo2": data.get("spo2"),
    }
    return assessment_engine.evaluate(input_fields)


# ──────────────── STEP 1: ASSESSMENT ────────────────

@router.post("/", response_model=VitalSignsRead)
def create_vital_signs(payload: AssessmentCreate, db: Session = Depends(get_db)):
    """Step 1: Create Vital Signs (Assessment). CDSS alerts are auto-generated."""
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.patient_id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    data = payload.model_dump()

    # Run CDSS to generate alerts
    alerts = _run_assessment_cdss(data)

    # Build the record
    now = datetime.utcnow()
    record = VitalSigns(
        **data,
        **alerts,
        created_at=now,
        updated_at=now,
    )

    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.put("/{record_id}/assessment", response_model=VitalSignsRead)
def update_assessment(record_id: int, payload: AssessmentUpdate, db: Session = Depends(get_db)):
    """Update Assessment fields. CDSS alerts are re-generated."""
    record = db.query(VitalSigns).filter(VitalSigns.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vital signs record not found")

    update_data = payload.model_dump(exclude_unset=True)

    # Apply updates
    for key, value in update_data.items():
        setattr(record, key, value)

    # Re-run CDSS with latest values
    current_data = {
        "temperature": record.temperature,
        "hr": record.hr,
        "rr": record.rr,
        "bp": record.bp,
        "spo2": record.spo2,
    }
    alerts = _run_assessment_cdss(current_data)
    for key, value in alerts.items():
        setattr(record, key, value)

    record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(record)
    return record


# ──────────────── STEP 2: DIAGNOSIS ────────────────

@router.put("/{record_id}/diagnosis", response_model=VitalSignsRead)
def add_diagnosis(record_id: int, payload: DiagnosisUpdate, db: Session = Depends(get_db)):
    """Step 2: Add Diagnosis. CDSS alert is auto-generated."""
    record = db.query(VitalSigns).filter(VitalSigns.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vital signs record not found")

    record.diagnosis = payload.diagnosis
    record.diagnosis_alert = diagnosis_engine.evaluate_single(payload.diagnosis) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── STEP 3: PLANNING ────────────────

@router.put("/{record_id}/planning", response_model=VitalSignsRead)
def add_planning(record_id: int, payload: PlanningUpdate, db: Session = Depends(get_db)):
    """Step 3: Add Planning. CDSS alert is auto-generated."""
    record = db.query(VitalSigns).filter(VitalSigns.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vital signs record not found")

    record.planning = payload.planning
    record.planning_alert = planning_engine.evaluate_single(payload.planning) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── STEP 4: INTERVENTION ────────────────

@router.put("/{record_id}/intervention", response_model=VitalSignsRead)
def add_intervention(record_id: int, payload: InterventionUpdate, db: Session = Depends(get_db)):
    """Step 4: Add Intervention. CDSS alert is auto-generated."""
    record = db.query(VitalSigns).filter(VitalSigns.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vital signs record not found")

    record.intervention = payload.intervention
    record.intervention_alert = intervention_engine.evaluate_single(payload.intervention) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── STEP 5: EVALUATION ────────────────

@router.put("/{record_id}/evaluation", response_model=VitalSignsRead)
def add_evaluation(record_id: int, payload: EvaluationUpdate, db: Session = Depends(get_db)):
    """Step 5: Add Evaluation. CDSS alert is auto-generated."""
    record = db.query(VitalSigns).filter(VitalSigns.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vital signs record not found")

    record.evaluation = payload.evaluation
    record.evaluation_alert = evaluation_engine.evaluate_single(payload.evaluation) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── READ ENDPOINTS ────────────────

@router.get("/patient/{patient_id}", response_model=List[VitalSignsRead])
def list_vital_signs_by_patient(patient_id: int, db: Session = Depends(get_db)):
    """Get all vital signs records for a patient."""
    records = (
        db.query(VitalSigns)
        .filter(VitalSigns.patient_id == patient_id)
        .order_by(VitalSigns.created_at.desc())
        .all()
    )
    return records


@router.get("/{record_id}", response_model=VitalSignsRead)
def get_vital_signs(record_id: int, db: Session = Depends(get_db)):
    """Get a single vital signs record (complete ADPIE) by ID."""
    record = db.query(VitalSigns).filter(VitalSigns.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vital signs record not found")
    return record


@router.delete("/{record_id}")
def delete_vital_signs(record_id: int, db: Session = Depends(get_db)):
    """Delete a vital signs record."""
    record = db.query(VitalSigns).filter(VitalSigns.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vital signs record not found")
    db.delete(record)
    db.commit()
    return {"detail": "Vital signs record deleted"}


# ──────────────── EXTRACT & PRINT ────────────────

@router.get("/{record_id}/extract-adpie")
def extract_adpie(record_id: int, db: Session = Depends(get_db)):
    """
    Extract complete ADPIE record and return formatted output.
    Nurse can use this to view/print the full vital signs workflow.
    """
    record = db.query(VitalSigns).filter(VitalSigns.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vital signs record not found")

    # Get patient info
    patient = db.query(Patient).filter(Patient.patient_id == record.patient_id).first()

    return {
        "patient": {
            "id": patient.patient_id,
            "name": f"{patient.first_name} {patient.last_name}",
            "age": patient.age,
            "admission_date": patient.admission_date,
        },
        "vital_signs_id": record.id,
        "adpie": {
            "assessment": {
                "date": record.date,
                "time": record.time,
                "day_no": record.day_no,
                "temperature": record.temperature,
                "temperature_alert": record.temperature_alert,
                "hr": record.hr,
                "hr_alert": record.hr_alert,
                "rr": record.rr,
                "rr_alert": record.rr_alert,
                "bp": record.bp,
                "bp_alert": record.bp_alert,
                "spo2": record.spo2,
                "spo2_alert": record.spo2_alert,
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
