import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Newspaper,
  User,
  Target,
  Shield,
} from 'lucide-react';
import { BentoCard, BentoCardHeader, BentoCardValue } from './BentoCard';
import { FinancialNews } from './FinancialNews';
import { formatCurrency } from './formatters';
import { useUserInfo } from '@/hooks/useUserInfo';
import { fetchWithAuth } from '@/contexts/UserContext';
import type { FinancialSummary, CashflowSummary, InvestmentsSummary } from '@/lib/finance-types';
import type { UserProfile } from '@/lib/profile-types';
import { RISK_TOLERANCE_LABELS } from '@/lib/profile-types';

// Mini sparkline component for cards
function MiniSparkline({ positive = true }: { positive?: boolean }) {
  const color = positive ? 'var(--color-success)' : 'var(--color-error)';
  const points = positive
    ? 'M0,20 L10,18 L20,15 L30,12 L40,8 L50,5'
    : 'M0,5 L10,8 L20,12 L30,10 L40,15 L50,20';

  return (
    <svg className="w-12 h-6" viewBox="0 0 50 25">
      <path
        d={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Loading skeleton
function BentoSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bento-card p-6 ${className}`}>
      <div className="shimmer h-4 w-24 rounded mb-4" />
      <div className="shimmer h-8 w-32 rounded mb-2" />
      <div className="shimmer h-4 w-20 rounded" />
    </div>
  );
}

export function FinanceDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<FinancialSummary | null>(null);
  const [cashflowData, setCashflowData] = useState<CashflowSummary | null>(null);
  const [investmentsData, setInvestmentsData] = useState<InvestmentsSummary | null>(null);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userInfo } = useUserInfo();

  useEffect(() => {
    async function fetchAllData() {
      try {
        const [summaryRes, cashflowRes, investmentsRes, profileRes] = await Promise.all([
          fetchWithAuth('/api/finance/summary'),
          fetchWithAuth('/api/finance/transactions?period=30'),
          fetchWithAuth('/api/finance/investments'),
          fetchWithAuth('/api/profile'),
        ]);

        const [summary, cashflow, investments, profile] = await Promise.all([
          summaryRes.json(),
          cashflowRes.json(),
          investmentsRes.json(),
          profileRes.json(),
        ]);

        if (summary.success) setData(summary.data);
        if (cashflow.success) setCashflowData(cashflow.data?.summary);
        if (investments.success) setInvestmentsData(investments.data?.summary);
        if (profile.success) setProfileData(profile.data);

        if (!summary.success) setError(summary.error || 'Failed to load data');
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, []);

  const userName = userInfo?.user?.split(' ')[0] || 'there';

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <div className="shimmer h-5 w-40 rounded mb-2" />
          <div className="shimmer h-12 w-64 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <BentoSkeleton className="lg:col-span-2 lg:row-span-2" />
          <BentoSkeleton />
          <BentoSkeleton />
          <BentoSkeleton />
          <BentoSkeleton />
          <BentoSkeleton className="lg:col-span-3" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-[var(--color-error)]">{error || 'No data'}</div>
      </div>
    );
  }

  const netCashflow = cashflowData?.netCashflow ?? 0;
  const isPositiveCashflow = netCashflow >= 0;
  const totalReturn = investmentsData?.totalGainLoss ?? 0;
  const isPositiveReturn = totalReturn >= 0;

  // Calculate asset breakdown
  const investmentAssets = data.assets.filter(a => a.category === 'investment');
  const cashAssets = data.assets.filter(a => a.category === 'cash');
  const totalInvestments = investmentAssets.reduce((sum, a) => sum + a.value, 0);
  const totalCash = cashAssets.reduce((sum, a) => sum + a.value, 0);

  // Calculate liability breakdown
  const loanLiabilities = data.liabilities.filter(l => l.category === 'loan' || l.category === 'mortgage');
  const creditLiabilities = data.liabilities.filter(l => l.category === 'credit_card');
  const totalLoans = loanLiabilities.reduce((sum, l) => sum + l.amount, 0);
  const totalCredit = creditLiabilities.reduce((sum, l) => sum + l.amount, 0);

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <header className="mb-8 stagger-children">
        <p className="text-sm text-[var(--color-text-muted)] mb-1">
          Welcome back, {userName}
        </p>
        <h1 className="text-4xl lg:text-5xl font-bold text-[var(--color-text-heading)] tracking-tight">
          Your Finances
        </h1>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 stagger-children">
        {/* Net Worth - Hero Card (spans 2 cols on large screens) */}
        <BentoCard
          size="xl"
          className="lg:col-span-2 lg:row-span-2 relative overflow-hidden"
          onClick={() => navigate('/networth')}
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent-primary)]/5 to-transparent pointer-events-none" />

          <div className="relative">
            <BentoCardHeader
              title="Total Net Worth"
              subtitle="Assets minus liabilities"
            />

            <div className="mt-6">
              <p className="text-5xl lg:text-6xl font-bold text-[var(--color-text-heading)] tracking-tight animate-count-up">
                {formatCurrency(data.netWorth)}
              </p>

              {/* Asset vs Liability bar */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Assets</span>
                  <span className="text-[var(--color-success)] font-medium">
                    {formatCurrency(data.totalAssets)}
                  </span>
                </div>
                <div className="h-2 bg-[var(--color-bg-primary)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-success)] rounded-full transition-all duration-1000"
                    style={{
                      width: `${(data.totalAssets / (data.totalAssets + data.totalLiabilities)) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Liabilities</span>
                  <span className="text-[var(--color-error)] font-medium">
                    {formatCurrency(data.totalLiabilities)}
                  </span>
                </div>
              </div>
            </div>

            {/* Click hint */}
            <div className="absolute bottom-6 right-6 flex items-center gap-1 text-xs text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
              <span>View details</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>
        </BentoCard>

        {/* Cashflow Card */}
        <BentoCard onClick={() => navigate('/cashflow')}>
          <BentoCardHeader
            icon={isPositiveCashflow
              ? <TrendingUp className="w-5 h-5 text-[var(--color-success)]" />
              : <TrendingDown className="w-5 h-5 text-[var(--color-error)]" />
            }
            title="Monthly Cashflow"
            subtitle="Last 30 days"
          />
          <div className="flex items-end justify-between">
            <BentoCardValue
              value={formatCurrency(Math.abs(netCashflow))}
              trend={{
                value: isPositiveCashflow ? 'surplus' : 'deficit',
                isPositive: isPositiveCashflow,
              }}
            />
            <MiniSparkline positive={isPositiveCashflow} />
          </div>
        </BentoCard>

        {/* Investments Card */}
        <BentoCard onClick={() => navigate('/investments')}>
          <BentoCardHeader
            icon={<PieChart className="w-5 h-5 text-[var(--color-accent-primary)]" />}
            title="Investments"
            subtitle="Portfolio value"
          />
          <div className="flex items-end justify-between">
            <BentoCardValue
              value={formatCurrency(investmentsData?.totalValue ?? totalInvestments)}
              trend={investmentsData ? {
                value: `${isPositiveReturn ? '+' : ''}${investmentsData.totalGainLossPercent.toFixed(1)}%`,
                isPositive: isPositiveReturn,
              } : undefined}
            />
            <MiniSparkline positive={isPositiveReturn} />
          </div>
        </BentoCard>

        {/* Assets Breakdown Card */}
        <BentoCard onClick={() => navigate('/networth')}>
          <BentoCardHeader
            icon={<Wallet className="w-5 h-5 text-[var(--color-success)]" />}
            title="Assets"
          />
          <BentoCardValue value={formatCurrency(data.totalAssets)} size="sm" />

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
                <span className="text-[var(--color-text-muted)]">Investments</span>
              </div>
              <span className="text-[var(--color-text-primary)]">{formatCurrency(totalInvestments)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--color-info)]" />
                <span className="text-[var(--color-text-muted)]">Cash</span>
              </div>
              <span className="text-[var(--color-text-primary)]">{formatCurrency(totalCash)}</span>
            </div>
          </div>
        </BentoCard>

        {/* Liabilities Breakdown Card */}
        <BentoCard onClick={() => navigate('/networth')}>
          <BentoCardHeader
            icon={<CreditCard className="w-5 h-5 text-[var(--color-error)]" />}
            title="Liabilities"
          />
          <BentoCardValue value={formatCurrency(data.totalLiabilities)} size="sm" />

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--color-error)]" />
                <span className="text-[var(--color-text-muted)]">Loans</span>
              </div>
              <span className="text-[var(--color-text-primary)]">{formatCurrency(totalLoans)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--color-warning)]" />
                <span className="text-[var(--color-text-muted)]">Credit Cards</span>
              </div>
              <span className="text-[var(--color-text-primary)]">{formatCurrency(totalCredit)}</span>
            </div>
          </div>
        </BentoCard>

        {/* Profile Summary Card */}
        <BentoCard onClick={() => navigate('/profile')}>
          <BentoCardHeader
            icon={<User className="w-5 h-5 text-[var(--color-accent-primary)]" />}
            title="Profile"
            subtitle="Goals & Risk"
          />
          {profileData ? (
            <div className="mt-2 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <span className="text-sm text-[var(--color-text-muted)]">Risk Tolerance</span>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  profileData.riskTolerance === 'aggressive' || profileData.riskTolerance === 'moderately_aggressive'
                    ? 'bg-[var(--color-error)]/20 text-[var(--color-error)]'
                    : profileData.riskTolerance === 'moderate'
                    ? 'bg-[var(--color-warning)]/20 text-[var(--color-warning)]'
                    : 'bg-[var(--color-success)]/20 text-[var(--color-success)]'
                }`}>
                  {profileData.riskTolerance ? RISK_TOLERANCE_LABELS[profileData.riskTolerance] : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <span className="text-sm text-[var(--color-text-muted)]">Retirement Target</span>
                </div>
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  {profileData.retirementAgeTarget ? `Age ${profileData.retirementAgeTarget}` : '—'}
                </span>
              </div>
              {profileData.investmentExperienceYears !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-muted)]">Experience</span>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {profileData.investmentExperienceYears} years
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)] mt-2">
              Set up your profile to get personalized insights
            </p>
          )}
        </BentoCard>

        {/* Financial News - Full width */}
        <div className="lg:col-span-3">
          <BentoCard size="lg">
            <BentoCardHeader
              icon={<Newspaper className="w-5 h-5 text-[var(--color-accent-primary)]" />}
              title="Financial News"
              subtitle="Latest updates"
            />
            <FinancialNews compact />
          </BentoCard>
        </div>
      </div>
    </div>
  );
}
