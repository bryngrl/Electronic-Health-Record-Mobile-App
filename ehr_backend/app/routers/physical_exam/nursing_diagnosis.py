from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

from app.database.db import get_db
from app.models.nursing_diagnosis import NursingDiagnosis
from app.models.physical_exam.physical_exam import PhysicalExam
from app.core.cdss_engine import CDSSEngine

router = APIRouter(prefix="/nursing-diagnosis", tags=["Nursing Diagnosis (DPIE)"])

# CDSS engines for each DPIE step (shared across all components)
diagnosis_engine = CDSSEngine("cdss_rules/dpie/diagnosis.yaml")
planning_engine = CDSSEngine("cdss_rules/dpie/planning.yaml")
intervention_engine = CDSSEngine("cdss_rules/dpie/intervention.yaml")
evaluation_engine = CDSSEngine("cdss_rules/dpie/evaluation.yaml")


# ──────────────── Pydantic Schemas ────────────────

class DiagnosisCreate(BaseModel):
    """Step 1 of DPIE: Nurse enters diagnosis text, linked to a component."""
    patient_id: str
    physical_exam_id: Optional[int] = None
    intake_and_output_id: Optional[int] = None
    vital_signs_id: Optional[int] = None
    adl_id: Optional[int] = None
    lab_values_id: Optional[int] = None
    diagnosis: str

    model_config = ConfigDict(extra="forbid")


class PlanningUpdate(BaseModel):
    """Step 2 of DPIE: Nurse enters planning text."""
    planning: str

    model_config = ConfigDict(extra="forbid")


class InterventionUpdate(BaseModel):
    """Step 3 of DPIE: Nurse enters intervention text."""
    intervention: str

    model_config = ConfigDict(extra="forbid")


class EvaluationUpdate(BaseModel):
    """Step 4 of DPIE: Nurse enters evaluation text."""
    evaluation: str

    model_config = ConfigDict(extra="forbid")


class NursingDiagnosisRead(BaseModel):
    id: int
    patient_id: Optional[str] = None
    physical_exam_id: Optional[int] = None
    intake_and_output_id: Optional[int] = None
    vital_signs_id: Optional[int] = None
    adl_id: Optional[int] = None
    lab_values_id: Optional[int] = None
    diagnosis: str
    diagnosis_alert: Optional[str] = None
    planning: Optional[str] = None
    planning_alert: Optional[str] = None
    intervention: Optional[str] = None
    intervention_alert: Optional[str] = None
    evaluation: Optional[str] = None
    evaluation_alert: Optional[str] = None
    rule_file_path: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ──────────────── Step 1: Create Diagnosis ────────────────

@router.post("/", response_model=NursingDiagnosisRead)
def create_nursing_diagnosis(payload: DiagnosisCreate, db: Session = Depends(get_db)):
    """
    Step 1 — Nurse submits a diagnosis linked to a component (e.g. physical_exam_id).
    CDSS auto-generates diagnosis_alert.
    """
    # If linked to physical exam, verify it exists
    if payload.physical_exam_id:
        exam = db.query(PhysicalExam).filter(PhysicalExam.id == payload.physical_exam_id).first()
        if not exam:
            raise HTTPException(status_code=404, detail="Physical exam not found")

    # Run CDSS on the diagnosis text
    diagnosis_alert = diagnosis_engine.evaluate_single(payload.diagnosis)

    now = datetime.utcnow()
    record = NursingDiagnosis(
        **payload.model_dump(),
        diagnosis_alert=diagnosis_alert if diagnosis_alert else None,
        created_at=now,
        updated_at=now,
    )

    db.add(record)
    db.commit()
    db.refresh(record)
    return record


# ──────────────── Step 2: Update Planning ────────────────

@router.put("/{diagnosis_id}/planning", response_model=NursingDiagnosisRead)
def update_planning(diagnosis_id: int, payload: PlanningUpdate, db: Session = Depends(get_db)):
    """
    Step 2 — Nurse submits planning text for an existing nursing diagnosis.
    CDSS auto-generates planning_alert.
    """
    record = db.query(NursingDiagnosis).filter(NursingDiagnosis.id == diagnosis_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Nursing diagnosis not found")

    record.planning = payload.planning
    record.planning_alert = planning_engine.evaluate_single(payload.planning) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── Step 3: Update Intervention ────────────────

@router.put("/{diagnosis_id}/intervention", response_model=NursingDiagnosisRead)
def update_intervention(diagnosis_id: int, payload: InterventionUpdate, db: Session = Depends(get_db)):
    """
    Step 3 — Nurse submits intervention text.
    CDSS auto-generates intervention_alert.
    """
    record = db.query(NursingDiagnosis).filter(NursingDiagnosis.id == diagnosis_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Nursing diagnosis not found")

    record.intervention = payload.intervention
    record.intervention_alert = intervention_engine.evaluate_single(payload.intervention) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── Step 4: Update Evaluation ────────────────

@router.put("/{diagnosis_id}/evaluation", response_model=NursingDiagnosisRead)
def update_evaluation(diagnosis_id: int, payload: EvaluationUpdate, db: Session = Depends(get_db)):
    """
    Step 4 — Nurse submits evaluation text.
    CDSS auto-generates evaluation_alert.
    """
    record = db.query(NursingDiagnosis).filter(NursingDiagnosis.id == diagnosis_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Nursing diagnosis not found")

    record.evaluation = payload.evaluation
    record.evaluation_alert = evaluation_engine.evaluate_single(payload.evaluation) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── Read Endpoints ────────────────

@router.get("/patient/{patient_id}", response_model=List[NursingDiagnosisRead])
def list_by_patient(patient_id: str, db: Session = Depends(get_db)):
    """Get all nursing diagnoses for a patient."""
    records = (
        db.query(NursingDiagnosis)
        .filter(NursingDiagnosis.patient_id == patient_id)
        .order_by(NursingDiagnosis.created_at.desc())
        .all()
    )
    return records


@router.get("/physical-exam/{exam_id}", response_model=List[NursingDiagnosisRead])
def list_by_physical_exam(exam_id: int, db: Session = Depends(get_db)):
    """Get all nursing diagnoses linked to a specific physical exam."""
    records = (
        db.query(NursingDiagnosis)
        .filter(NursingDiagnosis.physical_exam_id == exam_id)
        .order_by(NursingDiagnosis.created_at.desc())
        .all()
    )
    return records


@router.get("/{diagnosis_id}", response_model=NursingDiagnosisRead)
def get_nursing_diagnosis(diagnosis_id: int, db: Session = Depends(get_db)):
    """Get a single nursing diagnosis by ID."""
    record = db.query(NursingDiagnosis).filter(NursingDiagnosis.id == diagnosis_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Nursing diagnosis not found")
    return record


@router.delete("/{diagnosis_id}")
def delete_nursing_diagnosis(diagnosis_id: int, db: Session = Depends(get_db)):
    """Delete a nursing diagnosis record."""
    record = db.query(NursingDiagnosis).filter(NursingDiagnosis.id == diagnosis_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Nursing diagnosis not found")
    db.delete(record)
    db.commit()
    return {"detail": "Nursing diagnosis deleted"}
