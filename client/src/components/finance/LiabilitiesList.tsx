import { useState, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import type { Liability } from '@/lib/finance-types';
import { formatCurrency } from './formatters';

interface LiabilitiesListProps {
  liabilities: Liability[];
}

const categoryLabels: Record<string, string> = {
  mortgage: 'Mortgage',
  loan: 'Loans',
  credit_card: 'Credit Cards',
  other: 'Other',
};

const categoryColors: Record<string, string> = {
  mortgage: '#ef4444',   // red
  loan: '#f97316',       // orange
  credit_card: '#eab308', // yellow
  other: '#94a3b8',      // slate
};

export function LiabilitiesList({ liabilities }: LiabilitiesListProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const { categoryTotals, total } = useMemo(() => {
    const grouped = liabilities.reduce(
      (acc, liability) => {
        if (!acc[liability.category]) acc[liability.category] = [];
        acc[liability.category].push(liability);
        return acc;
      },
      {} as Record<string, Liability[]>
    );

    const categoryTotals = Object.entries(grouped).map(([category, items]) => ({
      category,
      total: items.reduce((sum, item) => sum + item.amount, 0),
      items,
    }));

    const total = categoryTotals.reduce((sum, cat) => sum + cat.total, 0);

    return { categoryTotals, total };
  }, [liabilities]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      {/* Header with total */}
      <div className="p-4 pb-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-semibold">Liabilities</h2>
          <span className="text-xl font-semibold text-[var(--color-muted-foreground)]">·</span>
          <span className="text-xl font-semibold text-red-500">{formatCurrency(total)}</span>
        </div>

        {/* Horizontal stacked bar */}
        <div className="mt-3 h-3 flex rounded-full overflow-hidden bg-[var(--color-muted)]">
          {categoryTotals.map(({ category, total: catTotal }) => {
            const percentage = total > 0 ? (catTotal / total) * 100 : 0;
            if (percentage === 0) return null;
            return (
              <div
                key={category}
                className="h-full transition-all"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: categoryColors[category] || '#94a3b8',
                }}
                title={`${categoryLabels[category] || category}: ${percentage.toFixed(0)}%`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {categoryTotals.map(({ category, total: catTotal }) => {
            const percentage = total > 0 ? (catTotal / total) * 100 : 0;
            return (
              <div key={category} className="flex items-center gap-1.5 text-sm">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: categoryColors[category] || '#94a3b8' }}
                />
                <span className="text-[var(--color-muted-foreground)]">
                  {categoryLabels[category] || category}
                </span>
                <span className="font-medium">{percentage.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_100px_120px] gap-4 px-4 py-2 border-t border-b border-[var(--color-border)] text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">
        <div>Name</div>
        <div className="text-center">Weight</div>
        <div className="text-right">Amount</div>
      </div>

      {/* Category rows */}
      <div className="divide-y divide-[var(--color-border)]">
        {categoryTotals.map(({ category, total: catTotal, items }) => {
          const percentage = total > 0 ? (catTotal / total) * 100 : 0;
          const isExpanded = expandedCategories.has(category);

          return (
            <div key={category}>
              {/* Category header row */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full grid grid-cols-[1fr_100px_120px] gap-4 px-4 py-3 hover:bg-[var(--color-muted)]/50 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <ChevronRight
                    className={`w-4 h-4 text-[var(--color-muted-foreground)] transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                  <span className="font-medium">{categoryLabels[category] || category}</span>
                </div>
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-1">
                    <div className="w-16 h-2 bg-[var(--color-muted)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: categoryColors[category] || '#94a3b8',
                        }}
                      />
                    </div>
                    <span className="text-sm text-[var(--color-muted-foreground)] w-12 text-right">
                      {percentage.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="text-right font-semibold text-red-500">
                  {formatCurrency(catTotal)}
                </div>
              </button>

              {/* Expanded items */}
              {isExpanded && (
                <div className="bg-[var(--color-muted)]/30">
                  {items.map((liability) => {
                    const itemPercentage = total > 0 ? (liability.amount / total) * 100 : 0;
                    return (
                      <div
                        key={liability.id}
                        className="grid grid-cols-[1fr_100px_120px] gap-4 px-4 py-2 pl-10 border-t border-[var(--color-border)]/50"
                      >
                        <div>
                          <div className="text-sm">{liability.name}</div>
                          {liability.description && (
                            <div className="text-xs text-[var(--color-muted-foreground)]">
                              {liability.description}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-center text-[var(--color-muted-foreground)]">
                          {itemPercentage.toFixed(2)}%
                        </div>
                        <div className="text-sm text-right text-red-500">
                          {formatCurrency(liability.amount)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
