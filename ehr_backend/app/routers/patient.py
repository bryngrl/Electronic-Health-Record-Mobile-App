from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.patient import Patient
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import date, datetime

router = APIRouter(prefix="/patients", tags=["Patients"])

class PatientCreate(BaseModel):
    first_name: str
    last_name: str
    middle_name: Optional[str] = None
    age: int
    birthdate: Optional[date] = None
    sex: str
    address: Optional[str] = None
    birthplace: Optional[str] = None
    religion: Optional[str] = None
    ethnicity: Optional[str] = None
    chief_complaints: Optional[str] = None
    admission_date: date
    room_no: Optional[str] = None
    bed_no: Optional[str] = None
    contact_name: Optional[str] = None
    contact_relationship: Optional[str] = None
    contact_number: Optional[str] = None
    user_id: int
    is_active: Optional[bool] = True
    model_config = ConfigDict(extra="forbid")

class PatientRead(BaseModel):
    patient_id: int
    first_name: str
    last_name: str
    middle_name: Optional[str] = None
    age: int
    birthdate: Optional[date] = None
    sex: str
    address: Optional[str] = None
    birthplace: Optional[str] = None
    religion: Optional[str] = None
    ethnicity: Optional[str] = None
    chief_complaints: Optional[str] = None
    admission_date: Optional[date] = None
    room_no: Optional[str] = None
    bed_no: Optional[str] = None
    contact_name: Optional[str] = None
    contact_relationship: Optional[str] = None
    contact_number: Optional[str] = None
    user_id: int
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

@router.post("/", response_model=PatientRead)
def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    db_patient = Patient(**patient.model_dump())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.get("/", response_model=List[PatientRead])
def list_patients(db: Session = Depends(get_db)):
    return db.query(Patient).all()

@router.get("/{patient_id}", response_model=PatientRead)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.put("/{patient_id}", response_model=PatientRead)
def update_patient(patient_id: int, patient: PatientCreate, db: Session = Depends(get_db)):
    db_patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    for key, value in patient.model_dump().items():
        setattr(db_patient, key, value)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.delete("/{patient_id}")
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    db_patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    db.delete(db_patient)
    db.commit()
    return {"detail": "Patient deleted"}
