from fastapi import FastAPI
from app.database.db import engine
from app.database.base import Base

# Model imports
from app.models.user import User
from app.models.patient import Patient
from app.models.physical_exam.physical_exam import PhysicalExam
from app.models.vital_signs.vital_signs import VitalSigns

# Router imports
from app.routers import auth, patient
from app.routers.physical_exam import physical_exam as pe_router
from app.routers.vital_signs import vital_signs as vs_router

app = FastAPI(title="EHR Backend API")

# Auth & Patient
app.include_router(auth.router)
app.include_router(patient.router)

# Physical Exam (with ADPIE)
app.include_router(pe_router.router)

# Vital Signs (with ADPIE)
app.include_router(vs_router.router)

Base.metadata.create_all(bind=engine)


# Just to test that the backend is running
@app.get("/")
def root():
    return {"status": "EHR backend is running"}
