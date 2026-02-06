from sqlalchemy import Column, String, Text, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import relationship
from app.database.base import Base


class NursingDiagnosis(Base):
    __tablename__ = "nursing_diagnoses"

    id = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    patient_id = Column(String(255), nullable=True)

    # Foreign keys to each component
    physical_exam_id = Column(BIGINT(unsigned=True), ForeignKey("physical_exams.id", ondelete="CASCADE"), nullable=True)
    intake_and_output_id = Column(BIGINT, nullable=True)
    vital_signs_id = Column(BIGINT, nullable=True)
    adl_id = Column(BIGINT, nullable=True)
    lab_values_id = Column(BIGINT, nullable=True)

    # DPIE fields: nurse input + CDSS auto-generated alert
    diagnosis = Column(Text, nullable=False)
    diagnosis_alert = Column(Text, nullable=True)

    planning = Column(Text, nullable=True)
    planning_alert = Column(Text, nullable=True)

    intervention = Column(Text, nullable=True)
    intervention_alert = Column(Text, nullable=True)

    evaluation = Column(Text, nullable=True)
    evaluation_alert = Column(Text, nullable=True)

    # Which YAML rule file was used (for traceability)
    rule_file_path = Column(String(255), nullable=True)

    created_at = Column(TIMESTAMP, nullable=True)
    updated_at = Column(TIMESTAMP, nullable=True)

    # Relationships
    physical_exam = relationship("PhysicalExam", back_populates="nursing_diagnoses")
