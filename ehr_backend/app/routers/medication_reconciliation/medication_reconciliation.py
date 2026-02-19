from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from app.database.db import get_db
from app.models.medication_reconciliation.medication_reconciliation import (
    HomeMedication, CurrentMedication, ChangesInMedication
)
from pydantic import BaseModel, ConfigDict

router = APIRouter(prefix="/medication-reconciliation", tags=["Medication Reconciliation"])


# ──────────────── Pydantic Schemas - Home Medication ────────────────

class HomeMedicationCreate(BaseModel):
    """Schema for creating a home medication record."""
    patient_id: int
    home_med: Optional[str] = None
    home_dose: Optional[str] = None
    home_route: Optional[str] = None
    home_frequency: Optional[str] = None
    home_indication: Optional[str] = None
    home_text: Optional[str] = None


class HomeMedicationUpdate(BaseModel):
    """Schema for updating a home medication record (partial updates allowed)."""
    home_med: Optional[str] = None
    home_dose: Optional[str] = None
    home_route: Optional[str] = None
    home_frequency: Optional[str] = None
    home_indication: Optional[str] = None
    home_text: Optional[str] = None


class HomeMedicationRead(BaseModel):
    """Schema for reading a home medication record."""
    id: int
    patient_id: int
    home_med: Optional[str] = None
    home_dose: Optional[str] = None
    home_route: Optional[str] = None
    home_frequency: Optional[str] = None
    home_indication: Optional[str] = None
    home_text: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


# ──────────────── Pydantic Schemas - Current Medication ────────────────

class CurrentMedicationCreate(BaseModel):
    """Schema for creating a current medication record."""
    patient_id: int
    date: Optional[datetime] = None
    current_med: Optional[str] = None
    current_dose: Optional[str] = None
    current_route: Optional[str] = None
    current_frequency: Optional[str] = None
    current_indication: Optional[str] = None
    current_text: Optional[str] = None


class CurrentMedicationUpdate(BaseModel):
    """Schema for updating a current medication record (partial updates allowed)."""
    date: Optional[datetime] = None
    current_med: Optional[str] = None
    current_dose: Optional[str] = None
    current_route: Optional[str] = None
    current_frequency: Optional[str] = None
    current_indication: Optional[str] = None
    current_text: Optional[str] = None


class CurrentMedicationRead(BaseModel):
    """Schema for reading a current medication record."""
    id: int
    patient_id: int
    date: Optional[datetime] = None
    current_med: Optional[str] = None
    current_dose: Optional[str] = None
    current_route: Optional[str] = None
    current_frequency: Optional[str] = None
    current_indication: Optional[str] = None
    current_text: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


# ──────────────── Pydantic Schemas - Changes in Medication ────────────────

class ChangesInMedicationCreate(BaseModel):
    """Schema for creating a changes in medication record."""
    patient_id: int
    change_med: Optional[str] = None
    change_dose: Optional[str] = None
    change_route: Optional[str] = None
    change_frequency: Optional[str] = None
    change_text: Optional[str] = None


class ChangesInMedicationUpdate(BaseModel):
    """Schema for updating a changes in medication record (partial updates allowed)."""
    change_med: Optional[str] = None
    change_dose: Optional[str] = None
    change_route: Optional[str] = None
    change_frequency: Optional[str] = None
    change_text: Optional[str] = None


class ChangesInMedicationRead(BaseModel):
    """Schema for reading a changes in medication record."""
    id: int
    patient_id: int
    change_med: Optional[str] = None
    change_dose: Optional[str] = None
    change_route: Optional[str] = None
    change_frequency: Optional[str] = None
    change_text: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


# ──────────────── HOME MEDICATION ENDPOINTS (5) ────────────────

@router.post("/home-medication/", response_model=HomeMedicationRead, status_code=201)
def create_home_medication(
    home_med: HomeMedicationCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new home medication record.
    
    Documents medications taken at HOME (baseline).
    This is the baseline medication list before hospitalization.
    """
    new_record = HomeMedication(
        patient_id=home_med.patient_id,
        home_med=home_med.home_med,
        home_dose=home_med.home_dose,
        home_route=home_med.home_route,
        home_frequency=home_med.home_frequency,
        home_indication=home_med.home_indication,
        home_text=home_med.home_text
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record


@router.get("/home-medication/patient/{patient_id}", response_model=List[HomeMedicationRead])
def get_patient_home_medications(
    patient_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get all home medication records for a specific patient.
    
    Supports pagination:
    - skip: Number of records to skip (default: 0)
    - limit: Maximum records to return (default: 10, max: 100)
    """
    records = db.query(HomeMedication).filter(
        HomeMedication.patient_id == patient_id
    ).offset(skip).limit(limit).all()
    return records


@router.get("/home-medication/{home_med_id}", response_model=HomeMedicationRead)
def get_home_medication(
    home_med_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific home medication record by ID."""
    record = db.query(HomeMedication).filter(
        HomeMedication.id == home_med_id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Home medication record not found")
    
    return record


@router.put("/home-medication/{home_med_id}", response_model=HomeMedicationRead)
def update_home_medication(
    home_med_id: int,
    update_data: HomeMedicationUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a home medication record.
    
    Supports partial updates - only provided fields are updated.
    """
    record = db.query(HomeMedication).filter(
        HomeMedication.id == home_med_id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Home medication record not found")
    
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(record, key, value)
    
    db.commit()
    db.refresh(record)
    return record


@router.delete("/home-medication/{home_med_id}", status_code=204)
def delete_home_medication(
    home_med_id: int,
    db: Session = Depends(get_db)
):
    """Delete a home medication record."""
    record = db.query(HomeMedication).filter(
        HomeMedication.id == home_med_id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Home medication record not found")
    
    db.delete(record)
    db.commit()
    return None


# ──────────────── CURRENT MEDICATION ENDPOINTS (5) ────────────────

@router.post("/current-medication/", response_model=CurrentMedicationRead, status_code=201)
def create_current_medication(
    current_med: CurrentMedicationCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new current medication record.
    
    Documents medications in HOSPITAL (current state).
    This is the medication list during hospitalization.
    """
    new_record = CurrentMedication(
        patient_id=current_med.patient_id,
        date=current_med.date,
        current_med=current_med.current_med,
        current_dose=current_med.current_dose,
        current_route=current_med.current_route,
        current_frequency=current_med.current_frequency,
        current_indication=current_med.current_indication,
        current_text=current_med.current_text
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record


@router.get("/current-medication/patient/{patient_id}", response_model=List[CurrentMedicationRead])
def get_patient_current_medications(
    patient_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get all current medication records for a specific patient.
    
    Supports pagination:
    - skip: Number of records to skip (default: 0)
    - limit: Maximum records to return (default: 10, max: 100)
    """
    records = db.query(CurrentMedication).filter(
        CurrentMedication.patient_id == patient_id
    ).offset(skip).limit(limit).all()
    return records


@router.get("/current-medication/{current_med_id}", response_model=CurrentMedicationRead)
def get_current_medication(
    current_med_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific current medication record by ID."""
    record = db.query(CurrentMedication).filter(
        CurrentMedication.id == current_med_id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Current medication record not found")
    
    return record


@router.put("/current-medication/{current_med_id}", response_model=CurrentMedicationRead)
def update_current_medication(
    current_med_id: int,
    update_data: CurrentMedicationUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a current medication record.
    
    Supports partial updates - only provided fields are updated.
    """
    record = db.query(CurrentMedication).filter(
        CurrentMedication.id == current_med_id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Current medication record not found")
    
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(record, key, value)
    
    db.commit()
    db.refresh(record)
    return record


@router.delete("/current-medication/{current_med_id}", status_code=204)
def delete_current_medication(
    current_med_id: int,
    db: Session = Depends(get_db)
):
    """Delete a current medication record."""
    record = db.query(CurrentMedication).filter(
        CurrentMedication.id == current_med_id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Current medication record not found")
    
    db.delete(record)
    db.commit()
    return None


# ──────────────── CHANGES IN MEDICATION ENDPOINTS (5) ────────────────

@router.post("/changes-in-medication/", response_model=ChangesInMedicationRead, status_code=201)
def create_changes_in_medication(
    change: ChangesInMedicationCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new changes in medication record.
    
    Documents CHANGES/DISCREPANCIES between home and current medications.
    Tracks why medications changed (stopped, adjusted, new added, discontinued, etc.).
    """
    new_record = ChangesInMedication(
        patient_id=change.patient_id,
        change_med=change.change_med,
        change_dose=change.change_dose,
        change_route=change.change_route,
        change_frequency=change.change_frequency,
        change_text=change.change_text
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record


@router.get("/changes-in-medication/patient/{patient_id}", response_model=List[ChangesInMedicationRead])
def get_patient_changes_in_medications(
    patient_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get all changes in medication records for a specific patient.
    
    Supports pagination:
    - skip: Number of records to skip (default: 0)
    - limit: Maximum records to return (default: 10, max: 100)
    """
    records = db.query(ChangesInMedication).filter(
        ChangesInMedication.patient_id == patient_id
    ).offset(skip).limit(limit).all()
    return records


@router.get("/changes-in-medication/{change_id}", response_model=ChangesInMedicationRead)
def get_changes_in_medication(
    change_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific changes in medication record by ID."""
    record = db.query(ChangesInMedication).filter(
        ChangesInMedication.id == change_id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Changes in medication record not found")
    
    return record


@router.put("/changes-in-medication/{change_id}", response_model=ChangesInMedicationRead)
def update_changes_in_medication(
    change_id: int,
    update_data: ChangesInMedicationUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a changes in medication record.
    
    Supports partial updates - only provided fields are updated.
    """
    record = db.query(ChangesInMedication).filter(
        ChangesInMedication.id == change_id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Changes in medication record not found")
    
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(record, key, value)
    
    db.commit()
    db.refresh(record)
    return record


@router.delete("/changes-in-medication/{change_id}", status_code=204)
def delete_changes_in_medication(
    change_id: int,
    db: Session = Depends(get_db)
):
    """Delete a changes in medication record."""
    record = db.query(ChangesInMedication).filter(
        ChangesInMedication.id == change_id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Changes in medication record not found")
    
    db.delete(record)
    db.commit()
    return None
