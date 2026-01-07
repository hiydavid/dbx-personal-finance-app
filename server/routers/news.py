"""News router for financial news API endpoints."""

import logging

from fastapi import APIRouter

from server.models.news import NewsApiResponse
from server.services.news_service import fetch_financial_news

logger = logging.getLogger(__name__)
router = APIRouter(prefix='/news', tags=['news'])


@router.get('/', response_model=NewsApiResponse)
async def get_news(limit: int = 5):
  """Fetch latest financial news from major outlets.

  Args:
      limit: Number of articles to return (1-10, default 5)
  """
  # Clamp limit to reasonable range
  limit = max(1, min(limit, 10))

  try:
    data = await fetch_financial_news(limit=limit)
    if data is None:
      return NewsApiResponse(
        success=False,
        data=None,
        error='News service unavailable. Check NEWSAPI_KEY configuration.',
      )
    return NewsApiResponse(success=True, data=data)
  except Exception as e:
    logger.error(f'Error fetching news: {e}')
    return NewsApiResponse(success=False, data=None, error=str(e))
