from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.db import engine
from app.database.base import Base

# Model imports
from app.models.user import User
from app.models.patient import Patient
from app.models.physical_exam.physical_exam import PhysicalExam
from app.models.vital_signs.vital_signs import VitalSigns
from app.models.intake_and_output.intake_and_output import IntakeAndOutput
from app.models.adl.adl import ADL
from app.models.lab_values.lab_values import LabValues
from app.models.medical_history.medical_history import (
    PresentIllness, PastMedicalSurgical, Allergies, Vaccination, DevelopmentalHistory
)
from app.models.diagnostics.diagnostics import Diagnostic
from app.models.ivs_and_lines.ivs_and_lines import IVsAndLines
from app.models.discharge_planning.discharge_planning import DischargePlanning

# Router imports
from app.routers import auth, patient
from app.routers.physical_exam import physical_exam as pe_router
from app.routers.vital_signs import vital_signs as vs_router
from app.routers.intake_and_output import intake_and_output as iao_router
from app.routers.adl import adl as adl_router
from app.routers.lab_values import lab_values as lv_router
from app.routers.medical_history import medical_history as mh_router
from app.routers.diagnostics import diagnostics as diag_router
from app.routers.ivs_and_lines import ivs_and_lines as ial_router
from app.routers.discharge_planning import discharge_planning as dp_router

app = FastAPI(title="EHR Backend API")

# ──────────────── CORS Configuration ────────────────
origins = [
    "http://localhost",
    "http://localhost:3000",      # React/Node
    "http://localhost:8080",      # Laravel
    "http://localhost:5000",      # Additional dev port
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:5000",
    "http://localhost:8000",      # Backend
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth & Patient
app.include_router(auth.router)
app.include_router(patient.router)

# Physical Exam (with ADPIE)
app.include_router(pe_router.router)

# Vital Signs (with ADPIE)
app.include_router(vs_router.router)

# Intake and Output (with ADPIE)
app.include_router(iao_router.router)

# Activities of Daily Living (with ADPIE)
app.include_router(adl_router.router)

# Lab Values (with ADPIE)
app.include_router(lv_router.router)

# Medical History (5 sub-components: no ADPIE workflow)
app.include_router(mh_router.router)

# Diagnostics (file upload/storage: medical imaging)
app.include_router(diag_router.router)

# IVs & Lines (data entry: IV fluid administration)
app.include_router(ial_router.router)

# Discharge Planning (data entry: discharge criteria & instructions)
app.include_router(dp_router.router)

Base.metadata.create_all(bind=engine)


# Just to test that the backend is running
@app.get("/")
def root():
    return {"status": "EHR backend is running"}
