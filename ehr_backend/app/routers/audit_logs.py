from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])


class AuditLogCreate(BaseModel):
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    user_role: Optional[str] = None
    action: str
    details: Optional[str] = None
    model_config = ConfigDict(extra="forbid")


class AuditLogRead(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    user_role: Optional[str] = None
    action: str
    details: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


@router.post("", response_model=AuditLogRead, status_code=201)
def create_audit_log(payload: AuditLogCreate, db: Session = Depends(get_db)):
    log = AuditLog(
        user_id=payload.user_id,
        user_name=payload.user_name,
        user_role=payload.user_role,
        action=payload.action,
        details=payload.details,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/users/{user_id}", response_model=List[AuditLogRead])
def get_user_audit_logs(user_id: int, limit: int = 50, db: Session = Depends(get_db)):
    safe_limit = min(max(limit, 1), 200)
    return (
        db.query(AuditLog)
        .filter(AuditLog.user_id == user_id)
        .order_by(AuditLog.created_at.desc())
        .limit(safe_limit)
        .all()
    )
