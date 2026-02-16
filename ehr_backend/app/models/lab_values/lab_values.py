from sqlalchemy import Column, String, Text, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import relationship
from app.database.base import Base


class LabValues(Base):
    __tablename__ = "lab_values"

    id = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    patient_id = Column(BIGINT(unsigned=True), ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)

    # ──── ASSESSMENT (Step 1) ────
    # 14 Lab Tests - Each with result, normal_range, and alert
    
    # 1. WBC (White Blood Cell Count)
    wbc_result = Column(String(255), nullable=True)
    wbc_normal_range = Column(String(255), nullable=True)
    wbc_alert = Column(String(255), nullable=True)
    
    # 2. RBC (Red Blood Cell Count)
    rbc_result = Column(String(255), nullable=True)
    rbc_normal_range = Column(String(255), nullable=True)
    rbc_alert = Column(String(255), nullable=True)
    
    # 3. HGB (Hemoglobin)
    hgb_result = Column(String(255), nullable=True)
    hgb_normal_range = Column(String(255), nullable=True)
    hgb_alert = Column(String(255), nullable=True)
    
    # 4. HCT (Hematocrit)
    hct_result = Column(String(255), nullable=True)
    hct_normal_range = Column(String(255), nullable=True)
    hct_alert = Column(String(255), nullable=True)
    
    # 5. Platelets
    platelets_result = Column(String(255), nullable=True)
    platelets_normal_range = Column(String(255), nullable=True)
    platelets_alert = Column(String(255), nullable=True)
    
    # 6. MCV (Mean Corpuscular Volume)
    mcv_result = Column(String(255), nullable=True)
    mcv_normal_range = Column(String(255), nullable=True)
    mcv_alert = Column(String(255), nullable=True)
    
    # 7. MCH (Mean Corpuscular Hemoglobin)
    mch_result = Column(String(255), nullable=True)
    mch_normal_range = Column(String(255), nullable=True)
    mch_alert = Column(String(255), nullable=True)
    
    # 8. MCHC (Mean Corpuscular Hemoglobin Concentration)
    mchc_result = Column(String(255), nullable=True)
    mchc_normal_range = Column(String(255), nullable=True)
    mchc_alert = Column(String(255), nullable=True)
    
    # 9. RDW (Red Cell Distribution Width)
    rdw_result = Column(String(255), nullable=True)
    rdw_normal_range = Column(String(255), nullable=True)
    rdw_alert = Column(String(255), nullable=True)
    
    # 10. Neutrophils
    neutrophils_result = Column(String(255), nullable=True)
    neutrophils_normal_range = Column(String(255), nullable=True)
    neutrophils_alert = Column(String(255), nullable=True)
    
    # 11. Lymphocytes
    lymphocytes_result = Column(String(255), nullable=True)
    lymphocytes_normal_range = Column(String(255), nullable=True)
    lymphocytes_alert = Column(String(255), nullable=True)
    
    # 12. Monocytes
    monocytes_result = Column(String(255), nullable=True)
    monocytes_normal_range = Column(String(255), nullable=True)
    monocytes_alert = Column(String(255), nullable=True)
    
    # 13. Eosinophils
    eosinophils_result = Column(String(255), nullable=True)
    eosinophils_normal_range = Column(String(255), nullable=True)
    eosinophils_alert = Column(String(255), nullable=True)
    
    # 14. Basophils
    basophils_result = Column(String(255), nullable=True)
    basophils_normal_range = Column(String(255), nullable=True)
    basophils_alert = Column(String(255), nullable=True)

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
    patient = relationship("Patient", back_populates="lab_values")
