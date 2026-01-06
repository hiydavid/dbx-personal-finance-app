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


# Asset/Liability create request models
class AssetCreate(BaseModel):
    name: str
    category: Literal['cash', 'investment', 'property']
    value: float
    description: Optional[str] = None


class LiabilityCreate(BaseModel):
    name: str
    category: Literal['loan', 'credit_card', 'mortgage', 'other']
    amount: float
    description: Optional[str] = None


# Asset/Liability API response models
class AssetApiResponse(BaseModel):
    success: bool
    data: Optional[Asset] = None
    error: Optional[str] = None


class LiabilityApiResponse(BaseModel):
    success: bool
    data: Optional[Liability] = None
    error: Optional[str] = None


# Investment models
AssetClass = Literal['stocks', 'bonds', 'cash']


class Holding(BaseModel):
    id: str
    ticker: str
    name: str
    asset_class: AssetClass = Field(alias='assetClass')
    shares: float
    cost_basis: float = Field(alias='costBasis')
    current_price: float = Field(alias='currentPrice')
    current_value: float = Field(alias='currentValue')
    gain_loss: float = Field(alias='gainLoss')
    gain_loss_percent: float = Field(alias='gainLossPercent')
    day_change: float = Field(alias='dayChange')
    week_change: float = Field(alias='weekChange')
    month_change: float = Field(alias='monthChange')
    ytd_change: float = Field(alias='ytdChange')
    year_change: float = Field(alias='yearChange')

    model_config = {'populate_by_name': True}


class AssetClassAllocation(BaseModel):
    asset_class: AssetClass = Field(alias='assetClass')
    value: float
    percentage: float
    holdings_count: int = Field(alias='holdingsCount')

    model_config = {'populate_by_name': True}


class PortfolioHistoryPoint(BaseModel):
    date: date
    value: float


class InvestmentsSummary(BaseModel):
    total_value: float = Field(alias='totalValue')
    total_cost_basis: float = Field(alias='totalCostBasis')
    total_gain_loss: float = Field(alias='totalGainLoss')
    total_gain_loss_percent: float = Field(alias='totalGainLossPercent')
    day_change: float = Field(alias='dayChange')
    day_change_percent: float = Field(alias='dayChangePercent')

    model_config = {'populate_by_name': True}


class InvestmentsData(BaseModel):
    holdings: list[Holding]
    allocations: list[AssetClassAllocation]
    history: list[PortfolioHistoryPoint]
    summary: InvestmentsSummary

    model_config = {'populate_by_name': True}


class InvestmentsApiResponse(BaseModel):
    success: bool
    data: Optional[InvestmentsData] = None
    error: Optional[str] = None
