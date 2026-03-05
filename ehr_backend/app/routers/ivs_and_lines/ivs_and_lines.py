"""
IVs & Lines Router
Handles IV fluid administration tracking
Pure data entry component - no ADPIE workflow, no auto-generated alerts
"""

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict, Field

from app.database.db import get_db
from app.models.ivs_and_lines.ivs_and_lines import IVsAndLines
from app.routers.doctor import create_doctor_update

# ==================== PYDANTIC SCHEMAS ====================

class IVsAndLinesCreate(BaseModel):
    """Schema for creating IV records"""
    iv_fluid: Optional[str] = Field(None, description="Type of IV fluid (e.g., D5W, NS, LR)")
    rate: Optional[str] = Field(None, description="Rate of administration (e.g., 100 ml/hr)")
    site: Optional[str] = Field(None, description="Site of IV insertion (e.g., left hand, right arm)")
    status: Optional[str] = Field(None, description="Status (e.g., running, blocked, discontinued)")


class IVsAndLinesUpdate(BaseModel):
    """Schema for updating IV records"""
    iv_fluid: Optional[str] = None
    rate: Optional[str] = None
    site: Optional[str] = None
    status: Optional[str] = None


class IVsAndLinesRead(BaseModel):
    """Schema for reading IV records"""
    id: int
    patient_id: int
    iv_fluid: Optional[str] = None
    rate: Optional[str] = None
    site: Optional[str] = None
    status: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==================== ROUTER SETUP ====================

router = APIRouter(
    prefix="/ivs-and-lines",
    tags=["IVs & Lines"],
    responses={404: {"description": "Not found"}},
)


# ==================== ENDPOINTS ====================

@router.post("/", response_model=IVsAndLinesRead, status_code=status.HTTP_201_CREATED)
def create_ivs_and_lines(
    patient_id: int,
    ivs_data: IVsAndLinesCreate,
    db: Session = Depends(get_db),
):
    """
    Create new IV and lines record for a patient
    
    - **patient_id**: Patient ID (required)
    - **iv_fluid**: Type of IV fluid (optional)
    - **rate**: Rate of administration (optional)
    - **site**: Site of IV insertion (optional)
    - **status**: Current status (optional)
    """
    db_ivs = IVsAndLines(
        patient_id=patient_id,
        iv_fluid=ivs_data.iv_fluid,
        rate=ivs_data.rate,
        site=ivs_data.site,
        status=ivs_data.status,
    )
    
    db.add(db_ivs)
    create_doctor_update(db, patient_id, "IVs and Lines Updated")
    db.commit()
    db.refresh(db_ivs)
    
    return db_ivs


@router.get("/patient/{patient_id}", response_model=List[IVsAndLinesRead])
def list_patient_ivs(
    patient_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    List all IV and lines records for a patient
    
    - **patient_id**: Patient ID to retrieve records for
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    """
    ivs_records = db.query(IVsAndLines).filter(
        IVsAndLines.patient_id == patient_id
    ).order_by(IVsAndLines.created_at.desc()).offset(skip).limit(limit).all()
    
    return ivs_records


@router.get("/{iv_id}", response_model=IVsAndLinesRead)
def get_ivs_and_lines(
    iv_id: int,
    db: Session = Depends(get_db),
):
    """Get single IV and lines record by ID"""
    ivs_record = db.query(IVsAndLines).filter(IVsAndLines.id == iv_id).first()
    
    if not ivs_record:
        raise HTTPException(status_code=404, detail="IV and lines record not found")
    
    return ivs_record


@router.put("/{iv_id}", response_model=IVsAndLinesRead)
def update_ivs_and_lines(
    iv_id: int,
    update_data: IVsAndLinesUpdate,
    db: Session = Depends(get_db),
):
    """
    Update IV and lines record
    
    - **iv_id**: IV record ID to update
    - **iv_fluid**: Type of IV fluid (optional)
    - **rate**: Rate of administration (optional)
    - **site**: Site of IV insertion (optional)
    - **status**: Current status (optional)
    """
    ivs_record = db.query(IVsAndLines).filter(IVsAndLines.id == iv_id).first()
    
    if not ivs_record:
        raise HTTPException(status_code=404, detail="IV and lines record not found")
    
    # Update fields
    if update_data.iv_fluid is not None:
        ivs_record.iv_fluid = update_data.iv_fluid
    
    if update_data.rate is not None:
        ivs_record.rate = update_data.rate
    
    if update_data.site is not None:
        ivs_record.site = update_data.site
    
    if update_data.status is not None:
        ivs_record.status = update_data.status
    
    ivs_record.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(ivs_record)
    
    return ivs_record


@router.delete("/{iv_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ivs_and_lines(
    iv_id: int,
    db: Session = Depends(get_db),
):
    """
    Delete IV and lines record
    
    - **iv_id**: IV record ID to delete
    """
    ivs_record = db.query(IVsAndLines).filter(IVsAndLines.id == iv_id).first()
    
    if not ivs_record:
        raise HTTPException(status_code=404, detail="IV and lines record not found")
    
    db.delete(ivs_record)
    db.commit()
    
    return None
