from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, String
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime, date, time

from app.database.db import get_db
from app.models.vital_signs.vital_signs import VitalSigns
from app.models.patient import Patient
from app.core.cdss_engine import CDSSEngine
from app.routers.doctor import create_doctor_update

router = APIRouter(prefix="/vital-signs", tags=["Vital Signs"])

# Initialize CDSS engines for DPIE steps only (assessment uses numerical comparison)
diagnosis_engine = CDSSEngine("cdss_rules/dpie/diagnosis.yaml")
planning_engine = CDSSEngine("cdss_rules/dpie/planning.yaml")
intervention_engine = CDSSEngine("cdss_rules/dpie/intervention.yaml")
evaluation_engine = CDSSEngine("cdss_rules/dpie/evaluation.yaml")


# ──────────────── Pydantic Schemas ────────────────

class AssessmentCreate(BaseModel):
    """Step 1: Create Vital Signs (Assessment)"""
    patient_id: int
    date: date
    time: time
    day_no: Optional[int] = None
    temperature: Optional[str] = None
    hr: Optional[str] = None
    rr: Optional[str] = None
    bp: Optional[str] = None
    spo2: Optional[str] = None

    model_config = ConfigDict(extra="forbid")


class AssessmentUpdate(BaseModel):
    """Update Assessment fields"""
    date: Optional[date] = None
    time: Optional[time] = None
    day_no: Optional[int] = None
    temperature: Optional[str] = None
    hr: Optional[str] = None
    rr: Optional[str] = None
    bp: Optional[str] = None
    spo2: Optional[str] = None

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


class VitalSignsRead(BaseModel):
    """Complete ADPIE record"""
    id: int
    patient_id: int
    # Assessment
    date: date
    time: time
    day_no: Optional[int] = None
    temperature: Optional[str] = None
    hr: Optional[str] = None
    rr: Optional[str] = None
    bp: Optional[str] = None
    spo2: Optional[str] = None
    assessment_alert: Optional[str] = None
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


# ──────────────── Helper ────────────────

def _run_assessment_cdss(data: dict) -> dict:
    """
    Run CDSS on vital signs using NUMERICAL COMPARISON.
    Evaluates all 5 vital signs together to determine overall vital sign status.
    """
    temp = data.get("temperature")
    hr = data.get("hr")
    rr = data.get("rr")
    bp = data.get("bp")
    spo2 = data.get("spo2")

    # Check for missing values
    if not all([temp, hr, rr, bp, spo2]):
        return {"assessment_alert": "⚠️ Incomplete vital signs data. All values (Temperature, HR, RR, BP, SpO2) are required for proper assessment."}

    try:
        temp_val = float(temp)
        hr_val = float(hr)
        rr_val = float(rr)
        spo2_val = float(spo2)
        
        # Parse BP (format: "systolic/diastolic" or just "systolic")
        bp_parts = str(bp).split("/")
        systolic = float(bp_parts[0]) if bp_parts else 0
        diastolic = float(bp_parts[1]) if len(bp_parts) > 1 else 0
        
    except (ValueError, TypeError):
        return {"assessment_alert": "❌ Unable to parse vital sign values. Ensure all values are numeric (BP format: 120/80)."}

    # Collect alerts based on numerical comparisons
    alerts = []
    severity = "info"

    # TEMPERATURE (Normal: 36.5-37.5°C)
    if temp_val >= 39.5:
        alerts.append(f"🔴 CRITICAL HYPERTHERMIA: {temp_val}°C - Risk of organ damage. Initiate cooling measures immediately.")
        severity = "critical"
    elif temp_val >= 39:
        alerts.append(f"🔴 HIGH FEVER: {temp_val}°C - Risk of febrile seizures. Assess for infection, initiate antipyretics.")
        severity = "critical"
    elif temp_val >= 38:
        alerts.append(f"🟠 Fever: {temp_val}°C - Monitor for infection signs, culture if indicated.")
        if severity != "critical": severity = "warning"
    elif temp_val < 36:
        alerts.append(f"🟠 Hypothermia: {temp_val}°C - Assess for sepsis, medication effects, or environmental exposure.")
        if severity != "critical": severity = "warning"
    elif temp_val < 35:
        alerts.append(f"🔴 CRITICAL HYPOTHERMIA: {temp_val}°C - Risk of arrhythmias. Initiate passive/active rewarming.")
        severity = "critical"

    # HEART RATE (Normal: 60-100 bpm)
    if hr_val > 150:
        alerts.append(f"🔴 SEVERE TACHYCARDIA: {hr_val} bpm - Risk of shock/cardiogenic compromise. Assess immediately.")
        severity = "critical"
    elif hr_val > 140:
        alerts.append(f"🔴 CRITICAL TACHYCARDIA: {hr_val} bpm - Assess for shock, pain, sepsis. Consider ECG.")
        severity = "critical"
    elif hr_val > 100:
        alerts.append(f"🟠 Tachycardia: {hr_val} bpm - Monitor closely, assess cause (pain, anxiety, fever, dehydration).")
        if severity != "critical": severity = "warning"
    elif hr_val < 50:
        alerts.append(f"🔴 CRITICAL BRADYCARDIA: {hr_val} bpm - Risk of hemodynamic compromise. Obtain ECG, notify provider.")
        severity = "critical"
    elif hr_val < 60:
        alerts.append(f"🟠 Bradycardia: {hr_val} bpm - Monitor for symptoms (dizziness, weakness). Consider athletic conditioning.")
        if severity != "critical": severity = "warning"

    # RESPIRATORY RATE (Normal: 12-20 breaths/min)
    if rr_val < 8:
        alerts.append(f"🔴 CRITICAL BRADYPNEA: {rr_val} breaths/min - Risk of respiratory failure/CNS depression. Assess airway, prepare for intervention.")
        severity = "critical"
    elif rr_val < 12:
        alerts.append(f"🔴 SEVERE BRADYPNEA: {rr_val} breaths/min - Risk of hypoventilation/opioid overdose. Monitor SpO2, notify provider.")
        severity = "critical"
    elif rr_val > 30:
        alerts.append(f"🔴 SEVERE TACHYPNEA: {rr_val} breaths/min - Risk of respiratory distress. Assess oxygen saturation, respiratory effort.")
        severity = "critical"
    elif rr_val > 25:
        alerts.append(f"🟠 Tachypnea: {rr_val} breaths/min - Monitor oxygenation, assess cause (pain, anxiety, acidosis).")
        if severity != "critical": severity = "warning"

    # BLOOD PRESSURE (Normal: 90-140 systolic / 60-90 diastolic)
    if systolic >= 200:
        alerts.append(f"🔴 HYPERTENSIVE CRISIS: {bp} mmHg - Risk of stroke/organ damage. Notify provider urgently, prepare for intervention.")
        severity = "critical"
    elif systolic >= 180:
        alerts.append(f"🔴 SEVERE HYPERTENSION: {bp} mmHg - Notify physician urgently, assess for target organ damage.")
        severity = "critical"
    elif systolic >= 140:
        alerts.append(f"🟠 Elevated BP: {bp} mmHg - Monitor closely, assess for pain/anxiety.")
        if severity != "critical": severity = "warning"
    elif systolic < 60:
        alerts.append(f"🔴 CRITICAL HYPOTENSION: {bp} mmHg - Risk of shock/end-organ hypoperfusion. Assess perfusion, notify provider immediately.")
        severity = "critical"
    elif systolic < 90:
        alerts.append(f"🔴 HYPOTENSION: {bp} mmHg - Risk of shock. Check perfusion (skin, mental status), assess for cause (hemorrhage, sepsis, medication).")
        severity = "critical"

    # OXYGEN SATURATION (Normal: ≥95%)
    if spo2_val < 85:
        alerts.append(f"🔴 CRITICAL HYPOXEMIA: SpO2 {spo2_val}% - SEVERE oxygen deficit. Apply O₂ immediately, assess airway, prepare for intervention.")
        severity = "critical"
    elif spo2_val < 90:
        alerts.append(f"🔴 SEVERE HYPOXEMIA: SpO2 {spo2_val}% - Apply supplemental oxygen immediately, assess respiratory status.")
        severity = "critical"
    elif spo2_val < 95:
        alerts.append(f"🟠 Low SpO2: {spo2_val}% - Consider supplemental oxygen, monitor respiratory effort.")
        if severity != "critical": severity = "warning"

    # Generate combined alert
    if not alerts:
        combined_alert = f"✓ All vital signs within normal range: Temp {temp}°C, HR {hr} bpm, RR {rr} breaths/min, BP {bp} mmHg, SpO2 {spo2}%"
    else:
        combined_alert = " | ".join(alerts)

    return {"assessment_alert": combined_alert}


# ──────────────── STEP 1: ASSESSMENT ────────────────

@router.post("/", response_model=VitalSignsRead)
def create_vital_signs(payload: AssessmentCreate, db: Session = Depends(get_db)):
    """Step 1: Create or Update Vital Signs (Assessment). CDSS alerts are auto-generated."""
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.patient_id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    data = payload.model_dump()

    # Run CDSS to generate alerts
    alerts = _run_assessment_cdss(data)

    # Check for existing record based on patient_id, date, and time (hour/minute)
    # This ensures that entering data for the same slot on the same day updates the record.
    now = datetime.utcnow()

    existing_record = db.query(VitalSigns).filter(
        VitalSigns.patient_id == payload.patient_id,
        func.date(VitalSigns.date) == payload.date,
        func.hour(VitalSigns.time) == payload.time.hour,
        func.minute(VitalSigns.time) == payload.time.minute
    ).first()

    if existing_record:
        # Update the existing record
        for key, value in data.items():
            if key != "patient_id": # Don't update patient_id
                setattr(existing_record, key, value)
        for key, value in alerts.items():
            setattr(existing_record, key, value)
        existing_record.updated_at = now
        record = existing_record
    else:
        # Build the record
        record = VitalSigns(
            **data,
            **alerts,
            created_at=now,
            updated_at=now,
        )
        db.add(record)
        db.flush() # Get the ID before commit
        # Create an update for the doctor
        create_doctor_update(db, payload.patient_id, "Vital Signs", "vital_signs", record.id)

    db.commit()
    db.refresh(record)
    return record


@router.put("/{record_id}/assessment", response_model=VitalSignsRead)
def update_assessment(record_id: int, payload: AssessmentUpdate, db: Session = Depends(get_db)):
    """Update Assessment fields. CDSS alerts are re-generated."""
    record = db.query(VitalSigns).filter(VitalSigns.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vital signs record not found")

    update_data = payload.model_dump(exclude_unset=True)

    # Apply updates
    for key, value in update_data.items():
        setattr(record, key, value)

    # Re-run CDSS with latest values
    current_data = {
        "temperature": record.temperature,
        "hr": record.hr,
        "rr": record.rr,
        "bp": record.bp,
        "spo2": record.spo2,
    }
    alerts = _run_assessment_cdss(current_data)
    for key, value in alerts.items():
        setattr(record, key, value)

    record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(record)
    return record


# ──────────────── STEP 2: DIAGNOSIS ────────────────

@router.put("/{record_id}/diagnosis", response_model=VitalSignsRead)
def add_diagnosis(record_id: int, payload: DiagnosisUpdate, db: Session = Depends(get_db)):
    """Step 2: Add Diagnosis. CDSS alert is auto-generated."""
    record = db.query(VitalSigns).filter(VitalSigns.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vital signs record not found")

    record.diagnosis = payload.diagnosis
    record.diagnosis_alert = diagnosis_engine.evaluate_single(payload.diagnosis) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── STEP 3: PLANNING ────────────────

@router.put("/{record_id}/planning", response_model=VitalSignsRead)
def add_planning(record_id: int, payload: PlanningUpdate, db: Session = Depends(get_db)):
    """Step 3: Add Planning. CDSS alert is auto-generated."""
    record = db.query(VitalSigns).filter(VitalSigns.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vital signs record not found")

    record.planning = payload.planning
    record.planning_alert = planning_engine.evaluate_single(payload.planning) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── STEP 4: INTERVENTION ────────────────

@router.put("/{record_id}/intervention", response_model=VitalSignsRead)
def add_intervention(record_id: int, payload: InterventionUpdate, db: Session = Depends(get_db)):
    """Step 4: Add Intervention. CDSS alert is auto-generated."""
    record = db.query(VitalSigns).filter(VitalSigns.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vital signs record not found")

    record.intervention = payload.intervention
    record.intervention_alert = intervention_engine.evaluate_single(payload.intervention) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── STEP 5: EVALUATION ────────────────

@router.put("/{record_id}/evaluation", response_model=VitalSignsRead)
def add_evaluation(record_id: int, payload: EvaluationUpdate, db: Session = Depends(get_db)):
    """Step 5: Add Evaluation. CDSS alert is auto-generated."""
    record = db.query(VitalSigns).filter(VitalSigns.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vital signs record not found")

    record.evaluation = payload.evaluation
    record.evaluation_alert = evaluation_engine.evaluate_single(payload.evaluation) or None
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


# ──────────────── READ ENDPOINTS ────────────────

@router.get("/patient/{patient_id}", response_model=List[VitalSignsRead])
def list_vital_signs_by_patient(patient_id: int, db: Session = Depends(get_db)):
    """Get all vital signs records for a patient."""
    records = (
        db.query(VitalSigns)
        .filter(VitalSigns.patient_id == patient_id)
        .order_by(VitalSigns.created_at.desc())
        .all()
    )
    return records


@router.get("/{record_id}", response_model=VitalSignsRead)
def get_vital_signs(record_id: int, db: Session = Depends(get_db)):
    """Get a single vital signs record (complete ADPIE) by ID."""
    record = db.query(VitalSigns).filter(VitalSigns.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vital signs record not found")
    return record


@router.delete("/{record_id}")
def delete_vital_signs(record_id: int, db: Session = Depends(get_db)):
    """Delete a vital signs record."""
    record = db.query(VitalSigns).filter(VitalSigns.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vital signs record not found")
    db.delete(record)
    db.commit()
    return {"detail": "Vital signs record deleted"}


# ──────────────── EXTRACT & PRINT ────────────────

@router.get("/{record_id}/extract-adpie")
def extract_adpie(record_id: int, db: Session = Depends(get_db)):
    """
    Extract complete ADPIE record and return formatted output.
    Nurse can use this to view/print the full vital signs workflow.
    """
    record = db.query(VitalSigns).filter(VitalSigns.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vital signs record not found")

    # Get patient info
    patient = db.query(Patient).filter(Patient.patient_id == record.patient_id).first()

    return {
        "patient": {
            "id": patient.patient_id,
            "name": f"{patient.first_name} {patient.last_name}",
            "age": patient.age,
            "admission_date": patient.admission_date,
        },
        "vital_signs_id": record.id,
        "adpie": {
            "assessment": {
                "date": record.date,
                "time": record.time,
                "day_no": record.day_no,
                "measurements": {
                    "temperature": record.temperature,
                    "hr": record.hr,
                    "rr": record.rr,
                    "bp": record.bp,
                    "spo2": record.spo2,
                },
                "combined_alert": record.assessment_alert,
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
