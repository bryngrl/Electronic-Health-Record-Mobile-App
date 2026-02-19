from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date, time, datetime
from typing import Optional, List
from app.database.db import get_db
from app.models.medication_administration.medication_administration import MedicationAdministration
from pydantic import BaseModel, ConfigDict

router = APIRouter(prefix="/medication-administration", tags=["Medication Administration"])


# ──────────────── Pydantic Schemas ────────────────

class MedicationAdministrationCreate(BaseModel):
    """Schema for creating a medication administration record."""
    patient_id: int
    medication: Optional[str] = None
    dose: Optional[str] = None
    route: Optional[str] = None
    frequency: Optional[str] = None
    comments: Optional[str] = None
    time: Optional[time] = None
    date: Optional[date] = None


class MedicationAdministrationUpdate(BaseModel):
    """Schema for updating a medication administration record (partial updates allowed)."""
    medication: Optional[str] = None
    dose: Optional[str] = None
    route: Optional[str] = None
    frequency: Optional[str] = None
    comments: Optional[str] = None
    time: Optional[time] = None
    date: Optional[date] = None


class MedicationAdministrationRead(BaseModel):
    """Schema for reading/retrieving a medication administration record."""
    id: int
    patient_id: int
    medication: Optional[str] = None
    dose: Optional[str] = None
    route: Optional[str] = None
    frequency: Optional[str] = None
    comments: Optional[str] = None
    time: Optional[time] = None
    date: Optional[date] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


# ──────────────── CRUD Endpoints ────────────────

@router.post("/", response_model=MedicationAdministrationRead, status_code=201)
def create_medication_administration(
    med_admin: MedicationAdministrationCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new medication administration record.
    
    Records medication administration event with:
    - medication: Name of the medication
    - dose: Amount administered
    - route: Administration route (oral, IV, IM, SC, topical, etc.)
    - frequency: How often given (once daily, twice daily, as needed, etc.)
    - comments: Additional notes
    - time: Time of administration
    - date: Date of administration
    """
    new_record = MedicationAdministration(
        patient_id=med_admin.patient_id,
        medication=med_admin.medication,
        dose=med_admin.dose,
        route=med_admin.route,
        frequency=med_admin.frequency,
        comments=med_admin.comments,
        time=med_admin.time,
        date=med_admin.date
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record


@router.get("/patient/{patient_id}", response_model=List[MedicationAdministrationRead])
def get_patient_medication_administrations(
    patient_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get all medication administration records for a specific patient.
    
    Supports pagination:
    - skip: Number of records to skip (default: 0)
    - limit: Maximum records to return (default: 10, max: 100)
    """
    records = db.query(MedicationAdministration).filter(
        MedicationAdministration.patient_id == patient_id
    ).offset(skip).limit(limit).all()
    return records


@router.get("/{med_admin_id}", response_model=MedicationAdministrationRead)
def get_medication_administration(
    med_admin_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific medication administration record by ID.
    
    Returns detailed information about a single medication administration event.
    """
    record = db.query(MedicationAdministration).filter(
        MedicationAdministration.id == med_admin_id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Medication administration record not found")
    
    return record


@router.put("/{med_admin_id}", response_model=MedicationAdministrationRead)
def update_medication_administration(
    med_admin_id: int,
    update_data: MedicationAdministrationUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a medication administration record.
    
    Supports partial updates - only provided fields are updated.
    """
    record = db.query(MedicationAdministration).filter(
        MedicationAdministration.id == med_admin_id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Medication administration record not found")
    
    # Update only provided fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(record, key, value)
    
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{med_admin_id}", status_code=204)
def delete_medication_administration(
    med_admin_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a medication administration record.
    
    Removes the record from the database permanently.
    """
    record = db.query(MedicationAdministration).filter(
        MedicationAdministration.id == med_admin_id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Medication administration record not found")
    
    db.delete(record)
    db.commit()
    return None
