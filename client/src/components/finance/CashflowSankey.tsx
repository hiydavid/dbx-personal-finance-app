import { useState, useEffect, useMemo } from 'react';
import { Sankey, Tooltip, Rectangle, Layer, ResponsiveContainer } from 'recharts';
import { formatCurrency } from './formatters';
import { fetchWithAuth } from '@/contexts/UserContext';
import type { Transaction, TransactionCategory } from '@/lib/finance-types';

type TimePeriod = '30D' | '60D' | '90D';

// Map transaction categories to display labels
const categoryLabels: Record<TransactionCategory, string> = {
  salary: 'Salary',
  freelance: 'Freelance',
  uncategorized_income: 'Other Income',
  housing: 'Housing',
  food: 'Food',
  transport: 'Transport',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  utilities: 'Utilities',
  healthcare: 'Healthcare',
  other: 'Other',
};

// Build Sankey data from transactions
function buildSankeyData(transactions: Transaction[]) {
  // Aggregate by category
  const categoryTotals: Record<string, number> = {};

  for (const tx of transactions) {
    const label = categoryLabels[tx.category];
    categoryTotals[label] = (categoryTotals[label] || 0) + tx.amount;
  }

  // Separate income and expense categories
  const incomeCategories = ['Salary', 'Freelance', 'Other Income'];
  const expenseCategories = ['Housing', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Utilities', 'Healthcare', 'Other'];

  // Build nodes - only include categories that have values
  const nodes: { name: string }[] = [];
  const nodeIndex: Record<string, number> = {};

  // Add income nodes
  for (const cat of incomeCategories) {
    if (categoryTotals[cat] > 0) {
      nodeIndex[cat] = nodes.length;
      nodes.push({ name: cat });
    }
  }

  // Add center node
  const centerIndex = nodes.length;
  nodeIndex['Cash Flow'] = centerIndex;
  nodes.push({ name: 'Cash Flow' });

  // Add expense nodes
  for (const cat of expenseCategories) {
    if (categoryTotals[cat] > 0) {
      nodeIndex[cat] = nodes.length;
      nodes.push({ name: cat });
    }
  }

  // Calculate totals
  const totalIncome = incomeCategories.reduce((sum, cat) => sum + (categoryTotals[cat] || 0), 0);
  const totalExpenses = expenseCategories.reduce((sum, cat) => sum + (categoryTotals[cat] || 0), 0);
  const surplus = totalIncome - totalExpenses;

  // Add surplus node if positive
  if (surplus > 0) {
    nodeIndex['Surplus'] = nodes.length;
    nodes.push({ name: 'Surplus' });
  }

  // Build links
  const links: { source: number; target: number; value: number }[] = [];

  // Income -> Cash Flow
  for (const cat of incomeCategories) {
    if (categoryTotals[cat] > 0) {
      links.push({
        source: nodeIndex[cat],
        target: centerIndex,
        value: Math.round(categoryTotals[cat]),
      });
    }
  }

  // Cash Flow -> Expenses
  for (const cat of expenseCategories) {
    if (categoryTotals[cat] > 0) {
      links.push({
        source: centerIndex,
        target: nodeIndex[cat],
        value: Math.round(categoryTotals[cat]),
      });
    }
  }

  // Cash Flow -> Surplus
  if (surplus > 0) {
    links.push({
      source: centerIndex,
      target: nodeIndex['Surplus'],
      value: Math.round(surplus),
    });
  }

  return { nodes, links, nodeIndex, totalIncome, totalExpenses, surplus };
}

// Node colors
const nodeColors: Record<string, string> = {
  'Salary': '#22c55e',
  'Freelance': '#22c55e',
  'Other Income': '#86efac',
  'Cash Flow': '#3b82f6',
  'Housing': '#ef4444',
  'Food': '#f97316',
  'Transport': '#eab308',
  'Entertainment': '#a855f7',
  'Healthcare': '#ec4899',
  'Shopping': '#06b6d4',
  'Utilities': '#3b82f6',
  'Other': '#94a3b8',
  'Surplus': '#22c55e',
};

// Income category names for detection
const incomeNodes = ['Salary', 'Freelance', 'Other Income'];

// Custom node component - text inline: "Category $X,XXX"
function SankeyNode(props: any) {
  const { x, y, width, height, payload } = props;
  const color = nodeColors[payload.name] || '#94a3b8';
  const isLeftSide = incomeNodes.includes(payload.name);
  const isCenterNode = payload.name === 'Cash Flow';

  // Format label: "Category $X,XXX" on one line
  const label = isCenterNode
    ? payload.name
    : `${payload.name} ${formatCurrency(payload.value)}`;

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
        {label}
      </text>
    </Layer>
  );
}

// Custom link component - needs sankeyData for node name lookups
function createSankeyLink(sankeyData: { nodes: { name: string }[] }) {
  return function SankeyLink(props: any) {
    const { sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index, payload } = props;

    const sourceName = sankeyData.nodes[payload.source]?.name;
    const targetName = sankeyData.nodes[payload.target]?.name;
    const isIncome = incomeNodes.includes(sourceName);
    const isSurplus = targetName === 'Surplus';

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
  };
}

export function CashflowSankey() {
  const [period, setPeriod] = useState<TimePeriod>('30D');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Convert period to days
  const periodDays = period === '30D' ? 30 : period === '60D' ? 60 : 90;

  // Fetch transactions from API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetchWithAuth(`/api/finance/transactions?days=${periodDays}`);
        const result = await response.json();
        if (result.success) {
          setTransactions(result.data.transactions);
        }
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [periodDays]);

  // Build Sankey data from transactions
  const sankeyData = useMemo(() => {
    // Filter transactions to the selected period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);
    const filtered = transactions.filter(tx => new Date(tx.date) >= cutoffDate);
    return buildSankeyData(filtered);
  }, [transactions, periodDays]);

  // Create link component with current data
  const SankeyLinkComponent = useMemo(
    () => createSankeyLink(sankeyData),
    [sankeyData]
  );

  if (loading) {
    return (
      <div className="h-[280px] flex items-center justify-center">
        <div className="text-[var(--color-muted-foreground)]">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with period selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Cashflow</h3>
          <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
            <span className="text-green-600 font-medium">
              {formatCurrency(sankeyData.totalIncome)}
            </span>
            <span>in</span>
            <span className="mx-1">/</span>
            <span className="text-red-500 font-medium">
              {formatCurrency(sankeyData.totalExpenses)}
            </span>
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
            data={sankeyData}
            node={SankeyNode}
            link={SankeyLinkComponent}
            nodePadding={24}
            nodeWidth={10}
            margin={{ top: 10, right: 120, bottom: 10, left: 120 }}
            iterations={32}
          >
            <Tooltip
              content={({ payload }) => {
                if (!payload || !payload.length) return null;
                const data = payload[0]?.payload;
                if (!data) return null;

                if (data.source !== undefined && data.target !== undefined) {
                  const sourceName = sankeyData.nodes[data.source]?.name;
                  const targetName = sankeyData.nodes[data.target]?.name;
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
          <div className={`font-semibold ${sankeyData.surplus >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {sankeyData.surplus >= 0 ? '+' : ''}{formatCurrency(sankeyData.surplus)}
          </div>
        </div>
      </div>
    </div>
  );
}
