from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routers import auth, categories, transactions, reports, budgets

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FinançasPro API",
    description="API para gerenciamento de finanças pessoais",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(transactions.router)
app.include_router(reports.router)
app.include_router(budgets.router)


@app.get("/")
def root():
    return {"message": "FinançasPro API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
