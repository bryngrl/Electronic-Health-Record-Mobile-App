from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.patient import Patient
from app.models.vital_signs.vital_signs import VitalSigns
from app.models.physical_exam.physical_exam import PhysicalExam
from app.models.adl.adl import ADL
from app.models.lab_values.lab_values import LabValues
from app.models.doctor_update import DoctorUpdate
from app.models.intake_and_output.intake_and_output import IntakeAndOutput
from app.models.medical_history.medical_history import (
    PresentIllness, PastMedicalSurgical, Allergies, Vaccination, DevelopmentalHistory
)
from app.models.diagnostics.diagnostics import Diagnostic
from app.models.ivs_and_lines.ivs_and_lines import IVsAndLines
from app.models.discharge_planning.discharge_planning import DischargePlanning
from app.models.medication_administration.medication_administration import MedicationAdministration
from app.models.medication_reconciliation.medication_reconciliation import (
    HomeMedication, CurrentMedication, ChangesInMedication
)
from xhtml2pdf import pisa
from jinja2 import Template
import io
import os
from datetime import datetime

router = APIRouter(prefix="/reports", tags=["Reports"])

REPORT_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <style>
        @page {
            size: A4;
            margin: 1cm;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 9pt;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #035022;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #035022;
            margin: 0;
            font-size: 18pt;
        }
        .section {
            margin-bottom: 15px;
            page-break-inside: avoid;
        }
        .section-title {
            background-color: #E5FFE8;
            color: #035022;
            padding: 4px 8px;
            font-weight: bold;
            border-left: 4px solid #29A539;
            margin-bottom: 8px;
            font-size: 10pt;
            text-transform: uppercase;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
        }
        table, th, td {
            border: 1px solid #ddd;
        }
        th, td {
            padding: 6px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .label {
            font-weight: bold;
            color: #555;
        }
        .diagnostic-image {
            max-width: 200px;
            max-height: 200px;
            margin: 5px;
            border: 1px solid #ddd;
        }
        .grid {
            display: block;
        }
        .row {
            display: block;
            margin-bottom: 5px;
        }
        .col {
            display: inline-block;
            width: 48%;
            vertical-align: top;
        }
        .na {
            color: #999;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>PATIENT MEDICAL RECORD</h1>
        <p>Electronic Health Record System | Generated: {{ generated_at }}</p>
    </div>

    <div class="section">
        <div class="section-title">1. Patient Demographics</div>
        <table>
            <tr>
                <td width="50%"><span class="label">Full Name:</span> {{ patient.last_name }}, {{ patient.first_name }} {{ patient.middle_name or '' }}</td>
                <td width="50%"><span class="label">Patient ID:</span> #{{ patient.patient_id }}</td>
            </tr>
            <tr>
                <td><span class="label">Age / Sex:</span> {{ patient.age }} / {{ patient.sex }}</td>
                <td><span class="label">Birthdate:</span> {{ patient.birthdate or 'N/A' }}</td>
            </tr>
            <tr>
                <td><span class="label">Address:</span> {{ patient.address or 'N/A' }}</td>
                <td><span class="label">Admission Date:</span> {{ patient.admission_date or 'N/A' }}</td>
            </tr>
            <tr>
                <td><span class="label">Room / Bed:</span> {{ patient.room_no or 'N/A' }} / {{ patient.bed_no or 'N/A' }}</td>
                <td><span class="label">Chief Complaints:</span> {{ patient.chief_complaints or 'N/A' }}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">2. Medical History</div>
        <div style="padding-left: 10px;">
            <p><span class="label">Present Illness:</span> {{ medical_history.present_illness.description if medical_history.present_illness else '<span class="na">N/A</span>' }}</p>
            <p><span class="label">Past Medical/Surgical:</span> {{ medical_history.past_medical.description if medical_history.past_medical else '<span class="na">N/A</span>' }}</p>
            <p><span class="label">Allergies:</span> {{ medical_history.allergies.description if medical_history.allergies else '<span class="na">N/A</span>' }}</p>
            <p><span class="label">Vaccinations:</span> {{ medical_history.vaccination.description if medical_history.vaccination else '<span class="na">N/A</span>' }}</p>
            <p><span class="label">Developmental History:</span> {{ medical_history.developmental.description if medical_history.developmental else '<span class="na">N/A</span>' }}</p>
        </div>
    </div>

    <div class="section">
        <div class="section-title">3. Vital Signs (Latest)</div>
        {% if vital_signs %}
        <table>
            <thead>
                <tr>
                    <th>Date/Time</th>
                    <th>Temp</th>
                    <th>HR</th>
                    <th>RR</th>
                    <th>BP</th>
                    <th>SpO2</th>
                </tr>
            </thead>
            <tbody>
                {% for vs in vital_signs[:10] %}
                <tr>
                    <td>{{ vs.date }} {{ vs.time }}</td>
                    <td>{{ vs.temperature }}°C</td>
                    <td>{{ vs.hr }}</td>
                    <td>{{ vs.rr }}</td>
                    <td>{{ vs.bp }}</td>
                    <td>{{ vs.spo2 }}%</td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
        {% else %}<p class="na">No vital signs recorded.</p>{% endif %}
    </div>

    <div class="section">
        <div class="section-title">4. Physical Examination</div>
        {% if physical_exams %}
            {% set pe = physical_exams[0] %}
            <table>
                <tr>
                    <td width="33%"><span class="label">General:</span> {{ pe.general_appearance or 'N/A' }}</td>
                    <td width="33%"><span class="label">Skin:</span> {{ pe.skin_condition or 'N/A' }}</td>
                    <td width="33%"><span class="label">Eyes:</span> {{ pe.eye_condition or 'N/A' }}</td>
                </tr>
                <tr>
                    <td><span class="label">Oral:</span> {{ pe.oral_condition or 'N/A' }}</td>
                    <td><span class="label">Cardio:</span> {{ pe.cardiovascular or 'N/A' }}</td>
                    <td><span class="label">Abdomen:</span> {{ pe.abdomen_condition or 'N/A' }}</td>
                </tr>
            </table>
            <p><span class="label">Diagnosis:</span> {{ pe.diagnosis or 'N/A' }}</p>
        {% else %}<p class="na">No physical examination recorded.</p>{% endif %}
    </div>

    <div class="section">
        <div class="section-title">5. Medication Reconciliation</div>
        <div class="row">
            <div class="col">
                <span class="label">Home Medications:</span><br/>
                {% if med_recon.home %}
                    {% for m in med_recon.home %} • {{ m.medication_name }} ({{ m.dosage }})<br/> {% endfor %}
                {% else %}<span class="na">N/A</span>{% endif %}
            </div>
            <div class="col">
                <span class="label">Current Medications:</span><br/>
                {% if med_recon.current %}
                    {% for m in med_recon.current %} • {{ m.medication_name }} ({{ m.dosage }})<br/> {% endfor %}
                {% else %}<span class="na">N/A</span>{% endif %}
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">6. Medication Administration Record</div>
        {% if med_admin %}
        <table>
            <thead>
                <tr>
                    <th>Date/Time</th>
                    <th>Medication</th>
                    <th>Dosage</th>
                    <th>Route</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {% for ma in med_admin[:10] %}
                <tr>
                    <td>{{ ma.date }} {{ ma.time }}</td>
                    <td>{{ ma.medication_name }}</td>
                    <td>{{ ma.dosage }}</td>
                    <td>{{ ma.route }}</td>
                    <td>{{ ma.status }}</td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
        {% else %}<p class="na">No medication administration records.</p>{% endif %}
    </div>

    <div class="section">
        <div class="section-title">7. Intake and Output</div>
        {% if intake_output %}
        <table>
            <thead>
                <tr>
                    <th>Date/Time</th>
                    <th>Intake Type</th>
                    <th>Intake (mL)</th>
                    <th>Output Type</th>
                    <th>Output (mL)</th>
                </tr>
            </thead>
            <tbody>
                {% for io in intake_output[:5] %}
                <tr>
                    <td>{{ io.created_at.strftime('%Y-%m-%d %H:%M') if io.created_at else 'N/A' }}</td>
                    <td>{{ io.intake_type or 'N/A' }}</td>
                    <td>{{ io.intake_amount or '0' }}</td>
                    <td>{{ io.output_type or 'N/A' }}</td>
                    <td>{{ io.output_amount or '0' }}</td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
        {% else %}<p class="na">No intake/output records.</p>{% endif %}
    </div>

    <div class="section">
        <div class="section-title">8. Lab Values & Diagnostics</div>
        {% if lab_values %}
        <table>
            <thead>
                <tr>
                    <th>Test Name</th>
                    <th>Result</th>
                    <th>Interpretation</th>
                </tr>
            </thead>
            <tbody>
                {% for lv in lab_values %}
                <tr>
                    <td>{{ lv.test_name }}</td>
                    <td>{{ lv.result_value }}</td>
                    <td>{{ lv.interpretation }}</td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
        {% else %}<p class="na">No lab values recorded.</p>{% endif %}

        <div style="margin-top: 10px;">
            <span class="label">Diagnostic Images:</span><br/>
            {% if diagnostics %}
                {% for diag in diagnostics %}
                <div style="display: inline-block; text-align: center; margin: 10px;">
                    <img src="{{ diag.absolute_path }}" class="diagnostic-image"><br/>
                    <span>{{ diag.image_type }}</span>
                </div>
                {% endfor %}
            {% else %}<span class="na">No diagnostic images available.</span>{% endif %}
        </div>
    </div>

    <div class="section">
        <div class="section-title">9. Doctor Updates & Plans</div>
        {% if doctor_updates %}
            {% for update in doctor_updates[:5] %}
            <div style="margin-bottom: 8px; border-bottom: 1px dashed #ddd; padding-bottom: 4px;">
                <span class="label">{{ update.created_at.strftime('%Y-%m-%d %H:%M') if update.created_at else 'N/A' }}:</span> {{ update.update_text }}
            </div>
            {% endfor %}
        {% else %}<p class="na">No doctor updates recorded.</p>{% endif %}
    </div>

    <div class="section">
        <div class="section-title">10. Discharge Planning</div>
        {% if discharge_planning %}
            <p><span class="label">Criteria:</span> {{ discharge_planning[0].criteria or 'N/A' }}</p>
            <p><span class="label">Instructions:</span> {{ discharge_planning[0].instructions or 'N/A' }}</p>
        {% else %}<p class="na">Discharge planning not yet started.</p>{% endif %}
    </div>

    <div style="text-align: center; margin-top: 30px; font-size: 8pt; color: #777; border-top: 1px solid #eee; padding-top: 10px;">
        *** Confidential Medical Document - End of Report ***
    </div>
</body>
</html>
"""

@router.get("/patient/{patient_id}")
def generate_patient_report(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # 1. Fetch Basic Data
    vital_signs = db.query(VitalSigns).filter(VitalSigns.patient_id == patient_id).order_by(VitalSigns.date.desc(), VitalSigns.time.desc()).all()
    physical_exams = db.query(PhysicalExam).filter(PhysicalExam.patient_id == patient_id).order_by(PhysicalExam.created_at.desc()).all()
    lab_values = db.query(LabValues).filter(LabValues.patient_id == patient_id).order_by(LabValues.created_at.desc()).all()
    doctor_updates = db.query(DoctorUpdate).filter(DoctorUpdate.patient_id == patient_id).order_by(DoctorUpdate.created_at.desc()).all()
    adls = db.query(ADL).filter(ADL.patient_id == patient_id).order_by(ADL.created_at.desc()).all()
    med_admin = db.query(MedicationAdministration).filter(MedicationAdministration.patient_id == patient_id).order_by(MedicationAdministration.date.desc(), MedicationAdministration.time.desc()).all()
    intake_output = db.query(IntakeAndOutput).filter(IntakeAndOutput.patient_id == patient_id).order_by(IntakeAndOutput.created_at.desc()).all()
    ivs_lines = db.query(IVsAndLines).filter(IVsAndLines.patient_id == patient_id).order_by(IVsAndLines.created_at.desc()).all()
    discharge_planning = db.query(DischargePlanning).filter(DischargePlanning.patient_id == patient_id).order_by(DischargePlanning.created_at.desc()).all()

    # 2. Fetch Medical History (5 sub-tables)
    medical_history = {
        "present_illness": db.query(PresentIllness).filter(PresentIllness.patient_id == patient_id).first(),
        "past_medical": db.query(PastMedicalSurgical).filter(PastMedicalSurgical.patient_id == patient_id).first(),
        "allergies": db.query(Allergies).filter(Allergies.patient_id == patient_id).first(),
        "vaccination": db.query(Vaccination).filter(Vaccination.patient_id == patient_id).first(),
        "developmental": db.query(DevelopmentalHistory).filter(DevelopmentalHistory.patient_id == patient_id).first(),
    }

    # 3. Fetch Medication Reconciliation (3 sub-tables)
    med_recon = {
        "home": db.query(HomeMedication).filter(HomeMedication.patient_id == patient_id).all(),
        "current": db.query(CurrentMedication).filter(CurrentMedication.patient_id == patient_id).all(),
        "changes": db.query(ChangesInMedication).filter(ChangesInMedication.patient_id == patient_id).all(),
    }

    # 4. Fetch Diagnostics and handle image paths
    diagnostics = db.query(Diagnostic).filter(Diagnostic.patient_id == patient_id).all()
    base_storage_path = os.path.abspath("storage/app/public")
    
    for diag in diagnostics:
        # Construct absolute local path for xhtml2pdf
        # Typical file_path in DB: "diagnostics/patient_1/image.jpg"
        clean_path = diag.file_path.replace("\\", "/")
        if clean_path.startswith("public/"):
            clean_path = clean_path.replace("public/", "", 1)
        
        abs_path = os.path.join(base_storage_path, clean_path)
        diag.absolute_path = abs_path.replace("\\", "/")

    # Prepare data for template
    data = {
        "patient": patient,
        "vital_signs": vital_signs,
        "physical_exams": physical_exams,
        "medical_history": medical_history,
        "med_recon": med_recon,
        "med_admin": med_admin,
        "lab_values": lab_values,
        "intake_output": intake_output,
        "ivs_lines": ivs_lines,
        "diagnostics": diagnostics,
        "doctor_updates": doctor_updates,
        "adls": adls,
        "discharge_planning": discharge_planning,
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    # Render HTML
    template = Template(REPORT_TEMPLATE)
    html_content = template.render(**data)

    # Convert HTML to PDF
    pdf_buffer = io.BytesIO()
    pisa_status = pisa.CreatePDF(io.BytesIO(html_content.encode("utf-8")), dest=pdf_buffer)

    if pisa_status.err:
        raise HTTPException(status_code=500, detail="Failed to generate PDF")

    pdf_buffer.seek(0)
    pdf_content = pdf_buffer.read()

    filename = f"Full_Report_{patient.last_name}_{patient_id}.pdf"
    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
