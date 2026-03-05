"""
Diagnostics Router
Handles file uploads, downloads, and retrieval of diagnostic images
"""

import os
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict, Field

from app.database.db import get_db
from app.models.diagnostics.diagnostics import Diagnostic
from app.routers.doctor import create_doctor_update

# ==================== PYDANTIC SCHEMAS ====================

class DiagnosticCreate(BaseModel):
    """Schema for creating diagnostic records"""
    image_type: str = Field(..., description="Type of diagnostic image")


class DiagnosticRead(BaseModel):
    """Schema for reading diagnostic records"""
    diagnostic_id: int
    patient_id: int
    image_type: str
    file_path: str
    original_name: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DiagnosticSummary(BaseModel):
    """Schema for diagnostic summary view"""
    diagnostic_id: int
    patient_id: int
    image_type: str
    original_name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==================== ROUTER SETUP ====================

router = APIRouter(
    prefix="/diagnostics",
    tags=["Diagnostics"],
    responses={404: {"description": "Not found"}},
)

# Create storage directory if it doesn't exist
STORAGE_DIR = "storage/app/public/diagnostics"
os.makedirs(STORAGE_DIR, exist_ok=True)

# ==================== HELPER FUNCTIONS ====================

async def save_upload_file(upload_file: UploadFile, patient_id: int, image_type: str) -> tuple:
    """
    Save uploaded file to storage directory with timestamped name
    
    Args:
        upload_file: File uploaded from client
        patient_id: Patient ID for organization
        image_type: Type of diagnostic image
        
    Returns:
        tuple: (file_path, original_name)
    """
    # Create patient-specific directory
    patient_dir = os.path.join(STORAGE_DIR, f"patient_{patient_id}")
    os.makedirs(patient_dir, exist_ok=True)
    
    # Generate timestamped filename
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    original_name = upload_file.filename
    name_parts = os.path.splitext(original_name)
    file_name = f"{timestamp}_{image_type.replace('/', '_')}_{name_parts[0]}{name_parts[1]}"
    
    file_path = os.path.join(patient_dir, file_name)
    
    # Save file
    try:
        content = await upload_file.read()
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    finally:
        await upload_file.close()
    
    # Return relative path for database storage
    relative_path = os.path.relpath(file_path, STORAGE_DIR).replace(os.sep, '/')
    
    return relative_path, original_name


def delete_diagnostic_file(file_path: str) -> None:
    """Delete diagnostic file from storage"""
    full_path = os.path.join(STORAGE_DIR, file_path)
    try:
        if os.path.exists(full_path):
            os.remove(full_path)
    except Exception as e:
        print(f"Warning: Failed to delete file {full_path}: {str(e)}")


# ==================== ENDPOINTS ====================

@router.post("/", response_model=DiagnosticRead, status_code=status.HTTP_201_CREATED)
async def create_diagnostic(
    patient_id: int = Form(...),
    image_type: str = Form(..., description="Type of diagnostic image"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload and create diagnostic image record
    
    - **patient_id**: Patient ID (required)
    - **image_type**: Type of diagnostic image (required)
    - **file**: Image file to upload (required)
    """
    # Validate file type
    allowed_types = [
        "image/jpeg", "image/png", "image/gif", "image/tiff", 
        "application/dicom", "image/heic", "image/heif", "image/webp"
    ]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
        )
    
    # Save file to storage
    file_path, original_name = await save_upload_file(file, patient_id, image_type)
    
    # Create database record
    db_diagnostic = Diagnostic(
        patient_id=patient_id,
        image_type=image_type,
        file_path=file_path,
        original_name=original_name,
    )
    
    db.add(db_diagnostic)
    create_doctor_update(db, patient_id, "Diagnostics Added")
    db.commit()
    db.refresh(db_diagnostic)
    
    return db_diagnostic


@router.get("/patient/{patient_id}", response_model=List[DiagnosticRead])
def list_patient_diagnostics(
    patient_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    List all diagnostic images for a patient
    
    - **patient_id**: Patient ID to retrieve diagnostics for
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    """
    diagnostics = db.query(Diagnostic).filter(
        Diagnostic.patient_id == patient_id
    ).order_by(Diagnostic.created_at.desc()).offset(skip).limit(limit).all()
    
    return diagnostics


@router.get("/{diagnostic_id}", response_model=DiagnosticRead)
def get_diagnostic(
    diagnostic_id: int,
    db: Session = Depends(get_db),
):
    """Get single diagnostic record by ID"""
    diagnostic = db.query(Diagnostic).filter(Diagnostic.diagnostic_id == diagnostic_id).first()
    
    if not diagnostic:
        raise HTTPException(status_code=404, detail="Diagnostic not found")
    
    return diagnostic


@router.get("/{diagnostic_id}/file")
def download_diagnostic_file(
    diagnostic_id: int,
    db: Session = Depends(get_db),
):
    """
    Download diagnostic image file
    Returns the actual image file for viewing/downloading
    """
    diagnostic = db.query(Diagnostic).filter(Diagnostic.diagnostic_id == diagnostic_id).first()
    
    if not diagnostic:
        raise HTTPException(status_code=404, detail="Diagnostic not found")
    
    # Normalize relative path to use correct separator for the OS
    normalized_rel_path = diagnostic.file_path.replace('/', os.sep)
    file_path = os.path.join(STORAGE_DIR, normalized_rel_path)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on storage")
    
    import mimetypes
    mime_type, _ = mimetypes.guess_type(file_path)
    
    return FileResponse(
        path=file_path,
        filename=diagnostic.original_name,
        media_type=mime_type or "application/octet-stream"
    )


@router.get("/file-by-path")
def get_file_by_path(path: str):
    """
    Get diagnostic file by relative path
    """
    import mimetypes
    # Normalize relative path to use correct separator for the OS
    normalized_path = path.replace('/', os.sep)
    file_path = os.path.join(STORAGE_DIR, normalized_path)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    mime_type, _ = mimetypes.guess_type(file_path)
    return FileResponse(file_path, media_type=mime_type or "application/octet-stream")


@router.delete("/{diagnostic_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_diagnostic(
    diagnostic_id: int,
    db: Session = Depends(get_db),
):
    """
    Delete diagnostic record and associated image file
    This permanently removes both database record and file from storage
    """
    diagnostic = db.query(Diagnostic).filter(Diagnostic.diagnostic_id == diagnostic_id).first()
    
    if not diagnostic:
        raise HTTPException(status_code=404, detail="Diagnostic not found")
    
    # Delete file from storage
    delete_diagnostic_file(diagnostic.file_path)
    
    # Delete database record
    db.delete(diagnostic)
    db.commit()
    
    return None


@router.get("/patient/{patient_id}/summary", response_model=List[DiagnosticSummary])
def get_patient_diagnostics_summary(
    patient_id: int,
    db: Session = Depends(get_db),
):
    """
    Get summary of all diagnostic images for a patient
    Returns lightweight view suitable for patient overview/lists
    """
    diagnostics = db.query(Diagnostic).filter(
        Diagnostic.patient_id == patient_id
    ).order_by(Diagnostic.created_at.desc()).all()
    
    return diagnostics
