# Databricks SQL Setup Guide

This guide walks through setting up Databricks SQL as the data backend for the Personal Finance App.

## Overview

By default, the app uses in-memory sample data. When Databricks SQL is configured, the app queries real data from Delta tables for:
- Assets & Liabilities (Net Worth)
- Transactions (Cashflow)
- Investment Holdings & Portfolio History

## Prerequisites

- Databricks workspace with Unity Catalog enabled
- SQL Warehouse (Serverless or Pro recommended)
- Personal Access Token with SQL warehouse access

## Step 1: Create the Schema

In Databricks SQL, create a schema for the app:

```sql
CREATE SCHEMA IF NOT EXISTS main.personal_finance;
```

Or use an existing catalog/schema of your choice.

## Step 2: Create Tables

Run the DDL script to create the required tables. You can either:

**Option A: Run in Databricks SQL Editor**

1. Open `scripts/sql/create_tables.sql`
2. Copy the contents to a Databricks SQL query
3. Find & replace `${schema}` with your schema (e.g., `main.personal_finance`)
4. Execute the query

**Option B: Use Databricks CLI**

```bash
# Set your schema
SCHEMA="main.personal_finance"

# Replace placeholder and run
sed "s/\${schema}/$SCHEMA/g" scripts/sql/create_tables.sql | \
  databricks sql execute --warehouse-id <your-warehouse-id>
```

### Tables Created

| Table | Description |
|-------|-------------|
| `assets` | User assets (cash, investments, property) |
| `liabilities` | User liabilities (loans, credit cards, mortgages) |
| `transactions` | Income and expense transactions |
| `holdings` | Investment positions (stocks, bonds, cash) |
| `portfolio_history` | Daily portfolio value snapshots |
| `user_profiles` | User profile and financial preferences |

## Step 3: Seed Sample Data

Populate the tables with sample data for testing:

1. Open `scripts/sql/seed_data.sql`
2. Copy the contents to a Databricks SQL query
3. Find & replace:
   - `${schema}` → your schema (e.g., `main.personal_finance`)
   - `${user_email}` → your Databricks user email (e.g., `user@company.com`)
4. Execute the query

This creates ~50 sample transactions, 5 assets, 4 liabilities, 6 holdings, and 12 months of portfolio history.

## Step 4: Get SQL Warehouse Connection Details

1. Go to **SQL Warehouses** in your Databricks workspace
2. Click on your warehouse
3. Click **Connection details**
4. Note the following:
   - **Server hostname**: e.g., `adb-1234567890.12.azuredatabricks.net`
   - **HTTP path**: e.g., `/sql/1.0/warehouses/abc123def456`

## Step 5: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Databricks SQL Configuration
DBSQL_SCHEMA=main.personal_finance
DATABRICKS_SERVER_HOSTNAME=adb-1234567890.12.azuredatabricks.net
DATABRICKS_HTTP_PATH=/sql/1.0/warehouses/abc123def456
DATABRICKS_TOKEN=dapi_your_personal_access_token
```

All 4 variables must be set for DBSQL to be enabled. If any are missing, the app falls back to sample data.

## Step 6: Verify Setup

1. Start the app:
   ```bash
   ./scripts/start_dev.sh
   ```

2. Check the logs for DBSQL connection messages

3. Open the app and verify data loads from your tables

## Troubleshooting

### "DATABRICKS_SERVER_HOSTNAME environment variable is not set"

Ensure all 4 required environment variables are set in `.env.local`:
- `DBSQL_SCHEMA`
- `DATABRICKS_SERVER_HOSTNAME`
- `DATABRICKS_HTTP_PATH`
- `DATABRICKS_TOKEN`

### Empty data in the app

1. Verify the `user_email` in your seed data matches your Databricks login email
2. Check the tables have data:
   ```sql
   SELECT * FROM main.personal_finance.assets WHERE user_email = 'your@email.com';
   ```

### Connection errors

1. Verify your SQL Warehouse is running
2. Check your token has permissions to access the warehouse
3. Confirm the server hostname and HTTP path are correct

## Multi-User Support

All tables include a `user_email` column for data isolation. Each user only sees their own data. To add data for additional users, run the seed script with different `${user_email}` values.

## Schema Reference

### assets
```sql
id STRING NOT NULL,
user_email STRING NOT NULL,
name STRING NOT NULL,
category STRING NOT NULL,  -- 'cash', 'investment', 'property'
value DOUBLE NOT NULL,
description STRING,
created_at TIMESTAMP,
updated_at TIMESTAMP
```

### liabilities
```sql
id STRING NOT NULL,
user_email STRING NOT NULL,
name STRING NOT NULL,
category STRING NOT NULL,  -- 'loan', 'credit_card', 'mortgage', 'other'
amount DOUBLE NOT NULL,
description STRING,
created_at TIMESTAMP,
updated_at TIMESTAMP
```

### transactions
```sql
id STRING NOT NULL,
user_email STRING NOT NULL,
name STRING NOT NULL,
amount DOUBLE NOT NULL,
merchant STRING NOT NULL,
transaction_date DATE NOT NULL,
category STRING NOT NULL,  -- see below
type STRING NOT NULL,      -- 'inflow' or 'outflow'
description STRING,
created_at TIMESTAMP
```

**Transaction Categories:**
- Inflows: `salary`, `freelance`, `uncategorized_income`
- Outflows: `housing`, `food`, `transport`, `shopping`, `entertainment`, `utilities`, `healthcare`, `other`

### holdings
```sql
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
```

### portfolio_history
```sql
user_email STRING NOT NULL,
record_date DATE NOT NULL,
total_value DOUBLE NOT NULL
```

### user_profiles
```sql
user_email STRING NOT NULL,
date_of_birth DATE,
marital_status STRING,          -- 'single', 'married', 'divorced', 'widowed', 'separated'
number_of_dependents INT,
employment_status STRING,       -- 'employed_full_time', 'employed_part_time', 'self_employed',
                                -- 'unemployed', 'retired', 'student'
employer_name STRING,
job_title STRING,
years_employed INT,
annual_income DOUBLE,
risk_tolerance STRING,          -- 'conservative', 'moderately_conservative', 'moderate',
                                -- 'moderately_aggressive', 'aggressive'
tax_filing_status STRING,       -- 'single', 'married_filing_jointly', 'married_filing_separately',
                                -- 'head_of_household', 'qualifying_widow'
financial_goals STRING,         -- JSON array of goals
investment_experience_years INT,
retirement_age_target INT,
notes STRING,
created_at TIMESTAMP,
updated_at TIMESTAMP
```
