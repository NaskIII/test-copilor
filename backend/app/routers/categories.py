from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import crud, schemas, models
from ..auth import get_current_active_user
from ..database import get_db

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("/", response_model=List[schemas.CategoryResponse])
def list_categories(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    return crud.get_categories(db, current_user.id)


@router.post("/", response_model=schemas.CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    return crud.create_category(db, category, current_user.id)


@router.put("/{category_id}", response_model=schemas.CategoryResponse)
def update_category(
    category_id: int,
    category: schemas.CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    result = crud.update_category(db, category_id, category, current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="Category not found")
    return result


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    if not crud.delete_category(db, category_id, current_user.id):
        raise HTTPException(status_code=404, detail="Category not found")
