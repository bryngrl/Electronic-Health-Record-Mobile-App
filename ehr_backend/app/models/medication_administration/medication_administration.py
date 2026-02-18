from sqlalchemy import Column, BIGINT, String, Time, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base


class MedicationAdministration(Base):
    """
    Medication Administration Record (MAR)
    Records actual medication administration events for patients.
    Tracks: what medication, dose, route, frequency, time, and date it was given.
    """
    
    __tablename__ = "medication_administrations"
    
    id = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    patient_id = Column(
        BIGINT(unsigned=True),
        ForeignKey("patients.patient_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    medication = Column(String(255), nullable=True)
    dose = Column(String(255), nullable=True)
    route = Column(String(255), nullable=True)  # e.g., oral, IV, IM, SC, topical
    frequency = Column(String(255), nullable=True)  # e.g., once daily, twice daily, as needed
    comments = Column(String(255), nullable=True)
    time = Column(Time, nullable=True)
    date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    patient = relationship("Patient", back_populates="medication_administrations")
