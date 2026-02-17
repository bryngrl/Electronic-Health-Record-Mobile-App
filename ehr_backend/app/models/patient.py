from sqlalchemy import Column, Integer, String, Date, Enum, Text, TIMESTAMP
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import relationship
from app.database.base import Base


class Patient(Base):
    __tablename__ = "patients"

    patient_id = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    middle_name = Column(String(255), nullable=True)
    age = Column(Integer, nullable=False)
    birthdate = Column(Date, nullable=True)
    sex = Column(Enum("Male", "Female", "Other"), nullable=False)
    address = Column(String(255), nullable=True)
    birthplace = Column(String(255), nullable=True)
    religion = Column(String(100), nullable=True)
    ethnicity = Column(String(100), nullable=True)
    chief_complaints = Column(Text, nullable=True)
    admission_date = Column(Date, nullable=False)
    room_no = Column(String(255), nullable=True)
    bed_no = Column(String(255), nullable=True)
    contact_name = Column(String(255), nullable=True)
    contact_relationship = Column(String(255), nullable=True)
    contact_number = Column(String(255), nullable=True)
    user_id = Column(BIGINT(unsigned=True), nullable=False)
    created_at = Column(TIMESTAMP, nullable=True)
    updated_at = Column(TIMESTAMP, nullable=True)
    deleted_at = Column(TIMESTAMP, nullable=True)

    # Relationships
    physical_exams = relationship("PhysicalExam", back_populates="patient")
    intake_and_outputs = relationship("IntakeAndOutput", back_populates="patient")
    adls = relationship("ADL", back_populates="patient")
    lab_values = relationship("LabValues", back_populates="patient")
    medication_administrations = relationship("MedicationAdministration", back_populates="patient")
    home_medications = relationship("HomeMedication", back_populates="patient")
    current_medications = relationship("CurrentMedication", back_populates="patient")
    changes_in_medications = relationship("ChangesInMedication", back_populates="patient")
