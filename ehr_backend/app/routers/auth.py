from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from app.database.db import get_db
from app.services.auth_service import (
    authenticate_user, 
    create_user,
    get_user_by_id,
    get_all_users,
    get_users_by_role,
    update_user_role,
    deactivate_user,
    activate_user
)
from app.models.user import UserRole
from app.models.audit_log import AuditLog
from pydantic import BaseModel, EmailStr, ConfigDict

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ──────────────── Pydantic Schemas ────────────────

class UserRegister(BaseModel):
    """Schema for user registration"""
    full_name: str
    email: EmailStr
    password: str
    role: str  # 'nurse', 'doctor', or 'admin'
    username: Optional[str] = None
    birthday: Optional[str] = None  # YYYY-MM-DD
    age: Optional[int] = None
    sex: Optional[str] = None
    address: Optional[str] = None
    birth_place: Optional[str] = None
    model_config = ConfigDict(extra="forbid")


class UserRead(BaseModel):
    """Schema for reading user data"""
    id: int
    full_name: str
    email: str
    role: str
    is_active: bool
    created_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class UserDetailRead(BaseModel):
    """Schema for full user details shown in Admin User Details screen."""
    id: int
    full_name: str
    email: str
    username: str
    role: str
    is_active: bool
    birthday: Optional[date] = None
    age: Optional[int] = None
    sex: Optional[str] = None
    address: Optional[str] = None
    birth_place: Optional[str] = None
    created_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None
    created_date: Optional[datetime] = None
    last_login: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    """Schema for updating user role"""
    role: str  # 'nurse', 'doctor', or 'admin'
    model_config = ConfigDict(extra="forbid")


class UserProfileUpdate(BaseModel):
    """Schema for updating user profile information"""
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    birthday: Optional[str] = None  # YYYY-MM-DD
    age: Optional[int] = None
    sex: Optional[str] = None
    address: Optional[str] = None
    birth_place: Optional[str] = None
    model_config = ConfigDict(extra="forbid")


class LoginResponse(BaseModel):
    """Schema for login response with role for frontend redirection"""
    access_token: str
    token_type: str
    role: str  # The account type: 'nurse', 'doctor', or 'admin'
    full_name: str
    user_id: int


class LoginRequest(BaseModel):
    """Schema for login request"""
    email: str
    password: str


# ──────────────── Authentication Endpoints ────────────────

@router.post("/login", response_model=LoginResponse)
def login(request: Optional[LoginRequest] = None, email: Optional[str] = None, password: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Login endpoint that returns user role for frontend redirection.
    Supports both JSON body and query parameters for compatibility.
    """
    login_email = email
    login_password = password

    if request:
        login_email = request.email
        login_password = request.password

    if not login_email or not login_password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    print(f"DEBUG: Login attempt for email: {login_email}")
    result = authenticate_user(db, login_email, login_password)

    if not result:
        print(f"DEBUG: Login failed for email: {login_email}")
        raise HTTPException(status_code=401, detail="Invalid email or password")

    print(f"DEBUG: Login successful for email: {login_email}, role: {result['role']}")
    return result


@router.get("/users", response_model=List[UserRead])
def get_all_accounts(db: Session = Depends(get_db)):
    """Get all user accounts for Admin Home list."""
    return get_all_users(db)


@router.get("/users/{user_id}", response_model=UserDetailRead)
def get_account_details(user_id: int, db: Session = Depends(get_db)):
    """Get full details for a specific user account."""
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    created_log = (
        db.query(AuditLog)
        .filter(AuditLog.user_id == user_id)
        .order_by(AuditLog.created_at.asc())
        .first()
    )
    last_login_log = (
        db.query(AuditLog)
        .filter(AuditLog.user_id == user_id, AuditLog.action.ilike("%login successful%"))
        .order_by(AuditLog.created_at.desc())
        .first()
    )

    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "username": user.username,
        "role": user.role,
        "is_active": user.is_active,
        "birthday": user.birthday,
        "age": user.age,
        "sex": user.sex,
        "address": user.address,
        "birth_place": user.birth_place,
        "created_at": user.created_at or (created_log.created_at if created_log else None),
        "last_login_at": last_login_log.created_at if last_login_log else None,
        "created_date": created_log.created_at if created_log else None,
        "last_login": last_login_log.created_at if last_login_log else None,
    }


@router.put("/users/{user_id}", response_model=UserDetailRead)
def update_user_profile(user_id: int, update_data: UserProfileUpdate, db: Session = Depends(get_db)):
    """Update user profile information (name, email, birthday, sex, address, etc.) from Admin Home."""
    try:
        from app.services.auth_service import update_user_info
        updated_user = update_user_info(db, user_id, update_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": updated_user.id,
        "full_name": updated_user.full_name,
        "email": updated_user.email,
        "username": updated_user.username,
        "role": updated_user.role,
        "is_active": updated_user.is_active,
        "birthday": updated_user.birthday,
        "age": updated_user.age,
        "sex": updated_user.sex,
        "address": updated_user.address,
        "birth_place": updated_user.birth_place,
        "created_at": updated_user.created_at,
        "last_login_at": None,
        "created_date": updated_user.created_at,
        "last_login": None,
    }


@router.put("/users/{user_id}/role", response_model=UserRead)
def update_account_role(user_id: int, update_data: UserUpdate, db: Session = Depends(get_db)):
    """Update any account role (admin, doctor, nurse) from Admin Home."""
    try:
        updated_user = update_user_role(db, user_id, update_data.role)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")

    return updated_user


# ──────────────── Nurse Account Management ────────────────

@router.post("/nurses", response_model=UserRead, status_code=201)
def create_nurse_account(user: UserRegister, db: Session = Depends(get_db)):
    """Create a new Nurse account"""
    user.role = "nurse"
    try:
        created_user = create_user(
            db, user.full_name, user.email, user.password, user.role,
            username=user.username, birthday=user.birthday, age=user.age,
            sex=user.sex, address=user.address, birth_place=user.birth_place
        )
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
    if not user or str(user.role).lower() != UserRole.NURSE.value:
        raise HTTPException(status_code=404, detail="Nurse not found")
    return user


@router.put("/nurses/{nurse_id}", response_model=UserRead)
def update_nurse(nurse_id: int, update_data: UserUpdate, db: Session = Depends(get_db)):
    """Update a Nurse's role"""
    user = get_user_by_id(db, nurse_id)
    if not user or str(user.role).lower() != UserRole.NURSE.value:
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
    if not user or str(user.role).lower() != UserRole.NURSE.value:
        raise HTTPException(status_code=404, detail="Nurse not found")
    
    deactivate_user(db, nurse_id)
    return None


# ──────────────── Doctor Account Management ────────────────

@router.post("/doctors", response_model=UserRead, status_code=201)
def create_doctor_account(user: UserRegister, db: Session = Depends(get_db)):
    """Create a new Doctor account"""
    user.role = "doctor"
    try:
        created_user = create_user(
            db, user.full_name, user.email, user.password, user.role,
            username=user.username, birthday=user.birthday, age=user.age,
            sex=user.sex, address=user.address, birth_place=user.birth_place
        )
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
    if not user or str(user.role).lower() != UserRole.DOCTOR.value:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return user


@router.put("/doctors/{doctor_id}", response_model=UserRead)
def update_doctor(doctor_id: int, update_data: UserUpdate, db: Session = Depends(get_db)):
    """Update a Doctor's role"""
    user = get_user_by_id(db, doctor_id)
    if not user or str(user.role).lower() != UserRole.DOCTOR.value:
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
    if not user or str(user.role).lower() != UserRole.DOCTOR.value:
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
    if not user or str(user.role).lower() != UserRole.ADMIN.value:
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
    if not user or str(user.role).lower() != UserRole.ADMIN.value:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    deactivate_user(db, admin_id)
    return None

