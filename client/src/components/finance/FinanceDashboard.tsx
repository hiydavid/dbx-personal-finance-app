import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ChartTabs } from './ChartTabs';
import { AssetsList } from './AssetsList';
import { LiabilitiesList } from './LiabilitiesList';
import { FinancialNews } from './FinancialNews';
import { formatCurrency } from './formatters';
import { useUserInfo } from '@/hooks/useUserInfo';
import type { FinancialSummary } from '@/lib/finance-types';

export function FinanceDashboard() {
  const [data, setData] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userInfo } = useUserInfo();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/finance/summary');
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || 'Failed to load data');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">{error || 'No data'}</div>
      </div>
    );
  }

  const userName = userInfo?.user?.split(' ')[0] || 'there';

  return (
    <div className="p-6 space-y-6">
      {/* Hero Section */}
      <header className="animate-fade-in-up mb-8">
        <p className="text-sm text-[var(--color-muted-foreground)] mb-1">
          Welcome back, {userName}
        </p>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-[var(--color-text-heading)] via-[var(--color-text-heading)] to-[var(--color-accent-primary)] bg-clip-text text-transparent">
              {formatCurrency(data.netWorth)}
            </h1>
            <p className="text-[var(--color-muted-foreground)] mt-1">
              Total Net Worth
            </p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-accent-primary)] text-white rounded-xl font-medium hover:opacity-90 transition-all hover:scale-[1.02] shadow-lg shadow-[var(--color-accent-primary)]/25">
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>
      </header>

      {/* Chart Tabs (Cashflow / Net Worth) */}
      <div className="opacity-0 animate-fade-in-up animate-delay-100">
        <ChartTabs currentNetWorth={data.netWorth} />
      </div>

      {/* Assets and Liabilities side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="opacity-0 animate-fade-in-up animate-delay-200">
          <AssetsList assets={data.assets} />
        </div>
        <div className="opacity-0 animate-fade-in-up animate-delay-300">
          <LiabilitiesList liabilities={data.liabilities} />
        </div>
      </div>

      {/* Latest Financial News */}
      <div className="opacity-0 animate-fade-in-up animate-delay-400">
        <FinancialNews />
      </div>
    </div>
  );
}
