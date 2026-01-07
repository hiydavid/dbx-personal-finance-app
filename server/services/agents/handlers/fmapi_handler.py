"""Handler for Databricks Foundation Model API endpoints with tool calling."""

import asyncio
import json
import logging
import os
from datetime import date
from typing import Any, AsyncGenerator, Dict, List, Optional

from openai import OpenAI

from .base import BaseDeploymentHandler

logger = logging.getLogger(__name__)


# Tool definitions in OpenAI function format
FINANCE_TOOLS = [
  {
    'type': 'function',
    'function': {
      'name': 'get_user_profile',
      'description': (
        'Get the current user profile including demographics, employment status, '
        'income, risk tolerance, and financial goals.'
      ),
      'parameters': {
        'type': 'object',
        'properties': {},
        'required': [],
      },
    },
  },
  {
    'type': 'function',
    'function': {
      'name': 'get_financial_summary',
      'description': (
        'Get the user financial summary including total assets, total liabilities, '
        'net worth, and detailed breakdown of each asset and liability.'
      ),
      'parameters': {
        'type': 'object',
        'properties': {},
        'required': [],
      },
    },
  },
  {
    'type': 'function',
    'function': {
      'name': 'get_transactions',
      'description': (
        'Get recent transactions and cashflow data. Returns transaction list, '
        'daily cashflow aggregation, and summary statistics.'
      ),
      'parameters': {
        'type': 'object',
        'properties': {
          'days': {
            'type': 'integer',
            'description': 'Number of days of transaction history to retrieve. Defaults to 30.',
            'default': 30,
          },
        },
        'required': [],
      },
    },
  },
]


def _calculate_age(dob: Optional[date]) -> Optional[int]:
  """Calculate age from date of birth."""
  if not dob:
    return None
  today = date.today()
  age = today.year - dob.year
  if (today.month, today.day) < (dob.month, dob.day):
    age -= 1
  return age


def _format_currency(value: Optional[float]) -> str:
  """Format a number as currency string."""
  if value is None:
    return 'Unknown'
  return f'${value:,.0f}'


class FMAPIHandler(BaseDeploymentHandler):
  """Handler for Databricks FMAPI endpoints with tool calling support."""

  def __init__(
    self,
    agent_config: Dict[str, Any],
    user_email: str,
    persona_id: Optional[str] = None,
  ):
    super().__init__(agent_config)
    self.endpoint_name = agent_config.get('endpoint_name')
    self.user_email = user_email
    self.persona_id = persona_id

    # Initialize OpenAI client with Databricks base URL
    databricks_host = os.environ.get('DATABRICKS_HOST', '').rstrip('/')
    databricks_token = os.environ.get('DATABRICKS_TOKEN', '')

    self.client = OpenAI(
      base_url=f'{databricks_host}/serving-endpoints',
      api_key=databricks_token,
    )

  async def _fetch_profile_data(self) -> Optional[Dict]:
    """Fetch user profile for system prompt context."""
    try:
      from sqlalchemy import select

      from server.db import UserProfileModel, is_postgres_configured, session_scope

      if not is_postgres_configured():
        logger.warning('📋 PostgreSQL not configured - skipping profile fetch')
        return None

      async with session_scope() as session:
        result = await session.execute(
          select(UserProfileModel).where(UserProfileModel.user_email == self.user_email)
        )
        profile = result.scalar_one_or_none()
        if profile:
          logger.info(f'📋 Found profile for {self.user_email}')
          return {
            'age': _calculate_age(profile.date_of_birth),
            'maritalStatus': profile.marital_status,
            'numberOfDependents': profile.number_of_dependents,
            'employmentStatus': profile.employment_status,
            'employerName': profile.employer_name,
            'jobTitle': profile.job_title,
            'annualIncome': profile.annual_income,
            'riskTolerance': profile.risk_tolerance,
            'financialGoals': profile.financial_goals,
            'retirementAgeTarget': profile.retirement_age_target,
          }
        else:
          logger.info(f'📋 No profile found for {self.user_email}')
    except Exception as e:
      logger.warning(f'Failed to fetch profile for system prompt: {e}', exc_info=True)
    return None

  def _get_persona_prompt(self) -> Optional[str]:
    """Get persona-specific system prompt if persona_id is set."""
    if not self.persona_id:
      return None

    from server.config_loader import config_loader

    persona = config_loader.get_persona_by_id(self.persona_id)
    if persona:
      return persona.get('system_prompt')
    return None

  def _build_system_prompt(self, profile_data: Optional[Dict]) -> str:
    """Build system prompt with user context and optional persona."""
    # Check for persona-specific prompt
    persona_prompt = self._get_persona_prompt()

    if persona_prompt:
      # Use persona prompt as base, add tools context
      base_prompt = (
        f'{persona_prompt}\n\n'
        "You have access to the user's financial data through tools. "
        "Use them to provide personalized advice.\n\n"
        "When answering questions about the user's finances:\n"
        '1. Use the available tools to fetch current data - '
        "don't make assumptions about their financial situation\n"
        '2. Provide specific numbers and actionable insights '
        'aligned with your investment philosophy\n'
        '3. Be conversational but accurate\n'
        '4. If data is missing or unavailable, acknowledge this clearly\n\n'
        'Available tools:\n'
        '- get_user_profile: Get user demographics, employment, income, and financial goals\n'
        '- get_financial_summary: Get net worth, assets, and liabilities breakdown\n'
        '- get_transactions: Get recent transaction history and cashflow patterns'
      )
    else:
      # Default generic finance assistant prompt
      base_prompt = (
        'You are a helpful personal finance assistant. '
        "You have access to the user's financial data through tools.\n\n"
        "When answering questions about the user's finances:\n"
        '1. Use the available tools to fetch current data - '
        "don't make assumptions about their financial situation\n"
        '2. Provide specific numbers and actionable insights\n'
        '3. Be conversational but accurate\n'
        '4. If data is missing or unavailable, acknowledge this clearly\n\n'
        'Available tools:\n'
        '- get_user_profile: Get user demographics, employment, income, and financial goals\n'
        '- get_financial_summary: Get net worth, assets, and liabilities breakdown\n'
        '- get_transactions: Get recent transaction history and cashflow patterns'
      )

    if profile_data:
      context_parts = ['\n\nUser Context (for personalization):']

      if profile_data.get('age'):
        context_parts.append(f"- Age: {profile_data['age']}")

      if profile_data.get('employmentStatus'):
        status = profile_data['employmentStatus'].replace('_', ' ').title()
        context_parts.append(f'- Employment: {status}')
        if profile_data.get('jobTitle') and profile_data.get('employerName'):
          context_parts.append(
            f"  ({profile_data['jobTitle']} at {profile_data['employerName']})"
          )

      if profile_data.get('annualIncome'):
        context_parts.append(f"- Annual Income: {_format_currency(profile_data['annualIncome'])}")

      if profile_data.get('riskTolerance'):
        tolerance = profile_data['riskTolerance'].replace('_', ' ').title()
        context_parts.append(f'- Risk Tolerance: {tolerance}')

      if profile_data.get('retirementAgeTarget'):
        context_parts.append(f"- Retirement Target Age: {profile_data['retirementAgeTarget']}")

      if profile_data.get('financialGoals'):
        goals = profile_data['financialGoals']
        if goals:
          goal_names = [g.get('name', 'Unknown') for g in goals[:3]]
          context_parts.append(f"- Financial Goals: {', '.join(goal_names)}")

      base_prompt += '\n'.join(context_parts)

    return base_prompt

  async def _execute_tool(self, tool_name: str, arguments: Dict) -> str:
    """Execute a tool and return the result as JSON string."""
    try:
      if tool_name == 'get_user_profile':
        from server.db.dbsql import get_user_profile_from_dbsql, is_dbsql_configured

        if is_dbsql_configured():
          profile = get_user_profile_from_dbsql(self.user_email)
          if profile:
            return profile.model_dump_json(by_alias=True)
          return json.dumps({
            'message': 'No profile found. User has not set up their profile yet.'
          })
        else:
          from sqlalchemy import select

          from server.db import UserProfileModel, session_scope

          async with session_scope() as session:
            result = await session.execute(
              select(UserProfileModel).where(UserProfileModel.user_email == self.user_email)
            )
            profile = result.scalar_one_or_none()
            if profile:
              return json.dumps({
                'age': _calculate_age(profile.date_of_birth),
                'dateOfBirth': str(profile.date_of_birth) if profile.date_of_birth else None,
                'maritalStatus': profile.marital_status,
                'numberOfDependents': profile.number_of_dependents,
                'employmentStatus': profile.employment_status,
                'employerName': profile.employer_name,
                'jobTitle': profile.job_title,
                'yearsEmployed': profile.years_employed,
                'annualIncome': profile.annual_income,
                'riskTolerance': profile.risk_tolerance,
                'taxFilingStatus': profile.tax_filing_status,
                'financialGoals': profile.financial_goals,
                'investmentExperienceYears': profile.investment_experience_years,
                'retirementAgeTarget': profile.retirement_age_target,
                'notes': profile.notes,
              })
            return json.dumps({
              'message': 'No profile found. User has not set up their profile yet.'
            })

      elif tool_name == 'get_financial_summary':
        from server.db.dbsql import get_financial_summary_from_dbsql, is_dbsql_configured

        if is_dbsql_configured():
          summary = get_financial_summary_from_dbsql(self.user_email)
        else:
          from server.data.sample_finance import get_financial_summary

          summary = get_financial_summary()
        return summary.model_dump_json()

      elif tool_name == 'get_transactions':
        from server.db.dbsql import get_transactions_from_dbsql, is_dbsql_configured

        days = arguments.get('days', 30)
        if is_dbsql_configured():
          data = get_transactions_from_dbsql(self.user_email, days=days)
        else:
          from server.data.sample_transactions import get_transactions_data

          data = get_transactions_data(days=days)
        return data.model_dump_json()

      else:
        return json.dumps({'error': f'Unknown tool: {tool_name}'})

    except Exception as e:
      logger.error(f'Tool execution error for {tool_name}: {e}')
      return json.dumps({'error': str(e)})

  async def predict_stream(
    self, messages: List[Dict[str, str]], endpoint_name: str
  ) -> AsyncGenerator[str, None]:
    """Stream response with tool calling loop."""
    # Fetch profile for system prompt
    logger.info(f'📋 Fetching profile for user: {self.user_email}')
    profile_data = await self._fetch_profile_data()
    logger.info(f'📋 Profile data found: {profile_data is not None}')
    if profile_data:
      logger.info(f'📋 Profile keys: {list(profile_data.keys())}')

    system_prompt = self._build_system_prompt(profile_data)
    logger.info(f'📋 System prompt length: {len(system_prompt)} chars')
    logger.debug(f'📋 System prompt: {system_prompt[:500]}...')

    # Build messages with system prompt
    llm_messages: List[Dict[str, Any]] = [{'role': 'system', 'content': system_prompt}]
    llm_messages.extend(messages)

    max_iterations = 10  # Prevent infinite loops
    iteration = 0

    while iteration < max_iterations:
      iteration += 1
      logger.info(f'🔄 Tool calling iteration {iteration}')

      try:
        # Call LLM (non-streaming to detect tool calls)
        response = await asyncio.to_thread(
          self.client.chat.completions.create,
          model=endpoint_name,
          messages=llm_messages,
          tools=FINANCE_TOOLS,
        )

        choice = response.choices[0]
        message = choice.message

        # Check if LLM wants to call tools
        if message.tool_calls:
          logger.info(f'🔧 LLM requested {len(message.tool_calls)} tool call(s)')

          # Emit tool call events for frontend
          for tool_call in message.tool_calls:
            event = {
              'type': 'response.output_item.done',
              'item': {
                'type': 'function_call',
                'call_id': tool_call.id,
                'name': tool_call.function.name,
                'arguments': tool_call.function.arguments,
              },
            }
            yield f'data: {json.dumps(event)}\n\n'

          # Add assistant message with tool calls to history
          # Note: content must be None (not empty string) when there's no text,
          # otherwise FMAPI rejects with "text content blocks must be non-empty"
          assistant_msg: Dict[str, Any] = {
            'role': 'assistant',
            'content': message.content,  # None is valid, empty string is not
            'tool_calls': [
              {
                'id': tc.id,
                'type': 'function',
                'function': {
                  'name': tc.function.name,
                  'arguments': tc.function.arguments,
                },
              }
              for tc in message.tool_calls
            ],
          }
          llm_messages.append(assistant_msg)
          tc_count = len(message.tool_calls)
          logger.info(f'📝 Assistant msg: content={message.content!r}, tool_calls={tc_count}')

          # Execute each tool
          for tool_call in message.tool_calls:
            args = json.loads(tool_call.function.arguments or '{}')
            logger.info(f'🔧 Executing tool: {tool_call.function.name}')
            result = await self._execute_tool(tool_call.function.name, args)

            # Emit tool output event
            output_event = {
              'type': 'response.output_item.done',
              'item': {
                'type': 'function_call_output',
                'call_id': tool_call.id,
                'output': result,
              },
            }
            yield f'data: {json.dumps(output_event)}\n\n'

            # Add tool result to messages
            # Include 'name' field as some APIs require it
            tool_result_msg = {
              'role': 'tool',
              'tool_call_id': tool_call.id,
              'name': tool_call.function.name,
              'content': result,
            }
            llm_messages.append(tool_result_msg)
            logger.info(f'📝 Tool result: id={tool_call.id}, name={tool_call.function.name}')

          # Log message array before next iteration
          logger.info(f'📝 Messages before iteration {iteration + 1}: {len(llm_messages)} messages')
          for i, msg in enumerate(llm_messages):
            role = msg.get('role')
            has_tool_calls = 'tool_calls' in msg
            tool_call_id = msg.get('tool_call_id', '')
            logger.info(f'  [{i}] role={role}, tool_calls={has_tool_calls}, tc_id={tool_call_id}')

          # Continue loop - LLM will process tool results
          continue

        # No tool calls - stream the final response
        logger.info('💬 Streaming final response')

        # If we already have content from the non-streaming call, emit it
        if message.content:
          # For simplicity, emit the content in chunks
          content = message.content
          chunk_size = 20  # Characters per chunk for typing effect
          for i in range(0, len(content), chunk_size):
            chunk = content[i : i + chunk_size]
            event = {
              'type': 'response.output_text.delta',
              'delta': chunk,
            }
            yield f'data: {json.dumps(event)}\n\n'
            # Small delay for typing effect
            await asyncio.sleep(0.02)

        # Done
        break

      except Exception as e:
        logger.error(f'Error in FMAPI handler: {e}')
        error_event = {'type': 'error', 'error': str(e)}
        yield f'data: {json.dumps(error_event)}\n\n'
        break

    yield 'data: [DONE]\n\n'
