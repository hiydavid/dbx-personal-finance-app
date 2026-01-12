"""Databricks MCP client service for external tool integration.

Provides access to external MCP servers configured in Databricks,
such as you.com web search.
"""

import asyncio
import logging
import os
from typing import Any, Dict, List, Optional, Set

from databricks.sdk import WorkspaceClient

logger = logging.getLogger(__name__)


def convert_mcp_tool_to_openai_format(mcp_tool: Any) -> Dict[str, Any]:
  """Convert an MCP tool definition to OpenAI function format.

  Args:
      mcp_tool: Tool object from MCP list_tools() (databricks_mcp.Tool)

  Returns:
      Tool definition in OpenAI function calling format
  """
  # Handle both dict and Tool object from databricks_mcp
  if hasattr(mcp_tool, 'inputSchema'):
    input_schema = mcp_tool.inputSchema or {}
    name = mcp_tool.name or ''
    description = mcp_tool.description or ''
  else:
    input_schema = mcp_tool.get('inputSchema', {})
    name = mcp_tool.get('name', '')
    description = mcp_tool.get('description', '')

  # input_schema may also be an object
  if hasattr(input_schema, '__dict__'):
    schema_type = getattr(input_schema, 'type', 'object')
    schema_props = getattr(input_schema, 'properties', {})
    schema_required = getattr(input_schema, 'required', [])
  else:
    schema_type = input_schema.get('type', 'object') if input_schema else 'object'
    schema_props = input_schema.get('properties', {}) if input_schema else {}
    schema_required = input_schema.get('required', []) if input_schema else []

  return {
    'type': 'function',
    'function': {
      'name': name,
      'description': description,
      'parameters': {
        'type': schema_type,
        'properties': schema_props,
        'required': schema_required,
      },
    },
  }


class MCPClientService:
  """Service to interact with Databricks external MCP servers."""

  def __init__(self, connection_name: str):
    """Initialize MCP client for a specific connection.

    Args:
        connection_name: Name of the MCP connection configured in Databricks
                        (e.g., 'you-com-search')
    """
    self.connection_name = connection_name
    self._client = None
    self._workspace_client: Optional[WorkspaceClient] = None

  def _get_workspace_client(self) -> WorkspaceClient:
    """Get or create the workspace client."""
    if self._workspace_client is None:
      self._workspace_client = WorkspaceClient()
    return self._workspace_client

  def _get_mcp_client(self):
    """Get or create the MCP client."""
    if self._client is None:
      try:
        from databricks_mcp import DatabricksMCPClient

        w = self._get_workspace_client()
        host = w.config.host.rstrip('/')
        mcp_url = f'{host}/api/2.0/mcp/external/{self.connection_name}'

        self._client = DatabricksMCPClient(
          server_url=mcp_url,
          workspace_client=w,
        )
        logger.info(f'Initialized MCP client for connection: {self.connection_name}')
      except ImportError:
        logger.error('databricks-mcp package not installed')
        raise
      except Exception as e:
        logger.error(f'Failed to initialize MCP client: {e}')
        raise
    return self._client

  async def list_tools(self) -> List[Dict[str, Any]]:
    """Discover available tools from the MCP server.

    Returns:
        List of tool definitions in MCP format
    """
    try:
      client = self._get_mcp_client()
      tools = await asyncio.wait_for(
        asyncio.to_thread(client.list_tools),
        timeout=10.0,
      )
      logger.info(f'Discovered {len(tools)} tools from MCP connection: {self.connection_name}')
      return tools
    except asyncio.TimeoutError:
      logger.error(f'Timeout discovering tools from MCP connection: {self.connection_name}')
      return []
    except Exception as e:
      logger.error(f'Failed to list MCP tools: {e}')
      return []

  async def call_tool(self, name: str, arguments: Dict[str, Any]) -> Any:
    """Invoke a tool on the MCP server.

    Args:
        name: Tool name
        arguments: Tool arguments

    Returns:
        Tool execution result
    """
    try:
      client = self._get_mcp_client()
      result = await asyncio.wait_for(
        asyncio.to_thread(client.call_tool, name, arguments),
        timeout=30.0,
      )
      logger.info(f'MCP tool {name} executed successfully')
      return result
    except asyncio.TimeoutError:
      logger.error(f'Timeout executing MCP tool: {name}')
      raise
    except Exception as e:
      logger.error(f'Failed to call MCP tool {name}: {e}')
      raise


# Global service instances by connection name
_mcp_services: Dict[str, MCPClientService] = {}


def get_mcp_service(connection_name: str) -> MCPClientService:
  """Get or create an MCP service for a connection.

  Args:
      connection_name: Name of the MCP connection

  Returns:
      MCPClientService instance
  """
  if connection_name not in _mcp_services:
    _mcp_services[connection_name] = MCPClientService(connection_name)
  return _mcp_services[connection_name]


def get_mcp_connections_from_config(agent_config: Dict[str, Any]) -> List[str]:
  """Get MCP connection names from agent config or environment.

  Args:
      agent_config: Agent configuration dictionary

  Returns:
      List of MCP connection names
  """
  # First check agent config
  connections = agent_config.get('mcp_connections', [])

  # Allow environment override
  env_connections = os.environ.get('MCP_CONNECTIONS', '')
  if env_connections:
    connections = [c.strip() for c in env_connections.split(',') if c.strip()]

  return connections
