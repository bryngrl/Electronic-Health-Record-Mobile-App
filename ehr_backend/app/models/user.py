from sqlalchemy import Column, Integer, String, Boolean, Enum
from app.database.base import Base
import enum


class UserRole(str, enum.Enum):
    """User account types"""
    NURSE = "nurse"
    DOCTOR = "doctor"
    ADMIN = "admin"


# A table for users with three account types: nurse, doctor, admin
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)

    # Role: nurse, doctor, or admin
    role = Column(Enum(UserRole), nullable=False, default=UserRole.NURSE)

    is_active = Column(Boolean, default=True)
