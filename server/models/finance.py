from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

# Transaction type literals
InflowCategory = Literal['salary', 'freelance', 'uncategorized_income']
OutflowCategory = Literal[
    'housing', 'food', 'transport', 'shopping',
    'entertainment', 'utilities', 'healthcare', 'other'
]
TransactionCategory = Literal[
    'salary', 'freelance', 'uncategorized_income',
    'housing', 'food', 'transport', 'shopping',
    'entertainment', 'utilities', 'healthcare', 'other'
]
TransactionType = Literal['inflow', 'outflow']


class Asset(BaseModel):
    id: str
    name: str
    category: Literal['cash', 'investment', 'property']
    value: float
    description: Optional[str] = None


class Liability(BaseModel):
    id: str
    name: str
    category: Literal['loan', 'credit_card', 'mortgage', 'other']
    amount: float
    description: Optional[str] = None


class FinancialSummary(BaseModel):
    total_assets: float = Field(alias='totalAssets')
    total_liabilities: float = Field(alias='totalLiabilities')
    net_worth: float = Field(alias='netWorth')
    assets: list[Asset]
    liabilities: list[Liability]
    last_updated: datetime = Field(alias='lastUpdated')

    model_config = {'populate_by_name': True}


class FinanceApiResponse(BaseModel):
    success: bool
    data: Optional[FinancialSummary] = None
    error: Optional[str] = None


# Transaction models
class Transaction(BaseModel):
    id: str
    name: str
    amount: float
    merchant: str
    date: date
    category: TransactionCategory
    type: TransactionType
    description: Optional[str] = None


class DailyCashflow(BaseModel):
    date: date
    inflows: float
    outflows: float
    net: float


class CashflowSummary(BaseModel):
    total_inflows: float = Field(alias='totalInflows')
    total_outflows: float = Field(alias='totalOutflows')
    net_cashflow: float = Field(alias='netCashflow')

    model_config = {'populate_by_name': True}


class TransactionsData(BaseModel):
    transactions: list[Transaction]
    daily_cashflow: list[DailyCashflow] = Field(alias='dailyCashflow')
    summary: CashflowSummary

    model_config = {'populate_by_name': True}


class TransactionsApiResponse(BaseModel):
    success: bool
    data: Optional[TransactionsData] = None
    error: Optional[str] = None
