"""
Medical History Router
Handles 5 sub-components: PresentIllness, PastMedicalSurgical, Allergies, Vaccination, DevelopmentalHistory
All components are pure data entry/retrieval with Upsert logic (Update or Create)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

from app.database.db import get_db
from app.models.medical_history.medical_history import (
    PresentIllness, PastMedicalSurgical, Allergies, Vaccination, DevelopmentalHistory
)
from app.models.patient import Patient

router = APIRouter(prefix="/medical-history", tags=["Medical History"])


# ──────────────── PRESENT ILLNESS ────────────────

class PresentIllnessCreate(BaseModel):
    """Create Present Illness record"""
    patient_id: int
    condition_name: Optional[str] = None
    description: Optional[str] = None
    medication: Optional[str] = None
    dosage: Optional[str] = None
    side_effect: Optional[str] = None
    comment: Optional[str] = None

    model_config = ConfigDict(extra="ignore")


class PresentIllnessUpdate(BaseModel):
    """Update Present Illness record"""
    condition_name: Optional[str] = None
    description: Optional[str] = None
    medication: Optional[str] = None
    dosage: Optional[str] = None
    side_effect: Optional[str] = None
    comment: Optional[str] = None

    model_config = ConfigDict(extra="ignore")


class PresentIllnessRead(BaseModel):
    """Complete Present Illness record"""
    medical_id: int
    patient_id: int
    condition_name: Optional[str] = None
    description: Optional[str] = None
    medication: Optional[str] = None
    dosage: Optional[str] = None
    side_effect: Optional[str] = None
    comment: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


@router.post("/present-illness", response_model=PresentIllnessRead)
def create_present_illness(payload: PresentIllnessCreate, db: Session = Depends(get_db)):
    """Create or Update a Present Illness record for a patient"""
    patient = db.query(Patient).filter(Patient.patient_id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    now = datetime.utcnow()
    existing_record = db.query(PresentIllness).filter(PresentIllness.patient_id == payload.patient_id).first()

    if existing_record:
        # Update
        update_data = payload.model_dump(exclude={"patient_id"})
        for key, value in update_data.items():
            setattr(existing_record, key, value)
        existing_record.updated_at = now
        record = existing_record
    else:
        # Create
        record = PresentIllness(
            **payload.model_dump(),
            created_at=now,
            updated_at=now,
        )
        db.add(record)
    
    db.commit()
    db.refresh(record)
    return record


@router.put("/present-illness/{medical_id}", response_model=PresentIllnessRead)
def update_present_illness(medical_id: int, payload: PresentIllnessUpdate, db: Session = Depends(get_db)):
    """Update Present Illness record by ID"""
    record = db.query(PresentIllness).filter(PresentIllness.medical_id == medical_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Present Illness record not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(record, key, value)

    record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(record)
    return record


@router.get("/present-illness/patient/{patient_id}", response_model=List[PresentIllnessRead])
def list_present_illness(patient_id: int, db: Session = Depends(get_db)):
    """Get all Present Illness records for a patient"""
    records = db.query(PresentIllness).filter(PresentIllness.patient_id == patient_id).all()
    return records


@router.get("/present-illness/{medical_id}", response_model=PresentIllnessRead)
def get_present_illness(medical_id: int, db: Session = Depends(get_db)):
    """Get a single Present Illness record"""
    record = db.query(PresentIllness).filter(PresentIllness.medical_id == medical_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Present Illness record not found")
    return record


@router.delete("/present-illness/{medical_id}")
def delete_present_illness(medical_id: int, db: Session = Depends(get_db)):
    """Delete a Present Illness record"""
    record = db.query(PresentIllness).filter(PresentIllness.medical_id == medical_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Present Illness record not found")
    db.delete(record)
    db.commit()
    return {"detail": "Present Illness record deleted"}


# ──────────────── PAST MEDICAL/SURGICAL ────────────────

class PastMedicalSurgicalCreate(BaseModel):
    """Create Past Medical/Surgical record"""
    patient_id: int
    condition_name: Optional[str] = None
    description: Optional[str] = None
    medication: Optional[str] = None
    dosage: Optional[str] = None
    side_effect: Optional[str] = None
    comment: Optional[str] = None

    model_config = ConfigDict(extra="ignore")


class PastMedicalSurgicalUpdate(BaseModel):
    """Update Past Medical/Surgical record"""
    condition_name: Optional[str] = None
    description: Optional[str] = None
    medication: Optional[str] = None
    dosage: Optional[str] = None
    side_effect: Optional[str] = None
    comment: Optional[str] = None

    model_config = ConfigDict(extra="ignore")


class PastMedicalSurgicalRead(BaseModel):
    """Complete Past Medical/Surgical record"""
    medical_id: int
    patient_id: int
    condition_name: Optional[str] = None
    description: Optional[str] = None
    medication: Optional[str] = None
    dosage: Optional[str] = None
    side_effect: Optional[str] = None
    comment: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


@router.post("/past-medical-surgical", response_model=PastMedicalSurgicalRead)
def create_past_medical_surgical(payload: PastMedicalSurgicalCreate, db: Session = Depends(get_db)):
    """Create or Update a Past Medical/Surgical record for a patient"""
    patient = db.query(Patient).filter(Patient.patient_id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    now = datetime.utcnow()
    existing_record = db.query(PastMedicalSurgical).filter(PastMedicalSurgical.patient_id == payload.patient_id).first()

    if existing_record:
        # Update
        update_data = payload.model_dump(exclude={"patient_id"})
        for key, value in update_data.items():
            setattr(existing_record, key, value)
        existing_record.updated_at = now
        record = existing_record
    else:
        # Create
        record = PastMedicalSurgical(
            **payload.model_dump(),
            created_at=now,
            updated_at=now,
        )
        db.add(record)
    
    db.commit()
    db.refresh(record)
    return record


@router.put("/past-medical-surgical/{medical_id}", response_model=PastMedicalSurgicalRead)
def update_past_medical_surgical(medical_id: int, payload: PastMedicalSurgicalUpdate, db: Session = Depends(get_db)):
    """Update Past Medical/Surgical record by ID"""
    record = db.query(PastMedicalSurgical).filter(PastMedicalSurgical.medical_id == medical_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Past Medical/Surgical record not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(record, key, value)

    record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(record)
    return record


@router.get("/past-medical-surgical/patient/{patient_id}", response_model=List[PastMedicalSurgicalRead])
def list_past_medical_surgical(patient_id: int, db: Session = Depends(get_db)):
    """Get all Past Medical/Surgical records for a patient"""
    records = db.query(PastMedicalSurgical).filter(PastMedicalSurgical.patient_id == patient_id).all()
    return records


@router.get("/past-medical-surgical/{medical_id}", response_model=PastMedicalSurgicalRead)
def get_past_medical_surgical(medical_id: int, db: Session = Depends(get_db)):
    """Get a single Past Medical/Surgical record"""
    record = db.query(PastMedicalSurgical).filter(PastMedicalSurgical.medical_id == medical_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Past Medical/Surgical record not found")
    return record


@router.delete("/past-medical-surgical/{medical_id}")
def delete_past_medical_surgical(medical_id: int, db: Session = Depends(get_db)):
    """Delete a Past Medical/Surgical record"""
    record = db.query(PastMedicalSurgical).filter(PastMedicalSurgical.medical_id == medical_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Past Medical/Surgical record not found")
    db.delete(record)
    db.commit()
    return {"detail": "Past Medical/Surgical record deleted"}


# ──────────────── ALLERGIES ────────────────

class AllergiesCreate(BaseModel):
    """Create Allergies record"""
    patient_id: int
    condition_name: Optional[str] = None  # e.g., "Penicillin", "Shellfish"
    description: Optional[str] = None      # Reaction details
    medication: Optional[str] = None
    dosage: Optional[str] = None
    side_effect: Optional[str] = None      # Allergic reaction type
    comment: Optional[str] = None

    model_config = ConfigDict(extra="ignore")


class AllergiesUpdate(BaseModel):
    """Update Allergies record"""
    condition_name: Optional[str] = None
    description: Optional[str] = None
    medication: Optional[str] = None
    dosage: Optional[str] = None
    side_effect: Optional[str] = None
    comment: Optional[str] = None

    model_config = ConfigDict(extra="ignore")


class AllergiesRead(BaseModel):
    """Complete Allergies record"""
    medical_id: int
    patient_id: int
    condition_name: Optional[str] = None
    description: Optional[str] = None
    medication: Optional[str] = None
    dosage: Optional[str] = None
    side_effect: Optional[str] = None
    comment: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


@router.post("/allergies", response_model=AllergiesRead)
def create_allergies(payload: AllergiesCreate, db: Session = Depends(get_db)):
    """Create or Update an Allergies record for a patient"""
    patient = db.query(Patient).filter(Patient.patient_id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    now = datetime.utcnow()
    existing_record = db.query(Allergies).filter(Allergies.patient_id == payload.patient_id).first()

    if existing_record:
        # Update
        update_data = payload.model_dump(exclude={"patient_id"})
        for key, value in update_data.items():
            setattr(existing_record, key, value)
        existing_record.updated_at = now
        record = existing_record
    else:
        # Create
        record = Allergies(
            **payload.model_dump(),
            created_at=now,
            updated_at=now,
        )
        db.add(record)
    
    db.commit()
    db.refresh(record)
    return record


@router.put("/allergies/{medical_id}", response_model=AllergiesRead)
def update_allergies(medical_id: int, payload: AllergiesUpdate, db: Session = Depends(get_db)):
    """Update Allergies record by ID"""
    record = db.query(Allergies).filter(Allergies.medical_id == medical_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Allergies record not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(record, key, value)

    record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(record)
    return record


@router.get("/allergies/patient/{patient_id}", response_model=List[AllergiesRead])
def list_allergies(patient_id: int, db: Session = Depends(get_db)):
    """Get all Allergies records for a patient"""
    records = db.query(Allergies).filter(Allergies.patient_id == patient_id).all()
    return records


@router.get("/allergies/{medical_id}", response_model=AllergiesRead)
def get_allergies(medical_id: int, db: Session = Depends(get_db)):
    """Get a single Allergies record"""
    record = db.query(Allergies).filter(Allergies.medical_id == medical_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Allergies record not found")
    return record


@router.delete("/allergies/{medical_id}")
def delete_allergies(medical_id: int, db: Session = Depends(get_db)):
    """Delete an Allergies record"""
    record = db.query(Allergies).filter(Allergies.medical_id == medical_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Allergies record not found")
    db.delete(record)
    db.commit()
    return {"detail": "Allergies record deleted"}


# ──────────────── VACCINATION ────────────────

class VaccinationCreate(BaseModel):
    """Create Vaccination record"""
    patient_id: int
    condition_name: Optional[str] = None  # Vaccine name
    description: Optional[str] = None
    medication: Optional[str] = None      # Vaccine product/batch
    dosage: Optional[str] = None          # Dose info
    side_effect: Optional[str] = None
    comment: Optional[str] = None

    model_config = ConfigDict(extra="ignore")


class VaccinationUpdate(BaseModel):
    """Update Vaccination record"""
    condition_name: Optional[str] = None
    description: Optional[str] = None
    medication: Optional[str] = None
    dosage: Optional[str] = None
    side_effect: Optional[str] = None
    comment: Optional[str] = None

    model_config = ConfigDict(extra="ignore")


class VaccinationRead(BaseModel):
    """Complete Vaccination record"""
    medical_id: int
    patient_id: int
    condition_name: Optional[str] = None
    description: Optional[str] = None
    medication: Optional[str] = None
    dosage: Optional[str] = None
    side_effect: Optional[str] = None
    comment: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


@router.post("/vaccination", response_model=VaccinationRead)
def create_vaccination(payload: VaccinationCreate, db: Session = Depends(get_db)):
    """Create or Update a Vaccination record for a patient"""
    patient = db.query(Patient).filter(Patient.patient_id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    now = datetime.utcnow()
    existing_record = db.query(Vaccination).filter(Vaccination.patient_id == payload.patient_id).first()

    if existing_record:
        # Update
        update_data = payload.model_dump(exclude={"patient_id"})
        for key, value in update_data.items():
            setattr(existing_record, key, value)
        existing_record.updated_at = now
        record = existing_record
    else:
        # Create
        record = Vaccination(
            **payload.model_dump(),
            created_at=now,
            updated_at=now,
        )
        db.add(record)
    
    db.commit()
    db.refresh(record)
    return record


@router.put("/vaccination/{medical_id}", response_model=VaccinationRead)
def update_vaccination(medical_id: int, payload: VaccinationUpdate, db: Session = Depends(get_db)):
    """Update Vaccination record by ID"""
    record = db.query(Vaccination).filter(Vaccination.medical_id == medical_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vaccination record not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(record, key, value)

    record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(record)
    return record


@router.get("/vaccination/patient/{patient_id}", response_model=List[VaccinationRead])
def list_vaccination(patient_id: int, db: Session = Depends(get_db)):
    """Get all Vaccination records for a patient"""
    records = db.query(Vaccination).filter(Vaccination.patient_id == patient_id).all()
    return records


@router.get("/vaccination/{medical_id}", response_model=VaccinationRead)
def get_vaccination(medical_id: int, db: Session = Depends(get_db)):
    """Get a single Vaccination record"""
    record = db.query(Vaccination).filter(Vaccination.medical_id == medical_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vaccination record not found")
    return record


@router.delete("/vaccination/{medical_id}")
def delete_vaccination(medical_id: int, db: Session = Depends(get_db)):
    """Delete a Vaccination record"""
    record = db.query(Vaccination).filter(Vaccination.medical_id == medical_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vaccination record not found")
    db.delete(record)
    db.commit()
    return {"detail": "Vaccination record deleted"}


# ──────────────── DEVELOPMENTAL HISTORY ────────────────

class DevelopmentalHistoryCreate(BaseModel):
    """Create Developmental History record"""
    patient_id: int
    gross_motor: Optional[str] = None
    fine_motor: Optional[str] = None
    language: Optional[str] = None
    cognitive: Optional[str] = None
    social: Optional[str] = None

    model_config = ConfigDict(extra="ignore")


class DevelopmentalHistoryUpdate(BaseModel):
    """Update Developmental History record"""
    gross_motor: Optional[str] = None
    fine_motor: Optional[str] = None
    language: Optional[str] = None
    cognitive: Optional[str] = None
    social: Optional[str] = None

    model_config = ConfigDict(extra="ignore")


class DevelopmentalHistoryRead(BaseModel):
    """Complete Developmental History record"""
    development_id: int
    patient_id: int
    gross_motor: Optional[str] = None
    fine_motor: Optional[str] = None
    language: Optional[str] = None
    cognitive: Optional[str] = None
    social: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


@router.post("/developmental-history", response_model=DevelopmentalHistoryRead)
def create_developmental_history(payload: DevelopmentalHistoryCreate, db: Session = Depends(get_db)):
    """Create or Update a Developmental History record for a patient"""
    patient = db.query(Patient).filter(Patient.patient_id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    now = datetime.utcnow()
    existing_record = db.query(DevelopmentalHistory).filter(DevelopmentalHistory.patient_id == payload.patient_id).first()

    if existing_record:
        # Update
        update_data = payload.model_dump(exclude={"patient_id"})
        for key, value in update_data.items():
            setattr(existing_record, key, value)
        existing_record.updated_at = now
        record = existing_record
    else:
        # Create
        record = DevelopmentalHistory(
            **payload.model_dump(),
            created_at=now,
            updated_at=now,
        )
        db.add(record)
    
    db.commit()
    db.refresh(record)
    return record


@router.put("/developmental-history/{development_id}", response_model=DevelopmentalHistoryRead)
def update_developmental_history(development_id: int, payload: DevelopmentalHistoryUpdate, db: Session = Depends(get_db)):
    """Update Developmental History record by ID"""
    record = db.query(DevelopmentalHistory).filter(DevelopmentalHistory.development_id == development_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Developmental History record not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(record, key, value)

    record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(record)
    return record


@router.get("/developmental-history/patient/{patient_id}", response_model=List[DevelopmentalHistoryRead])
def list_developmental_history(patient_id: int, db: Session = Depends(get_db)):
    """Get all Developmental History records for a patient"""
    records = db.query(DevelopmentalHistory).filter(DevelopmentalHistory.patient_id == patient_id).all()
    return records


@router.get("/developmental-history/{development_id}", response_model=DevelopmentalHistoryRead)
def get_developmental_history(development_id: int, db: Session = Depends(get_db)):
    """Get a single Developmental History record"""
    record = db.query(DevelopmentalHistory).filter(DevelopmentalHistory.development_id == development_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Developmental History record not found")
    return record


@router.delete("/developmental-history/{development_id}")
def delete_developmental_history(development_id: int, db: Session = Depends(get_db)):
    """Delete a Developmental History record"""
    record = db.query(DevelopmentalHistory).filter(DevelopmentalHistory.development_id == development_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Developmental History record not found")
    db.delete(record)
    db.commit()
    return {"detail": "Developmental History record deleted"}


# ──────────────── UNIFIED MEDICAL HISTORY ────────────────

class MedicalHistorySummary(BaseModel):
    """Unified view of all medical history components for a patient"""
    patient_id: int
    present_illness: Optional[PresentIllnessRead] = None
    past_medical_surgical: Optional[PastMedicalSurgicalRead] = None
    allergies: Optional[AllergiesRead] = None
    vaccination: Optional[VaccinationRead] = None
    developmental_history: Optional[DevelopmentalHistoryRead] = None


@router.get("/patient/{patient_id}/summary", response_model=MedicalHistorySummary)
def get_medical_history_summary(patient_id: int, db: Session = Depends(get_db)):
    """Get complete Medical History summary for a patient (all 5 sub-components)"""
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    return {
        "patient_id": patient_id,
        "present_illness": db.query(PresentIllness).filter(PresentIllness.patient_id == patient_id).first(),
        "past_medical_surgical": db.query(PastMedicalSurgical).filter(PastMedicalSurgical.patient_id == patient_id).first(),
        "allergies": db.query(Allergies).filter(Allergies.patient_id == patient_id).first(),
        "vaccination": db.query(Vaccination).filter(Vaccination.patient_id == patient_id).first(),
        "developmental_history": db.query(DevelopmentalHistory).filter(DevelopmentalHistory.patient_id == patient_id).first(),
    }
