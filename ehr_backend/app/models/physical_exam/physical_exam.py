from sqlalchemy import Column, String, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import relationship
from app.database.base import Base


class PhysicalExam(Base):
    __tablename__ = "physical_exams"

    id = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    patient_id = Column(BIGINT(unsigned=True), ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)

    # Nurse input fields (assessment)
    general_appearance = Column(String(255), nullable=True)
    skin_condition = Column(String(255), nullable=True)
    eye_condition = Column(String(255), nullable=True)
    oral_condition = Column(String(255), nullable=True)
    cardiovascular = Column(String(255), nullable=True)
    abdomen_condition = Column(String(255), nullable=True)
    extremities = Column(String(255), nullable=True)
    neurological = Column(String(255), nullable=True)

    # CDSS auto-generated alert fields
    general_appearance_alert = Column(String(255), nullable=True)
    skin_alert = Column(String(255), nullable=True)
    eye_alert = Column(String(255), nullable=True)
    oral_alert = Column(String(255), nullable=True)
    cardiovascular_alert = Column(String(255), nullable=True)
    abdomen_alert = Column(String(255), nullable=True)
    extremities_alert = Column(String(255), nullable=True)
    neurological_alert = Column(String(255), nullable=True)

    created_at = Column(TIMESTAMP, nullable=True)
    updated_at = Column(TIMESTAMP, nullable=True)

    # Relationships
    patient = relationship("Patient", back_populates="physical_exams")
    nursing_diagnoses = relationship("NursingDiagnosis", back_populates="physical_exam")
