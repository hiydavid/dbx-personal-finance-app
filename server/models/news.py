"""News models for financial news API responses."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class NewsArticle(BaseModel):
  """Individual news article from NewsAPI."""

  id: str
  title: str
  description: Optional[str] = None
  source: str
  source_domain: str = Field(alias='sourceDomain')
  published_at: datetime = Field(alias='publishedAt')
  url: str
  image_url: Optional[str] = Field(default=None, alias='imageUrl')

  model_config = {'populate_by_name': True}


class NewsData(BaseModel):
  """Collection of news articles with metadata."""

  articles: list[NewsArticle]
  fetched_at: datetime = Field(alias='fetchedAt')

  model_config = {'populate_by_name': True}


class NewsApiResponse(BaseModel):
  """Standard API response wrapper for news endpoint."""

  success: bool
  data: Optional[NewsData] = None
  error: Optional[str] = None
