from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

from app.database.db import get_db
from app.models.adl.adl import ADL
from app.models.patient import Patient
from app.core.cdss_engine import CDSSEngine
from app.routers.doctor import create_doctor_update

router = APIRouter(prefix="/adl", tags=["ADL"])

# Initialize the CDSS engines
assessment_engine = CDSSEngine("cdss_rules/adl/assessment.yaml")
diagnosis_engine = CDSSEngine("cdss_rules/dpie/diagnosis.yaml")
planning_engine = CDSSEngine("cdss_rules/dpie/planning.yaml")
intervention_engine = CDSSEngine("cdss_rules/dpie/intervention.yaml")
evaluation_engine = CDSSEngine("cdss_rules/dpie/evaluation.yaml")


# ──────────────── Pydantic Schemas ────────────────

class AssessmentCreate(BaseModel):
    """Step 1: Create ADL Assessment"""
    patient_id: int
    mobility: Optional[str] = None
    hygiene: Optional[str] = None
    toileting: Optional[str] = None
    feeding: Optional[str] = None
    hydration: Optional[str] = None
    sleep_pattern: Optional[str] = None
    pain_level: Optional[str] = None

    model_config = ConfigDict(extra="ignore")


class AssessmentUpdate(BaseModel):
    """Update Assessment fields"""
    mobility: Optional[str] = None
    hygiene: Optional[str] = None
    toileting: Optional[str] = None
    feeding: Optional[str] = None
    hydration: Optional[str] = None
    sleep_pattern: Optional[str] = None
    pain_level: Optional[str] = None

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


class ADLRead(BaseModel):
    """Complete ADL ADPIE record"""
    id: int
    patient_id: int
    # Assessment
    mobility: Optional[str] = None
    mobility_alert: Optional[str] = None
    hygiene: Optional[str] = None
    hygiene_alert: Optional[str] = None
    toileting: Optional[str] = None
    toileting_alert: Optional[str] = None
    feeding: Optional[str] = None
    feeding_alert: Optional[str] = None
    hydration: Optional[str] = None
    hydration_alert: Optional[str] = None
    sleep_pattern: Optional[str] = None
    sleep_pattern_alert: Optional[str] = None
    pain_level: Optional[str] = None
    pain_level_alert: Optional[str] = None
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
    """Run CDSS on each assessment field and return individual alerts."""
    assessment_fields = {
        "mobility": data.get("mobility"),
        "hygiene": data.get("hygiene"),
        "toileting": data.get("toileting"),
        "feeding": data.get("feeding"),
        "hydration": data.get("hydration"),
        "sleep_pattern": data.get("sleep_pattern"),
        "pain_level": data.get("pain_level"),
    }
    return assessment_engine.evaluate(assessment_fields)


# ──────────────── STEP 1: ASSESSMENT ────────────────

@router.post("/", response_model=ADLRead)
def create_adl(payload: AssessmentCreate, db: Session = Depends(get_db)):
    """Step 1: Create or Update ADL Assessment. CDSS alerts are auto-generated."""
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
    existing_record = db.query(ADL).filter(
        ADL.patient_id == payload.patient_id,
        func.date(ADL.created_at) == today
    ).first()

    if existing_record:
        # Update existing
        for key, value in data.items():
            if key != "patient_id":
                setattr(existing_record, key, value)
        for key, value in alerts.items():
            setattr(existing_record, key, value)
        existing_record.updated_at = now
        record = existing_record
    else:
        # Create new
        record = ADL(
            **data,
            **alerts,
            created_at=now,
            updated_at=now,
        )
        db.add(record)

    create_doctor_update(db, payload.patient_id, "ADL")
    db.commit()
    db.refresh(record)
    return record


@router.post("/check-alerts")
def check_adl_alerts(payload: AssessmentCreate):
    """Simulate CDSS alerts for ADL without saving to DB (for real-time UI)."""
    data = payload.model_dump()
    alerts = _run_assessment_cdss(data)
    return alerts


@router.put("/{record_id}/assessment", response_model=ADLRead)
def update_assessment(record_id: int, payload: AssessmentUpdate, db: Session = Depends(get_db)):
    """Update Assessment fields. CDSS alerts are re-generated."""
    record = db.query(ADL).filter(ADL.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="ADL record not found")

    update_data = payload.model_dump(exclude_unset=True)

    # Apply updates
    for key, value in update_data.items():
        setattr(record, key, value)

    # Re-run CDSS with latest values
    current_data = {
        "mobility": record.mobility,
        "hygiene": record.hygiene,
        "toileting": record.toileting,
        "feeding": record.feeding,
        "hydration": record.hydration,
        "sleep_pattern": record.sleep_pattern,
        "pain_level": record.pain_level,
    }
    alerts = _run_assessment_cdss(current_data)
    for key, value in alerts.items():
        setattr(record, key, value)

    record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(record)
    return record


# ──────────────── STEP 2: DIAGNOSIS ────────────────

@router.put("/{record_id}/diagnosis", response_model=ADLRead)
def add_diagnosis(record_id: int, payload: DiagnosisUpdate, db: Session = Depends(get_db)):
    """Step 2: Add Diagnosis."""
    record = db.query(ADL).filter(ADL.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="ADL record not found")

    record.diagnosis = payload.diagnosis
    record.diagnosis_alert = diagnosis_engine.evaluate_single(payload.diagnosis) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── STEP 3: PLANNING ────────────────

@router.put("/{record_id}/planning", response_model=ADLRead)
def add_planning(record_id: int, payload: PlanningUpdate, db: Session = Depends(get_db)):
    """Step 3: Add Planning."""
    record = db.query(ADL).filter(ADL.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="ADL record not found")

    record.planning = payload.planning
    record.planning_alert = planning_engine.evaluate_single(payload.planning) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── STEP 4: INTERVENTION ────────────────

@router.put("/{record_id}/intervention", response_model=ADLRead)
def add_intervention(record_id: int, payload: InterventionUpdate, db: Session = Depends(get_db)):
    """Step 4: Add Intervention."""
    record = db.query(ADL).filter(ADL.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="ADL record not found")

    record.intervention = payload.intervention
    record.intervention_alert = intervention_engine.evaluate_single(payload.intervention) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── STEP 5: EVALUATION ────────────────

@router.put("/{record_id}/evaluation", response_model=ADLRead)
def add_evaluation(record_id: int, payload: EvaluationUpdate, db: Session = Depends(get_db)):
    """Step 5: Add Evaluation."""
    record = db.query(ADL).filter(ADL.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="ADL record not found")

    record.evaluation = payload.evaluation
    record.evaluation_alert = evaluation_engine.evaluate_single(payload.evaluation) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── READ ENDPOINTS ────────────────

@router.get("/patient/{patient_id}", response_model=List[ADLRead])
def list_by_patient(patient_id: int, db: Session = Depends(get_db)):
    """Get all ADL assessments for a patient."""
    records = (
        db.query(ADL)
        .filter(ADL.patient_id == patient_id)
        .order_by(ADL.created_at.desc())
        .all()
    )
    return records


@router.get("/{record_id}", response_model=ADLRead)
def get_record(record_id: int, db: Session = Depends(get_db)):
    """Get a single ADL record by ID."""
    record = db.query(ADL).filter(ADL.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="ADL record not found")
    return record


@router.delete("/{record_id}")
def delete_record(record_id: int, db: Session = Depends(get_db)):
    """Delete an ADL record."""
    record = db.query(ADL).filter(ADL.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="ADL record not found")
    db.delete(record)
    db.commit()
    return {"detail": "ADL record deleted"}
