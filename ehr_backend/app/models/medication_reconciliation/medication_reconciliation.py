from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base


class HomeMedication(Base):
    """
    Home Medication - Documents medications taken at HOME (baseline).
    This is the baseline medication list before hospitalization.
    Tracks: medication name, dose, route, frequency, indication, and patient comments.
    """
    
    __tablename__ = "home_medication"
    
    id = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    patient_id = Column(
        BIGINT(unsigned=True),
        ForeignKey("patients.patient_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    home_med = Column(String(255), nullable=True)
    home_dose = Column(String(255), nullable=True)
    home_route = Column(String(255), nullable=True)
    home_frequency = Column(String(255), nullable=True)
    home_indication = Column(String(255), nullable=True)
    home_text = Column(String(255), nullable=True)  # Additional notes/comments
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    patient = relationship("Patient", back_populates="home_medications")


class CurrentMedication(Base):
    """
    Current Medication - Documents medications in HOSPITAL (current state).
    This is the medication list during hospitalization.
    Tracks: medication name, dose, route, frequency, indication, date, and patient comments.
    """
    
    __tablename__ = "current_medication"
    
    id = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    patient_id = Column(
        BIGINT(unsigned=True),
        ForeignKey("patients.patient_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    date = Column(DateTime, nullable=True)
    current_med = Column(String(255), nullable=True)
    current_dose = Column(String(255), nullable=True)
    current_route = Column(String(255), nullable=True)
    current_frequency = Column(String(255), nullable=True)
    current_indication = Column(String(255), nullable=True)
    current_text = Column(String(255), nullable=True)  # Additional notes/comments
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    patient = relationship("Patient", back_populates="current_medications")


class ChangesInMedication(Base):
    """
    Changes in Medication - Documents CHANGES/DISCREPANCIES between home and current.
    This tracks why medications changed (stopped, adjusted, new added, discontinued, etc.).
    Tracks: medication name, dose, route, frequency changes, and reason/description.
    """
    
    __tablename__ = "changes_in_medication"
    
    id = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    patient_id = Column(
        BIGINT(unsigned=True),
        ForeignKey("patients.patient_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    change_med = Column(String(255), nullable=True)
    change_dose = Column(String(255), nullable=True)
    change_route = Column(String(255), nullable=True)
    change_frequency = Column(String(255), nullable=True)
    change_text = Column(String(255), nullable=True)  # Reason for change/discrepancy notes
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    patient = relationship("Patient", back_populates="changes_in_medications")
