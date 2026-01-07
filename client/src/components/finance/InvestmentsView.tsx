import { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth } from '@/contexts/UserContext';
import type { InvestmentsData } from '@/lib/finance-types';
import { InvestmentsSummaryCards } from './InvestmentsSummaryCards';
import { AllocationChart } from './AllocationChart';
import { PerformanceChart } from './PerformanceChart';
import { HoldingsTable } from './HoldingsTable';

export function InvestmentsView() {
  const [data, setData] = useState<InvestmentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('1Y');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`/api/finance/investments?period=${period}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to load data');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Investments</h1>
        <p className="text-[var(--color-muted-foreground)]">
          Track your portfolio performance and holdings
        </p>
      </header>

      {/* Summary Cards */}
      <div className="opacity-0 animate-fade-in-up animate-delay-100">
        <InvestmentsSummaryCards summary={data.summary} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="opacity-0 animate-fade-in-up animate-delay-200">
          <AllocationChart allocations={data.allocations} />
        </div>
        <div className="opacity-0 animate-fade-in-up animate-delay-300">
          <PerformanceChart
            history={data.history}
            period={period}
            onPeriodChange={setPeriod}
          />
        </div>
      </div>

      {/* Holdings Table */}
      <div className="opacity-0 animate-fade-in-up animate-delay-400">
        <HoldingsTable holdings={data.holdings} />
      </div>
    </div>
  );
}
