import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import type { InvestmentsSummary } from '@/lib/finance-types';
import { formatCurrency, formatPercent, formatGainLoss } from './formatters';

interface InvestmentsSummaryCardsProps {
  summary: InvestmentsSummary;
}

export function InvestmentsSummaryCards({ summary }: InvestmentsSummaryCardsProps) {
  const isPositiveDay = summary.dayChange >= 0;
  const isPositiveTotal = summary.totalGainLoss >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Value */}
      <div className="card-elevated card-glow p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <DollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-sm font-medium text-[var(--color-muted-foreground)]">
            Portfolio Value
          </span>
        </div>
        <div className="text-2xl font-bold text-[var(--color-foreground)]">
          {formatCurrency(summary.totalValue)}
        </div>
        <div className="text-xs text-[var(--color-muted-foreground)] mt-1">
          Cost basis: {formatCurrency(summary.totalCostBasis)}
        </div>
      </div>

      {/* Today's Change */}
      <div className="card-elevated card-glow p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg ${isPositiveDay ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            {isPositiveDay ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
          </div>
          <span className="text-sm font-medium text-[var(--color-muted-foreground)]">
            Today's Change
          </span>
        </div>
        <div className={`text-2xl font-bold ${isPositiveDay ? 'text-green-600' : 'text-red-600'}`}>
          {formatGainLoss(summary.dayChange)}
        </div>
        <div className={`text-sm mt-1 ${isPositiveDay ? 'text-green-600' : 'text-red-600'}`}>
          {formatPercent(summary.dayChangePercent)}
        </div>
      </div>

      {/* Total Gain/Loss */}
      <div className="card-elevated card-glow p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg ${isPositiveTotal ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            <Calendar className="w-5 h-5 text-[var(--color-muted-foreground)]" />
          </div>
          <span className="text-sm font-medium text-[var(--color-muted-foreground)]">
            Total Return
          </span>
        </div>
        <div className={`text-2xl font-bold ${isPositiveTotal ? 'text-green-600' : 'text-red-600'}`}>
          {formatGainLoss(summary.totalGainLoss)}
        </div>
        <div className={`text-sm mt-1 ${isPositiveTotal ? 'text-green-600' : 'text-red-600'}`}>
          {formatPercent(summary.totalGainLossPercent)}
        </div>
      </div>
    </div>
  );
}
