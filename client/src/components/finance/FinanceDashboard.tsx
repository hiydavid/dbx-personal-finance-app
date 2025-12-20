import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ChartTabs } from './ChartTabs';
import { AssetsList } from './AssetsList';
import { LiabilitiesList } from './LiabilitiesList';
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
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {userName}</h1>
          <p className="text-[var(--color-muted-foreground)]">
            Here's what's happening with your finances
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-foreground)] text-[var(--color-background)] rounded-lg hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          <span className="font-medium">New</span>
        </button>
      </header>

      {/* Chart Tabs (Cashflow / Net Worth) */}
      <ChartTabs currentNetWorth={data.netWorth} />

      {/* Assets and Liabilities side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssetsList assets={data.assets} />
        <LiabilitiesList liabilities={data.liabilities} />
      </div>
    </div>
  );
}
