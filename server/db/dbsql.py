"""Databricks SQL connection and query utilities.

This module provides functions to query financial data from Databricks SQL tables.
Used as an alternative data source to the in-memory sample data.

Configuration:
  DBSQL_SCHEMA: Unity Catalog schema (e.g., 'catalog.schema')
  DATABRICKS_HOST: Databricks workspace URL
  DATABRICKS_TOKEN: Personal access token (for local dev)
  DATABRICKS_SERVER_HOSTNAME: SQL warehouse hostname
  DATABRICKS_HTTP_PATH: SQL warehouse HTTP path
"""

import json
import logging
import os
from datetime import date, datetime, timedelta
from typing import Optional

from databricks import sql as dbsql

from server.models.finance import (
  Asset,
  AssetClassAllocation,
  CashflowSummary,
  DailyCashflow,
  FinancialSummary,
  Holding,
  InvestmentsData,
  InvestmentsSummary,
  Liability,
  PortfolioHistoryPoint,
  Transaction,
  TransactionsData,
)
from server.models.profile import FinancialGoal, UserProfileResponse

logger = logging.getLogger(__name__)

# Connection cache
_connection = None


def is_dbsql_configured() -> bool:
  """Check if Databricks SQL is fully configured.

  Returns:
      True if all required DBSQL environment variables are set.
      DATABRICKS_TOKEN is optional - if not set, uses Databricks SDK default auth
      (which works automatically in Databricks Apps with service principal).
  """
  required_vars = [
    'DBSQL_SCHEMA',
    'DATABRICKS_SERVER_HOSTNAME',
    'DATABRICKS_HTTP_PATH',
  ]
  return all(os.environ.get(var) for var in required_vars)


def get_schema() -> str:
  """Get the configured DBSQL schema.

  Returns:
      Schema string (e.g., 'catalog.schema')

  Raises:
      ValueError: If DBSQL_SCHEMA is not configured
  """
  schema = os.environ.get('DBSQL_SCHEMA')
  if not schema:
    raise ValueError('DBSQL_SCHEMA environment variable is not set')
  return schema


def get_connection():
  """Get or create a Databricks SQL connection.

  Uses DATABRICKS_TOKEN if set, otherwise falls back to Databricks SDK credentials
  provider (which works automatically in Databricks Apps with service principal).

  Returns:
      databricks.sql connection object

  Raises:
      ValueError: If required environment variables are not set
  """
  global _connection

  if _connection is not None:
    return _connection

  server_hostname = os.environ.get('DATABRICKS_SERVER_HOSTNAME')
  http_path = os.environ.get('DATABRICKS_HTTP_PATH')
  access_token = os.environ.get('DATABRICKS_TOKEN')

  if not server_hostname:
    raise ValueError('DATABRICKS_SERVER_HOSTNAME environment variable is not set')
  if not http_path:
    raise ValueError('DATABRICKS_HTTP_PATH environment variable is not set')

  if access_token:
    # Use PAT directly if provided
    logger.info('Using DATABRICKS_TOKEN for DBSQL authentication')
    _connection = dbsql.connect(
      server_hostname=server_hostname,
      http_path=http_path,
      access_token=access_token,
    )
  else:
    # Use Databricks SDK credentials provider for OAuth/service principal
    try:
      from databricks.sdk.core import Config, oauth_service_principal

      # Log available env vars for debugging (redacted)
      logger.info(f'DATABRICKS_HOST set: {bool(os.environ.get("DATABRICKS_HOST"))}')
      logger.info(f'DATABRICKS_CLIENT_ID set: {bool(os.environ.get("DATABRICKS_CLIENT_ID"))}')
      logger.info(f'DATABRICKS_CLIENT_SECRET set: {bool(os.environ.get("DATABRICKS_CLIENT_SECRET"))}')

      # Create credentials provider for OAuth service principal
      # See: https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m
      def credential_provider():
        config = Config(
          host=f'https://{server_hostname}',
          client_id=os.environ.get('DATABRICKS_CLIENT_ID'),
          client_secret=os.environ.get('DATABRICKS_CLIENT_SECRET'),
        )
        return oauth_service_principal(config)

      logger.info('Using OAuth service principal for DBSQL authentication')
      _connection = dbsql.connect(
        server_hostname=server_hostname,
        http_path=http_path,
        credentials_provider=credential_provider,
      )
    except Exception as e:
      logger.error(f'Failed to authenticate via Databricks SDK: {e}')
      raise ValueError(
        'DATABRICKS_TOKEN not set and could not authenticate via Databricks SDK. '
        f'Ensure DATABRICKS_HOST is set and service principal is configured. Error: {e}'
      )

  return _connection


def close_connection():
  """Close the DBSQL connection if open."""
  global _connection
  if _connection is not None:
    _connection.close()
    _connection = None


def _execute_query(query: str, params: Optional[dict] = None) -> list[dict]:
  """Execute a SQL query and return results as list of dicts.

  Args:
      query: SQL query string
      params: Optional dict of query parameters

  Returns:
      List of row dictionaries
  """
  conn = get_connection()
  cursor = conn.cursor()

  try:
    if params:
      cursor.execute(query, params)
    else:
      cursor.execute(query)

    columns = [desc[0] for desc in cursor.description] if cursor.description else []
    rows = cursor.fetchall()

    return [dict(zip(columns, row)) for row in rows]
  finally:
    cursor.close()


# =============================================================================
# Financial Summary Queries
# =============================================================================


def get_financial_summary_from_dbsql(user_email: str) -> FinancialSummary:
  """Fetch financial summary from Databricks SQL.

  Args:
      user_email: User's email address

  Returns:
      FinancialSummary object with assets, liabilities, and net worth
  """
  schema = get_schema()

  # Fetch assets
  assets_query = f"""
    SELECT id, name, category, value, description
    FROM {schema}.assets
    WHERE user_email = %(user_email)s
    ORDER BY value DESC
  """
  assets_rows = _execute_query(assets_query, {'user_email': user_email})
  assets = [
    Asset(
      id=row['id'],
      name=row['name'],
      category=row['category'],
      value=row['value'],
      description=row.get('description'),
    )
    for row in assets_rows
  ]

  # Fetch liabilities
  liabilities_query = f"""
    SELECT id, name, category, amount, description
    FROM {schema}.liabilities
    WHERE user_email = %(user_email)s
    ORDER BY amount DESC
  """
  liabilities_rows = _execute_query(liabilities_query, {'user_email': user_email})
  liabilities = [
    Liability(
      id=row['id'],
      name=row['name'],
      category=row['category'],
      amount=row['amount'],
      description=row.get('description'),
    )
    for row in liabilities_rows
  ]

  # Calculate totals
  total_assets = sum(a.value for a in assets)
  total_liabilities = sum(liab.amount for liab in liabilities)
  net_worth = total_assets - total_liabilities

  return FinancialSummary(
    totalAssets=total_assets,
    totalLiabilities=total_liabilities,
    netWorth=net_worth,
    assets=assets,
    liabilities=liabilities,
    lastUpdated=datetime.now(),
  )


def create_asset_in_dbsql(
  user_email: str,
  asset_id: str,
  name: str,
  category: str,
  value: float,
  description: Optional[str] = None,
) -> Asset:
  """Create a new asset in Databricks SQL.

  Args:
      user_email: User's email address
      asset_id: Unique asset ID
      name: Asset name
      category: Asset category
      value: Asset value
      description: Optional description

  Returns:
      Created Asset object
  """
  schema = get_schema()

  query = f"""
    INSERT INTO {schema}.assets (id, user_email, name, category, value, description)
    VALUES (%(id)s, %(user_email)s, %(name)s, %(category)s, %(value)s, %(description)s)
  """
  _execute_query(
    query,
    {
      'id': asset_id,
      'user_email': user_email,
      'name': name,
      'category': category,
      'value': value,
      'description': description,
    },
  )

  return Asset(id=asset_id, name=name, category=category, value=value, description=description)


def create_liability_in_dbsql(
  user_email: str,
  liability_id: str,
  name: str,
  category: str,
  amount: float,
  description: Optional[str] = None,
) -> Liability:
  """Create a new liability in Databricks SQL.

  Args:
      user_email: User's email address
      liability_id: Unique liability ID
      name: Liability name
      category: Liability category
      amount: Liability amount
      description: Optional description

  Returns:
      Created Liability object
  """
  schema = get_schema()

  query = f"""
    INSERT INTO {schema}.liabilities (id, user_email, name, category, amount, description)
    VALUES (%(id)s, %(user_email)s, %(name)s, %(category)s, %(amount)s, %(description)s)
  """
  _execute_query(
    query,
    {
      'id': liability_id,
      'user_email': user_email,
      'name': name,
      'category': category,
      'amount': amount,
      'description': description,
    },
  )

  return Liability(
    id=liability_id, name=name, category=category, amount=amount, description=description
  )


# =============================================================================
# Transactions Queries
# =============================================================================


def get_transactions_from_dbsql(user_email: str, days: int = 30) -> TransactionsData:
  """Fetch transactions from Databricks SQL.

  Args:
      user_email: User's email address
      days: Number of days to include in daily cashflow aggregation

  Returns:
      TransactionsData object with transactions, daily cashflow, and summary
  """
  schema = get_schema()

  # Fetch all transactions (last 6 months for full history)
  transactions_query = f"""
    SELECT id, name, amount, merchant, transaction_date, category, type, description
    FROM {schema}.transactions
    WHERE user_email = %(user_email)s
      AND transaction_date >= DATE_SUB(CURRENT_DATE(), 180)
    ORDER BY transaction_date DESC
  """
  transactions_rows = _execute_query(transactions_query, {'user_email': user_email})
  transactions = [
    Transaction(
      id=row['id'],
      name=row['name'],
      amount=row['amount'],
      merchant=row['merchant'],
      date=row['transaction_date'],
      category=row['category'],
      type=row['type'],
      description=row.get('description'),
    )
    for row in transactions_rows
  ]

  # Calculate daily cashflow for the specified period
  cutoff_date = date.today() - timedelta(days=days)
  daily_cashflow_query = f"""
    SELECT
      transaction_date as date,
      SUM(CASE WHEN type = 'inflow' THEN amount ELSE 0 END) as inflows,
      SUM(CASE WHEN type = 'outflow' THEN amount ELSE 0 END) as outflows
    FROM {schema}.transactions
    WHERE user_email = %(user_email)s
      AND transaction_date >= %(cutoff_date)s
    GROUP BY transaction_date
    ORDER BY transaction_date
  """
  daily_rows = _execute_query(
    daily_cashflow_query, {'user_email': user_email, 'cutoff_date': cutoff_date}
  )
  daily_cashflow = [
    DailyCashflow(
      date=row['date'],
      inflows=row['inflows'],
      outflows=row['outflows'],
      net=row['inflows'] - row['outflows'],
    )
    for row in daily_rows
  ]

  # Calculate summary
  total_inflows = sum(dc.inflows for dc in daily_cashflow)
  total_outflows = sum(dc.outflows for dc in daily_cashflow)

  summary = CashflowSummary(
    totalInflows=total_inflows,
    totalOutflows=total_outflows,
    netCashflow=total_inflows - total_outflows,
  )

  return TransactionsData(
    transactions=transactions,
    dailyCashflow=daily_cashflow,
    summary=summary,
  )


# =============================================================================
# Investments Queries
# =============================================================================


def get_investments_from_dbsql(user_email: str, period: str = '1Y') -> InvestmentsData:
  """Fetch investment data from Databricks SQL.

  Args:
      user_email: User's email address
      period: Time period for history ('1M', '3M', '6M', 'YTD', '1Y', 'ALL')

  Returns:
      InvestmentsData object with holdings, allocations, history, and summary
  """
  schema = get_schema()

  # Fetch holdings
  holdings_query = f"""
    SELECT id, ticker, name, asset_class, shares, cost_basis, current_price,
           day_change, week_change, month_change, ytd_change, year_change
    FROM {schema}.holdings
    WHERE user_email = %(user_email)s
    ORDER BY (shares * current_price) DESC
  """
  holdings_rows = _execute_query(holdings_query, {'user_email': user_email})

  holdings = []
  for row in holdings_rows:
    current_value = row['shares'] * row['current_price']
    gain_loss = current_value - row['cost_basis']
    gain_loss_percent = (gain_loss / row['cost_basis'] * 100) if row['cost_basis'] > 0 else 0

    holdings.append(
      Holding(
        id=row['id'],
        ticker=row['ticker'],
        name=row['name'],
        assetClass=row['asset_class'],
        shares=row['shares'],
        costBasis=row['cost_basis'],
        currentPrice=row['current_price'],
        currentValue=current_value,
        gainLoss=gain_loss,
        gainLossPercent=gain_loss_percent,
        dayChange=row['day_change'] or 0,
        weekChange=row['week_change'] or 0,
        monthChange=row['month_change'] or 0,
        ytdChange=row['ytd_change'] or 0,
        yearChange=row['year_change'] or 0,
      )
    )

  # Calculate allocations
  total_value = sum(h.current_value for h in holdings)
  allocation_map = {}
  for h in holdings:
    ac = h.asset_class
    if ac not in allocation_map:
      allocation_map[ac] = {'value': 0, 'count': 0}
    allocation_map[ac]['value'] += h.current_value
    allocation_map[ac]['count'] += 1

  allocations = [
    AssetClassAllocation(
      assetClass=ac,
      value=data['value'],
      percentage=(data['value'] / total_value * 100) if total_value > 0 else 0,
      holdingsCount=data['count'],
    )
    for ac, data in allocation_map.items()
  ]

  # Fetch portfolio history based on period
  period_days = {
    '1M': 30,
    '3M': 90,
    '6M': 180,
    'YTD': (date.today() - date(date.today().year, 1, 1)).days,
    '1Y': 365,
    'ALL': 3650,  # ~10 years
  }
  days = period_days.get(period, 365)
  cutoff_date = date.today() - timedelta(days=days)

  history_query = f"""
    SELECT record_date, total_value
    FROM {schema}.portfolio_history
    WHERE user_email = %(user_email)s
      AND record_date >= %(cutoff_date)s
    ORDER BY record_date
  """
  history_rows = _execute_query(
    history_query, {'user_email': user_email, 'cutoff_date': cutoff_date}
  )
  history = [
    PortfolioHistoryPoint(date=row['record_date'], value=row['total_value'])
    for row in history_rows
  ]

  # Calculate summary
  total_cost_basis = sum(h.cost_basis for h in holdings)
  total_gain_loss = total_value - total_cost_basis
  total_gain_loss_percent = (
    (total_gain_loss / total_cost_basis * 100) if total_cost_basis > 0 else 0
  )

  # Calculate day change from holdings
  day_change = sum(
    h.current_value * (h.day_change / 100) for h in holdings if h.day_change
  )
  day_change_percent = (
    (day_change / (total_value - day_change) * 100) if total_value > day_change else 0
  )

  summary = InvestmentsSummary(
    totalValue=total_value,
    totalCostBasis=total_cost_basis,
    totalGainLoss=total_gain_loss,
    totalGainLossPercent=total_gain_loss_percent,
    dayChange=day_change,
    dayChangePercent=day_change_percent,
  )

  return InvestmentsData(
    holdings=holdings,
    allocations=allocations,
    history=history,
    summary=summary,
  )


# =============================================================================
# User Profile Queries
# =============================================================================


def _calculate_age(dob: Optional[date]) -> Optional[int]:
  """Calculate age from date of birth."""
  if not dob:
    return None
  today = date.today()
  age = today.year - dob.year
  if (today.month, today.day) < (dob.month, dob.day):
    age -= 1
  return age


def _parse_financial_goals(goals_json: Optional[str]) -> Optional[list[FinancialGoal]]:
  """Parse financial goals from JSON string."""
  if not goals_json:
    return None
  try:
    goals_data = json.loads(goals_json)
    return [
      FinancialGoal(
        name=g.get('name', ''),
        targetAmount=g.get('targetAmount'),
        targetDate=g.get('targetDate'),
        priority=g.get('priority'),
      )
      for g in goals_data
    ]
  except (json.JSONDecodeError, TypeError):
    return None


def get_user_profile_from_dbsql(user_email: str) -> Optional[UserProfileResponse]:
  """Fetch user profile from Databricks SQL.

  Args:
      user_email: User's email address

  Returns:
      UserProfileResponse object or None if not found
  """
  schema = get_schema()

  query = f"""
    SELECT
      user_email,
      date_of_birth,
      marital_status,
      number_of_dependents,
      employment_status,
      employer_name,
      job_title,
      years_employed,
      annual_income,
      risk_tolerance,
      tax_filing_status,
      financial_goals,
      investment_experience_years,
      retirement_age_target,
      notes,
      created_at,
      updated_at
    FROM {schema}.user_profiles
    WHERE user_email = %(user_email)s
  """
  rows = _execute_query(query, {'user_email': user_email})

  if not rows:
    return None

  row = rows[0]
  dob = row.get('date_of_birth')

  return UserProfileResponse(
    userEmail=row['user_email'],
    dateOfBirth=dob,
    age=_calculate_age(dob),
    maritalStatus=row.get('marital_status'),
    numberOfDependents=row.get('number_of_dependents', 0),
    employmentStatus=row.get('employment_status'),
    employerName=row.get('employer_name'),
    jobTitle=row.get('job_title'),
    yearsEmployed=row.get('years_employed'),
    annualIncome=row.get('annual_income'),
    riskTolerance=row.get('risk_tolerance'),
    taxFilingStatus=row.get('tax_filing_status'),
    financialGoals=_parse_financial_goals(row.get('financial_goals')),
    investmentExperienceYears=row.get('investment_experience_years'),
    retirementAgeTarget=row.get('retirement_age_target'),
    notes=row.get('notes'),
    createdAt=row.get('created_at') or datetime.now(),
    updatedAt=row.get('updated_at') or datetime.now(),
  )


def upsert_user_profile_in_dbsql(
  user_email: str,
  date_of_birth: Optional[date] = None,
  marital_status: Optional[str] = None,
  number_of_dependents: int = 0,
  employment_status: Optional[str] = None,
  employer_name: Optional[str] = None,
  job_title: Optional[str] = None,
  years_employed: Optional[int] = None,
  annual_income: Optional[float] = None,
  risk_tolerance: Optional[str] = None,
  tax_filing_status: Optional[str] = None,
  financial_goals: Optional[list] = None,
  investment_experience_years: Optional[int] = None,
  retirement_age_target: Optional[int] = None,
  notes: Optional[str] = None,
  **kwargs,
) -> UserProfileResponse:
  """Create or update a user profile in Databricks SQL.

  Args:
      user_email: User's email address
      date_of_birth: User's date of birth
      marital_status: Marital status
      number_of_dependents: Number of dependents
      employment_status: Employment status
      employer_name: Employer name
      job_title: Job title
      years_employed: Years at current employer
      annual_income: Annual income
      risk_tolerance: Investment risk tolerance
      tax_filing_status: Tax filing status
      financial_goals: List of financial goals
      investment_experience_years: Years of investment experience
      retirement_age_target: Target retirement age
      notes: Additional notes
      **kwargs: Additional fields (ignored)

  Returns:
      UserProfileResponse object
  """
  schema = get_schema()

  # Convert financial_goals list to JSON string
  goals_json = json.dumps(financial_goals) if financial_goals else None

  # Check if profile exists
  existing = get_user_profile_from_dbsql(user_email)

  if existing:
    # Update existing profile
    query = f"""
      UPDATE {schema}.user_profiles
      SET
        date_of_birth = %(date_of_birth)s,
        marital_status = %(marital_status)s,
        number_of_dependents = %(number_of_dependents)s,
        employment_status = %(employment_status)s,
        employer_name = %(employer_name)s,
        job_title = %(job_title)s,
        years_employed = %(years_employed)s,
        annual_income = %(annual_income)s,
        risk_tolerance = %(risk_tolerance)s,
        tax_filing_status = %(tax_filing_status)s,
        financial_goals = %(financial_goals)s,
        investment_experience_years = %(investment_experience_years)s,
        retirement_age_target = %(retirement_age_target)s,
        notes = %(notes)s,
        updated_at = CURRENT_TIMESTAMP()
      WHERE user_email = %(user_email)s
    """
  else:
    # Insert new profile
    query = f"""
      INSERT INTO {schema}.user_profiles (
        user_email, date_of_birth, marital_status, number_of_dependents,
        employment_status, employer_name, job_title, years_employed,
        annual_income, risk_tolerance, tax_filing_status, financial_goals,
        investment_experience_years, retirement_age_target, notes
      )
      VALUES (
        %(user_email)s, %(date_of_birth)s, %(marital_status)s, %(number_of_dependents)s,
        %(employment_status)s, %(employer_name)s, %(job_title)s, %(years_employed)s,
        %(annual_income)s, %(risk_tolerance)s, %(tax_filing_status)s, %(financial_goals)s,
        %(investment_experience_years)s, %(retirement_age_target)s, %(notes)s
      )
    """

  _execute_query(
    query,
    {
      'user_email': user_email,
      'date_of_birth': str(date_of_birth) if date_of_birth else None,
      'marital_status': marital_status,
      'number_of_dependents': number_of_dependents,
      'employment_status': employment_status,
      'employer_name': employer_name,
      'job_title': job_title,
      'years_employed': years_employed,
      'annual_income': annual_income,
      'risk_tolerance': risk_tolerance,
      'tax_filing_status': tax_filing_status,
      'financial_goals': goals_json,
      'investment_experience_years': investment_experience_years,
      'retirement_age_target': retirement_age_target,
      'notes': notes,
    },
  )

  # Return the updated/created profile
  return get_user_profile_from_dbsql(user_email)


def delete_user_profile_from_dbsql(user_email: str) -> bool:
  """Delete a user profile from Databricks SQL.

  Args:
      user_email: User's email address

  Returns:
      True if profile was deleted, False if not found
  """
  schema = get_schema()

  # Check if exists first
  existing = get_user_profile_from_dbsql(user_email)
  if not existing:
    return False

  query = f"""
    DELETE FROM {schema}.user_profiles
    WHERE user_email = %(user_email)s
  """
  _execute_query(query, {'user_email': user_email})
  return True
