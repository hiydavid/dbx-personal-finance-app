import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { PortfolioHistoryPoint } from '@/lib/finance-types';
import { formatCurrency } from './formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PerformanceChartProps {
  history: PortfolioHistoryPoint[];
  period: string;
  onPeriodChange: (period: string) => void;
}

const periods = ['1M', '3M', '6M', 'YTD', '1Y', 'ALL'];

export function PerformanceChart({ history, period, onPeriodChange }: PerformanceChartProps) {
  const textColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-text-primary')
    .trim() || '#1f2937';
  const mutedColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-text-muted')
    .trim() || '#6b7280';
  const borderColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-border')
    .trim() || '#e5e7eb';

  // Format dates for display - show fewer labels for better readability
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Sample every nth point for labels based on data length
  const step = Math.max(1, Math.floor(history.length / 8));
  const labels = history.map((point, i) =>
    i % step === 0 || i === history.length - 1 ? formatDate(point.date) : ''
  );

  const startValue = history[0]?.value || 0;
  const endValue = history[history.length - 1]?.value || 0;
  const isPositive = endValue >= startValue;
  const lineColor = isPositive ? '#22c55e' : '#ef4444';
  const bgColor = isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Portfolio Value',
        data: history.map((point) => point.value),
        borderColor: lineColor,
        backgroundColor: bgColor,
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: lineColor,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
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
          title: (context) => {
            const index = context[0].dataIndex;
            const point = history[index];
            if (point) {
              return new Date(point.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              });
            }
            return '';
          },
          label: (context) => {
            const value = context.parsed.y ?? 0;
            return `Portfolio: ${formatCurrency(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: mutedColor,
          maxRotation: 0,
        },
      },
      y: {
        grid: {
          color: borderColor,
          display: true,
        },
        ticks: {
          color: mutedColor,
          callback: (value) => formatCurrency(Number(value)),
        },
      },
    },
  };

  const changeAmount = endValue - startValue;
  const changePercent = startValue > 0 ? ((endValue - startValue) / startValue) * 100 : 0;

  return (
    <div className="card-elevated card-glow p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h3 className="text-lg font-semibold">Performance</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{formatCurrency(changeAmount)}
            </span>
            <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="flex gap-1 bg-[var(--color-muted)]/50 rounded-lg p-1">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                period === p
                  ? 'bg-[var(--color-background)] text-[var(--color-foreground)] shadow-sm'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-[200px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
