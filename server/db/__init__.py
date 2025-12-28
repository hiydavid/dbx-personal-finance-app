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
from .lakebase_auth import (
  get_lakebase_token,
  is_lakebase_oauth_configured,
  start_token_refresh,
  stop_token_refresh,
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
  'get_lakebase_token',
  'get_session',
  'get_session_factory',
  'init_database',
  'is_lakebase_oauth_configured',
  'is_postgres_configured',
  'run_migrations',
  'session_scope',
  'start_token_refresh',
  'stop_token_refresh',
  'test_database_connection',
]
