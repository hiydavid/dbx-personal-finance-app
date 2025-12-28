"""Lakebase OAuth token management.

This module handles OAuth token generation and refresh for Databricks Lakebase
database connections. Tokens expire after 1 hour but expiration is only enforced
at connection time, so existing connections remain active.

For long-running applications, tokens should be refreshed before expiration.
"""

import asyncio
import logging
import os
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta
from threading import Lock
from typing import Optional

logger = logging.getLogger(__name__)

# Token refresh interval (refresh before the 1-hour expiration)
TOKEN_REFRESH_INTERVAL_SECONDS = 45 * 60  # 45 minutes


@dataclass
class LakebaseCredential:
  """Lakebase OAuth credential with expiration tracking."""

  token: str
  instance_name: str
  created_at: datetime
  expires_at: datetime

  def is_expired(self) -> bool:
    """Check if token is expired or close to expiration."""
    # Consider expired if less than 5 minutes remaining
    buffer = timedelta(minutes=5)
    return datetime.now() >= (self.expires_at - buffer)


class LakebaseAuthManager:
  """Manages Lakebase OAuth tokens with automatic refresh.

  This class handles:
  - OAuth token generation via Databricks SDK
  - Token caching to avoid unnecessary regeneration
  - Background token refresh for long-running applications
  """

  def __init__(self):
    self._credential: Optional[LakebaseCredential] = None
    self._lock = Lock()
    self._refresh_task: Optional[asyncio.Task] = None

  def get_instance_name(self) -> Optional[str]:
    """Get Lakebase instance name from environment.

    Checks for:
    1. LAKEBASE_INSTANCE_NAME (explicit configuration)
    2. PGHOST (Databricks Apps sets this when database resource is added)

    Returns:
        Instance name or None if not configured
    """
    # Explicit instance name takes precedence
    instance_name = os.environ.get('LAKEBASE_INSTANCE_NAME')
    if instance_name:
      return instance_name

    # In Databricks Apps, PGHOST contains the instance endpoint
    # Format: ep-xxx-yyy.region.aws.neon.tech or similar
    pghost = os.environ.get('PGHOST')
    if pghost:
      # The PGHOST is the actual endpoint, we use it for connection
      # but we need instance_name for token generation
      # When using Databricks Apps, the instance is managed automatically
      return os.environ.get('LAKEBASE_INSTANCE_NAME')

    return None

  def generate_token(self, instance_name: str) -> str:
    """Generate a new OAuth token for Lakebase.

    Args:
        instance_name: Name of the Lakebase database instance

    Returns:
        OAuth token string to use as password

    Raises:
        ValueError: If Databricks SDK is not configured
        Exception: If token generation fails
    """
    try:
      from databricks.sdk import WorkspaceClient
    except ImportError as e:
      raise ValueError(
        'databricks-sdk is required for Lakebase OAuth. '
        'Install with: pip install databricks-sdk>=0.56.0'
      ) from e

    logger.info(f'Generating Lakebase OAuth token for instance: {instance_name}')

    try:
      w = WorkspaceClient()
      cred = w.database.generate_database_credential(
        request_id=str(uuid.uuid4()),
        instance_names=[instance_name],
      )
      return cred.token
    except Exception as e:
      logger.error(f'Failed to generate Lakebase OAuth token: {e}')
      raise

  def get_token(self, instance_name: Optional[str] = None) -> str:
    """Get a valid OAuth token, generating or refreshing as needed.

    Thread-safe method that returns cached token if still valid,
    or generates a new one if expired or not yet created.

    Args:
        instance_name: Lakebase instance name (uses env var if not provided)

    Returns:
        Valid OAuth token string

    Raises:
        ValueError: If instance name cannot be determined
    """
    instance = instance_name or self.get_instance_name()
    if not instance:
      raise ValueError(
        'Lakebase instance name not configured. Set LAKEBASE_INSTANCE_NAME environment variable.'
      )

    with self._lock:
      # Return cached token if still valid
      if self._credential and not self._credential.is_expired():
        if self._credential.instance_name == instance:
          return self._credential.token

      # Generate new token
      token = self.generate_token(instance)
      now = datetime.now()
      self._credential = LakebaseCredential(
        token=token,
        instance_name=instance,
        created_at=now,
        expires_at=now + timedelta(hours=1),
      )
      logger.info(f'Generated new Lakebase token, expires at {self._credential.expires_at}')
      return token

  def get_current_token(self) -> Optional[str]:
    """Get the current cached token without generation.

    Used by connection pool event handlers that need synchronous access.

    Returns:
        Cached token or None if not available
    """
    with self._lock:
      if self._credential:
        return self._credential.token
      return None

  async def start_refresh_task(self, instance_name: Optional[str] = None):
    """Start background task to refresh tokens before expiration.

    Args:
        instance_name: Lakebase instance name (uses env var if not provided)
    """
    instance = instance_name or self.get_instance_name()
    if not instance:
      logger.warning('Cannot start token refresh: instance name not configured')
      return

    if self._refresh_task and not self._refresh_task.done():
      logger.debug('Token refresh task already running')
      return

    self._refresh_task = asyncio.create_task(self._refresh_loop(instance))
    logger.info('Started Lakebase token refresh background task')

  async def stop_refresh_task(self):
    """Stop the background token refresh task."""
    if self._refresh_task and not self._refresh_task.done():
      self._refresh_task.cancel()
      try:
        await self._refresh_task
      except asyncio.CancelledError:
        pass
      logger.info('Stopped Lakebase token refresh task')

  async def _refresh_loop(self, instance_name: str):
    """Background loop that refreshes tokens periodically.

    Args:
        instance_name: Lakebase instance name
    """
    while True:
      try:
        await asyncio.sleep(TOKEN_REFRESH_INTERVAL_SECONDS)
        logger.debug('Refreshing Lakebase OAuth token...')
        # Run token generation in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self.get_token, instance_name)
      except asyncio.CancelledError:
        break
      except Exception as e:
        logger.error(f'Error refreshing Lakebase token: {e}')
        # Continue trying on next interval


# Global auth manager instance
_auth_manager: Optional[LakebaseAuthManager] = None


def get_auth_manager() -> LakebaseAuthManager:
  """Get the global Lakebase auth manager instance."""
  global _auth_manager
  if _auth_manager is None:
    _auth_manager = LakebaseAuthManager()
  return _auth_manager


def get_lakebase_token(instance_name: Optional[str] = None) -> str:
  """Convenience function to get a Lakebase OAuth token.

  Args:
      instance_name: Lakebase instance name (uses env var if not provided)

  Returns:
      Valid OAuth token string
  """
  return get_auth_manager().get_token(instance_name)


async def start_token_refresh(instance_name: Optional[str] = None):
  """Start background token refresh for long-running applications.

  Args:
      instance_name: Lakebase instance name (uses env var if not provided)
  """
  await get_auth_manager().start_refresh_task(instance_name)


async def stop_token_refresh():
  """Stop background token refresh."""
  await get_auth_manager().stop_refresh_task()


def is_lakebase_oauth_configured() -> bool:
  """Check if Lakebase OAuth authentication is available.

  Returns True if:
  - LAKEBASE_INSTANCE_NAME is set, OR
  - PGHOST is set (Databricks Apps) and Databricks SDK is configured

  Returns:
      True if OAuth can be used, False otherwise
  """
  instance_name = os.environ.get('LAKEBASE_INSTANCE_NAME')
  pghost = os.environ.get('PGHOST')

  # Need at least one way to identify the instance
  if not instance_name and not pghost:
    return False

  # For local dev, need Databricks SDK configured
  if instance_name and not pghost:
    # Check if Databricks SDK has credentials
    databricks_host = os.environ.get('DATABRICKS_HOST')
    databricks_token = os.environ.get('DATABRICKS_TOKEN')
    if not databricks_host or not databricks_token:
      return False

  return True
