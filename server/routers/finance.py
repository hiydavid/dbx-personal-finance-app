import logging

from fastapi import APIRouter

from server.data.sample_finance import get_financial_summary
from server.data.sample_transactions import get_transactions_data
from server.models.finance import FinanceApiResponse, TransactionsApiResponse

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
