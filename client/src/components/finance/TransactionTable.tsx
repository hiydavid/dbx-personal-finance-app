import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from './formatters';
import type { Transaction, TransactionCategory } from '@/lib/finance-types';

interface TransactionTableProps {
  transactions: Transaction[];
}

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

const categoryColors: Record<TransactionCategory, string> = {
  salary: '#22c55e',
  freelance: '#22c55e',
  uncategorized_income: '#86efac',
  housing: '#ef4444',
  food: '#f97316',
  transport: '#eab308',
  shopping: '#06b6d4',
  entertainment: '#a855f7',
  utilities: '#3b82f6',
  healthcare: '#ec4899',
  other: '#94a3b8',
};

export function TransactionTable({ transactions }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="p-8 text-center text-[var(--color-muted-foreground)]">
        No transactions match your filters
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-[var(--color-bg-tertiary)]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold text-[var(--color-text-heading)] uppercase tracking-wider">
              Transaction
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-[var(--color-text-heading)] uppercase tracking-wider">
              Merchant
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-[var(--color-text-heading)] uppercase tracking-wider">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-[var(--color-text-heading)] uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-right text-xs font-bold text-[var(--color-text-heading)] uppercase tracking-wider">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {transactions.map((tx) => (
            <tr
              key={tx.id}
              className="hover:bg-[var(--color-bg-elevated)] transition-all duration-200"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {tx.type === 'inflow' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">{tx.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-[var(--color-text-primary)]">
                {tx.merchant}
              </td>
              <td className="px-4 py-3">
                <span
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${categoryColors[tx.category]}20`,
                    color: categoryColors[tx.category],
                  }}
                >
                  {categoryLabels[tx.category]}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-[var(--color-muted-foreground)]">
                {new Date(tx.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </td>
              <td className={`px-4 py-3 text-sm text-right font-medium ${
                tx.type === 'inflow' ? 'text-green-600' : 'text-red-500'
              }`}>
                {tx.type === 'inflow' ? '+' : '-'}{formatCurrency(tx.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
