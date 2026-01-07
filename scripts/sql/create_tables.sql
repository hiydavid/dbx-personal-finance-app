-- Personal Finance App - Databricks SQL Tables
-- Run this script in Databricks SQL to create the required tables

-- ============================================================================
-- CONFIGURATION: Set your schema here (catalog.schema format)
-- ============================================================================
DECLARE OR REPLACE schema_name = 'main.personal_finance'; -- replace with actual schema name

-- ============================================================================
-- Table: assets
-- Stores user assets (cash, investments, property)
-- ============================================================================
CREATE TABLE IF NOT EXISTS IDENTIFIER(schema_name || '.assets') (
  id STRING NOT NULL,
  user_email STRING NOT NULL,
  name STRING NOT NULL,
  category STRING NOT NULL,  -- 'cash', 'investment', 'property'
  value DOUBLE NOT NULL,
  description STRING,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
USING DELTA
TBLPROPERTIES (
  'delta.enableChangeDataFeed' = 'true'
);

-- ============================================================================
-- Table: liabilities
-- Stores user liabilities (loans, credit cards, mortgages)
-- ============================================================================
CREATE TABLE IF NOT EXISTS IDENTIFIER(schema_name || '.liabilities') (
  id STRING NOT NULL,
  user_email STRING NOT NULL,
  name STRING NOT NULL,
  category STRING NOT NULL,  -- 'loan', 'credit_card', 'mortgage', 'other'
  amount DOUBLE NOT NULL,
  description STRING,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
USING DELTA
TBLPROPERTIES (
  'delta.enableChangeDataFeed' = 'true'
);

-- ============================================================================
-- Table: transactions
-- Stores user transactions (inflows and outflows)
-- ============================================================================
CREATE TABLE IF NOT EXISTS IDENTIFIER(schema_name || '.transactions') (
  id STRING NOT NULL,
  user_email STRING NOT NULL,
  name STRING NOT NULL,
  amount DOUBLE NOT NULL,
  merchant STRING NOT NULL,
  transaction_date DATE NOT NULL,
  category STRING NOT NULL,
  -- Inflow categories: 'salary', 'freelance', 'uncategorized_income'
  -- Outflow categories: 'housing', 'food', 'transport', 'shopping',
  --                     'entertainment', 'utilities', 'healthcare', 'other'
  type STRING NOT NULL,  -- 'inflow' or 'outflow'
  description STRING,
  created_at TIMESTAMP
)
USING DELTA
PARTITIONED BY (user_email)
TBLPROPERTIES (
  'delta.enableChangeDataFeed' = 'true'
);

-- ============================================================================
-- Table: holdings
-- Stores user investment holdings
-- ============================================================================
CREATE TABLE IF NOT EXISTS IDENTIFIER(schema_name || '.holdings') (
  id STRING NOT NULL,
  user_email STRING NOT NULL,
  ticker STRING NOT NULL,
  name STRING NOT NULL,
  asset_class STRING NOT NULL,  -- 'stocks', 'bonds', 'cash'
  shares DOUBLE NOT NULL,
  cost_basis DOUBLE NOT NULL,
  current_price DOUBLE NOT NULL,
  day_change DOUBLE,
  week_change DOUBLE,
  month_change DOUBLE,
  ytd_change DOUBLE,
  year_change DOUBLE,
  updated_at TIMESTAMP
)
USING DELTA
TBLPROPERTIES (
  'delta.enableChangeDataFeed' = 'true'
);

-- ============================================================================
-- Table: portfolio_history
-- Stores daily portfolio value snapshots for charting
-- ============================================================================
CREATE TABLE IF NOT EXISTS IDENTIFIER(schema_name || '.portfolio_history') (
  user_email STRING NOT NULL,
  record_date DATE NOT NULL,
  total_value DOUBLE NOT NULL
)
USING DELTA
PARTITIONED BY (user_email)
TBLPROPERTIES (
  'delta.enableChangeDataFeed' = 'true'
);

-- ============================================================================
-- Table: user_profiles
-- Stores user profile and financial preferences
-- ============================================================================
CREATE TABLE IF NOT EXISTS IDENTIFIER(schema_name || '.user_profiles') (
  user_email STRING NOT NULL,
  date_of_birth DATE,
  marital_status STRING,  -- 'single', 'married', 'divorced', 'widowed', 'separated'
  number_of_dependents INT,
  employment_status STRING,  -- 'employed_full_time', 'employed_part_time', 'self_employed',
                             -- 'unemployed', 'retired', 'student'
  employer_name STRING,
  job_title STRING,
  years_employed INT,
  annual_income DOUBLE,
  risk_tolerance STRING,  -- 'conservative', 'moderately_conservative', 'moderate',
                          -- 'moderately_aggressive', 'aggressive'
  tax_filing_status STRING,  -- 'single', 'married_filing_jointly', 'married_filing_separately',
                             -- 'head_of_household', 'qualifying_widow'
  financial_goals STRING,  -- JSON array of goals
  investment_experience_years INT,
  retirement_age_target INT,
  notes STRING,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
USING DELTA
TBLPROPERTIES (
  'delta.enableChangeDataFeed' = 'true'
);
