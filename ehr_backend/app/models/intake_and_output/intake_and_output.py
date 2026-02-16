from sqlalchemy import Column, String, Text, Integer, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import relationship
from app.database.base import Base


class IntakeAndOutput(Base):
    __tablename__ = "intake_and_outputs"

    id = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    patient_id = Column(BIGINT(unsigned=True), ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)

    # ──── ASSESSMENT (Step 1) ────
    # Nurse input fields
    oral_intake = Column(Integer, nullable=True)      # oral intake in mL
    iv_fluids = Column(Integer, nullable=True)        # IV fluids in mL
    urine_output = Column(Integer, nullable=True)     # urine output in mL

    # CDSS auto-generated combined alert 
    assessment_alert = Column(Text, nullable=True)

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
    patient = relationship("Patient", back_populates="intake_and_outputs")
