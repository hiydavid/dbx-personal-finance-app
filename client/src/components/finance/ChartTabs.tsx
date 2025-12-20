import { useState } from 'react';
import { CashflowSankey } from './CashflowSankey';
import { GrowthProjectionChart } from './GrowthProjectionChart';

interface ChartTabsProps {
  currentNetWorth: number;
}

type TabId = 'cashflow' | 'networth';

export function ChartTabs({ currentNetWorth }: ChartTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('cashflow');

  const tabs: { id: TabId; label: string }[] = [
    { id: 'cashflow', label: 'Cashflow' },
    { id: 'networth', label: 'Net Worth' },
  ];

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      {/* Tab Header */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-[var(--color-accent-primary)] text-white'
                  : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6 pt-2">
        {activeTab === 'cashflow' && <CashflowSankey />}
        {activeTab === 'networth' && (
          <GrowthProjectionChart currentNetWorth={currentNetWorth} embedded />
        )}
      </div>
    </div>
  );
}
