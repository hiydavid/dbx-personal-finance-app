"""Database layer - connection management and SQLAlchemy models."""

from .database import (
  create_tables,
  get_database_url,
  get_engine,
  get_lakebase_project_id,
  get_session,
  get_session_factory,
  init_database,
  is_postgres_configured,
  run_migrations,
  session_scope,
  test_database_connection,
)
from .models import (
  Base,
  ChatModel,
  EmploymentStatus,
  MaritalStatus,
  MessageModel,
  RiskTolerance,
  TaxFilingStatus,
  UserProfileModel,
)

__all__ = [
  'Base',
  'ChatModel',
  'EmploymentStatus',
  'MaritalStatus',
  'MessageModel',
  'RiskTolerance',
  'TaxFilingStatus',
  'UserProfileModel',
  'create_tables',
  'get_database_url',
  'get_engine',
  'get_lakebase_project_id',
  'get_session',
  'get_session_factory',
  'init_database',
  'is_postgres_configured',
  'run_migrations',
  'session_scope',
  'test_database_connection',
]
