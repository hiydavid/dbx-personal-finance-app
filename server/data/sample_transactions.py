import random
from datetime import date, timedelta

from server.models.finance import (
    CashflowSummary,
    DailyCashflow,
    Transaction,
    TransactionsData,
)

# Realistic merchants by category
MERCHANTS = {
    # Inflows
    'salary': ['Acme Corp', 'TechStart Inc', 'Global Solutions'],
    'freelance': ['Upwork Client', 'Fiverr Project', 'Direct Client'],
    'uncategorized_income': ['Venmo Transfer', 'Refund', 'Cash Deposit'],
    # Outflows
    'housing': ['Apartment Rent', 'Mortgage Payment', 'HOA Fees', 'Home Repair Co'],
    'food': ['Whole Foods', 'Trader Joes', 'Chipotle', 'DoorDash', 'Starbucks', 'Costco'],
    'transport': ['Shell Gas', 'Uber', 'Lyft', 'Metro Transit', 'Car Insurance Co'],
    'shopping': ['Amazon', 'Target', 'Best Buy', 'Nike', 'Nordstrom'],
    'entertainment': ['Netflix', 'Spotify', 'AMC Theaters', 'Steam', 'PlayStation'],
    'utilities': ['PG&E', 'Comcast', 'Verizon', 'Water Utility'],
    'healthcare': ['CVS Pharmacy', 'Kaiser', 'Dental Care', 'Vision Center'],
    'other': ['Miscellaneous', 'ATM Withdrawal', 'Bank Fee'],
}

TRANSACTION_NAMES = {
    'salary': ['Monthly Salary', 'Paycheck', 'Direct Deposit'],
    'freelance': ['Project Payment', 'Consulting Fee', 'Contract Work'],
    'uncategorized_income': ['Transfer In', 'Reimbursement', 'Bonus'],
    'housing': ['Rent Payment', 'Mortgage', 'HOA Dues', 'Repairs'],
    'food': ['Groceries', 'Dining Out', 'Coffee', 'Takeout', 'Snacks'],
    'transport': ['Gas', 'Ride Share', 'Public Transit', 'Parking', 'Insurance'],
    'shopping': ['Online Order', 'Clothing', 'Electronics', 'Household Items'],
    'entertainment': ['Subscription', 'Movie Tickets', 'Games', 'Concert'],
    'utilities': ['Electric Bill', 'Internet', 'Phone Bill', 'Water Bill'],
    'healthcare': ['Prescription', 'Doctor Visit', 'Dental', 'Vision'],
    'other': ['Miscellaneous', 'Cash', 'Fee'],
}

# Monthly patterns (approximate frequency and amount ranges)
CATEGORY_PATTERNS = {
    # Inflows - less frequent, larger amounts
    'salary': {'monthly_freq': 2, 'amount_range': (4000, 6000)},
    'freelance': {'monthly_freq': 1, 'amount_range': (500, 2000)},
    'uncategorized_income': {'monthly_freq': 0.5, 'amount_range': (50, 500)},
    # Outflows - varying frequencies
    'housing': {'monthly_freq': 1, 'amount_range': (1500, 2500)},
    'food': {'monthly_freq': 20, 'amount_range': (15, 150)},
    'transport': {'monthly_freq': 8, 'amount_range': (20, 100)},
    'shopping': {'monthly_freq': 5, 'amount_range': (30, 300)},
    'entertainment': {'monthly_freq': 4, 'amount_range': (10, 100)},
    'utilities': {'monthly_freq': 3, 'amount_range': (50, 200)},
    'healthcare': {'monthly_freq': 1, 'amount_range': (20, 200)},
    'other': {'monthly_freq': 2, 'amount_range': (10, 100)},
}


def generate_sample_transactions(months: int = 6) -> list[Transaction]:
    """Generate realistic transaction data for the specified number of months."""
    random.seed(42)  # Consistent data across requests
    transactions = []
    today = date.today()
    start_date = today - timedelta(days=months * 30)

    transaction_id = 1

    inflow_categories = ('salary', 'freelance', 'uncategorized_income')
    for category, pattern in CATEGORY_PATTERNS.items():
        # Determine transaction type
        tx_type = 'inflow' if category in inflow_categories else 'outflow'

        # Calculate total transactions for the period
        total_transactions = int(pattern['monthly_freq'] * months)

        for _ in range(total_transactions):
            # Random date within the period
            days_offset = random.randint(0, months * 30)
            tx_date = start_date + timedelta(days=days_offset)

            # Skip future dates
            if tx_date > today:
                continue

            # Random amount within range
            min_amt, max_amt = pattern['amount_range']
            amount = round(random.uniform(min_amt, max_amt), 2)

            # Random merchant and name
            merchant = random.choice(MERCHANTS[category])
            name = random.choice(TRANSACTION_NAMES[category])

            transactions.append(
                Transaction(
                    id=f'tx-{transaction_id:06d}',
                    name=name,
                    amount=amount,
                    merchant=merchant,
                    date=tx_date,
                    category=category,
                    type=tx_type,
                )
            )
            transaction_id += 1

    # Sort by date descending (most recent first)
    transactions.sort(key=lambda x: x.date, reverse=True)
    return transactions


def aggregate_daily_cashflow(
    transactions: list[Transaction], days: int = 30
) -> list[DailyCashflow]:
    """Aggregate transactions into daily cashflow data."""
    today = date.today()
    start_date = today - timedelta(days=days - 1)

    # Initialize all days with zero values
    daily_data: dict[date, dict[str, float]] = {}
    for i in range(days):
        d = start_date + timedelta(days=i)
        daily_data[d] = {'inflows': 0.0, 'outflows': 0.0}

    # Aggregate transactions
    for tx in transactions:
        if tx.date in daily_data:
            if tx.type == 'inflow':
                daily_data[tx.date]['inflows'] += tx.amount
            else:
                daily_data[tx.date]['outflows'] += tx.amount

    # Convert to list
    result = []
    for d in sorted(daily_data.keys()):
        inflows = round(daily_data[d]['inflows'], 2)
        outflows = round(daily_data[d]['outflows'], 2)
        result.append(
            DailyCashflow(
                date=d,
                inflows=inflows,
                outflows=outflows,
                net=round(inflows - outflows, 2),
            )
        )

    return result


def get_transactions_data(days: int = 30) -> TransactionsData:
    """Get complete transactions data including daily aggregation and summary."""
    transactions = generate_sample_transactions(months=6)
    daily_cashflow = aggregate_daily_cashflow(transactions, days=days)

    total_inflows = sum(tx.amount for tx in transactions if tx.type == 'inflow')
    total_outflows = sum(tx.amount for tx in transactions if tx.type == 'outflow')

    return TransactionsData(
        transactions=transactions,
        dailyCashflow=daily_cashflow,
        summary=CashflowSummary(
            totalInflows=round(total_inflows, 2),
            totalOutflows=round(total_outflows, 2),
            netCashflow=round(total_inflows - total_outflows, 2),
        ),
    )
