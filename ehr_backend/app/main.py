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

# Router imports
from app.routers import auth, patient
from app.routers.physical_exam import physical_exam as pe_router
from app.routers.vital_signs import vital_signs as vs_router
from app.routers.intake_and_output import intake_and_output as iao_router

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
    allow_origins=origins,
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

Base.metadata.create_all(bind=engine)


# Just to test that the backend is running
@app.get("/")
def root():
    return {"status": "EHR backend is running"}
