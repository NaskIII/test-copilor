from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from .. import crud, schemas, models
from ..auth import get_current_active_user
from ..database import get_db

router = APIRouter(prefix="/api/budgets", tags=["budgets"])


@router.get("/", response_model=List[schemas.BudgetResponse])
def list_budgets(
    month: int = datetime.utcnow().month,
    year: int = datetime.utcnow().year,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    return crud.get_budgets(db, current_user.id, month, year)


@router.post("/", response_model=schemas.BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_budget(
    budget: schemas.BudgetCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    return crud.create_or_update_budget(db, budget, current_user.id)
