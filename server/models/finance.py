from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class Asset(BaseModel):
    id: str
    name: str
    category: Literal["cash", "investment", "property"]
    value: float
    description: Optional[str] = None


class Liability(BaseModel):
    id: str
    name: str
    category: Literal["loan", "credit_card", "mortgage", "other"]
    amount: float
    description: Optional[str] = None


class FinancialSummary(BaseModel):
    total_assets: float = Field(alias="totalAssets")
    total_liabilities: float = Field(alias="totalLiabilities")
    net_worth: float = Field(alias="netWorth")
    assets: list[Asset]
    liabilities: list[Liability]
    last_updated: datetime = Field(alias="lastUpdated")

    model_config = {"populate_by_name": True}


class FinanceApiResponse(BaseModel):
    success: bool
    data: Optional[FinancialSummary] = None
    error: Optional[str] = None
