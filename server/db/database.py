"""Async database connection and session management.

This module handles PostgreSQL database connections using async SQLAlchemy.
Uses asyncpg driver for non-blocking database operations.

Supports multiple connection modes:
1. LAKEBASE_PG_URL: Direct connection URL (legacy/explicit)
2. PG* env vars: Databricks Apps provides PGHOST, PGUSER, etc.
3. LAKEBASE_INSTANCE_NAME: Local dev with OAuth token generation
"""

import logging
import os
import ssl
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional
from urllib.parse import parse_qs, quote_plus, urlencode, urlparse, urlunparse

from sqlalchemy.ext.asyncio import (
  AsyncEngine,
  AsyncSession,
  async_sessionmaker,
  create_async_engine,
)

from .models import Base

logger = logging.getLogger(__name__)

# Global engine and session factory
_engine: Optional[AsyncEngine] = None
_async_session_maker: Optional[async_sessionmaker[AsyncSession]] = None


def _get_pg_env_vars() -> Optional[dict]:
  """Get PostgreSQL connection parameters from PG* environment variables.

  These are automatically set by Databricks Apps when a database resource is added.

  Returns:
      Dict with host, port, database, user, sslmode or None if not configured
  """
  pghost = os.environ.get('PGHOST')
  if not pghost:
    return None

  return {
    'host': pghost,
    'port': os.environ.get('PGPORT', '5432'),
    'database': os.environ.get('PGDATABASE', 'databricks_postgres'),
    'user': os.environ.get('PGUSER'),
    'sslmode': os.environ.get('PGSSLMODE', 'require'),
  }


def _build_url_from_pg_vars(pg_vars: dict, password: Optional[str] = None) -> str:
  """Build PostgreSQL connection URL from individual components.

  Args:
      pg_vars: Dict with host, port, database, user, sslmode
      password: Optional password/token to include

  Returns:
      PostgreSQL connection URL string
  """
  user = pg_vars.get('user', '')
  host = pg_vars['host']
  port = pg_vars.get('port', '5432')
  database = pg_vars.get('database', 'databricks_postgres')
  sslmode = pg_vars.get('sslmode', 'require')

  # Build URL with optional password
  if password:
    auth = f'{quote_plus(user)}:{quote_plus(password)}'
  elif user:
    auth = quote_plus(user)
  else:
    auth = ''

  url = f'postgresql://{auth}@{host}:{port}/{database}'
  if sslmode:
    url += f'?sslmode={sslmode}'

  return url


def get_database_url() -> Optional[str]:
  """Get database URL from environment.

  Tries multiple sources in order:
  1. LAKEBASE_PG_URL: Direct URL (may include password)
  2. PG* env vars: Databricks Apps environment (requires OAuth token)
  3. LAKEBASE_INSTANCE_NAME: Local dev (requires OAuth token generation)

  Returns:
      Database URL string or None if not configured
  """
  # Option 1: Direct URL (legacy/explicit configuration)
  url = os.environ.get('LAKEBASE_PG_URL')
  if url:
    if url.startswith('postgresql://'):
      url = url.replace('postgresql://', 'postgresql+asyncpg://', 1)
    return url

  # Option 2: PG* env vars (Databricks Apps deployment)
  pg_vars = _get_pg_env_vars()
  if pg_vars:
    # Need to generate OAuth token for password
    from .lakebase_auth import get_lakebase_token, is_lakebase_oauth_configured

    if is_lakebase_oauth_configured():
      try:
        token = get_lakebase_token()
        url = _build_url_from_pg_vars(pg_vars, password=token)
        logger.info('Built database URL from PG* env vars with OAuth token')
        return url
      except Exception as e:
        logger.warning(f'Failed to get OAuth token, trying without auth: {e}')

    # Fall back to URL without password (may work in some configurations)
    url = _build_url_from_pg_vars(pg_vars)
    logger.info('Built database URL from PG* env vars (no password)')
    return url

  # Option 3: Instance name for local development
  instance_name = os.environ.get('LAKEBASE_INSTANCE_NAME')
  if instance_name:
    from .lakebase_auth import get_lakebase_token

    try:
      # Use Databricks SDK to get instance details and token
      from databricks.sdk import WorkspaceClient

      w = WorkspaceClient()
      instance = w.database.get_database_instance(name=instance_name)

      token = get_lakebase_token(instance_name)
      database = os.environ.get('LAKEBASE_DATABASE_NAME', 'databricks_postgres')
      user = os.environ.get('PGUSER', '')

      # Use the read-write DNS from instance
      host = instance.read_write_dns
      url = f'postgresql://{quote_plus(user)}:{quote_plus(token)}@{host}:5432/{database}?sslmode=require'
      logger.info(f'Built database URL from Lakebase instance: {instance_name}')
      return url
    except Exception as e:
      logger.error(f'Failed to build URL from Lakebase instance: {e}')
      return None

  return None


def _prepare_async_url(url: str) -> tuple[str, dict]:
  """Prepare URL for asyncpg driver.

  asyncpg doesn't support sslmode in URL query params like psycopg2 does.
  This function extracts sslmode and converts it to connect_args.

  Args:
      url: Database URL (may contain sslmode parameter)

  Returns:
      Tuple of (cleaned_url, connect_args)
  """
  # Ensure URL uses async driver
  if url.startswith('postgresql://'):
    url = url.replace('postgresql://', 'postgresql+asyncpg://', 1)

  # Parse URL to extract and remove sslmode
  parsed = urlparse(url)
  query_params = parse_qs(parsed.query)

  connect_args = {}

  # Extract sslmode and convert to asyncpg's ssl parameter
  if 'sslmode' in query_params:
    sslmode = query_params.pop('sslmode')[0]
    if sslmode in ('require', 'verify-ca', 'verify-full'):
      # Create SSL context for secure connections
      ssl_context = ssl.create_default_context()
      if sslmode == 'require':
        # require = encrypt but don't verify certificate
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
      # verify-ca and verify-full use default strict verification
      connect_args['ssl'] = ssl_context
    elif sslmode == 'prefer':
      connect_args['ssl'] = 'prefer'
    # 'disable' and 'allow' don't set ssl

  # Rebuild URL without sslmode
  new_query = urlencode(query_params, doseq=True)
  cleaned_url = urlunparse(parsed._replace(query=new_query))

  return cleaned_url, connect_args


def init_database(database_url: Optional[str] = None) -> AsyncEngine:
  """Initialize async database connection.

  Args:
      database_url: Optional database URL. If not provided, reads from LAKEBASE_PG_URL

  Returns:
      SQLAlchemy AsyncEngine instance

  Raises:
      ValueError: If no database URL is available
  """
  global _engine, _async_session_maker

  url = database_url or get_database_url()
  if not url:
    raise ValueError('No database URL provided. Set LAKEBASE_PG_URL environment variable.')

  # Prepare URL for asyncpg (handles sslmode conversion)
  url, connect_args = _prepare_async_url(url)

  _engine = create_async_engine(
    url,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=3600,  # Recycle connections after 1 hour
    echo=False,  # Set to True for SQL logging
    connect_args=connect_args,
  )

  _async_session_maker = async_sessionmaker(
    _engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Critical for async - avoid lazy loading issues
    autoflush=False,
  )

  return _engine


def get_engine() -> AsyncEngine:
  """Get the database engine, initializing if needed.

  Returns:
      SQLAlchemy AsyncEngine instance

  Raises:
      ValueError: If database is not configured
  """
  global _engine
  if _engine is None:
    init_database()
  return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
  """Get the async session factory, initializing if needed.

  Returns:
      SQLAlchemy async_sessionmaker instance
  """
  global _async_session_maker
  if _async_session_maker is None:
    init_database()
  return _async_session_maker


async def get_session() -> AsyncSession:
  """Create a new async database session.

  Returns:
      SQLAlchemy AsyncSession instance
  """
  factory = get_session_factory()
  return factory()


@asynccontextmanager
async def session_scope() -> AsyncGenerator[AsyncSession, None]:
  """Provide a transactional scope around a series of operations.

  Yields:
      SQLAlchemy AsyncSession instance

  Example:
      async with session_scope() as session:
          result = await session.execute(select(Model))
          await session.commit()
  """
  session = await get_session()
  try:
    yield session
    await session.commit()
  except Exception:
    await session.rollback()
    raise
  finally:
    await session.close()


async def create_tables():
  """Create all database tables asynchronously.

  This should be called after init_database() to create the schema.
  For production, use Alembic migrations instead.
  """
  engine = get_engine()
  async with engine.begin() as conn:
    # run_sync executes sync methods in async context
    await conn.run_sync(Base.metadata.create_all)


def is_postgres_configured() -> bool:
  """Check if PostgreSQL is configured via any supported method.

  Returns:
      True if database connection can be established, False otherwise
  """
  # Check explicit URL
  if os.environ.get('LAKEBASE_PG_URL'):
    return True

  # Check Databricks Apps PG* env vars
  if os.environ.get('PGHOST'):
    return True

  # Check instance name for local development
  if os.environ.get('LAKEBASE_INSTANCE_NAME'):
    return True

  return False


def get_lakebase_project_id() -> Optional[str]:
  """Get Lakebase project ID from environment.

  Returns:
      Project ID string or None if not configured
  """
  return os.environ.get('LAKEBASE_PROJECT_ID') or None


async def test_database_connection() -> Optional[str]:
  """Test database connection and return error message if failed.

  Returns:
      None if connection is successful, error message string if failed
  """
  if not is_postgres_configured():
    return None  # Not configured, so no error to report

  try:
    from sqlalchemy import text

    # Initialize if not already done
    if _engine is None:
      init_database()

    # Try a simple query
    async with _engine.connect() as conn:
      await conn.execute(text('SELECT 1'))

    return None  # Success
  except Exception as e:
    return str(e)


def run_migrations() -> None:
  """Run Alembic migrations programmatically.

  This is safe to run multiple times - Alembic tracks which migrations
  have been applied and only runs pending ones.

  Should only be called when PostgreSQL is configured.
  """
  if not is_postgres_configured():
    return

  import logging

  from alembic import command
  from alembic.config import Config

  logger = logging.getLogger(__name__)
  logger.info('🔄 Running database migrations...')

  try:
    # Create Alembic config pointing to alembic.ini
    alembic_cfg = Config('alembic.ini')

    # Run upgrade to head (latest migration)
    command.upgrade(alembic_cfg, 'head')

    logger.info('✅ Database migrations completed')
  except Exception as e:
    logger.error(f'❌ Migration failed: {e}')
    raise
