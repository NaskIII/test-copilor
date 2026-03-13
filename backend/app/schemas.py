from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from .models import TransactionType


# ─── Auth ────────────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# ─── User ────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Category ────────────────────────────────────────────────────────────────

class CategoryCreate(BaseModel):
    name: str
    icon: Optional[str] = "💰"
    color: Optional[str] = "#3f51b5"
    type: TransactionType


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None


class CategoryResponse(BaseModel):
    id: int
    name: str
    icon: str
    color: str
    type: TransactionType
    user_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Transaction ─────────────────────────────────────────────────────────────

class TransactionCreate(BaseModel):
    amount: float
    description: str
    notes: Optional[str] = None
    type: TransactionType
    date: datetime
    category_id: Optional[int] = None

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Amount must be positive")
        return v


class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    date: Optional[datetime] = None
    category_id: Optional[int] = None


class TransactionResponse(BaseModel):
    id: int
    amount: float
    description: str
    notes: Optional[str]
    type: TransactionType
    date: datetime
    user_id: int
    category_id: Optional[int]
    category: Optional[CategoryResponse] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TransactionListResponse(BaseModel):
    items: List[TransactionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# ─── Budget ──────────────────────────────────────────────────────────────────

class BudgetCreate(BaseModel):
    amount: float
    month: int
    year: int
    category_id: Optional[int] = None

    @field_validator("month")
    @classmethod
    def month_valid(cls, v: int) -> int:
        if not 1 <= v <= 12:
            raise ValueError("Month must be between 1 and 12")
        return v


class BudgetResponse(BaseModel):
    id: int
    amount: float
    month: int
    year: int
    category_id: Optional[int]
    category: Optional[CategoryResponse] = None
    user_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Reports ─────────────────────────────────────────────────────────────────

class MonthlySummary(BaseModel):
    month: int
    year: int
    total_income: float
    total_expenses: float
    balance: float
    transaction_count: int


class CategorySummary(BaseModel):
    category_id: Optional[int]
    category_name: str
    category_icon: str
    category_color: str
    total: float
    count: int
    percentage: float


class DailySummary(BaseModel):
    date: str
    income: float
    expenses: float


class ReportResponse(BaseModel):
    monthly_summary: MonthlySummary
    by_category: List[CategorySummary]
    daily_trend: List[DailySummary]
    budget_status: Optional[dict] = None
