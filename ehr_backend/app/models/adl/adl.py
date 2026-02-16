from sqlalchemy import Column, String, Text, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import relationship
from app.database.base import Base


class ADL(Base):
    __tablename__ = "adls"

    id = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    patient_id = Column(BIGINT(unsigned=True), ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)

    # ──── ASSESSMENT (Step 1) ────
    # Nurse input fields for Activities of Daily Living
    mobility = Column(String(255), nullable=True)           # e.g., independent, with assist, bed rest
    mobility_alert = Column(String(255), nullable=True)     # CDSS auto-generated alert

    hygiene = Column(String(255), nullable=True)            # e.g., independent, needs assist, dependent
    hygiene_alert = Column(String(255), nullable=True)

    toileting = Column(String(255), nullable=True)          # e.g., independent, needs assist, incontinent
    toileting_alert = Column(String(255), nullable=True)

    feeding = Column(String(255), nullable=True)            # e.g., independent, needs assist, tube feeding
    feeding_alert = Column(String(255), nullable=True)

    hydration = Column(String(255), nullable=True)          # e.g., adequate, limited, unable to drink
    hydration_alert = Column(String(255), nullable=True)

    sleep_pattern = Column(String(255), nullable=True)      # e.g., 8 hours, restless, insomnia
    sleep_pattern_alert = Column(String(255), nullable=True)

    pain_level = Column(String(255), nullable=True)         # e.g., 0/10, 5/10, 10/10
    pain_level_alert = Column(String(255), nullable=True)

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
    patient = relationship("Patient", back_populates="adls")
