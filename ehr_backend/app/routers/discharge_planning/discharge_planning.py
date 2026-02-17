"""
Discharge Planning Router
Handles discharge criteria and discharge instructions
Pure data entry component - no ADPIE workflow, no auto-generated alerts
"""

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict, Field

from app.database.db import get_db
from app.models.discharge_planning.discharge_planning import DischargePlanning

# ==================== PYDANTIC SCHEMAS ====================

class DischargePlanningCreate(BaseModel):
    """Schema for creating discharge planning records"""
    criteria_feverRes: Optional[str] = Field(None, description="Fever resolved status")
    criteria_patientCount: Optional[str] = Field(None, description="Patient cooperation/comprehension level")
    criteria_manageFever: Optional[str] = Field(None, description="Can manage fever indicators")
    criteria_manageFever2: Optional[str] = Field(None, description="Additional fever management criteria")
    instruction_med: Optional[str] = Field(None, description="Medication instructions")
    instruction_appointment: Optional[str] = Field(None, description="Follow-up appointment details")
    instruction_fluidIntake: Optional[str] = Field(None, description="Fluid intake recommendations")
    instruction_exposure: Optional[str] = Field(None, description="Exposure/activity restrictions")
    instruction_complications: Optional[str] = Field(None, description="Warning signs/complications to watch")


class DischargePlanningUpdate(BaseModel):
    """Schema for updating discharge planning records"""
    criteria_feverRes: Optional[str] = None
    criteria_patientCount: Optional[str] = None
    criteria_manageFever: Optional[str] = None
    criteria_manageFever2: Optional[str] = None
    instruction_med: Optional[str] = None
    instruction_appointment: Optional[str] = None
    instruction_fluidIntake: Optional[str] = None
    instruction_exposure: Optional[str] = None
    instruction_complications: Optional[str] = None


class DischargePlanningRead(BaseModel):
    """Schema for reading discharge planning records"""
    id: int
    patient_id: int
    criteria_feverRes: Optional[str] = None
    criteria_patientCount: Optional[str] = None
    criteria_manageFever: Optional[str] = None
    criteria_manageFever2: Optional[str] = None
    instruction_med: Optional[str] = None
    instruction_appointment: Optional[str] = None
    instruction_fluidIntake: Optional[str] = None
    instruction_exposure: Optional[str] = None
    instruction_complications: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==================== ROUTER SETUP ====================

router = APIRouter(
    prefix="/discharge-planning",
    tags=["Discharge Planning"],
    responses={404: {"description": "Not found"}},
)


# ==================== ENDPOINTS ====================

@router.post("/", response_model=DischargePlanningRead, status_code=status.HTTP_201_CREATED)
def create_discharge_planning(
    patient_id: int,
    discharge_data: DischargePlanningCreate,
    db: Session = Depends(get_db),
):
    """
    Create new discharge planning record for a patient
    
    - **patient_id**: Patient ID (required)
    - **criteria_feverRes**: Fever resolved status (optional)
    - **criteria_patientCount**: Patient cooperation/comprehension level (optional)
    - **criteria_manageFever**: Can manage fever indicators (optional)
    - **criteria_manageFever2**: Additional fever management criteria (optional)
    - **instruction_med**: Medication instructions (optional)
    - **instruction_appointment**: Follow-up appointment details (optional)
    - **instruction_fluidIntake**: Fluid intake recommendations (optional)
    - **instruction_exposure**: Exposure/activity restrictions (optional)
    - **instruction_complications**: Warning signs/complications to watch (optional)
    """
    db_discharge = DischargePlanning(
        patient_id=patient_id,
        criteria_feverRes=discharge_data.criteria_feverRes,
        criteria_patientCount=discharge_data.criteria_patientCount,
        criteria_manageFever=discharge_data.criteria_manageFever,
        criteria_manageFever2=discharge_data.criteria_manageFever2,
        instruction_med=discharge_data.instruction_med,
        instruction_appointment=discharge_data.instruction_appointment,
        instruction_fluidIntake=discharge_data.instruction_fluidIntake,
        instruction_exposure=discharge_data.instruction_exposure,
        instruction_complications=discharge_data.instruction_complications,
    )
    
    db.add(db_discharge)
    db.commit()
    db.refresh(db_discharge)
    
    return db_discharge


@router.get("/patient/{patient_id}", response_model=List[DischargePlanningRead])
def list_patient_discharge_planning(
    patient_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    List all discharge planning records for a patient
    
    - **patient_id**: Patient ID to retrieve records for
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    """
    discharge_records = db.query(DischargePlanning).filter(
        DischargePlanning.patient_id == patient_id
    ).order_by(DischargePlanning.created_at.desc()).offset(skip).limit(limit).all()
    
    return discharge_records


@router.get("/{discharge_id}", response_model=DischargePlanningRead)
def get_discharge_planning(
    discharge_id: int,
    db: Session = Depends(get_db),
):
    """Get single discharge planning record by ID"""
    discharge_record = db.query(DischargePlanning).filter(DischargePlanning.id == discharge_id).first()
    
    if not discharge_record:
        raise HTTPException(status_code=404, detail="Discharge planning record not found")
    
    return discharge_record


@router.put("/{discharge_id}", response_model=DischargePlanningRead)
def update_discharge_planning(
    discharge_id: int,
    update_data: DischargePlanningUpdate,
    db: Session = Depends(get_db),
):
    """
    Update discharge planning record
    
    - **discharge_id**: Discharge planning record ID to update
    - All fields are optional for partial updates
    """
    discharge_record = db.query(DischargePlanning).filter(DischargePlanning.id == discharge_id).first()
    
    if not discharge_record:
        raise HTTPException(status_code=404, detail="Discharge planning record not found")
    
    # Update criteria fields
    if update_data.criteria_feverRes is not None:
        discharge_record.criteria_feverRes = update_data.criteria_feverRes
    
    if update_data.criteria_patientCount is not None:
        discharge_record.criteria_patientCount = update_data.criteria_patientCount
    
    if update_data.criteria_manageFever is not None:
        discharge_record.criteria_manageFever = update_data.criteria_manageFever
    
    if update_data.criteria_manageFever2 is not None:
        discharge_record.criteria_manageFever2 = update_data.criteria_manageFever2
    
    # Update instruction fields
    if update_data.instruction_med is not None:
        discharge_record.instruction_med = update_data.instruction_med
    
    if update_data.instruction_appointment is not None:
        discharge_record.instruction_appointment = update_data.instruction_appointment
    
    if update_data.instruction_fluidIntake is not None:
        discharge_record.instruction_fluidIntake = update_data.instruction_fluidIntake
    
    if update_data.instruction_exposure is not None:
        discharge_record.instruction_exposure = update_data.instruction_exposure
    
    if update_data.instruction_complications is not None:
        discharge_record.instruction_complications = update_data.instruction_complications
    
    discharge_record.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(discharge_record)
    
    return discharge_record


@router.delete("/{discharge_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_discharge_planning(
    discharge_id: int,
    db: Session = Depends(get_db),
):
    """
    Delete discharge planning record
    
    - **discharge_id**: Discharge planning record ID to delete
    """
    discharge_record = db.query(DischargePlanning).filter(DischargePlanning.id == discharge_id).first()
    
    if not discharge_record:
        raise HTTPException(status_code=404, detail="Discharge planning record not found")
    
    db.delete(discharge_record)
    db.commit()
    
    return None
