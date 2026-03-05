from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

from app.database.db import get_db
from app.models.lab_values.lab_values import LabValues
from app.models.patient import Patient
from app.core.cdss_engine import CDSSEngine
from app.routers.doctor import create_doctor_update

router = APIRouter(prefix="/lab-values", tags=["Lab Values"])

# Initialize the CDSS engines
diagnosis_engine = CDSSEngine("cdss_rules/dpie/diagnosis.yaml")
planning_engine = CDSSEngine("cdss_rules/dpie/planning.yaml")
intervention_engine = CDSSEngine("cdss_rules/dpie/intervention.yaml")
evaluation_engine = CDSSEngine("cdss_rules/dpie/evaluation.yaml")

# Lab test definitions for numerical comparison
LAB_TESTS = {
    "wbc": {"name": "White Blood Cell Count", "unit": "K/uL", "low": 4.5, "high": 11.0, "critical_low": 2.0, "critical_high": 30.0},
    "rbc": {"name": "Red Blood Cell Count", "unit": "M/uL", "low": 4.0, "high": 5.5, "critical_low": 2.0, "critical_high": 8.0},
    "hgb": {"name": "Hemoglobin", "unit": "g/dL", "low": 12.0, "high": 17.5, "critical_low": 7.0, "critical_high": 20.0},
    "hct": {"name": "Hematocrit", "unit": "%", "low": 36, "high": 54, "critical_low": 20, "critical_high": 70},
    "platelets": {"name": "Platelet Count", "unit": "K/uL", "low": 150, "high": 400, "critical_low": 50, "critical_high": 1000},
    "mcv": {"name": "Mean Corpuscular Volume", "unit": "fL", "low": 80, "high": 100, "critical_low": 60, "critical_high": 140},
    "mch": {"name": "Mean Corpuscular Hemoglobin", "unit": "pg", "low": 27, "high": 31, "critical_low": 20, "critical_high": 40},
    "mchc": {"name": "Mean Corpuscular Hemoglobin Concentration", "unit": "g/dL", "low": 32, "high": 36, "critical_low": 25, "critical_high": 50},
    "rdw": {"name": "Red Cell Distribution Width", "unit": "%", "low": 11, "high": 14.5, "critical_low": 8, "critical_high": 20},
    "neutrophils": {"name": "Neutrophils", "unit": "K/uL", "low": 2.0, "high": 7.5, "critical_low": 1.5, "critical_high": 15.0},
    "lymphocytes": {"name": "Lymphocytes", "unit": "K/uL", "low": 1.0, "high": 4.8, "critical_low": 0.5, "critical_high": 10.0},
    "monocytes": {"name": "Monocytes", "unit": "K/uL", "low": 0.2, "high": 0.8, "critical_low": 0.1, "critical_high": 2.0},
    "eosinophils": {"name": "Eosinophils", "unit": "K/uL", "low": 0.0, "high": 0.4, "critical_low": 0.0, "critical_high": 1.5},
    "basophils": {"name": "Basophils", "unit": "K/uL", "low": 0.0, "high": 0.1, "critical_low": 0.0, "critical_high": 0.5},
}


# ──────────────── Pydantic Schemas ────────────────

class AssessmentCreate(BaseModel):
    """Step 1: Create Lab Values Assessment - 14 lab tests with result and normal range"""
    patient_id: int
    # WBC
    wbc_result: Optional[str] = None
    wbc_normal_range: Optional[str] = None
    # RBC
    rbc_result: Optional[str] = None
    rbc_normal_range: Optional[str] = None
    # HGB
    hgb_result: Optional[str] = None
    hgb_normal_range: Optional[str] = None
    # HCT
    hct_result: Optional[str] = None
    hct_normal_range: Optional[str] = None
    # Platelets
    platelets_result: Optional[str] = None
    platelets_normal_range: Optional[str] = None
    # MCV
    mcv_result: Optional[str] = None
    mcv_normal_range: Optional[str] = None
    # MCH
    mch_result: Optional[str] = None
    mch_normal_range: Optional[str] = None
    # MCHC
    mchc_result: Optional[str] = None
    mchc_normal_range: Optional[str] = None
    # RDW
    rdw_result: Optional[str] = None
    rdw_normal_range: Optional[str] = None
    # Neutrophils
    neutrophils_result: Optional[str] = None
    neutrophils_normal_range: Optional[str] = None
    # Lymphocytes
    lymphocytes_result: Optional[str] = None
    lymphocytes_normal_range: Optional[str] = None
    # Monocytes
    monocytes_result: Optional[str] = None
    monocytes_normal_range: Optional[str] = None
    # Eosinophils
    eosinophils_result: Optional[str] = None
    eosinophils_normal_range: Optional[str] = None
    # Basophils
    basophils_result: Optional[str] = None
    basophils_normal_range: Optional[str] = None

    model_config = ConfigDict(extra="forbid")


class AssessmentUpdate(BaseModel):
    """Update Assessment fields"""
    wbc_result: Optional[str] = None
    wbc_normal_range: Optional[str] = None
    rbc_result: Optional[str] = None
    rbc_normal_range: Optional[str] = None
    hgb_result: Optional[str] = None
    hgb_normal_range: Optional[str] = None
    hct_result: Optional[str] = None
    hct_normal_range: Optional[str] = None
    platelets_result: Optional[str] = None
    platelets_normal_range: Optional[str] = None
    mcv_result: Optional[str] = None
    mcv_normal_range: Optional[str] = None
    mch_result: Optional[str] = None
    mch_normal_range: Optional[str] = None
    mchc_result: Optional[str] = None
    mchc_normal_range: Optional[str] = None
    rdw_result: Optional[str] = None
    rdw_normal_range: Optional[str] = None
    neutrophils_result: Optional[str] = None
    neutrophils_normal_range: Optional[str] = None
    lymphocytes_result: Optional[str] = None
    lymphocytes_normal_range: Optional[str] = None
    monocytes_result: Optional[str] = None
    monocytes_normal_range: Optional[str] = None
    eosinophils_result: Optional[str] = None
    eosinophils_normal_range: Optional[str] = None
    basophils_result: Optional[str] = None
    basophils_normal_range: Optional[str] = None

    model_config = ConfigDict(extra="forbid")


class DiagnosisUpdate(BaseModel):
    """Step 2: Add Diagnosis"""
    diagnosis: str

    model_config = ConfigDict(extra="forbid")


class PlanningUpdate(BaseModel):
    """Step 3: Add Planning"""
    planning: str

    model_config = ConfigDict(extra="forbid")


class InterventionUpdate(BaseModel):
    """Step 4: Add Intervention"""
    intervention: str

    model_config = ConfigDict(extra="forbid")


class EvaluationUpdate(BaseModel):
    """Step 5: Add Evaluation"""
    evaluation: str

    model_config = ConfigDict(extra="forbid")


class LabValuesRead(BaseModel):
    """Complete Lab Values ADPIE record"""
    id: int
    patient_id: int
    # Assessment - 14 tests x 3 fields (result, range, alert)
    wbc_result: Optional[str] = None
    wbc_normal_range: Optional[str] = None
    wbc_alert: Optional[str] = None
    rbc_result: Optional[str] = None
    rbc_normal_range: Optional[str] = None
    rbc_alert: Optional[str] = None
    hgb_result: Optional[str] = None
    hgb_normal_range: Optional[str] = None
    hgb_alert: Optional[str] = None
    hct_result: Optional[str] = None
    hct_normal_range: Optional[str] = None
    hct_alert: Optional[str] = None
    platelets_result: Optional[str] = None
    platelets_normal_range: Optional[str] = None
    platelets_alert: Optional[str] = None
    mcv_result: Optional[str] = None
    mcv_normal_range: Optional[str] = None
    mcv_alert: Optional[str] = None
    mch_result: Optional[str] = None
    mch_normal_range: Optional[str] = None
    mch_alert: Optional[str] = None
    mchc_result: Optional[str] = None
    mchc_normal_range: Optional[str] = None
    mchc_alert: Optional[str] = None
    rdw_result: Optional[str] = None
    rdw_normal_range: Optional[str] = None
    rdw_alert: Optional[str] = None
    neutrophils_result: Optional[str] = None
    neutrophils_normal_range: Optional[str] = None
    neutrophils_alert: Optional[str] = None
    lymphocytes_result: Optional[str] = None
    lymphocytes_normal_range: Optional[str] = None
    lymphocytes_alert: Optional[str] = None
    monocytes_result: Optional[str] = None
    monocytes_normal_range: Optional[str] = None
    monocytes_alert: Optional[str] = None
    eosinophils_result: Optional[str] = None
    eosinophils_normal_range: Optional[str] = None
    eosinophils_alert: Optional[str] = None
    basophils_result: Optional[str] = None
    basophils_normal_range: Optional[str] = None
    basophils_alert: Optional[str] = None
    # Diagnosis
    diagnosis: Optional[str] = None
    diagnosis_alert: Optional[str] = None
    # Planning
    planning: Optional[str] = None
    planning_alert: Optional[str] = None
    # Intervention
    intervention: Optional[str] = None
    intervention_alert: Optional[str] = None
    # Evaluation
    evaluation: Optional[str] = None
    evaluation_alert: Optional[str] = None
    # Metadata
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ──────────────── Helper Function ────────────────

def _compare_lab_value(test_key: str, result_str: Optional[str], normal_range_str: Optional[str]) -> str:
    """
    Compare lab result vs normal range and generate alert.
    
    Args:
        test_key: Key of the lab test (e.g., "wbc", "rbc")
        result_str: Result value as string
        normal_range_str: Normal range value as string
    
    Returns:
        Alert message based on comparison
    """
    # If either is missing, return "No result"
    if not result_str or not normal_range_str:
        return "No result available."
    
    try:
        result = float(result_str)
        normal_range = float(normal_range_str)
        test_info = LAB_TESTS.get(test_key, {})
        test_name = test_info.get("name", test_key.upper())
        unit = test_info.get("unit", "")
        
        # Get critical and normal thresholds
        critical_low = test_info.get("critical_low")
        critical_high = test_info.get("critical_high")
        normal_low = test_info.get("low")
        normal_high = test_info.get("high")
        
        # Check if result is within normal range
        if result == normal_range:
            return f"✓ {test_name} ({result} {unit}): Normal. Within expected range. Continue monitoring."
        
        # Check if result is BELOW normal range
        elif result < normal_range:
            # Check if critically low
            if critical_low and result < critical_low:
                return f"🔴 CRITICAL: {test_name} ({result} {unit}): CRITICALLY LOW (< {critical_low}). Immediate intervention required. Notify physician."
            # Check if moderately low
            elif normal_low and result < normal_low:
                return f"🟠 WARNING: {test_name} ({result} {unit}): LOW (below {normal_range}). Assess for deficiency. Monitor closely and notify physician."
            else:
                return f"🟡 INFO: {test_name} ({result} {unit}): Below normal range ({normal_range}). Monitor and reassess."
        
        # Check if result is ABOVE normal range
        elif result > normal_range:
            # Check if critically high
            if critical_high and result > critical_high:
                return f"🔴 CRITICAL: {test_name} ({result} {unit}): CRITICALLY HIGH (> {critical_high}). Immediate intervention required. Notify physician."
            # Check if moderately high
            elif normal_high and result > normal_high:
                return f"🟠 WARNING: {test_name} ({result} {unit}): HIGH (above {normal_range}). Assess for excess/disorder. Monitor closely and notify physician."
            else:
                return f"🟡 INFO: {test_name} ({result} {unit}): Above normal range ({normal_range}). Monitor and reassess."
        
        else:
            return f"ℹ️ {test_name}: Result processing complete."
    
    except (ValueError, TypeError):
        return f"Unable to compare values. Check result and normal range format."


def _run_assessment_cdss(data: dict) -> dict:
    """
    Run CDSS on all 14 lab tests by comparing result vs normal range.
    Returns alerts for each test.
    """
    alerts = {}
    
    # List of all lab tests
    lab_test_keys = [
        "wbc", "rbc", "hgb", "hct", "platelets", "mcv", "mch", "mchc", "rdw",
        "neutrophils", "lymphocytes", "monocytes", "eosinophils", "basophils"
    ]
    
    for test_key in lab_test_keys:
        result_key = f"{test_key}_result"
        range_key = f"{test_key}_normal_range"
        alert_key = f"{test_key}_alert"
        
        result = data.get(result_key)
        normal_range = data.get(range_key)
        
        # Compare and generate alert
        alert = _compare_lab_value(test_key, result, normal_range)
        alerts[alert_key] = alert
    
    return alerts


# ──────────────── STEP 1: ASSESSMENT ────────────────

@router.post("/", response_model=LabValuesRead)
def create_lab_values(payload: AssessmentCreate, db: Session = Depends(get_db)):
    """Step 1: Create Lab Values Assessment. CDSS alerts are auto-generated for each test."""
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.patient_id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    data = payload.model_dump()

    # Run CDSS to generate alerts
    alerts = _run_assessment_cdss(data)

    # Build the record
    now = datetime.utcnow()
    record = LabValues(
        **data,
        **alerts,
        created_at=now,
        updated_at=now,
    )

    db.add(record)
    # Create an update for the doctor
    create_doctor_update(db, payload.patient_id, "Lab Results Updated")
    
    db.commit()
    db.refresh(record)
    return record


@router.put("/{record_id}/assessment", response_model=LabValuesRead)
def update_assessment(record_id: int, payload: AssessmentUpdate, db: Session = Depends(get_db)):
    """Update Assessment fields. CDSS alerts are re-generated."""
    record = db.query(LabValues).filter(LabValues.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Lab values record not found")

    update_data = payload.model_dump(exclude_unset=True)

    # Apply updates
    for key, value in update_data.items():
        setattr(record, key, value)

    # Re-run CDSS with latest values
    lab_test_keys = [
        "wbc", "rbc", "hgb", "hct", "platelets", "mcv", "mch", "mchc", "rdw",
        "neutrophils", "lymphocytes", "monocytes", "eosinophils", "basophils"
    ]
    
    current_data = {}
    for test_key in lab_test_keys:
        current_data[f"{test_key}_result"] = getattr(record, f"{test_key}_result", None)
        current_data[f"{test_key}_normal_range"] = getattr(record, f"{test_key}_normal_range", None)
    
    alerts = _run_assessment_cdss(current_data)
    for key, value in alerts.items():
        setattr(record, key, value)

    record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(record)
    return record


# ──────────────── STEP 2: DIAGNOSIS ────────────────

@router.put("/{record_id}/diagnosis", response_model=LabValuesRead)
def add_diagnosis(record_id: int, payload: DiagnosisUpdate, db: Session = Depends(get_db)):
    """Step 2: Add Diagnosis. CDSS alert is auto-generated."""
    record = db.query(LabValues).filter(LabValues.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Lab values record not found")

    record.diagnosis = payload.diagnosis
    record.diagnosis_alert = diagnosis_engine.evaluate_single(payload.diagnosis) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── STEP 3: PLANNING ────────────────

@router.put("/{record_id}/planning", response_model=LabValuesRead)
def add_planning(record_id: int, payload: PlanningUpdate, db: Session = Depends(get_db)):
    """Step 3: Add Planning. CDSS alert is auto-generated."""
    record = db.query(LabValues).filter(LabValues.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Lab values record not found")

    record.planning = payload.planning
    record.planning_alert = planning_engine.evaluate_single(payload.planning) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── STEP 4: INTERVENTION ────────────────

@router.put("/{record_id}/intervention", response_model=LabValuesRead)
def add_intervention(record_id: int, payload: InterventionUpdate, db: Session = Depends(get_db)):
    """Step 4: Add Intervention. CDSS alert is auto-generated."""
    record = db.query(LabValues).filter(LabValues.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Lab values record not found")

    record.intervention = payload.intervention
    record.intervention_alert = intervention_engine.evaluate_single(payload.intervention) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── STEP 5: EVALUATION ────────────────

@router.put("/{record_id}/evaluation", response_model=LabValuesRead)
def add_evaluation(record_id: int, payload: EvaluationUpdate, db: Session = Depends(get_db)):
    """Step 5: Add Evaluation. CDSS alert is auto-generated."""
    record = db.query(LabValues).filter(LabValues.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Lab values record not found")

    record.evaluation = payload.evaluation
    record.evaluation_alert = evaluation_engine.evaluate_single(payload.evaluation) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── READ ENDPOINTS ────────────────

@router.get("/patient/{patient_id}", response_model=List[LabValuesRead])
def list_by_patient(patient_id: int, db: Session = Depends(get_db)):
    """Get all lab values records for a patient."""
    records = (
        db.query(LabValues)
        .filter(LabValues.patient_id == patient_id)
        .order_by(LabValues.created_at.desc())
        .all()
    )
    return records


@router.get("/{record_id}", response_model=LabValuesRead)
def get_record(record_id: int, db: Session = Depends(get_db)):
    """Get a single lab values record (complete ADPIE) by ID."""
    record = db.query(LabValues).filter(LabValues.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Lab values record not found")
    return record


@router.get("/{record_id}/extract-adpie")
def extract_adpie(record_id: int, db: Session = Depends(get_db)):
    """
    Extract complete ADPIE record and return formatted output.
    Physician/Nurse can use this to view/print the full lab values workflow.
    """
    record = db.query(LabValues).filter(LabValues.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Lab values record not found")

    # Get patient info
    patient = db.query(Patient).filter(Patient.patient_id == record.patient_id).first()

    return {
        "patient": {
            "id": patient.patient_id,
            "name": f"{patient.first_name} {patient.last_name}",
            "age": patient.age,
            "admission_date": patient.admission_date,
        },
        "record_id": record.id,
        "adpie": {
            "assessment": {
                "wbc": {"result": record.wbc_result, "normal_range": record.wbc_normal_range, "alert": record.wbc_alert},
                "rbc": {"result": record.rbc_result, "normal_range": record.rbc_normal_range, "alert": record.rbc_alert},
                "hgb": {"result": record.hgb_result, "normal_range": record.hgb_normal_range, "alert": record.hgb_alert},
                "hct": {"result": record.hct_result, "normal_range": record.hct_normal_range, "alert": record.hct_alert},
                "platelets": {"result": record.platelets_result, "normal_range": record.platelets_normal_range, "alert": record.platelets_alert},
                "mcv": {"result": record.mcv_result, "normal_range": record.mcv_normal_range, "alert": record.mcv_alert},
                "mch": {"result": record.mch_result, "normal_range": record.mch_normal_range, "alert": record.mch_alert},
                "mchc": {"result": record.mchc_result, "normal_range": record.mchc_normal_range, "alert": record.mchc_alert},
                "rdw": {"result": record.rdw_result, "normal_range": record.rdw_normal_range, "alert": record.rdw_alert},
                "neutrophils": {"result": record.neutrophils_result, "normal_range": record.neutrophils_normal_range, "alert": record.neutrophils_alert},
                "lymphocytes": {"result": record.lymphocytes_result, "normal_range": record.lymphocytes_normal_range, "alert": record.lymphocytes_alert},
                "monocytes": {"result": record.monocytes_result, "normal_range": record.monocytes_normal_range, "alert": record.monocytes_alert},
                "eosinophils": {"result": record.eosinophils_result, "normal_range": record.eosinophils_normal_range, "alert": record.eosinophils_alert},
                "basophils": {"result": record.basophils_result, "normal_range": record.basophils_normal_range, "alert": record.basophils_alert},
            },
            "diagnosis": {
                "input": record.diagnosis,
                "alert": record.diagnosis_alert,
            },
            "planning": {
                "input": record.planning,
                "alert": record.planning_alert,
            },
            "intervention": {
                "input": record.intervention,
                "alert": record.intervention_alert,
            },
            "evaluation": {
                "input": record.evaluation,
                "alert": record.evaluation_alert,
            },
        },
        "created_at": record.created_at,
        "updated_at": record.updated_at,
    }


@router.delete("/{record_id}")
def delete_record(record_id: int, db: Session = Depends(get_db)):
    """Delete a lab values record."""
    record = db.query(LabValues).filter(LabValues.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Lab values record not found")
    db.delete(record)
    db.commit()
    return {"detail": "Lab values record deleted"}
