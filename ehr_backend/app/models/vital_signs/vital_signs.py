from sqlalchemy import Column, BigInteger, Integer, String, Date, Time, Text, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import relationship
from app.database.base import Base


class VitalSigns(Base):
    __tablename__ = "vital_signs"

    id = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    patient_id = Column(BIGINT(unsigned=True), ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)

    # Assessment fields (vital signs measurements)
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=False)
    day_no = Column(Integer, nullable=True)
    temperature = Column(String(255), nullable=True)
    hr = Column(String(255), nullable=True)
    rr = Column(String(255), nullable=True)
    bp = Column(String(255), nullable=True)
    spo2 = Column(String(255), nullable=True)

    # CDSS auto-generated combined alert field (based on all 5 vital signs)
    assessment_alert = Column(Text, nullable=True)

    # DPIE fields: nurse input + CDSS auto-generated alert
    diagnosis = Column(Text, nullable=True)
    diagnosis_alert = Column(Text, nullable=True)

    planning = Column(Text, nullable=True)
    planning_alert = Column(Text, nullable=True)

    intervention = Column(Text, nullable=True)
    intervention_alert = Column(Text, nullable=True)

    evaluation = Column(Text, nullable=True)
    evaluation_alert = Column(Text, nullable=True)

    created_at = Column(TIMESTAMP, nullable=True)
    updated_at = Column(TIMESTAMP, nullable=True)

    # Relationships
    patient = relationship("Patient")
