from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

from app.database.db import get_db
from app.models.physical_exam.physical_exam import PhysicalExam
from app.models.patient import Patient
from app.core.cdss_engine import CDSSEngine

router = APIRouter(prefix="/physical-exam", tags=["Physical Exam"])

# Initialize the CDSS engine for physical exam assessment
assessment_engine = CDSSEngine("cdss_rules/physical_exam/assessment.yaml")


# ──────────────── Pydantic Schemas ────────────────

class PhysicalExamCreate(BaseModel):
    patient_id: int
    general_appearance: Optional[str] = None
    skin_condition: Optional[str] = None
    eye_condition: Optional[str] = None
    oral_condition: Optional[str] = None
    cardiovascular: Optional[str] = None
    abdomen_condition: Optional[str] = None
    extremities: Optional[str] = None
    neurological: Optional[str] = None

    model_config = ConfigDict(extra="forbid")


class PhysicalExamUpdate(BaseModel):
    general_appearance: Optional[str] = None
    skin_condition: Optional[str] = None
    eye_condition: Optional[str] = None
    oral_condition: Optional[str] = None
    cardiovascular: Optional[str] = None
    abdomen_condition: Optional[str] = None
    extremities: Optional[str] = None
    neurological: Optional[str] = None

    model_config = ConfigDict(extra="forbid")


class PhysicalExamRead(BaseModel):
    id: int
    patient_id: int
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
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ──────────────── Helper ────────────────

def _run_cdss(data: dict) -> dict:
    """Run the CDSS engine on the nurse's input fields and return alert values."""
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


# ──────────────── Endpoints ────────────────

@router.post("/", response_model=PhysicalExamRead)
def create_physical_exam(payload: PhysicalExamCreate, db: Session = Depends(get_db)):
    """Create a physical exam record. CDSS alerts are auto-generated."""
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.patient_id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    data = payload.model_dump()

    # Run CDSS to generate alerts
    alerts = _run_cdss(data)

    # Build the record
    now = datetime.utcnow()
    record = PhysicalExam(
        **data,
        **alerts,
        created_at=now,
        updated_at=now,
    )

    db.add(record)
    db.commit()
    db.refresh(record)
    return record


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
    """Get a single physical exam record by ID."""
    record = db.query(PhysicalExam).filter(PhysicalExam.id == exam_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Physical exam not found")
    return record


@router.put("/{exam_id}", response_model=PhysicalExamRead)
def update_physical_exam(exam_id: int, payload: PhysicalExamUpdate, db: Session = Depends(get_db)):
    """Update a physical exam record. CDSS alerts are re-generated."""
    record = db.query(PhysicalExam).filter(PhysicalExam.id == exam_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Physical exam not found")

    update_data = payload.model_dump(exclude_unset=True)

    # Apply nurse input updates
    for key, value in update_data.items():
        setattr(record, key, value)

    # Re-run CDSS with the latest field values
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
    alerts = _run_cdss(current_data)
    for key, value in alerts.items():
        setattr(record, key, value)

    record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(record)
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
