-- Personal Finance App - Seed Data for Bob (Young Professional)
-- Run this script in Databricks SQL after creating tables

-- ============================================================================
-- CONFIGURATION: Set your schema and user email here
-- ============================================================================
DECLARE OR REPLACE schema_name = 'main.personal_finance'; -- replace with actual schema name
DECLARE OR REPLACE user_email = 'bob@company.com';

-- ============================================================================
-- Seed Assets
-- ============================================================================
INSERT INTO IDENTIFIER(schema_name || '.assets') (id, user_email, name, category, value, description)
VALUES
  ('asset-101', user_email, 'Checking Account', 'cash', 3500.00, 'Primary checking account at Chase'),
  ('asset-102', user_email, 'Emergency Fund', 'cash', 8000.00, 'High-yield savings at Ally Bank'),
  ('asset-103', user_email, '401(k)', 'investment', 18000.00, 'Employer-sponsored retirement account'),
  ('asset-104', user_email, 'Brokerage Account', 'investment', 12000.00, 'Individual account at Robinhood'),
  ('asset-105', user_email, 'Crypto Holdings', 'investment', 3500.00, 'Bitcoin and Ethereum on Coinbase');

-- ============================================================================
-- Seed Liabilities
-- ============================================================================
INSERT INTO IDENTIFIER(schema_name || '.liabilities') (id, user_email, name, category, amount, description)
VALUES
  ('liab-101', user_email, 'Federal Student Loan', 'loan', 28000.00, 'Federal student loan at 5.5% APR'),
  ('liab-102', user_email, 'Private Student Loan', 'loan', 4000.00, 'Private loan from Sallie Mae at 7.2% APR'),
  ('liab-103', user_email, 'Auto Loan', 'loan', 4200.00, 'Used car loan at 6.9% APR'),
  ('liab-104', user_email, 'Discover Card', 'credit_card', 1800.00, 'Credit card balance');

-- ============================================================================
-- Seed Investment Holdings
-- ============================================================================
INSERT INTO IDENTIFIER(schema_name || '.holdings') (id, user_email, ticker, name, asset_class, shares, cost_basis, current_price, day_change, week_change, month_change, ytd_change, year_change)
VALUES
  ('hold-101', user_email, 'VTI', 'Vanguard Total Stock Market ETF', 'stocks', 45.0, 10500.00, 250.50, 0.85, 1.23, 2.45, 8.50, 17.42),
  ('hold-102', user_email, 'QQQ', 'Invesco QQQ Trust', 'stocks', 20.0, 7800.00, 435.20, 1.25, 2.10, 3.50, 12.30, 17.62),
  ('hold-103', user_email, 'ARKK', 'ARK Innovation ETF', 'stocks', 80.0, 4200.00, 48.50, 2.15, 3.80, 5.20, 15.40, 22.30),
  ('hold-104', user_email, 'VXUS', 'Vanguard Total International Stock ETF', 'stocks', 60.0, 3500.00, 62.40, -0.32, 0.89, 1.78, 5.20, 13.45),
  ('hold-105', user_email, 'BND', 'Vanguard Total Bond Market ETF', 'bonds', 30.0, 2200.00, 72.80, 0.12, -0.25, -0.50, -2.10, -5.45),
  ('hold-106', user_email, 'VMFXX', 'Vanguard Federal Money Market Fund', 'cash', 1800.0, 1800.00, 1.00, 0.00, 0.00, 0.00, 0.00, 0.00);

-- ============================================================================
-- Seed Transactions (last 90 days)
-- ============================================================================

-- Salary deposits (bi-weekly, ~$2,200 after tax)
INSERT INTO IDENTIFIER(schema_name || '.transactions') (id, user_email, name, amount, merchant, transaction_date, category, type, description)
VALUES
  ('txn-101', user_email, 'Paycheck', 2200.00, 'TechStartup Inc', DATE_SUB(CURRENT_DATE(), 7), 'salary', 'inflow', 'Bi-weekly salary'),
  ('txn-102', user_email, 'Paycheck', 2200.00, 'TechStartup Inc', DATE_SUB(CURRENT_DATE(), 21), 'salary', 'inflow', 'Bi-weekly salary'),
  ('txn-103', user_email, 'Paycheck', 2200.00, 'TechStartup Inc', DATE_SUB(CURRENT_DATE(), 35), 'salary', 'inflow', 'Bi-weekly salary'),
  ('txn-104', user_email, 'Paycheck', 2200.00, 'TechStartup Inc', DATE_SUB(CURRENT_DATE(), 49), 'salary', 'inflow', 'Bi-weekly salary'),
  ('txn-105', user_email, 'Paycheck', 2200.00, 'TechStartup Inc', DATE_SUB(CURRENT_DATE(), 63), 'salary', 'inflow', 'Bi-weekly salary'),
  ('txn-106', user_email, 'Paycheck', 2200.00, 'TechStartup Inc', DATE_SUB(CURRENT_DATE(), 77), 'salary', 'inflow', 'Bi-weekly salary');

-- Side gig income
INSERT INTO IDENTIFIER(schema_name || '.transactions') (id, user_email, name, amount, merchant, transaction_date, category, type, description)
VALUES
  ('txn-107', user_email, 'Freelance Project', 450.00, 'Fiverr', DATE_SUB(CURRENT_DATE(), 25), 'freelance', 'inflow', 'Logo design project'),
  ('txn-108', user_email, 'Side Gig', 320.00, 'Upwork', DATE_SUB(CURRENT_DATE(), 55), 'freelance', 'inflow', 'Data entry work');

-- Housing expenses (rent)
INSERT INTO IDENTIFIER(schema_name || '.transactions') (id, user_email, name, amount, merchant, transaction_date, category, type, description)
VALUES
  ('txn-110', user_email, 'Rent Payment', 1650.00, 'Apartment Complex', DATE_SUB(CURRENT_DATE(), 5), 'housing', 'outflow', 'Monthly rent'),
  ('txn-111', user_email, 'Rent Payment', 1650.00, 'Apartment Complex', DATE_SUB(CURRENT_DATE(), 35), 'housing', 'outflow', 'Monthly rent'),
  ('txn-112', user_email, 'Rent Payment', 1650.00, 'Apartment Complex', DATE_SUB(CURRENT_DATE(), 65), 'housing', 'outflow', 'Monthly rent'),
  ('txn-113', user_email, 'Renters Insurance', 25.00, 'Lemonade', DATE_SUB(CURRENT_DATE(), 12), 'housing', 'outflow', 'Monthly insurance');

-- Utilities (lower than homeowner)
INSERT INTO IDENTIFIER(schema_name || '.transactions') (id, user_email, name, amount, merchant, transaction_date, category, type, description)
VALUES
  ('txn-120', user_email, 'Electric Bill', 65.00, 'PG&E', DATE_SUB(CURRENT_DATE(), 10), 'utilities', 'outflow', 'Monthly electric'),
  ('txn-121', user_email, 'Internet', 59.99, 'Xfinity', DATE_SUB(CURRENT_DATE(), 12), 'utilities', 'outflow', 'Monthly internet'),
  ('txn-122', user_email, 'Electric Bill', 58.00, 'PG&E', DATE_SUB(CURRENT_DATE(), 40), 'utilities', 'outflow', 'Monthly electric'),
  ('txn-123', user_email, 'Internet', 59.99, 'Xfinity', DATE_SUB(CURRENT_DATE(), 42), 'utilities', 'outflow', 'Monthly internet'),
  ('txn-124', user_email, 'Phone Bill', 45.00, 'Mint Mobile', DATE_SUB(CURRENT_DATE(), 8), 'utilities', 'outflow', 'Monthly phone'),
  ('txn-125', user_email, 'Phone Bill', 45.00, 'Mint Mobile', DATE_SUB(CURRENT_DATE(), 38), 'utilities', 'outflow', 'Monthly phone');

-- Food & Dining (higher frequency, more dining out)
INSERT INTO IDENTIFIER(schema_name || '.transactions') (id, user_email, name, amount, merchant, transaction_date, category, type, description)
VALUES
  ('txn-130', user_email, 'Groceries', 85.00, 'Trader Joes', DATE_SUB(CURRENT_DATE(), 2), 'food', 'outflow', 'Weekly groceries'),
  ('txn-131', user_email, 'Dinner', 42.00, 'Thai Restaurant', DATE_SUB(CURRENT_DATE(), 3), 'food', 'outflow', 'Dinner with friends'),
  ('txn-132', user_email, 'Coffee', 7.50, 'Blue Bottle', DATE_SUB(CURRENT_DATE(), 1), 'food', 'outflow', 'Morning coffee'),
  ('txn-133', user_email, 'Lunch', 16.00, 'Sweetgreen', DATE_SUB(CURRENT_DATE(), 4), 'food', 'outflow', 'Work lunch'),
  ('txn-134', user_email, 'Coffee', 6.25, 'Blue Bottle', DATE_SUB(CURRENT_DATE(), 5), 'food', 'outflow', 'Morning coffee'),
  ('txn-135', user_email, 'Food Delivery', 38.00, 'Uber Eats', DATE_SUB(CURRENT_DATE(), 6), 'food', 'outflow', 'Late night order'),
  ('txn-136', user_email, 'Brunch', 55.00, 'Brunch Spot', DATE_SUB(CURRENT_DATE(), 8), 'food', 'outflow', 'Weekend brunch'),
  ('txn-137', user_email, 'Groceries', 72.00, 'Whole Foods', DATE_SUB(CURRENT_DATE(), 9), 'food', 'outflow', 'Weekly groceries'),
  ('txn-138', user_email, 'Happy Hour', 35.00, 'Local Bar', DATE_SUB(CURRENT_DATE(), 11), 'food', 'outflow', 'After work drinks'),
  ('txn-139', user_email, 'Lunch', 14.50, 'Chipotle', DATE_SUB(CURRENT_DATE(), 12), 'food', 'outflow', 'Work lunch'),
  ('txn-140', user_email, 'Coffee', 5.75, 'Starbucks', DATE_SUB(CURRENT_DATE(), 13), 'food', 'outflow', 'Morning coffee'),
  ('txn-141', user_email, 'Food Delivery', 28.00, 'DoorDash', DATE_SUB(CURRENT_DATE(), 15), 'food', 'outflow', 'Weekend delivery'),
  ('txn-142', user_email, 'Dinner', 68.00, 'Sushi Place', DATE_SUB(CURRENT_DATE(), 17), 'food', 'outflow', 'Date night'),
  ('txn-143', user_email, 'Groceries', 65.00, 'Trader Joes', DATE_SUB(CURRENT_DATE(), 18), 'food', 'outflow', 'Weekly groceries'),
  ('txn-144', user_email, 'Coffee', 6.50, 'Local Cafe', DATE_SUB(CURRENT_DATE(), 20), 'food', 'outflow', 'Working from cafe');

-- Transportation (car payment + rideshare)
INSERT INTO IDENTIFIER(schema_name || '.transactions') (id, user_email, name, amount, merchant, transaction_date, category, type, description)
VALUES
  ('txn-150', user_email, 'Auto Loan Payment', 185.00, 'Credit Union', DATE_SUB(CURRENT_DATE(), 5), 'transport', 'outflow', 'Monthly car payment'),
  ('txn-151', user_email, 'Gas', 42.00, 'Shell', DATE_SUB(CURRENT_DATE(), 7), 'transport', 'outflow', 'Gas fill-up'),
  ('txn-152', user_email, 'Uber', 18.50, 'Uber', DATE_SUB(CURRENT_DATE(), 10), 'transport', 'outflow', 'Ride downtown'),
  ('txn-153', user_email, 'Lyft', 24.00, 'Lyft', DATE_SUB(CURRENT_DATE(), 14), 'transport', 'outflow', 'Night out ride'),
  ('txn-154', user_email, 'Gas', 38.00, 'Chevron', DATE_SUB(CURRENT_DATE(), 21), 'transport', 'outflow', 'Gas fill-up'),
  ('txn-155', user_email, 'Auto Loan Payment', 185.00, 'Credit Union', DATE_SUB(CURRENT_DATE(), 35), 'transport', 'outflow', 'Monthly car payment'),
  ('txn-156', user_email, 'Uber', 22.00, 'Uber', DATE_SUB(CURRENT_DATE(), 28), 'transport', 'outflow', 'Airport ride'),
  ('txn-157', user_email, 'Car Insurance', 95.00, 'Geico', DATE_SUB(CURRENT_DATE(), 15), 'transport', 'outflow', 'Monthly insurance');

-- Shopping (more frequent, smaller purchases)
INSERT INTO IDENTIFIER(schema_name || '.transactions') (id, user_email, name, amount, merchant, transaction_date, category, type, description)
VALUES
  ('txn-160', user_email, 'Tech Gadget', 79.99, 'Amazon', DATE_SUB(CURRENT_DATE(), 4), 'shopping', 'outflow', 'Phone charger and accessories'),
  ('txn-161', user_email, 'Clothing', 55.00, 'H&M', DATE_SUB(CURRENT_DATE(), 11), 'shopping', 'outflow', 'New t-shirts'),
  ('txn-162', user_email, 'Gaming', 29.99, 'Steam', DATE_SUB(CURRENT_DATE(), 16), 'shopping', 'outflow', 'New game'),
  ('txn-163', user_email, 'Home Decor', 45.00, 'IKEA', DATE_SUB(CURRENT_DATE(), 22), 'shopping', 'outflow', 'Apartment stuff'),
  ('txn-164', user_email, 'Electronics', 120.00, 'Best Buy', DATE_SUB(CURRENT_DATE(), 30), 'shopping', 'outflow', 'Mechanical keyboard'),
  ('txn-165', user_email, 'Clothing', 89.00, 'Nike', DATE_SUB(CURRENT_DATE(), 45), 'shopping', 'outflow', 'Running shoes');

-- Entertainment & Subscriptions
INSERT INTO IDENTIFIER(schema_name || '.transactions') (id, user_email, name, amount, merchant, transaction_date, category, type, description)
VALUES
  ('txn-170', user_email, 'Netflix', 15.99, 'Netflix', DATE_SUB(CURRENT_DATE(), 8), 'entertainment', 'outflow', 'Monthly subscription'),
  ('txn-171', user_email, 'Spotify', 10.99, 'Spotify', DATE_SUB(CURRENT_DATE(), 10), 'entertainment', 'outflow', 'Monthly subscription'),
  ('txn-172', user_email, 'YouTube Premium', 13.99, 'Google', DATE_SUB(CURRENT_DATE(), 12), 'entertainment', 'outflow', 'Monthly subscription'),
  ('txn-173', user_email, 'Gym Membership', 39.99, 'Crunch Fitness', DATE_SUB(CURRENT_DATE(), 6), 'entertainment', 'outflow', 'Monthly gym'),
  ('txn-174', user_email, 'Concert Tickets', 85.00, 'AXS', DATE_SUB(CURRENT_DATE(), 18), 'entertainment', 'outflow', 'Local show'),
  ('txn-175', user_email, 'Gaming Subscription', 14.99, 'Xbox Game Pass', DATE_SUB(CURRENT_DATE(), 9), 'entertainment', 'outflow', 'Monthly subscription'),
  ('txn-176', user_email, 'Movie Tickets', 28.00, 'AMC Theaters', DATE_SUB(CURRENT_DATE(), 20), 'entertainment', 'outflow', 'Weekend movie'),
  ('txn-177', user_email, 'Bar Tab', 65.00, 'Rooftop Bar', DATE_SUB(CURRENT_DATE(), 24), 'entertainment', 'outflow', 'Friday night out');

-- Healthcare
INSERT INTO IDENTIFIER(schema_name || '.transactions') (id, user_email, name, amount, merchant, transaction_date, category, type, description)
VALUES
  ('txn-180', user_email, 'Gym Membership', 39.99, 'Crunch Fitness', DATE_SUB(CURRENT_DATE(), 36), 'healthcare', 'outflow', 'Monthly gym'),
  ('txn-181', user_email, 'Pharmacy', 15.00, 'Walgreens', DATE_SUB(CURRENT_DATE(), 25), 'healthcare', 'outflow', 'OTC medication');

-- Student Loan Payments
INSERT INTO IDENTIFIER(schema_name || '.transactions') (id, user_email, name, amount, merchant, transaction_date, category, type, description)
VALUES
  ('txn-190', user_email, 'Student Loan Payment', 350.00, 'Federal Loan Servicer', DATE_SUB(CURRENT_DATE(), 5), 'other', 'outflow', 'Monthly student loan'),
  ('txn-191', user_email, 'Student Loan Payment', 350.00, 'Federal Loan Servicer', DATE_SUB(CURRENT_DATE(), 35), 'other', 'outflow', 'Monthly student loan'),
  ('txn-192', user_email, 'Student Loan Payment', 350.00, 'Federal Loan Servicer', DATE_SUB(CURRENT_DATE(), 65), 'other', 'outflow', 'Monthly student loan');

-- ============================================================================
-- Seed Portfolio History (last 3 years, monthly snapshots - shorter history)
-- ============================================================================
INSERT INTO IDENTIFIER(schema_name || '.portfolio_history') (user_email, record_date, total_value)
VALUES
  (user_email, DATE_SUB(CURRENT_DATE(), 365), 18500.00),
  (user_email, DATE_SUB(CURRENT_DATE(), 335), 19200.00),
  (user_email, DATE_SUB(CURRENT_DATE(), 304), 18800.00),
  (user_email, DATE_SUB(CURRENT_DATE(), 274), 20500.00),
  (user_email, DATE_SUB(CURRENT_DATE(), 243), 21800.00),
  (user_email, DATE_SUB(CURRENT_DATE(), 213), 20900.00),
  (user_email, DATE_SUB(CURRENT_DATE(), 182), 23200.00),
  (user_email, DATE_SUB(CURRENT_DATE(), 152), 24800.00),
  (user_email, DATE_SUB(CURRENT_DATE(), 121), 26500.00),
  (user_email, DATE_SUB(CURRENT_DATE(), 91), 25200.00),
  (user_email, DATE_SUB(CURRENT_DATE(), 60), 28100.00),
  (user_email, DATE_SUB(CURRENT_DATE(), 30), 29500.00),
  (user_email, CURRENT_DATE(), 30000.00);

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
  '1998-03-22',
  'single',
  0,
  'employed_full_time',
  'TechStartup Inc',
  'Junior Data Analyst',
  2,
  72000.00,
  'aggressive',
  'single',
  '[{"name": "Emergency Fund", "targetAmount": 15000, "targetDate": "2025-12-01", "priority": 1}, {"name": "House Down Payment", "targetAmount": 60000, "targetDate": "2030-01-01", "priority": 2}, {"name": "Pay Off Student Loans", "targetAmount": 32000, "targetDate": "2028-01-01", "priority": 3}]',
  3,
  55,
  'Young professional focused on aggressive growth. Comfortable with volatility for higher long-term returns. Interested in growth stocks and crypto.'
);
