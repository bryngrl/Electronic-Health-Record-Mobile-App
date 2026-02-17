"""
IVs & Lines Model
Handles IV fluid administration tracking
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import relationship
from app.database.base import Base


class IVsAndLines(Base):
    """
    IVs and Lines table for tracking IV fluid administration
    Stores information about IV fluids, rates, sites, and status
    """
    __tablename__ = "ivs_and_lines"

    id = Column(BIGINT(unsigned=True), primary_key=True, index=True)
    patient_id = Column(BIGINT(unsigned=True), ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False, index=True)
    iv_fluid = Column(String(255), nullable=True)  # Type of IV fluid (e.g., D5W, NS, LR)
    rate = Column(String(255), nullable=True)  # Rate of administration (e.g., 100 ml/hr)
    site = Column(String(255), nullable=True)  # Site of IV insertion (e.g., left hand, right arm)
    status = Column(String(255), nullable=True)  # Status (e.g., running, blocked, discontinued)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<IVsAndLines(id={self.id}, patient_id={self.patient_id}, iv_fluid={self.iv_fluid}, status={self.status})>"
