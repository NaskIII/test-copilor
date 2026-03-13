from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime

from . import models, schemas
from .auth import get_password_hash


# ─── Users ───────────────────────────────────────────────────────────────────

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    _seed_default_categories(db, db_user.id)
    return db_user


def _seed_default_categories(db: Session, user_id: int) -> None:
    defaults = [
        # Expenses
        {"name": "Alimentação", "icon": "🍔", "color": "#f44336", "type": models.TransactionType.expense},
        {"name": "Transporte", "icon": "🚗", "color": "#ff9800", "type": models.TransactionType.expense},
        {"name": "Moradia", "icon": "🏠", "color": "#795548", "type": models.TransactionType.expense},
        {"name": "Saúde", "icon": "🏥", "color": "#e91e63", "type": models.TransactionType.expense},
        {"name": "Educação", "icon": "📚", "color": "#9c27b0", "type": models.TransactionType.expense},
        {"name": "Lazer", "icon": "🎮", "color": "#00bcd4", "type": models.TransactionType.expense},
        {"name": "Roupas", "icon": "👕", "color": "#ff5722", "type": models.TransactionType.expense},
        {"name": "Outros Gastos", "icon": "💸", "color": "#607d8b", "type": models.TransactionType.expense},
        # Income
        {"name": "Salário", "icon": "💼", "color": "#4caf50", "type": models.TransactionType.income},
        {"name": "Freelance", "icon": "💻", "color": "#2196f3", "type": models.TransactionType.income},
        {"name": "Investimentos", "icon": "📈", "color": "#009688", "type": models.TransactionType.income},
        {"name": "Outros Ganhos", "icon": "💰", "color": "#8bc34a", "type": models.TransactionType.income},
    ]
    for cat in defaults:
        db.add(models.Category(user_id=user_id, **cat))
    db.commit()


# ─── Categories ──────────────────────────────────────────────────────────────

def get_categories(db: Session, user_id: int) -> List[models.Category]:
    return db.query(models.Category).filter(models.Category.user_id == user_id).all()


def get_category(db: Session, category_id: int, user_id: int) -> Optional[models.Category]:
    return db.query(models.Category).filter(
        models.Category.id == category_id,
        models.Category.user_id == user_id,
    ).first()


def create_category(db: Session, category: schemas.CategoryCreate, user_id: int) -> models.Category:
    db_category = models.Category(**category.model_dump(), user_id=user_id)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_category(
    db: Session, category_id: int, category: schemas.CategoryUpdate, user_id: int
) -> Optional[models.Category]:
    db_category = get_category(db, category_id, user_id)
    if not db_category:
        return None
    for field, value in category.model_dump(exclude_unset=True).items():
        setattr(db_category, field, value)
    db.commit()
    db.refresh(db_category)
    return db_category


def delete_category(db: Session, category_id: int, user_id: int) -> bool:
    db_category = get_category(db, category_id, user_id)
    if not db_category:
        return False
    db.delete(db_category)
    db.commit()
    return True


# ─── Transactions ─────────────────────────────────────────────────────────────

def get_transactions(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    type: Optional[models.TransactionType] = None,
    category_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
) -> tuple[List[models.Transaction], int]:
    query = db.query(models.Transaction).filter(models.Transaction.user_id == user_id)
    if type:
        query = query.filter(models.Transaction.type == type)
    if category_id:
        query = query.filter(models.Transaction.category_id == category_id)
    if start_date:
        query = query.filter(models.Transaction.date >= start_date)
    if end_date:
        query = query.filter(models.Transaction.date <= end_date)
    total = query.count()
    items = query.order_by(models.Transaction.date.desc()).offset(skip).limit(limit).all()
    return items, total


def get_transaction(db: Session, transaction_id: int, user_id: int) -> Optional[models.Transaction]:
    return db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == user_id,
    ).first()


def create_transaction(
    db: Session, transaction: schemas.TransactionCreate, user_id: int
) -> models.Transaction:
    db_transaction = models.Transaction(**transaction.model_dump(), user_id=user_id)
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def update_transaction(
    db: Session, transaction_id: int, transaction: schemas.TransactionUpdate, user_id: int
) -> Optional[models.Transaction]:
    db_transaction = get_transaction(db, transaction_id, user_id)
    if not db_transaction:
        return None
    for field, value in transaction.model_dump(exclude_unset=True).items():
        setattr(db_transaction, field, value)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def delete_transaction(db: Session, transaction_id: int, user_id: int) -> bool:
    db_transaction = get_transaction(db, transaction_id, user_id)
    if not db_transaction:
        return False
    db.delete(db_transaction)
    db.commit()
    return True


# ─── Budgets ──────────────────────────────────────────────────────────────────

def get_budgets(db: Session, user_id: int, month: int, year: int) -> List[models.Budget]:
    return db.query(models.Budget).filter(
        models.Budget.user_id == user_id,
        models.Budget.month == month,
        models.Budget.year == year,
    ).all()


def create_or_update_budget(
    db: Session, budget: schemas.BudgetCreate, user_id: int
) -> models.Budget:
    existing = db.query(models.Budget).filter(
        models.Budget.user_id == user_id,
        models.Budget.month == budget.month,
        models.Budget.year == budget.year,
        models.Budget.category_id == budget.category_id,
    ).first()
    if existing:
        existing.amount = budget.amount
        db.commit()
        db.refresh(existing)
        return existing
    db_budget = models.Budget(**budget.model_dump(), user_id=user_id)
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget


# ─── Reports ──────────────────────────────────────────────────────────────────

def get_monthly_report(
    db: Session, user_id: int, month: int, year: int
) -> schemas.ReportResponse:
    # Totals
    income = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.type == models.TransactionType.income,
        extract("month", models.Transaction.date) == month,
        extract("year", models.Transaction.date) == year,
    ).scalar() or 0.0

    expenses = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.type == models.TransactionType.expense,
        extract("month", models.Transaction.date) == month,
        extract("year", models.Transaction.date) == year,
    ).scalar() or 0.0

    count = db.query(func.count(models.Transaction.id)).filter(
        models.Transaction.user_id == user_id,
        extract("month", models.Transaction.date) == month,
        extract("year", models.Transaction.date) == year,
    ).scalar() or 0

    monthly_summary = schemas.MonthlySummary(
        month=month,
        year=year,
        total_income=income,
        total_expenses=expenses,
        balance=income - expenses,
        transaction_count=count,
    )

    # By category (expenses only)
    from sqlalchemy import case
    cat_rows = db.query(
        models.Category.id,
        models.Category.name,
        models.Category.icon,
        models.Category.color,
        func.sum(models.Transaction.amount).label("total"),
        func.count(models.Transaction.id).label("count"),
    ).join(
        models.Transaction,
        models.Transaction.category_id == models.Category.id,
    ).filter(
        models.Transaction.user_id == user_id,
        models.Transaction.type == models.TransactionType.expense,
        extract("month", models.Transaction.date) == month,
        extract("year", models.Transaction.date) == year,
    ).group_by(models.Category.id).all()

    by_category = []
    for row in cat_rows:
        by_category.append(schemas.CategorySummary(
            category_id=row.id,
            category_name=row.name,
            category_icon=row.icon,
            category_color=row.color,
            total=row.total,
            count=row.count,
            percentage=round((row.total / expenses * 100) if expenses > 0 else 0, 2),
        ))

    # Daily trend
    daily_rows = db.query(
        func.date(models.Transaction.date).label("day"),
        models.Transaction.type,
        func.sum(models.Transaction.amount).label("total"),
    ).filter(
        models.Transaction.user_id == user_id,
        extract("month", models.Transaction.date) == month,
        extract("year", models.Transaction.date) == year,
    ).group_by(func.date(models.Transaction.date), models.Transaction.type).all()

    daily_map: dict = {}
    for row in daily_rows:
        day_str = str(row.day)
        if day_str not in daily_map:
            daily_map[day_str] = {"income": 0.0, "expenses": 0.0}
        if row.type == models.TransactionType.income:
            daily_map[day_str]["income"] = row.total
        else:
            daily_map[day_str]["expenses"] = row.total

    daily_trend = [
        schemas.DailySummary(date=k, income=v["income"], expenses=v["expenses"])
        for k, v in sorted(daily_map.items())
    ]

    return schemas.ReportResponse(
        monthly_summary=monthly_summary,
        by_category=by_category,
        daily_trend=daily_trend,
    )


def get_annual_summary(db: Session, user_id: int, year: int) -> List[schemas.MonthlySummary]:
    summaries = []
    for month in range(1, 13):
        income = db.query(func.sum(models.Transaction.amount)).filter(
            models.Transaction.user_id == user_id,
            models.Transaction.type == models.TransactionType.income,
            extract("month", models.Transaction.date) == month,
            extract("year", models.Transaction.date) == year,
        ).scalar() or 0.0

        expenses = db.query(func.sum(models.Transaction.amount)).filter(
            models.Transaction.user_id == user_id,
            models.Transaction.type == models.TransactionType.expense,
            extract("month", models.Transaction.date) == month,
            extract("year", models.Transaction.date) == year,
        ).scalar() or 0.0

        count = db.query(func.count(models.Transaction.id)).filter(
            models.Transaction.user_id == user_id,
            extract("month", models.Transaction.date) == month,
            extract("year", models.Transaction.date) == year,
        ).scalar() or 0

        summaries.append(schemas.MonthlySummary(
            month=month,
            year=year,
            total_income=income,
            total_expenses=expenses,
            balance=income - expenses,
            transaction_count=count,
        ))
    return summaries
