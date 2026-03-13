from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from .. import crud, schemas, models
from ..auth import get_current_active_user
from ..database import get_db

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.get("/", response_model=schemas.TransactionListResponse)
def list_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    type: Optional[models.TransactionType] = None,
    category_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    skip = (page - 1) * page_size
    items, total = crud.get_transactions(
        db, current_user.id, skip, page_size, type, category_id, start_date, end_date
    )
    total_pages = (total + page_size - 1) // page_size
    return schemas.TransactionListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("/", response_model=schemas.TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    if transaction.category_id:
        category = crud.get_category(db, transaction.category_id, current_user.id)
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
    return crud.create_transaction(db, transaction, current_user.id)


@router.get("/{transaction_id}", response_model=schemas.TransactionResponse)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    result = crud.get_transaction(db, transaction_id, current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return result


@router.put("/{transaction_id}", response_model=schemas.TransactionResponse)
def update_transaction(
    transaction_id: int,
    transaction: schemas.TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    result = crud.update_transaction(db, transaction_id, transaction, current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return result


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    if not crud.delete_transaction(db, transaction_id, current_user.id):
        raise HTTPException(status_code=404, detail="Transaction not found")
