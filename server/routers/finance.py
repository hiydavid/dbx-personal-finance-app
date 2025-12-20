import logging

from fastapi import APIRouter

from server.data.sample_finance import get_financial_summary
from server.models.finance import FinanceApiResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/finance", tags=["finance"])


@router.get("/summary", response_model=FinanceApiResponse)
async def get_summary():
    """
    Get the current financial summary including assets, liabilities, and net worth.
    For MVP, returns hardcoded sample data.
    """
    try:
        summary = get_financial_summary()
        return FinanceApiResponse(success=True, data=summary)
    except Exception as e:
        logger.error(f"Error fetching financial summary: {e}")
        return FinanceApiResponse(success=False, data=None, error=str(e))
