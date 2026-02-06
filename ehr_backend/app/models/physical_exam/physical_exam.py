from sqlalchemy import Column, String, Text, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import relationship
from app.database.base import Base


class PhysicalExam(Base):
    __tablename__ = "physical_exams"

    id = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    patient_id = Column(BIGINT(unsigned=True), ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)

    # ──── ASSESSMENT (Step 1) ────
    # Nurse input fields
    general_appearance = Column(String(255), nullable=True)
    skin_condition = Column(String(255), nullable=True)
    eye_condition = Column(String(255), nullable=True)
    oral_condition = Column(String(255), nullable=True)
    cardiovascular = Column(String(255), nullable=True)
    abdomen_condition = Column(String(255), nullable=True)
    extremities = Column(String(255), nullable=True)
    neurological = Column(String(255), nullable=True)

    # CDSS auto-generated alerts
    general_appearance_alert = Column(String(255), nullable=True)
    skin_alert = Column(String(255), nullable=True)
    eye_alert = Column(String(255), nullable=True)
    oral_alert = Column(String(255), nullable=True)
    cardiovascular_alert = Column(String(255), nullable=True)
    abdomen_alert = Column(String(255), nullable=True)
    extremities_alert = Column(String(255), nullable=True)
    neurological_alert = Column(String(255), nullable=True)

    # ──── DIAGNOSIS (Step 2) ────
    diagnosis = Column(Text, nullable=True)
    diagnosis_alert = Column(Text, nullable=True)

    # ──── PLANNING (Step 3) ────
    planning = Column(Text, nullable=True)
    planning_alert = Column(Text, nullable=True)

    # ──── INTERVENTION (Step 4) ────
    intervention = Column(Text, nullable=True)
    intervention_alert = Column(Text, nullable=True)

    # ──── EVALUATION (Step 5) ────
    evaluation = Column(Text, nullable=True)
    evaluation_alert = Column(Text, nullable=True)

    created_at = Column(TIMESTAMP, nullable=True)
    updated_at = Column(TIMESTAMP, nullable=True)

    # Relationships
    patient = relationship("Patient", back_populates="physical_exams")
