from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.db import get_db
from app.services.auth_service import (
    authenticate_user, 
    create_user,
    get_user_by_id,
    get_users_by_role,
    update_user_role,
    deactivate_user,
    activate_user
)
from app.models.user import UserRole
from pydantic import BaseModel, EmailStr, ConfigDict

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ──────────────── Pydantic Schemas ────────────────

class UserRegister(BaseModel):
    """Schema for user registration"""
    full_name: str
    email: EmailStr
    password: str
    role: str  # 'nurse', 'doctor', or 'admin'
    model_config = ConfigDict(extra="forbid")


class UserRead(BaseModel):
    """Schema for reading user data"""
    id: int
    full_name: str
    email: str
    role: str
    is_active: bool
    
    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    """Schema for updating user role"""
    role: str  # 'nurse', 'doctor', or 'admin'
    model_config = ConfigDict(extra="forbid")


class LoginResponse(BaseModel):
    """Schema for login response with role for frontend redirection"""
    access_token: str
    token_type: str
    role: str  # The account type: 'nurse', 'doctor', or 'admin'
    full_name: str
    user_id: int


# ──────────────── Authentication Endpoints ────────────────

@router.post("/login", response_model=LoginResponse)
def login(email: str, password: str, db: Session = Depends(get_db)):
    """
    Login endpoint that returns user role for frontend redirection.
    
    Response includes:
    - access_token: JWT token for API authentication
    - role: Account type (nurse, doctor, or admin) - Use this to redirect to appropriate dashboard
    - full_name: User's full name
    - user_id: User's ID
    """
    result = authenticate_user(db, email, password)

    if not result:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return result


# ──────────────── Nurse Account Management ────────────────

@router.post("/nurses", response_model=UserRead, status_code=201)
def create_nurse_account(user: UserRegister, db: Session = Depends(get_db)):
    """Create a new Nurse account"""
    user.role = "nurse"
    try:
        created_user = create_user(db, user.full_name, user.email, user.password, user.role)
        if not created_user:
            raise HTTPException(status_code=400, detail="User with this email already exists")
        return created_user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/nurses", response_model=List[UserRead])
def get_all_nurses(db: Session = Depends(get_db)):
    """Get all Nurse accounts"""
    nurses = get_users_by_role(db, "nurse")
    return nurses


@router.get("/nurses/{nurse_id}", response_model=UserRead)
def get_nurse(nurse_id: int, db: Session = Depends(get_db)):
    """Get a specific Nurse account by ID"""
    user = get_user_by_id(db, nurse_id)
    if not user or user.role != UserRole.NURSE:
        raise HTTPException(status_code=404, detail="Nurse not found")
    return user


@router.put("/nurses/{nurse_id}", response_model=UserRead)
def update_nurse(nurse_id: int, update_data: UserUpdate, db: Session = Depends(get_db)):
    """Update a Nurse's role"""
    user = get_user_by_id(db, nurse_id)
    if not user or user.role != UserRole.NURSE:
        raise HTTPException(status_code=404, detail="Nurse not found")
    
    try:
        updated_user = update_user_role(db, nurse_id, update_data.role)
        if not updated_user:
            raise HTTPException(status_code=404, detail="Nurse not found")
        return updated_user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/nurses/{nurse_id}", status_code=204)
def delete_nurse(nurse_id: int, db: Session = Depends(get_db)):
    """Deactivate a Nurse account"""
    user = get_user_by_id(db, nurse_id)
    if not user or user.role != UserRole.NURSE:
        raise HTTPException(status_code=404, detail="Nurse not found")
    
    deactivate_user(db, nurse_id)
    return None


# ──────────────── Doctor Account Management ────────────────

@router.post("/doctors", response_model=UserRead, status_code=201)
def create_doctor_account(user: UserRegister, db: Session = Depends(get_db)):
    """Create a new Doctor account"""
    user.role = "doctor"
    try:
        created_user = create_user(db, user.full_name, user.email, user.password, user.role)
        if not created_user:
            raise HTTPException(status_code=400, detail="User with this email already exists")
        return created_user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/doctors", response_model=List[UserRead])
def get_all_doctors(db: Session = Depends(get_db)):
    """Get all Doctor accounts"""
    doctors = get_users_by_role(db, "doctor")
    return doctors


@router.get("/doctors/{doctor_id}", response_model=UserRead)
def get_doctor(doctor_id: int, db: Session = Depends(get_db)):
    """Get a specific Doctor account by ID"""
    user = get_user_by_id(db, doctor_id)
    if not user or user.role != UserRole.DOCTOR:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return user


@router.put("/doctors/{doctor_id}", response_model=UserRead)
def update_doctor(doctor_id: int, update_data: UserUpdate, db: Session = Depends(get_db)):
    """Update a Doctor's role"""
    user = get_user_by_id(db, doctor_id)
    if not user or user.role != UserRole.DOCTOR:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    try:
        updated_user = update_user_role(db, doctor_id, update_data.role)
        if not updated_user:
            raise HTTPException(status_code=404, detail="Doctor not found")
        return updated_user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/doctors/{doctor_id}", status_code=204)
def delete_doctor(doctor_id: int, db: Session = Depends(get_db)):
    """Deactivate a Doctor account"""
    user = get_user_by_id(db, doctor_id)
    if not user or user.role != UserRole.DOCTOR:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    deactivate_user(db, doctor_id)
    return None


# ──────────────── Admin Account Management ────────────────

@router.post("/admins", response_model=UserRead, status_code=201)
def create_admin_account(user: UserRegister, db: Session = Depends(get_db)):
    """Create a new Admin account"""
    user.role = "admin"
    try:
        created_user = create_user(db, user.full_name, user.email, user.password, user.role)
        if not created_user:
            raise HTTPException(status_code=400, detail="User with this email already exists")
        return created_user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/admins/{admin_id}", response_model=UserRead)
def update_admin(admin_id: int, update_data: UserUpdate, db: Session = Depends(get_db)):
    """Update an Admin's role"""
    user = get_user_by_id(db, admin_id)
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    try:
        updated_user = update_user_role(db, admin_id, update_data.role)
        if not updated_user:
            raise HTTPException(status_code=404, detail="Admin not found")
        return updated_user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/admins/{admin_id}", status_code=204)
def delete_admin(admin_id: int, db: Session = Depends(get_db)):
    """Deactivate an Admin account"""
    user = get_user_by_id(db, admin_id)
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    deactivate_user(db, admin_id)
    return None

