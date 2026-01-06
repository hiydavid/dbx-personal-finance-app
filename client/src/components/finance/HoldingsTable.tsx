import { useState, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import type { Holding, AssetClass } from '@/lib/finance-types';
import { formatCurrency, formatPercent } from './formatters';

interface HoldingsTableProps {
  holdings: Holding[];
}

const assetClassLabels: Record<AssetClass, string> = {
  stocks: 'Stocks',
  bonds: 'Bonds',
  cash: 'Cash',
};

const assetClassColors: Record<AssetClass, string> = {
  stocks: '#22c55e',
  bonds: '#3b82f6',
  cash: '#6b7280',
};

export function HoldingsTable({ holdings }: HoldingsTableProps) {
  const [expandedClasses, setExpandedClasses] = useState<Set<AssetClass>>(
    new Set(['stocks', 'bonds', 'cash'])
  );

  const { grouped, classTotals, totalValue } = useMemo(() => {
    const grouped = holdings.reduce(
      (acc, holding) => {
        if (!acc[holding.assetClass]) acc[holding.assetClass] = [];
        acc[holding.assetClass].push(holding);
        return acc;
      },
      {} as Record<AssetClass, Holding[]>
    );

    const classTotals = (Object.entries(grouped) as [AssetClass, Holding[]][]).map(
      ([assetClass, items]) => ({
        assetClass,
        total: items.reduce((sum, item) => sum + item.currentValue, 0),
        gainLoss: items.reduce((sum, item) => sum + item.gainLoss, 0),
        items,
      })
    );

    const totalValue = classTotals.reduce((sum, cat) => sum + cat.total, 0);

    return { grouped, classTotals, totalValue };
  }, [holdings]);

  const toggleClass = (assetClass: AssetClass) => {
    setExpandedClasses((prev) => {
      const next = new Set(prev);
      if (next.has(assetClass)) {
        next.delete(assetClass);
      } else {
        next.add(assetClass);
      }
      return next;
    });
  };

  return (
    <div className="card-elevated card-glow">
      <div className="p-4 pb-3">
        <h3 className="text-lg font-semibold">Holdings</h3>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_80px_100px_100px_80px_70px_70px] gap-2 px-4 py-2 border-t border-b border-[var(--color-border)] text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">
        <div>Name</div>
        <div className="text-right">Shares</div>
        <div className="text-right">Cost</div>
        <div className="text-right">Value</div>
        <div className="text-right">Gain/Loss</div>
        <div className="text-right">YTD</div>
        <div className="text-right">1Y</div>
      </div>

      {/* Asset class groups */}
      <div className="divide-y divide-[var(--color-border)]">
        {classTotals.map(({ assetClass, total, gainLoss, items }) => {
          const percentage = totalValue > 0 ? (total / totalValue) * 100 : 0;
          const isExpanded = expandedClasses.has(assetClass);
          const isPositive = gainLoss >= 0;

          return (
            <div key={assetClass}>
              {/* Asset class header row */}
              <button
                onClick={() => toggleClass(assetClass)}
                className="w-full grid grid-cols-[1fr_80px_100px_100px_80px_70px_70px] gap-2 px-4 py-3 hover:bg-[var(--color-muted)]/50 transition-all duration-200 text-left"
              >
                <div className="flex items-center gap-2">
                  <ChevronRight
                    className={`w-4 h-4 text-[var(--color-muted-foreground)] transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: assetClassColors[assetClass] }}
                  />
                  <span className="font-medium">{assetClassLabels[assetClass]}</span>
                  <span className="text-sm text-[var(--color-muted-foreground)]">
                    ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="text-right text-sm text-[var(--color-muted-foreground)]">
                  {items.length} {items.length === 1 ? 'holding' : 'holdings'}
                </div>
                <div className="text-right text-sm text-[var(--color-muted-foreground)]">–</div>
                <div className="text-right font-semibold">{formatCurrency(total)}</div>
                <div className={`text-right font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}{formatCurrency(gainLoss)}
                </div>
                <div className="text-right text-sm text-[var(--color-muted-foreground)]">–</div>
                <div className="text-right text-sm text-[var(--color-muted-foreground)]">–</div>
              </button>

              {/* Expanded holdings */}
              {isExpanded && (
                <div className="bg-[var(--color-muted)]/30">
                  {items.map((holding) => {
                    const holdingPositive = holding.gainLoss >= 0;
                    const ytdPositive = holding.ytdChange >= 0;
                    const yearPositive = holding.yearChange >= 0;

                    return (
                      <div
                        key={holding.id}
                        className="grid grid-cols-[1fr_80px_100px_100px_80px_70px_70px] gap-2 px-4 py-2.5 pl-10 border-t border-[var(--color-border)]/50"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{holding.ticker}</span>
                            <span className="text-xs text-[var(--color-muted-foreground)]">
                              ${holding.currentPrice.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-xs text-[var(--color-muted-foreground)] truncate">
                            {holding.name}
                          </div>
                        </div>
                        <div className="text-sm text-right text-[var(--color-muted-foreground)]">
                          {holding.shares.toLocaleString()}
                        </div>
                        <div className="text-sm text-right text-[var(--color-muted-foreground)]">
                          {formatCurrency(holding.costBasis)}
                        </div>
                        <div className="text-sm text-right font-medium">
                          {formatCurrency(holding.currentValue)}
                        </div>
                        <div className={`text-sm text-right ${holdingPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercent(holding.gainLossPercent)}
                        </div>
                        <div className={`text-sm text-right ${ytdPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercent(holding.ytdChange)}
                        </div>
                        <div className={`text-sm text-right ${yearPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercent(holding.yearChange)}
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
