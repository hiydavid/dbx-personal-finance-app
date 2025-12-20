import { useState } from 'react';
import { Sankey, Tooltip, Rectangle, Layer, ResponsiveContainer } from 'recharts';
import { formatCurrency } from './formatters';

type TimePeriod = '30D' | '60D' | '90D';

// Mock cashflow data
const mockData = {
  nodes: [
    // Income sources (left)
    { name: 'Salary' },
    { name: 'Freelance' },
    { name: 'Uncategorized Income' },
    // Center node
    { name: 'Cash Flow' },
    // Expense categories (right)
    { name: 'Housing' },
    { name: 'Food & Dining' },
    { name: 'Transportation' },
    { name: 'Entertainment' },
    { name: 'Healthcare' },
    { name: 'Shopping' },
    { name: 'Travel' },
    { name: 'Personal Care' },
    { name: 'Miscellaneous' },
    { name: 'Loan Interest' },
    { name: 'Uncategorized' },
    { name: 'Surplus' },
  ],
  links: [
    // Income -> Cash Flow
    { source: 0, target: 3, value: 17248 },
    { source: 1, target: 3, value: 1419 },
    { source: 2, target: 3, value: 10834 },
    // Cash Flow -> Expenses
    { source: 3, target: 4, value: 9559 },
    { source: 3, target: 5, value: 761 },
    { source: 3, target: 6, value: 555 },
    { source: 3, target: 7, value: 445 },
    { source: 3, target: 8, value: 16 },
    { source: 3, target: 9, value: 628 },
    { source: 3, target: 10, value: 204 },
    { source: 3, target: 11, value: 42 },
    { source: 3, target: 12, value: 922 },
    { source: 3, target: 13, value: 100 },
    { source: 3, target: 14, value: 10034 },
    { source: 3, target: 15, value: 6810 },
  ],
};

// Node colors
const nodeColors: Record<string, string> = {
  'Salary': '#22c55e',
  'Freelance': '#22c55e',
  'Uncategorized Income': '#86efac',
  'Cash Flow': '#3b82f6',
  'Housing': '#ef4444',
  'Food & Dining': '#f97316',
  'Transportation': '#eab308',
  'Entertainment': '#a855f7',
  'Healthcare': '#ec4899',
  'Shopping': '#06b6d4',
  'Travel': '#8b5cf6',
  'Personal Care': '#f472b6',
  'Miscellaneous': '#64748b',
  'Loan Interest': '#dc2626',
  'Uncategorized': '#94a3b8',
  'Surplus': '#22c55e',
};

// Custom node component as a function that returns JSX
function SankeyNode(props: any) {
  const { x, y, width, height, payload } = props;
  const color = nodeColors[payload.name] || '#94a3b8';
  const isLeftSide = ['Salary', 'Freelance', 'Uncategorized Income'].includes(payload.name);
  const isCenterNode = payload.name === 'Cash Flow';

  return (
    <Layer key={`node-${payload.name}`}>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        fillOpacity={0.9}
      />
      <text
        x={isLeftSide ? x - 8 : (isCenterNode ? x + width / 2 : x + width + 8)}
        y={y + height / 2}
        textAnchor={isLeftSide ? 'end' : (isCenterNode ? 'middle' : 'start')}
        dominantBaseline="middle"
        fontSize={11}
        fill="#374151"
      >
        {payload.name}
      </text>
      <text
        x={isLeftSide ? x - 8 : (isCenterNode ? x + width / 2 : x + width + 8)}
        y={y + height / 2 + 14}
        textAnchor={isLeftSide ? 'end' : (isCenterNode ? 'middle' : 'start')}
        dominantBaseline="middle"
        fontSize={10}
        fill="#6b7280"
      >
        {formatCurrency(payload.value)}
      </text>
    </Layer>
  );
}

// Custom link component
function SankeyLink(props: any) {
  const { sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index, payload } = props;

  const isIncome = payload.source < 3;
  const isSurplus = payload.target === 15;

  const gradientId = `gradient-${index}`;
  const startColor = isIncome ? '#22c55e' : '#3b82f6';
  const endColor = isSurplus ? '#22c55e' : (isIncome ? '#3b82f6' : '#94a3b8');

  return (
    <Layer key={`link-${index}`}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={startColor} stopOpacity={0.5} />
          <stop offset="100%" stopColor={endColor} stopOpacity={0.3} />
        </linearGradient>
      </defs>
      <path
        d={`
          M${sourceX},${sourceY}
          C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
        `}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={linkWidth}
        strokeOpacity={0.7}
      />
    </Layer>
  );
}

export function CashflowSankey() {
  const [period, setPeriod] = useState<TimePeriod>('30D');

  const totalIncome = mockData.links
    .filter(l => l.source < 3)
    .reduce((sum, l) => sum + l.value, 0);

  const totalExpenses = mockData.links
    .filter(l => l.source === 3 && l.target !== 15)
    .reduce((sum, l) => sum + l.value, 0);

  const surplus = mockData.links.find(l => l.target === 15)?.value || 0;

  return (
    <div>
      {/* Header with period selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Cashflow</h3>
          <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
            <span className="text-green-600 font-medium">{formatCurrency(totalIncome)}</span>
            <span>in</span>
            <span className="mx-1">/</span>
            <span className="text-red-500 font-medium">{formatCurrency(totalExpenses)}</span>
            <span>out</span>
          </div>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as TimePeriod)}
          className="px-3 py-1.5 text-sm bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]"
        >
          <option value="30D">30D</option>
          <option value="60D">60D</option>
          <option value="90D">90D</option>
        </select>
      </div>

      {/* Sankey Chart */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={mockData}
            node={SankeyNode}
            link={SankeyLink}
            nodePadding={16}
            nodeWidth={10}
            margin={{ top: 10, right: 100, bottom: 10, left: 100 }}
            iterations={32}
          >
            <Tooltip
              content={({ payload }) => {
                if (!payload || !payload.length) return null;
                const data = payload[0]?.payload;
                if (!data) return null;

                if (data.source !== undefined && data.target !== undefined) {
                  const sourceName = mockData.nodes[data.source]?.name;
                  const targetName = mockData.nodes[data.target]?.name;
                  return (
                    <div className="bg-white border border-gray-200 shadow-lg rounded-lg px-3 py-2">
                      <div className="text-sm font-medium">{sourceName} → {targetName}</div>
                      <div className="text-sm text-gray-600">{formatCurrency(data.value)}</div>
                    </div>
                  );
                }
                return (
                  <div className="bg-white border border-gray-200 shadow-lg rounded-lg px-3 py-2">
                    <div className="text-sm font-medium">{data.name}</div>
                    <div className="text-sm text-gray-600">{formatCurrency(data.value)}</div>
                  </div>
                );
              }}
            />
          </Sankey>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex justify-center gap-8 text-sm">
        <div className="text-center">
          <div className="text-[var(--color-muted-foreground)]">Net Cashflow</div>
          <div className={`font-semibold ${surplus >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {surplus >= 0 ? '+' : ''}{formatCurrency(surplus)}
          </div>
        </div>
      </div>
    </div>
  );
}
