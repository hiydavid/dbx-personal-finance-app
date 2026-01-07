-- Personal Finance App - Seed Data for Alice (Established Professional)
-- Run this script in Databricks SQL after creating tables

-- ============================================================================
-- CONFIGURATION: Set your schema and user email here
-- ============================================================================
DECLARE OR REPLACE schema_name = 'main.personal_finance'; -- replace with actual schema name
DECLARE OR REPLACE user_email = 'alice@company.com';

-- ============================================================================
-- Seed Assets
-- ============================================================================
INSERT INTO IDENTIFIER(schema_name || '.assets') (id, user_email, name, category, value, description)
VALUES
  ('asset-001', user_email, 'Checking Account', 'cash', 15000.00, 'Primary checking account at Chase'),
  ('asset-002', user_email, 'Emergency Savings', 'cash', 25000.00, 'High-yield savings account at Marcus'),
  ('asset-003', user_email, '401(k)', 'investment', 120000.00, 'Employer-sponsored retirement account'),
  ('asset-004', user_email, 'Brokerage Account', 'investment', 45000.00, 'Individual investment account at Fidelity'),
  ('asset-005', user_email, 'Primary Residence', 'property', 450000.00, 'Single family home purchased in 2020');

-- ============================================================================
-- Seed Liabilities
-- ============================================================================
INSERT INTO IDENTIFIER(schema_name || '.liabilities') (id, user_email, name, category, amount, description)
VALUES
  ('liab-001', user_email, 'Mortgage', 'mortgage', 320000.00, '30-year fixed at 6.5% APR'),
  ('liab-002', user_email, 'Auto Loan', 'loan', 18000.00, '5-year auto loan at 4.9% APR'),
  ('liab-003', user_email, 'Chase Sapphire', 'credit_card', 2500.00, 'Credit card balance'),
  ('liab-004', user_email, 'Student Loan', 'loan', 35000.00, 'Federal student loan at 5.5% APR');

-- ============================================================================
-- Seed Investment Holdings
-- ============================================================================
INSERT INTO IDENTIFIER(schema_name || '.holdings') (id, user_email, ticker, name, asset_class, shares, cost_basis, current_price, day_change, week_change, month_change, ytd_change, year_change)
VALUES
  ('hold-001', user_email, 'VTI', 'Vanguard Total Stock Market ETF', 'stocks', 150.0, 32000.00, 250.50, 0.85, 1.23, 2.45, 8.50, 17.42),
  ('hold-002', user_email, 'VXUS', 'Vanguard Total International Stock ETF', 'stocks', 200.0, 11000.00, 62.40, -0.32, 0.89, 1.78, 5.20, 13.45),
  ('hold-003', user_email, 'QQQ', 'Invesco QQQ Trust', 'stocks', 50.0, 18500.00, 435.20, 1.25, 2.10, 3.50, 12.30, 17.62),
  ('hold-004', user_email, 'BND', 'Vanguard Total Bond Market ETF', 'bonds', 300.0, 23100.00, 72.80, 0.12, -0.25, -0.50, -2.10, -5.45),
  ('hold-005', user_email, 'VGIT', 'Vanguard Intermediate-Term Treasury ETF', 'bonds', 150.0, 9300.00, 58.50, 0.08, -0.15, -0.35, -1.80, -5.65),
  ('hold-006', user_email, 'VMFXX', 'Vanguard Federal Money Market Fund', 'cash', 8000.0, 8000.00, 1.00, 0.00, 0.00, 0.00, 0.00, 0.00);

-- ============================================================================
-- Seed Transactions (last 90 days)
-- ============================================================================

-- Salary deposits (bi-weekly)
INSERT INTO IDENTIFIER(schema_name || '.transactions') (id, user_email, name, amount, merchant, transaction_date, category, type, description)
VALUES
  ('txn-001', user_email, 'Paycheck', 5200.00, 'Employer Direct Deposit', DATE_SUB(CURRENT_DATE(), 7), 'salary', 'inflow', 'Bi-weekly salary'),
  ('txn-002', user_email, 'Paycheck', 5200.00, 'Employer Direct Deposit', DATE_SUB(CURRENT_DATE(), 21), 'salary', 'inflow', 'Bi-weekly salary'),
  ('txn-003', user_email, 'Paycheck', 5200.00, 'Employer Direct Deposit', DATE_SUB(CURRENT_DATE(), 35), 'salary', 'inflow', 'Bi-weekly salary'),
  ('txn-004', user_email, 'Paycheck', 5200.00, 'Employer Direct Deposit', DATE_SUB(CURRENT_DATE(), 49), 'salary', 'inflow', 'Bi-weekly salary'),
  ('txn-005', user_email, 'Paycheck', 5200.00, 'Employer Direct Deposit', DATE_SUB(CURRENT_DATE(), 63), 'salary', 'inflow', 'Bi-weekly salary'),
  ('txn-006', user_email, 'Paycheck', 5200.00, 'Employer Direct Deposit', DATE_SUB(CURRENT_DATE(), 77), 'salary', 'inflow', 'Bi-weekly salary');

-- Freelance income
INSERT INTO IDENTIFIER(schema_name || '.transactions') (id, user_email, name, amount, merchant, transaction_date, category, type, description)
VALUES
  ('txn-007', user_email, 'Consulting Project', 1500.00, 'Client Payment', DATE_SUB(CURRENT_DATE(), 15), 'freelance', 'inflow', 'Web development project'),
  ('txn-008', user_email, 'Side Gig', 800.00, 'Upwork', DATE_SUB(CURRENT_DATE(), 45), 'freelance', 'inflow', 'Data analysis work');

-- Housing expenses
INSERT INTO IDENTIFIER(schema_name || '.transactions') (id, user_email, name, amount, merchant, transaction_date, category, type, description)
VALUES
  ('txn-010', user_email, 'Mortgage Payment', 2100.00, 'Chase Mortgage', DATE_SUB(CURRENT_DATE(), 5), 'housing', 'outflow', 'Monthly mortgage'),
  ('txn-011', user_email, 'Mortgage Payment', 2100.00, 'Chase Mortgage', DATE_SUB(CURRENT_DATE(), 35), 'housing', 'outflow', 'Monthly mortgage'),
  ('txn-012', user_email, 'Mortgage Payment', 2100.00, 'Chase Mortgage', DATE_SUB(CURRENT_DATE(), 65), 'housing', 'outflow', 'Monthly mortgage');

-- Utilities
INSERT INTO IDENTIFIER(schema_name || '.transactions') (id, user_email, name, amount, merchant, transaction_date, category, type, description)
VALUES
  ('txn-020', user_email, 'Electric Bill', 145.00, 'PG&E', DATE_SUB(CURRENT_DATE(), 10), 'utilities', 'outflow', 'Monthly electric'),
  ('txn-021', user_email, 'Internet', 79.99, 'Comcast', DATE_SUB(CURRENT_DATE(), 12), 'utilities', 'outflow', 'Monthly internet'),
  ('txn-022', user_email, 'Water Bill', 65.00, 'City Water', DATE_SUB(CURRENT_DATE(), 8), 'utilities', 'outflow', 'Monthly water'),
  ('txn-023', user_email, 'Electric Bill', 138.00, 'PG&E', DATE_SUB(CURRENT_DATE(), 40), 'utilities', 'outflow', 'Monthly electric'),
  ('txn-024', user_email, 'Internet', 79.99, 'Comcast', DATE_SUB(CURRENT_DATE(), 42), 'utilities', 'outflow', 'Monthly internet'),
  ('txn-025', user_email, 'Water Bill', 62.00, 'City Water', DATE_SUB(CURRENT_DATE(), 38), 'utilities', 'outflow', 'Monthly water');

-- Food & Dining
INSERT INTO IDENTIFIER(schema_name || '.transactions') (id, user_email, name, amount, merchant, transaction_date, category, type, description)
VALUES
  ('txn-030', user_email, 'Groceries', 185.50, 'Whole Foods', DATE_SUB(CURRENT_DATE(), 2), 'food', 'outflow', 'Weekly groceries'),
  ('txn-031', user_email, 'Dinner', 78.00, 'Olive Garden', DATE_SUB(CURRENT_DATE(), 4), 'food', 'outflow', 'Family dinner'),
  ('txn-032', user_email, 'Coffee', 6.50, 'Starbucks', DATE_SUB(CURRENT_DATE(), 1), 'food', 'outflow', 'Morning coffee'),
  ('txn-033', user_email, 'Groceries', 142.30, 'Trader Joes', DATE_SUB(CURRENT_DATE(), 9), 'food', 'outflow', 'Weekly groceries'),
  ('txn-034', user_email, 'Lunch', 18.50, 'Chipotle', DATE_SUB(CURRENT_DATE(), 6), 'food', 'outflow', 'Work lunch'),
  ('txn-035', user_email, 'Food Delivery', 45.00, 'DoorDash', DATE_SUB(CURRENT_DATE(), 11), 'food', 'outflow', 'Weekend delivery'),
  ('txn-036', user_email, 'Groceries', 198.00, 'Costco', DATE_SUB(CURRENT_DATE(), 16), 'food', 'outflow', 'Bulk shopping'),
  ('txn-037', user_email, 'Coffee', 5.75, 'Starbucks', DATE_SUB(CURRENT_DATE(), 3), 'food', 'outflow', 'Morning coffee'),
  ('txn-038', user_email, 'Dinner', 95.00, 'Cheesecake Factory', DATE_SUB(CURRENT_DATE(), 18), 'food', 'outflow', 'Date night'),
  ('txn-039', user_email, 'Groceries', 156.00, 'Whole Foods', DATE_SUB(CURRENT_DATE(), 23), 'food', 'outflow', 'Weekly groceries');

-- Transportation
INSERT INTO IDENTIFIER(schema_name || '.transactions') (id, user_email, name, amount, merchant, transaction_date, category, type, description)
VALUES
  ('txn-040', user_email, 'Gas', 55.00, 'Shell', DATE_SUB(CURRENT_DATE(), 3), 'transport', 'outflow', 'Gas fill-up'),
  ('txn-041', user_email, 'Uber', 24.50, 'Uber', DATE_SUB(CURRENT_DATE(), 7), 'transport', 'outflow', 'Ride to airport'),
  ('txn-042', user_email, 'Gas', 52.00, 'Chevron', DATE_SUB(CURRENT_DATE(), 17), 'transport', 'outflow', 'Gas fill-up'),
  ('txn-043', user_email, 'Car Wash', 25.00, 'Quick Quack', DATE_SUB(CURRENT_DATE(), 20), 'transport', 'outflow', 'Monthly car wash'),
  ('txn-044', user_email, 'Gas', 58.00, 'Shell', DATE_SUB(CURRENT_DATE(), 31), 'transport', 'outflow', 'Gas fill-up');

-- Shopping
INSERT INTO IDENTIFIER(schema_name || '.transactions') (id, user_email, name, amount, merchant, transaction_date, category, type, description)
VALUES
  ('txn-050', user_email, 'Electronics', 149.99, 'Amazon', DATE_SUB(CURRENT_DATE(), 5), 'shopping', 'outflow', 'Wireless earbuds'),
  ('txn-051', user_email, 'Clothing', 89.00, 'Target', DATE_SUB(CURRENT_DATE(), 14), 'shopping', 'outflow', 'New shirts'),
  ('txn-052', user_email, 'Home Goods', 65.00, 'Bed Bath Beyond', DATE_SUB(CURRENT_DATE(), 22), 'shopping', 'outflow', 'Kitchen items'),
  ('txn-053', user_email, 'Books', 35.00, 'Amazon', DATE_SUB(CURRENT_DATE(), 28), 'shopping', 'outflow', 'Programming books');

-- Entertainment
INSERT INTO IDENTIFIER(schema_name || '.transactions') (id, user_email, name, amount, merchant, transaction_date, category, type, description)
VALUES
  ('txn-060', user_email, 'Netflix', 15.99, 'Netflix', DATE_SUB(CURRENT_DATE(), 8), 'entertainment', 'outflow', 'Monthly subscription'),
  ('txn-061', user_email, 'Spotify', 10.99, 'Spotify', DATE_SUB(CURRENT_DATE(), 10), 'entertainment', 'outflow', 'Monthly subscription'),
  ('txn-062', user_email, 'Movie Tickets', 32.00, 'AMC Theaters', DATE_SUB(CURRENT_DATE(), 13), 'entertainment', 'outflow', 'Weekend movie'),
  ('txn-063', user_email, 'Concert Tickets', 150.00, 'Ticketmaster', DATE_SUB(CURRENT_DATE(), 25), 'entertainment', 'outflow', 'Live concert');

-- Healthcare
INSERT INTO IDENTIFIER(schema_name || '.transactions') (id, user_email, name, amount, merchant, transaction_date, category, type, description)
VALUES
  ('txn-070', user_email, 'Gym Membership', 49.99, 'Planet Fitness', DATE_SUB(CURRENT_DATE(), 6), 'healthcare', 'outflow', 'Monthly gym'),
  ('txn-071', user_email, 'Pharmacy', 25.00, 'CVS', DATE_SUB(CURRENT_DATE(), 19), 'healthcare', 'outflow', 'Prescription refill'),
  ('txn-072', user_email, 'Doctor Visit', 30.00, 'Kaiser', DATE_SUB(CURRENT_DATE(), 33), 'healthcare', 'outflow', 'Copay for checkup');

-- ============================================================================
-- Seed Portfolio History (last 365 days, monthly snapshots)
-- ============================================================================
INSERT INTO IDENTIFIER(schema_name || '.portfolio_history') (user_email, record_date, total_value)
VALUES
  (user_email, DATE_SUB(CURRENT_DATE(), 365), 95000.00),
  (user_email, DATE_SUB(CURRENT_DATE(), 335), 96500.00),
  (user_email, DATE_SUB(CURRENT_DATE(), 304), 94200.00),
  (user_email, DATE_SUB(CURRENT_DATE(), 274), 97800.00),
  (user_email, DATE_SUB(CURRENT_DATE(), 243), 99500.00),
  (user_email, DATE_SUB(CURRENT_DATE(), 213), 98200.00),
  (user_email, DATE_SUB(CURRENT_DATE(), 182), 101500.00),
  (user_email, DATE_SUB(CURRENT_DATE(), 152), 103200.00),
  (user_email, DATE_SUB(CURRENT_DATE(), 121), 105800.00),
  (user_email, DATE_SUB(CURRENT_DATE(), 91), 104500.00),
  (user_email, DATE_SUB(CURRENT_DATE(), 60), 107200.00),
  (user_email, DATE_SUB(CURRENT_DATE(), 30), 109500.00),
  (user_email, CURRENT_DATE(), 110430.00);

-- ============================================================================
-- Seed User Profile
-- ============================================================================
INSERT INTO IDENTIFIER(schema_name || '.user_profiles') (
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
  notes
)
VALUES (
  user_email,
  '1988-06-15',
  'married',
  2,
  'employed_full_time',
  'Acme Corporation',
  'Senior Software Engineer',
  5,
  135000.00,
  'moderate',
  'married_filing_jointly',
  '[{"name": "Retirement Savings", "targetAmount": 2000000, "targetDate": "2048-01-01", "priority": 1}, {"name": "College Fund", "targetAmount": 150000, "targetDate": "2035-01-01", "priority": 2}, {"name": "Emergency Fund", "targetAmount": 50000, "priority": 3}]',
  8,
  60,
  'Focus on long-term growth with moderate risk. Interested in index funds and ETFs.'
);
