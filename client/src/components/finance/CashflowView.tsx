import { useState, useEffect, useMemo } from 'react';
import { DailyCashflowChart } from './DailyCashflowChart';
import { TransactionTable } from './TransactionTable';
import { TransactionFilters } from './TransactionFilters';
import { formatCurrency } from './formatters';
import { fetchWithAuth } from '@/contexts/UserContext';
import type {
  Transaction,
  DailyCashflow,
  TransactionFilters as Filters,
  CashflowSummary,
} from '@/lib/finance-types';

export function CashflowView() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dailyCashflow, setDailyCashflow] = useState<DailyCashflow[]>([]);
  const [summary, setSummary] = useState<CashflowSummary>({
    totalInflows: 0,
    totalOutflows: 0,
    netCashflow: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartDays, setChartDays] = useState(30);
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    type: 'all',
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetchWithAuth(`/api/finance/transactions?days=${chartDays}`);
        const result = await response.json();

        if (result.success) {
          setTransactions(result.data.transactions);
          setDailyCashflow(result.data.dailyCashflow);
          setSummary(result.data.summary);
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
  }, [chartDays]);

  // Filter transactions based on current filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Type filter
      if (filters.type !== 'all' && tx.type !== filters.type) return false;

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(tx.category)) {
        return false;
      }

      // Date range filter
      if (filters.startDate && tx.date < filters.startDate) return false;
      if (filters.endDate && tx.date > filters.endDate) return false;

      return true;
    });
  }, [transactions, filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-[var(--color-muted-foreground)]">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold">Cashflow</h1>
        <p className="text-[var(--color-muted-foreground)]">
          Track your income and expenses over time
        </p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border shadow-sm p-4">
          <div className="text-sm text-[var(--color-muted-foreground)]">Total Inflows</div>
          <div className="text-2xl font-semibold text-green-600">
            {formatCurrency(summary.totalInflows)}
          </div>
        </div>
        <div className="bg-card rounded-lg border shadow-sm p-4">
          <div className="text-sm text-[var(--color-muted-foreground)]">Total Outflows</div>
          <div className="text-2xl font-semibold text-red-500">
            {formatCurrency(summary.totalOutflows)}
          </div>
        </div>
        <div className="bg-card rounded-lg border shadow-sm p-4">
          <div className="text-sm text-[var(--color-muted-foreground)]">Net Cashflow</div>
          <div className={`text-2xl font-semibold ${summary.netCashflow >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {summary.netCashflow >= 0 ? '+' : ''}{formatCurrency(summary.netCashflow)}
          </div>
        </div>
      </div>

      {/* Daily Cashflow Chart */}
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Daily Cashflow</h2>
          <select
            value={chartDays}
            onChange={(e) => setChartDays(Number(e.target.value))}
            className="px-3 py-1.5 text-sm bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg"
          >
            <option value={30}>30 Days</option>
            <option value={60}>60 Days</option>
            <option value={90}>90 Days</option>
          </select>
        </div>
        <DailyCashflowChart data={dailyCashflow} />
      </div>

      {/* Transaction Table with Filters */}
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-4 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-semibold mb-4">Transactions</h2>
          <TransactionFilters filters={filters} onFiltersChange={setFilters} />
        </div>
        <TransactionTable transactions={filteredTransactions} />
      </div>
    </div>
  );
}
