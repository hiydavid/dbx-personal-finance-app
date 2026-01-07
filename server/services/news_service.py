"""News service for fetching financial news from NewsAPI."""

import hashlib
import logging
import os
from datetime import datetime, timezone
from typing import Optional
from urllib.parse import urlparse

import httpx

from server.models.news import NewsArticle, NewsData

logger = logging.getLogger(__name__)

NEWSAPI_BASE_URL = 'https://newsapi.org/v2/everything'
ALLOWED_DOMAINS = ['bloomberg.com', 'reuters.com', 'wsj.com', 'cnbc.com', 'ft.com']


async def fetch_financial_news(limit: int = 5) -> Optional[NewsData]:
  """Fetch latest financial news from NewsAPI.

  Args:
      limit: Number of articles to return (default 5)

  Returns:
      NewsData with articles or None if API key missing/error
  """
  api_key = os.getenv('NEWSAPI_KEY')
  if not api_key:
    logger.warning('NEWSAPI_KEY not configured in environment')
    return None

  # Build domain filter
  domains = ','.join(ALLOWED_DOMAINS)

  params = {
    'apiKey': api_key,
    'domains': domains,
    'language': 'en',
    'sortBy': 'publishedAt',
    'pageSize': limit,
  }

  try:
    async with httpx.AsyncClient(timeout=10.0) as client:
      response = await client.get(NEWSAPI_BASE_URL, params=params)
      response.raise_for_status()
      data = response.json()

    if data.get('status') != 'ok':
      logger.error(f'NewsAPI error: {data.get("message", "Unknown error")}')
      return None

    articles = []
    for article in data.get('articles', []):
      # Generate stable ID from URL
      article_id = hashlib.md5(article['url'].encode()).hexdigest()[:12]

      # Extract source info
      source_name = article.get('source', {}).get('name', 'Unknown')
      source_domain = _extract_domain(article.get('url', ''))

      # Parse published date
      published_str = article.get('publishedAt', '')
      try:
        published_at = datetime.fromisoformat(published_str.replace('Z', '+00:00'))
      except (ValueError, AttributeError):
        published_at = datetime.now(timezone.utc)

      articles.append(
        NewsArticle(
          id=article_id,
          title=article.get('title', ''),
          description=article.get('description'),
          source=source_name,
          sourceDomain=source_domain,
          publishedAt=published_at,
          url=article['url'],
          imageUrl=article.get('urlToImage'),
        )
      )

    return NewsData(
      articles=articles,
      fetchedAt=datetime.now(timezone.utc),
    )

  except httpx.HTTPStatusError as e:
    logger.error(f'NewsAPI HTTP error: {e.response.status_code}')
    return None
  except httpx.RequestError as e:
    logger.error(f'NewsAPI request error: {e}')
    return None


def _extract_domain(url: str) -> str:
  """Extract domain from URL for display."""
  try:
    parsed = urlparse(url)
    return parsed.netloc.replace('www.', '')
  except Exception:
    return 'unknown'
