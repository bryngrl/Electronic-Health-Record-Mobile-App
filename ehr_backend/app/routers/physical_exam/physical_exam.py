from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

from app.database.db import get_db
from app.models.physical_exam.physical_exam import PhysicalExam
from app.models.patient import Patient
from app.core.cdss_engine import CDSSEngine
from app.routers.doctor import create_doctor_update

router = APIRouter(prefix="/physical-exam", tags=["Physical Exam"])

# Initialize the CDSS engines
assessment_engine = CDSSEngine("cdss_rules/physical_exam/assessment.yaml")
diagnosis_engine = CDSSEngine("cdss_rules/dpie/diagnosis.yaml")
planning_engine = CDSSEngine("cdss_rules/dpie/planning.yaml")
intervention_engine = CDSSEngine("cdss_rules/dpie/intervention.yaml")
evaluation_engine = CDSSEngine("cdss_rules/dpie/evaluation.yaml")


# ──────────────── Pydantic Schemas ────────────────

class AssessmentCreate(BaseModel):
    """Step 1: Create Physical Exam (Assessment)"""
    patient_id: int
    general_appearance: Optional[str] = None
    skin_condition: Optional[str] = None
    eye_condition: Optional[str] = None
    oral_condition: Optional[str] = None
    cardiovascular: Optional[str] = None
    abdomen_condition: Optional[str] = None
    extremities: Optional[str] = None
    neurological: Optional[str] = None

    model_config = ConfigDict(extra="ignore")


class AssessmentUpdate(BaseModel):
    """Update Assessment fields"""
    general_appearance: Optional[str] = None
    skin_condition: Optional[str] = None
    eye_condition: Optional[str] = None
    oral_condition: Optional[str] = None
    cardiovascular: Optional[str] = None
    abdomen_condition: Optional[str] = None
    extremities: Optional[str] = None
    neurological: Optional[str] = None

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


class PhysicalExamRead(BaseModel):
    """Complete ADPIE record"""
    id: int
    patient_id: int
    # Assessment
    general_appearance: Optional[str] = None
    skin_condition: Optional[str] = None
    eye_condition: Optional[str] = None
    oral_condition: Optional[str] = None
    cardiovascular: Optional[str] = None
    abdomen_condition: Optional[str] = None
    extremities: Optional[str] = None
    neurological: Optional[str] = None
    general_appearance_alert: Optional[str] = None
    skin_alert: Optional[str] = None
    eye_alert: Optional[str] = None
    oral_alert: Optional[str] = None
    cardiovascular_alert: Optional[str] = None
    abdomen_alert: Optional[str] = None
    extremities_alert: Optional[str] = None
    neurological_alert: Optional[str] = None
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
        "general_appearance": data.get("general_appearance"),
        "skin_condition": data.get("skin_condition"),
        "eye_condition": data.get("eye_condition"),
        "oral_condition": data.get("oral_condition"),
        "cardiovascular": data.get("cardiovascular"),
        "abdomen_condition": data.get("abdomen_condition"),
        "extremities": data.get("extremities"),
        "neurological": data.get("neurological"),
    }
    return assessment_engine.evaluate(input_fields)


# ──────────────── STEP 1: ASSESSMENT ────────────────

@router.post("/", response_model=PhysicalExamRead)
def create_physical_exam(payload: AssessmentCreate, db: Session = Depends(get_db)):
    """Step 1: Create or Update Physical Exam (Assessment). CDSS alerts are auto-generated."""
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.patient_id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    data = payload.model_dump()

    # Run CDSS to generate alerts
    alerts = _run_assessment_cdss(data)

    now = datetime.utcnow()
    # Check for existing record for this patient on this day (today)
    today = now.date()
    existing_record = db.query(PhysicalExam).filter(
        PhysicalExam.patient_id == payload.patient_id,
        func.date(PhysicalExam.created_at) == today
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
        record = PhysicalExam(
            **data,
            **alerts,
            created_at=now,
            updated_at=now,
        )
        db.add(record)
        # Create an update for the doctor
        create_doctor_update(db, payload.patient_id, "Physical Exam")

    db.commit()
    db.refresh(record)
    return record


@router.post("/check-alerts")
def check_assessment_alerts(payload: AssessmentCreate):
    """Simulate CDSS alerts for Physical Exam without saving to DB (for real-time UI)."""
    data = payload.model_dump()
    alerts = _run_assessment_cdss(data)
    return alerts


@router.put("/{exam_id}/assessment", response_model=PhysicalExamRead)
def update_assessment(exam_id: int, payload: AssessmentUpdate, db: Session = Depends(get_db)):
    """Update Assessment fields. CDSS alerts are re-generated."""
    record = db.query(PhysicalExam).filter(PhysicalExam.id == exam_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Physical exam not found")

    update_data = payload.model_dump(exclude_unset=True)

    # Apply updates
    for key, value in update_data.items():
        setattr(record, key, value)

    # Re-run CDSS with latest values
    current_data = {
        "general_appearance": record.general_appearance,
        "skin_condition": record.skin_condition,
        "eye_condition": record.eye_condition,
        "oral_condition": record.oral_condition,
        "cardiovascular": record.cardiovascular,
        "abdomen_condition": record.abdomen_condition,
        "extremities": record.extremities,
        "neurological": record.neurological,
    }
    alerts = _run_assessment_cdss(current_data)
    for key, value in alerts.items():
        setattr(record, key, value)

    record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(record)
    return record


# ──────────────── STEP 2: DIAGNOSIS ────────────────

@router.put("/{exam_id}/diagnosis", response_model=PhysicalExamRead)
def add_diagnosis(exam_id: int, payload: DiagnosisUpdate, db: Session = Depends(get_db)):
    """Step 2: Add Diagnosis. CDSS alert is auto-generated."""
    record = db.query(PhysicalExam).filter(PhysicalExam.id == exam_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Physical exam not found")

    record.diagnosis = payload.diagnosis
    record.diagnosis_alert = diagnosis_engine.evaluate_single(payload.diagnosis) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── STEP 3: PLANNING ────────────────

@router.put("/{exam_id}/planning", response_model=PhysicalExamRead)
def add_planning(exam_id: int, payload: PlanningUpdate, db: Session = Depends(get_db)):
    """Step 3: Add Planning. CDSS alert is auto-generated."""
    record = db.query(PhysicalExam).filter(PhysicalExam.id == exam_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Physical exam not found")

    record.planning = payload.planning
    record.planning_alert = planning_engine.evaluate_single(payload.planning) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── STEP 4: INTERVENTION ────────────────

@router.put("/{exam_id}/intervention", response_model=PhysicalExamRead)
def add_intervention(exam_id: int, payload: InterventionUpdate, db: Session = Depends(get_db)):
    """Step 4: Add Intervention. CDSS alert is auto-generated."""
    record = db.query(PhysicalExam).filter(PhysicalExam.id == exam_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Physical exam not found")

    record.intervention = payload.intervention
    record.intervention_alert = intervention_engine.evaluate_single(payload.intervention) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── STEP 5: EVALUATION ────────────────

@router.put("/{exam_id}/evaluation", response_model=PhysicalExamRead)
def add_evaluation(exam_id: int, payload: EvaluationUpdate, db: Session = Depends(get_db)):
    """Step 5: Add Evaluation. CDSS alert is auto-generated."""
    record = db.query(PhysicalExam).filter(PhysicalExam.id == exam_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Physical exam not found")

    record.evaluation = payload.evaluation
    record.evaluation_alert = evaluation_engine.evaluate_single(payload.evaluation) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── READ ENDPOINTS ────────────────

@router.get("/patient/{patient_id}", response_model=List[PhysicalExamRead])
def list_physical_exams_by_patient(patient_id: int, db: Session = Depends(get_db)):
    """Get all physical exam records for a patient."""
    records = (
        db.query(PhysicalExam)
        .filter(PhysicalExam.patient_id == patient_id)
        .order_by(PhysicalExam.created_at.desc())
        .all()
    )
    return records


@router.get("/{exam_id}", response_model=PhysicalExamRead)
def get_physical_exam(exam_id: int, db: Session = Depends(get_db)):
    """Get a single physical exam record (complete ADPIE) by ID."""
    record = db.query(PhysicalExam).filter(PhysicalExam.id == exam_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Physical exam not found")
    return record


@router.delete("/{exam_id}")
def delete_physical_exam(exam_id: int, db: Session = Depends(get_db)):
    """Delete a physical exam record."""
    record = db.query(PhysicalExam).filter(PhysicalExam.id == exam_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Physical exam not found")
    db.delete(record)
    db.commit()
    return {"detail": "Physical exam deleted"}


# ──────────────── EXTRACT & PRINT ────────────────

@router.get("/{exam_id}/extract-adpie")
def extract_adpie(exam_id: int, db: Session = Depends(get_db)):
    """
    Extract complete ADPIE record and return formatted output.
    Nurse can use this to view/print the full physical exam workflow.
    """
    record = db.query(PhysicalExam).filter(PhysicalExam.id == exam_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Physical exam not found")

    # Get patient info
    patient = db.query(Patient).filter(Patient.patient_id == record.patient_id).first()

    return {
        "patient": {
            "id": patient.patient_id,
            "name": f"{patient.first_name} {patient.last_name}",
            "age": patient.age,
            "admission_date": patient.admission_date,
        },
        "physical_exam_id": record.id,
        "adpie": {
            "assessment": {
                "general_appearance": record.general_appearance,
                "general_appearance_alert": record.general_appearance_alert,
                "skin_condition": record.skin_condition,
                "skin_alert": record.skin_alert,
                "eye_condition": record.eye_condition,
                "eye_alert": record.eye_alert,
                "oral_condition": record.oral_condition,
                "oral_alert": record.oral_alert,
                "cardiovascular": record.cardiovascular,
                "cardiovascular_alert": record.cardiovascular_alert,
                "abdomen_condition": record.abdomen_condition,
                "abdomen_alert": record.abdomen_alert,
                "extremities": record.extremities,
                "extremities_alert": record.extremities_alert,
                "neurological": record.neurological,
                "neurological_alert": record.neurological_alert,
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
