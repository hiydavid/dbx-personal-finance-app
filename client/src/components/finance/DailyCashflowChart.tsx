import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatCurrency } from './formatters';
import type { DailyCashflow } from '@/lib/finance-types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DailyCashflowChartProps {
  data: DailyCashflow[];
}

export function DailyCashflowChart({ data }: DailyCashflowChartProps) {
  const textColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-text-primary')
    .trim() || '#1f2937';
  const mutedColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-text-muted')
    .trim() || '#6b7280';
  const borderColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-border')
    .trim() || '#e5e7eb';

  // Format dates for labels
  const labels = data.map(d => {
    const date = new Date(d.date);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Inflows',
        data: data.map(d => d.inflows),
        backgroundColor: '#22c55e',
        borderRadius: 4,
        barPercentage: 0.8,
        categoryPercentage: 0.9,
      },
      {
        label: 'Outflows',
        data: data.map(d => -d.outflows),
        backgroundColor: '#ef4444',
        borderRadius: 4,
        barPercentage: 0.8,
        categoryPercentage: 0.9,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
          usePointStyle: true,
          padding: 20,
        },
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
            const value = Math.abs(context.parsed.y ?? 0);
            const label = context.dataset.label || '';
            return `${label}: ${formatCurrency(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          color: mutedColor,
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        stacked: true,
        grid: {
          color: borderColor,
        },
        ticks: {
          color: mutedColor,
          callback: (value) => formatCurrency(Math.abs(Number(value))),
        },
      },
    },
  };

  return (
    <div className="h-[300px]">
      <Bar data={chartData} options={options} />
    </div>
  );
}
