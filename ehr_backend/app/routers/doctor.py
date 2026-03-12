from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.doctor_update import DoctorUpdate
from app.models.patient import Patient
from typing import List

router = APIRouter(prefix="/doctor", tags=["doctor"])

@router.get("/updates")
def get_doctor_updates(db: Session = Depends(get_db)):
    updates = db.query(DoctorUpdate).order_by(DoctorUpdate.created_at.desc()).all()
    
    # Format for frontend
    result = []
    for update in updates:
        result.append({
            "id": str(update.id),
            "patient_id": update.patient_id,
            "patient_name": f"{update.patient.first_name} {update.patient.last_name}",
            "update_type": update.update_type,
            "status": update.status,
            "created_at": update.created_at.isoformat() + "Z"
        })
    return result

@router.put("/updates/{update_id}/read")
def mark_update_as_read(update_id: int, db: Session = Depends(get_db)):
    update = db.query(DoctorUpdate).filter(DoctorUpdate.id == update_id).first()
    if not update:
        raise HTTPException(status_code=404, detail="Update not found")
    
    update.status = "Read"
    db.commit()
    return {"status": "success"}

from datetime import datetime

# Helper function for other parts of the app to create updates
def create_doctor_update(db: Session, patient_id: int, update_type: str):
    # Check if an unread update of the same type already exists for this patient
    existing_update = db.query(DoctorUpdate).filter(
        DoctorUpdate.patient_id == patient_id,
        DoctorUpdate.update_type == update_type,
        DoctorUpdate.status == "Unread"
    ).first()

    if existing_update:
        # Just update the timestamp so it moves to the top of the list
        existing_update.created_at = datetime.utcnow()
        db.commit()
        return existing_update
    
    # Otherwise create a new one
    new_update = DoctorUpdate(
        patient_id=patient_id,
        update_type=update_type,
        status="Unread",
        created_at=datetime.utcnow()
    )
    db.add(new_update)
    db.commit()
    return new_update
