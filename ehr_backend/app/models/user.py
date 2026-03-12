from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Date, Text, DateTime
from app.database.base import Base
import enum

class UserRole(str, enum.Enum):
    """User account types supported by the EHR system"""
    NURSE = "nurse"
    DOCTOR = "doctor"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    # Primary account identification
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    
    # New Demographics for Registration and EHR records
    birthday = Column(Date, nullable=True) # Recommended format: YYYY-MM-DD
    age = Column(Integer, nullable=True)
    sex = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    birth_place = Column(String(255), nullable=True)
    
    # Unique username for login authentication
    username = Column(String(100), unique=True, index=True, nullable=False)

    # System configuration and status
    role = Column(String(20), nullable=False, default=UserRole.NURSE.value)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
