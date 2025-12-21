import uuid
from datetime import datetime, timezone

from server.models.finance import Asset, FinancialSummary, Liability

SAMPLE_ASSETS = [
    Asset(
        id='asset-001',
        name='Checking Account',
        category='cash',
        value=15000.00,
        description='Primary checking account',
    ),
    Asset(
        id='asset-002',
        name='Emergency Savings',
        category='cash',
        value=25000.00,
        description='6-month emergency fund',
    ),
    Asset(
        id='asset-003',
        name='401(k)',
        category='investment',
        value=120000.00,
        description='Employer retirement plan',
    ),
    Asset(
        id='asset-004',
        name='Brokerage Account',
        category='investment',
        value=45000.00,
        description='Index fund portfolio',
    ),
    Asset(
        id='asset-005',
        name='Primary Residence',
        category='property',
        value=450000.00,
        description='Home equity value',
    ),
]

SAMPLE_LIABILITIES = [
    Liability(
        id='liability-001',
        name='Mortgage',
        category='mortgage',
        amount=320000.00,
        description='30-year fixed, 6.5% APR',
    ),
    Liability(
        id='liability-002',
        name='Auto Loan',
        category='loan',
        amount=18000.00,
        description='5-year term, 4.9% APR',
    ),
    Liability(
        id='liability-003',
        name='Chase Sapphire',
        category='credit_card',
        amount=2500.00,
        description='Monthly balance',
    ),
    Liability(
        id='liability-004',
        name='Student Loan',
        category='loan',
        amount=35000.00,
        description='Federal student loans',
    ),
]


def get_financial_summary() -> FinancialSummary:
    total_assets = sum(a.value for a in SAMPLE_ASSETS)
    total_liabilities = sum(li.amount for li in SAMPLE_LIABILITIES)

    return FinancialSummary(
        totalAssets=total_assets,
        totalLiabilities=total_liabilities,
        netWorth=total_assets - total_liabilities,
        assets=SAMPLE_ASSETS,
        liabilities=SAMPLE_LIABILITIES,
        lastUpdated=datetime.now(timezone.utc),
    )


def add_asset(name: str, category: str, value: float, description: str | None = None) -> Asset:
    """Add a new asset to the in-memory store."""
    asset = Asset(
        id=f'asset-{uuid.uuid4().hex[:8]}',
        name=name,
        category=category,
        value=value,
        description=description,
    )
    SAMPLE_ASSETS.append(asset)
    return asset


def add_liability(
    name: str, category: str, amount: float, description: str | None = None
) -> Liability:
    """Add a new liability to the in-memory store."""
    liability = Liability(
        id=f'liability-{uuid.uuid4().hex[:8]}',
        name=name,
        category=category,
        amount=amount,
        description=description,
    )
    SAMPLE_LIABILITIES.append(liability)
    return liability
