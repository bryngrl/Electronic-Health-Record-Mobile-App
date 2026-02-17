"""
Discharge Planning Model
Handles discharge criteria and discharge instructions
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import relationship
from app.database.base import Base


class DischargePlanning(Base):
    """
    Discharge Planning table for tracking patient discharge readiness and instructions
    Combines discharge criteria (readiness assessment) and discharge instructions (post-discharge care)
    """
    __tablename__ = "discharge_planning"

    id = Column(BIGINT(unsigned=True), primary_key=True, index=True)
    patient_id = Column(BIGINT(unsigned=True), ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Discharge Criteria (Patient readiness assessment)
    criteria_feverRes = Column(String(255), nullable=True)  # Fever resolved status
    criteria_patientCount = Column(String(255), nullable=True)  # Patient cooperation/comprehension level
    criteria_manageFever = Column(String(255), nullable=True)  # Can manage fever indicators
    criteria_manageFever2 = Column(String(255), nullable=True)  # Additional fever management criteria
    
    # Discharge Instructions (Patient education/care directives)
    instruction_med = Column(String(255), nullable=True)  # Medication instructions
    instruction_appointment = Column(String(255), nullable=True)  # Follow-up appointment details
    instruction_fluidIntake = Column(String(255), nullable=True)  # Fluid intake recommendations
    instruction_exposure = Column(String(255), nullable=True)  # Exposure/activity restrictions
    instruction_complications = Column(String(255), nullable=True)  # Warning signs/complications to watch
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<DischargePlanning(id={self.id}, patient_id={self.patient_id})>"
