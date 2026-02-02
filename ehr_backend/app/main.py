from fastapi import FastAPI
from app.database.db import engine
from app.database.base import Base

# Models imports here:
from app.routers import auth, patient
from app.models.user import User
from app.models.patient import Patient  # Patient table

app = FastAPI(title="EHR Backend API")

app.include_router(auth.router) 
app.include_router(patient.router)

Base.metadata.create_all(bind=engine)

# Just to test that the backend are running
@app.get("/")
def root():
    return {"status": "EHR backend is running"}
