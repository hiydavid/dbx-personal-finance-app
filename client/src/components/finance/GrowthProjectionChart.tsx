import { useMemo } from 'react';
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

interface GrowthProjectionChartProps {
  currentNetWorth: number;
  embedded?: boolean;
}

export function GrowthProjectionChart({ currentNetWorth, embedded = false }: GrowthProjectionChartProps) {
  const projectionData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const labels = Array.from({ length: 11 }, (_, i) => (currentYear + i).toString());

    const highGrowth = labels.map((_, i) => currentNetWorth * Math.pow(1.10, i));
    const mediumGrowth = labels.map((_, i) => currentNetWorth * Math.pow(1.07, i));
    const lowGrowth = labels.map((_, i) => currentNetWorth * Math.pow(1.03, i));
    const currentTrajectory = labels.map((_, i) => currentNetWorth * Math.pow(1.05, i));

    return { labels, highGrowth, mediumGrowth, lowGrowth, currentTrajectory };
  }, [currentNetWorth]);

  const textColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-text-primary')
    .trim() || '#1f2937';
  const mutedColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-text-muted')
    .trim() || '#6b7280';
  const borderColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-border')
    .trim() || '#e5e7eb';

  const chartData = {
    labels: projectionData.labels,
    datasets: [
      {
        label: 'High (10%)',
        data: projectionData.highGrowth,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderDash: [5, 5],
        tension: 0.3,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: 'Medium (7%)',
        data: projectionData.mediumGrowth,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderDash: [5, 5],
        tension: 0.3,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: 'Low (3%)',
        data: projectionData.lowGrowth,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderDash: [5, 5],
        tension: 0.3,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: 'Current (5%)',
        data: projectionData.currentTrajectory,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        borderWidth: 3,
        tension: 0.3,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 4,
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
            const value = context.parsed.y ?? 0;
            return `${context.dataset.label}: ${formatCurrency(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: borderColor,
          display: true,
        },
        ticks: {
          color: mutedColor,
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

  const isOnTrack = projectionData.currentTrajectory[10] >= projectionData.mediumGrowth[10];

  const content = (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">10-Year Growth Projection</h2>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isOnTrack
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {isOnTrack ? 'On Track' : 'Below Target'}
        </span>
      </div>
      <div className="h-[280px]">
        <Line data={chartData} options={options} />
      </div>
    </>
  );

  if (embedded) {
    return <div>{content}</div>;
  }

  return (
    <div className="bg-card rounded-lg border shadow-sm p-6">
      {content}
    </div>
  );
}
