import logging

from fastapi import APIRouter

from server.data.sample_finance import add_asset, add_liability, get_financial_summary
from server.data.sample_transactions import get_transactions_data
from server.models.finance import (
    AssetApiResponse,
    AssetCreate,
    FinanceApiResponse,
    LiabilityApiResponse,
    LiabilityCreate,
    TransactionsApiResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix='/finance', tags=['finance'])


@router.get('/summary', response_model=FinanceApiResponse)
async def get_summary():
    """Get the current financial summary including assets, liabilities, and net worth.
    For MVP, returns hardcoded sample data.
    """
    try:
        summary = get_financial_summary()
        return FinanceApiResponse(success=True, data=summary)
    except Exception as e:
        logger.error(f'Error fetching financial summary: {e}')
        return FinanceApiResponse(success=False, data=None, error=str(e))


@router.get('/transactions', response_model=TransactionsApiResponse)
async def get_transactions(days: int = 30):
    """Get transaction data with daily cashflow aggregation.

    Args:
        days: Number of days to include in daily aggregation (default 30)
    """
    try:
        data = get_transactions_data(days=days)
        return TransactionsApiResponse(success=True, data=data)
    except Exception as e:
        logger.error(f'Error fetching transactions: {e}')
        return TransactionsApiResponse(success=False, data=None, error=str(e))


@router.post('/assets', response_model=AssetApiResponse)
async def create_asset(asset_data: AssetCreate):
    """Add a new asset to the portfolio (in-memory only)."""
    try:
        asset = add_asset(
            name=asset_data.name,
            category=asset_data.category,
            value=asset_data.value,
            description=asset_data.description,
        )
        return AssetApiResponse(success=True, data=asset)
    except Exception as e:
        logger.error(f'Error creating asset: {e}')
        return AssetApiResponse(success=False, data=None, error=str(e))


@router.post('/liabilities', response_model=LiabilityApiResponse)
async def create_liability(liability_data: LiabilityCreate):
    """Add a new liability to the portfolio (in-memory only)."""
    try:
        liability = add_liability(
            name=liability_data.name,
            category=liability_data.category,
            amount=liability_data.amount,
            description=liability_data.description,
        )
        return LiabilityApiResponse(success=True, data=liability)
    except Exception as e:
        logger.error(f'Error creating liability: {e}')
        return LiabilityApiResponse(success=False, data=None, error=str(e))
