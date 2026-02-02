from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database.base import Base

class Patient(Base):
    __tablename__ = "patients"

    patient_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    age = Column(Integer, nullable=False)
    sex = Column(String(10), nullable=False)
    address = Column(String(255), nullable=False)
    birth_place = Column(String(150), nullable=False)
    religion = Column(String(100), nullable=True)
    ethnicity = Column(String(100), nullable=True)
    chief_complaints = Column(String(255), nullable=True)
    admission_date = Column(DateTime, nullable=False)
    room_no = Column(String(20), nullable=True)
    bed_no = Column(String(20), nullable=True)
    contact_name = Column(String(150), nullable=True)
    contact_relationship = Column(String(100), nullable=True)
    contact_number = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
