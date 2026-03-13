from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from .. import crud, schemas, models
from ..auth import get_current_active_user
from ..database import get_db

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/monthly", response_model=schemas.ReportResponse)
def monthly_report(
    month: int = Query(default=datetime.utcnow().month, ge=1, le=12),
    year: int = Query(default=datetime.utcnow().year, ge=2000),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    return crud.get_monthly_report(db, current_user.id, month, year)


@router.get("/annual", response_model=List[schemas.MonthlySummary])
def annual_report(
    year: int = Query(default=datetime.utcnow().year, ge=2000),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    return crud.get_annual_summary(db, current_user.id, year)
