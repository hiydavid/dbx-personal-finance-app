"""Finance API router for assets, liabilities, transactions, and investments."""

import logging
import uuid

from fastapi import APIRouter, Request

from server.data.sample_finance import add_asset, add_liability, get_financial_summary
from server.data.sample_investments import get_investments_data
from server.data.sample_transactions import get_transactions_data
from server.db.dbsql import (
  create_asset_in_dbsql,
  create_liability_in_dbsql,
  get_financial_summary_from_dbsql,
  get_investments_from_dbsql,
  get_transactions_from_dbsql,
  is_dbsql_configured,
)
from server.models.finance import (
  AssetApiResponse,
  AssetCreate,
  FinanceApiResponse,
  InvestmentsApiResponse,
  LiabilityApiResponse,
  LiabilityCreate,
  TransactionsApiResponse,
)
from server.services.user import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix='/finance', tags=['finance'])


@router.get('/summary', response_model=FinanceApiResponse)
async def get_summary(request: Request):
  """Get the current financial summary including assets, liabilities, and net worth.

  Uses Databricks SQL when configured, otherwise falls back to sample data.
  """
  try:
    if is_dbsql_configured():
      user_email = await get_current_user(request)
      summary = get_financial_summary_from_dbsql(user_email)
    else:
      summary = get_financial_summary()
    return FinanceApiResponse(success=True, data=summary)
  except Exception as e:
    logger.error(f'Error fetching financial summary: {e}')
    return FinanceApiResponse(success=False, data=None, error=str(e))


@router.get('/transactions', response_model=TransactionsApiResponse)
async def get_transactions(request: Request, days: int = 30):
  """Get transaction data with daily cashflow aggregation.

  Args:
      request: FastAPI request object
      days: Number of days to include in daily aggregation (default 30)

  Uses Databricks SQL when configured, otherwise falls back to sample data.
  """
  try:
    if is_dbsql_configured():
      user_email = await get_current_user(request)
      data = get_transactions_from_dbsql(user_email, days=days)
    else:
      data = get_transactions_data(days=days)
    return TransactionsApiResponse(success=True, data=data)
  except Exception as e:
    logger.error(f'Error fetching transactions: {e}')
    return TransactionsApiResponse(success=False, data=None, error=str(e))


@router.post('/assets', response_model=AssetApiResponse)
async def create_asset(request: Request, asset_data: AssetCreate):
  """Add a new asset to the portfolio.

  Uses Databricks SQL when configured, otherwise falls back to in-memory storage.
  """
  try:
    if is_dbsql_configured():
      user_email = await get_current_user(request)
      asset_id = f'asset-{uuid.uuid4().hex[:8]}'
      asset = create_asset_in_dbsql(
        user_email=user_email,
        asset_id=asset_id,
        name=asset_data.name,
        category=asset_data.category,
        value=asset_data.value,
        description=asset_data.description,
      )
    else:
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
async def create_liability(request: Request, liability_data: LiabilityCreate):
  """Add a new liability to the portfolio.

  Uses Databricks SQL when configured, otherwise falls back to in-memory storage.
  """
  try:
    if is_dbsql_configured():
      user_email = await get_current_user(request)
      liability_id = f'liab-{uuid.uuid4().hex[:8]}'
      liability = create_liability_in_dbsql(
        user_email=user_email,
        liability_id=liability_id,
        name=liability_data.name,
        category=liability_data.category,
        amount=liability_data.amount,
        description=liability_data.description,
      )
    else:
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


@router.get('/investments', response_model=InvestmentsApiResponse)
async def get_investments(request: Request, period: str = '1Y'):
  """Get investment portfolio data including holdings, allocations, and history.

  Args:
      request: FastAPI request object
      period: Time period for history data ('1M', '3M', '6M', 'YTD', '1Y', 'ALL')

  Uses Databricks SQL when configured, otherwise falls back to sample data.
  """
  try:
    if is_dbsql_configured():
      user_email = await get_current_user(request)
      data = get_investments_from_dbsql(user_email, period=period)
    else:
      data = get_investments_data(period=period)
    return InvestmentsApiResponse(success=True, data=data)
  except Exception as e:
    logger.error(f'Error fetching investments: {e}')
    return InvestmentsApiResponse(success=False, data=None, error=str(e))
