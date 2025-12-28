"""Alembic environment configuration for chat storage migrations.

Uses sync psycopg2 driver for migrations (simpler and avoids async event loop issues).
Runtime database access uses async asyncpg driver.

Supports multiple connection modes:
1. LAKEBASE_PG_URL: Direct connection URL
2. PG* env vars: Databricks Apps environment
3. LAKEBASE_INSTANCE_NAME: Local dev with OAuth token
"""

import os
from logging.config import fileConfig
from urllib.parse import quote_plus

from alembic import context
from dotenv import load_dotenv
from sqlalchemy import create_engine, pool

# Load environment variables from .env.local
load_dotenv('.env.local')

# Import models for autogenerate support
from server.db.models import Base

# this is the Alembic Config object
config = context.config

# Setup logging from alembic.ini
if config.config_file_name is not None:
  fileConfig(config.config_file_name)

# Target metadata for autogenerate
target_metadata = Base.metadata


def get_url():
  """Get database URL from environment.

  Tries multiple sources and returns standard PostgreSQL URL
  (uses sync psycopg2 driver for migrations).
  """
  # Option 1: Direct URL
  url = os.environ.get('LAKEBASE_PG_URL')
  if url:
    # Ensure URL uses sync driver (psycopg2) for migrations
    if url.startswith('postgresql+asyncpg://'):
      url = url.replace('postgresql+asyncpg://', 'postgresql://', 1)
    return url

  # Option 2: PG* env vars (Databricks Apps)
  pghost = os.environ.get('PGHOST')
  if pghost:
    from server.db.lakebase_auth import get_lakebase_token, is_lakebase_oauth_configured

    pgport = os.environ.get('PGPORT', '5432')
    pgdatabase = os.environ.get('PGDATABASE', 'databricks_postgres')
    pguser = os.environ.get('PGUSER', '')
    pgsslmode = os.environ.get('PGSSLMODE', 'require')

    # Try to get OAuth token
    password = ''
    if is_lakebase_oauth_configured():
      try:
        password = get_lakebase_token()
      except Exception:
        pass  # Will try without password

    if password:
      auth = f'{quote_plus(pguser)}:{quote_plus(password)}'
    elif pguser:
      auth = quote_plus(pguser)
    else:
      auth = ''

    url = f'postgresql://{auth}@{pghost}:{pgport}/{pgdatabase}'
    if pgsslmode:
      url += f'?sslmode={pgsslmode}'
    return url

  # Option 3: Instance name (local development)
  instance_name = os.environ.get('LAKEBASE_INSTANCE_NAME')
  if instance_name:
    from databricks.sdk import WorkspaceClient
    from server.db.lakebase_auth import get_lakebase_token

    w = WorkspaceClient()
    instance = w.database.get_database_instance(name=instance_name)
    token = get_lakebase_token(instance_name)
    database = os.environ.get('LAKEBASE_DATABASE_NAME', 'databricks_postgres')
    user = os.environ.get('PGUSER', '')

    host = instance.read_write_dns
    url = f'postgresql://{quote_plus(user)}:{quote_plus(token)}@{host}:5432/{database}?sslmode=require'
    return url

  raise ValueError(
    'No database configuration found. Set one of: '
    'LAKEBASE_PG_URL, PGHOST, or LAKEBASE_INSTANCE_NAME'
  )


def run_migrations_offline():
  """Run migrations in 'offline' mode.

  This configures the context with just a URL
  and not an Engine, though an Engine is acceptable
  here as well. By skipping the Engine creation
  we don't even need a DBAPI to be available.

  Calls to context.execute() here emit the given string to the
  script output.
  """
  url = get_url()
  context.configure(
    url=url,
    target_metadata=target_metadata,
    literal_binds=True,
    dialect_opts={'paramstyle': 'named'},
  )

  with context.begin_transaction():
    context.run_migrations()


def run_migrations_online():
  """Run migrations in 'online' mode using sync engine."""
  url = get_url()

  connectable = create_engine(
    url,
    poolclass=pool.NullPool,
  )

  with connectable.connect() as connection:
    context.configure(
      connection=connection,
      target_metadata=target_metadata,
    )

    with context.begin_transaction():
      context.run_migrations()

  connectable.dispose()


if context.is_offline_mode():
  run_migrations_offline()
else:
  run_migrations_online()
