import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import type { AssetClassAllocation, AssetClass } from '@/lib/finance-types';
import { formatCurrency } from './formatters';

ChartJS.register(ArcElement, Tooltip, Legend);

interface AllocationChartProps {
  allocations: AssetClassAllocation[];
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

export function AllocationChart({ allocations }: AllocationChartProps) {
  const textColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-text-primary')
    .trim() || '#1f2937';
  const borderColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-border')
    .trim() || '#e5e7eb';

  const chartData = {
    labels: allocations.map((a) => assetClassLabels[a.assetClass]),
    datasets: [
      {
        data: allocations.map((a) => a.value),
        backgroundColor: allocations.map((a) => assetClassColors[a.assetClass]),
        borderColor: allocations.map((a) => assetClassColors[a.assetClass]),
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: borderColor,
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            const value = context.parsed ?? 0;
            const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  const totalValue = allocations.reduce((sum, a) => sum + a.value, 0);

  return (
    <div className="card-elevated card-glow p-5 h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Asset Allocation</h3>
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-[180px] h-[180px]">
          <Doughnut data={chartData} options={options} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-[var(--color-muted-foreground)]">Total</span>
            <span className="text-lg font-bold">{formatCurrency(totalValue)}</span>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          {allocations.map((allocation) => (
            <div key={allocation.assetClass} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: assetClassColors[allocation.assetClass] }}
                />
                <span className="text-sm font-medium">
                  {assetClassLabels[allocation.assetClass]}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">
                  {allocation.percentage.toFixed(1)}%
                </div>
                <div className="text-xs text-[var(--color-muted-foreground)]">
                  {formatCurrency(allocation.value)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
