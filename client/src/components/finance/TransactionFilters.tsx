import { X } from 'lucide-react';
import type { TransactionFilters, TransactionCategory } from '@/lib/finance-types';

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
}

const allCategories: { value: TransactionCategory; label: string; type: 'inflow' | 'outflow' }[] = [
  { value: 'salary', label: 'Salary', type: 'inflow' },
  { value: 'freelance', label: 'Freelance', type: 'inflow' },
  { value: 'uncategorized_income', label: 'Other Income', type: 'inflow' },
  { value: 'housing', label: 'Housing', type: 'outflow' },
  { value: 'food', label: 'Food', type: 'outflow' },
  { value: 'transport', label: 'Transport', type: 'outflow' },
  { value: 'shopping', label: 'Shopping', type: 'outflow' },
  { value: 'entertainment', label: 'Entertainment', type: 'outflow' },
  { value: 'utilities', label: 'Utilities', type: 'outflow' },
  { value: 'healthcare', label: 'Healthcare', type: 'outflow' },
  { value: 'other', label: 'Other', type: 'outflow' },
];

export function TransactionFilters({ filters, onFiltersChange }: TransactionFiltersProps) {
  const handleTypeChange = (type: 'all' | 'inflow' | 'outflow') => {
    onFiltersChange({ ...filters, type, categories: [] });
  };

  const handleCategoryToggle = (category: TransactionCategory) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({ ...filters, [field]: value || null });
  };

  const clearFilters = () => {
    onFiltersChange({ categories: [], type: 'all', startDate: null, endDate: null });
  };

  const hasActiveFilters = filters.type !== 'all' ||
    filters.categories.length > 0 ||
    filters.startDate ||
    filters.endDate;

  // Filter categories based on selected type
  const visibleCategories = filters.type === 'all'
    ? allCategories
    : allCategories.filter(c => c.type === filters.type);

  return (
    <div className="space-y-4">
      {/* Type Filter */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-[var(--color-muted-foreground)]">Type:</span>
        <div className="flex gap-2">
          {(['all', 'inflow', 'outflow'] as const).map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filters.type === type
                  ? 'bg-[var(--color-foreground)] text-[var(--color-background)]'
                  : 'bg-[var(--color-muted)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]/80'
              }`}
            >
              {type === 'all' ? 'All' : type === 'inflow' ? 'Inflows' : 'Outflows'}
            </button>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-[var(--color-muted-foreground)]">Date:</span>
        <input
          type="date"
          value={filters.startDate || ''}
          onChange={(e) => handleDateChange('startDate', e.target.value)}
          className="px-3 py-1.5 text-sm bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg"
        />
        <span className="text-[var(--color-muted-foreground)]">to</span>
        <input
          type="date"
          value={filters.endDate || ''}
          onChange={(e) => handleDateChange('endDate', e.target.value)}
          className="px-3 py-1.5 text-sm bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {visibleCategories.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handleCategoryToggle(value)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filters.categories.includes(value)
                ? 'bg-[var(--color-accent-primary)] text-white'
                : 'bg-[var(--color-muted)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]/80'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 text-sm text-[var(--color-accent-primary)] hover:underline"
        >
          <X className="w-4 h-4" />
          Clear filters
        </button>
      )}
    </div>
  );
}
