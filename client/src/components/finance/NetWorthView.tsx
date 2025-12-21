import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { FinancialSummary, Asset, Liability } from '@/lib/finance-types';
import { SummaryCards } from './SummaryCards';
import { AssetsList } from './AssetsList';
import { LiabilitiesList } from './LiabilitiesList';
import { AddFinanceItemModal } from '@/components/modals/AddFinanceItemModal';

export function NetWorthView() {
  const [data, setData] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<'asset' | 'liability'>('asset');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/finance/summary');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch financial data');
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = () => {
    setModalDefaultType('asset');
    setIsModalOpen(true);
  };

  const handleAddLiability = () => {
    setModalDefaultType('liability');
    setIsModalOpen(true);
  };

  const handleAssetAdded = (asset: Asset) => {
    setData(prev => prev ? {
      ...prev,
      assets: [...prev.assets, asset],
      totalAssets: prev.totalAssets + asset.value,
      netWorth: prev.netWorth + asset.value,
    } : null);
    setIsModalOpen(false);
  };

  const handleLiabilityAdded = (liability: Liability) => {
    setData(prev => prev ? {
      ...prev,
      liabilities: [...prev.liabilities, liability],
      totalLiabilities: prev.totalLiabilities + liability.amount,
      netWorth: prev.netWorth - liability.amount,
    } : null);
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent-primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-[var(--color-accent-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Net Worth</h1>
        <p className="text-[var(--color-muted-foreground)]">
          Your complete financial portfolio
        </p>
      </div>

      {/* Summary Cards */}
      <SummaryCards
        totalAssets={data.totalAssets}
        totalLiabilities={data.totalLiabilities}
        netWorth={data.netWorth}
      />

      {/* Assets and Liabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssetsList assets={data.assets} onAddClick={handleAddAsset} />
        <LiabilitiesList liabilities={data.liabilities} onAddClick={handleAddLiability} />
      </div>

      {/* Add Modal */}
      <AddFinanceItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAssetAdded={handleAssetAdded}
        onLiabilityAdded={handleLiabilityAdded}
        defaultType={modalDefaultType}
      />
    </div>
  );
}
