from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.services.auth_service import authenticate_user, create_user
from pydantic import BaseModel, EmailStr, ConfigDict

router = APIRouter(prefix="/auth", tags=["Authentication"])

class RegisterUser(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str  # 'nurse' or 'doctor'
    model_config = ConfigDict(extra="forbid")

@router.post("/login")
def login(email: str, password: str, db: Session = Depends(get_db)):
    result = authenticate_user(db, email, password)

    if not result:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return result

@router.post("/register")
def register(user: RegisterUser, db: Session = Depends(get_db)):
    created_user = create_user(db, user.full_name, user.email, user.password, user.role)
    if not created_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    return {"message": f"{user.role.capitalize()} account created successfully", "user_id": created_user.id}
