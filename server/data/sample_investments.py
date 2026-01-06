import random
from datetime import date, timedelta

from server.models.finance import (
    AssetClassAllocation,
    Holding,
    InvestmentsData,
    InvestmentsSummary,
    PortfolioHistoryPoint,
)

SAMPLE_HOLDINGS = [
    Holding(
        id='holding-001',
        ticker='VTI',
        name='Vanguard Total Stock Market ETF',
        assetClass='stocks',
        shares=150.0,
        costBasis=32000.00,
        currentPrice=250.50,
        currentValue=37575.00,
        gainLoss=5575.00,
        gainLossPercent=17.42,
        dayChange=0.85,
        weekChange=2.15,
        monthChange=3.45,
        ytdChange=12.30,
        yearChange=18.50,
    ),
    Holding(
        id='holding-002',
        ticker='VXUS',
        name='Vanguard Total International Stock ETF',
        assetClass='stocks',
        shares=200.0,
        costBasis=11000.00,
        currentPrice=62.40,
        currentValue=12480.00,
        gainLoss=1480.00,
        gainLossPercent=13.45,
        dayChange=0.45,
        weekChange=1.80,
        monthChange=2.90,
        ytdChange=8.50,
        yearChange=10.20,
    ),
    Holding(
        id='holding-003',
        ticker='QQQ',
        name='Invesco QQQ Trust',
        assetClass='stocks',
        shares=50.0,
        costBasis=18500.00,
        currentPrice=435.20,
        currentValue=21760.00,
        gainLoss=3260.00,
        gainLossPercent=17.62,
        dayChange=1.20,
        weekChange=3.50,
        monthChange=5.80,
        ytdChange=22.40,
        yearChange=28.30,
    ),
    Holding(
        id='holding-004',
        ticker='BND',
        name='Vanguard Total Bond Market ETF',
        assetClass='bonds',
        shares=300.0,
        costBasis=23100.00,
        currentPrice=72.80,
        currentValue=21840.00,
        gainLoss=-1260.00,
        gainLossPercent=-5.45,
        dayChange=-0.12,
        weekChange=-0.45,
        monthChange=0.80,
        ytdChange=-2.10,
        yearChange=-1.50,
    ),
    Holding(
        id='holding-005',
        ticker='VGIT',
        name='Vanguard Intermediate-Term Treasury ETF',
        assetClass='bonds',
        shares=150.0,
        costBasis=9300.00,
        currentPrice=58.50,
        currentValue=8775.00,
        gainLoss=-525.00,
        gainLossPercent=-5.65,
        dayChange=-0.08,
        weekChange=-0.25,
        monthChange=0.50,
        ytdChange=-1.80,
        yearChange=-0.90,
    ),
    Holding(
        id='holding-006',
        ticker='VMFXX',
        name='Vanguard Federal Money Market Fund',
        assetClass='cash',
        shares=8000.0,
        costBasis=8000.00,
        currentPrice=1.00,
        currentValue=8000.00,
        gainLoss=0.00,
        gainLossPercent=0.00,
        dayChange=0.01,
        weekChange=0.10,
        monthChange=0.42,
        ytdChange=4.80,
        yearChange=5.20,
    ),
]


def _calculate_allocations(holdings: list[Holding]) -> list[AssetClassAllocation]:
    """Calculate asset class allocations from holdings."""
    totals: dict[str, float] = {'stocks': 0, 'bonds': 0, 'cash': 0}
    counts: dict[str, int] = {'stocks': 0, 'bonds': 0, 'cash': 0}

    for h in holdings:
        totals[h.asset_class] += h.current_value
        counts[h.asset_class] += 1

    total_value = sum(totals.values())

    return [
        AssetClassAllocation(
            assetClass=ac,
            value=totals[ac],
            percentage=(totals[ac] / total_value * 100) if total_value > 0 else 0,
            holdingsCount=counts[ac],
        )
        for ac in ['stocks', 'bonds', 'cash']
        if totals[ac] > 0
    ]


def _generate_history(
    holdings: list[Holding], period: str
) -> list[PortfolioHistoryPoint]:
    """Generate historical portfolio values based on period."""
    period_days = {
        '1M': 30,
        '3M': 90,
        '6M': 180,
        'YTD': (date.today() - date(date.today().year, 1, 1)).days,
        '1Y': 365,
        'ALL': 730,
    }

    days = period_days.get(period, 365)
    today = date.today()
    current_value = sum(h.current_value for h in holdings)

    # Simulate historical values with some variance
    history = []
    random.seed(42)  # Consistent random values

    for i in range(days, -1, -1):
        d = today - timedelta(days=i)
        # Add some daily variance (-1% to +1%) with general upward trend
        growth_factor = 1 - (i / days * 0.15)  # ~15% growth over period
        daily_variance = random.uniform(-0.01, 0.01)
        value = current_value * growth_factor * (1 + daily_variance)
        history.append(PortfolioHistoryPoint(date=d, value=round(value, 2)))

    return history


def _calculate_summary(holdings: list[Holding]) -> InvestmentsSummary:
    """Calculate portfolio summary from holdings."""
    total_value = sum(h.current_value for h in holdings)
    total_cost = sum(h.cost_basis for h in holdings)
    total_gain = total_value - total_cost
    total_gain_pct = (total_gain / total_cost * 100) if total_cost > 0 else 0

    # Calculate day change (weighted average of day changes)
    day_change_dollars = sum(
        h.current_value * h.day_change / 100 for h in holdings
    )
    prev_value = total_value - day_change_dollars
    day_change_pct = (day_change_dollars / prev_value * 100) if prev_value > 0 else 0

    return InvestmentsSummary(
        totalValue=round(total_value, 2),
        totalCostBasis=round(total_cost, 2),
        totalGainLoss=round(total_gain, 2),
        totalGainLossPercent=round(total_gain_pct, 2),
        dayChange=round(day_change_dollars, 2),
        dayChangePercent=round(day_change_pct, 2),
    )


def get_investments_data(period: str = '1Y') -> InvestmentsData:
    """Get complete investments data including holdings, allocations, and history."""
    return InvestmentsData(
        holdings=SAMPLE_HOLDINGS,
        allocations=_calculate_allocations(SAMPLE_HOLDINGS),
        history=_generate_history(SAMPLE_HOLDINGS, period),
        summary=_calculate_summary(SAMPLE_HOLDINGS),
    )
