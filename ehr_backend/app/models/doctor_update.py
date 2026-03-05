from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import relationship
from app.database.base import Base
import datetime

class DoctorUpdate(Base):
    __tablename__ = "doctor_updates"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(BIGINT(unsigned=True), ForeignKey("patients.patient_id"))
    update_type = Column(String(100)) # e.g., "Vital Signs Updated", "New Lab Result"
    status = Column(String(20), default="Unread") # Unread, Read
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationship to Patient to get the name
    patient = relationship("Patient", back_populates="updates")
