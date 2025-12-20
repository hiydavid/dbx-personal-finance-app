import { useState, useEffect } from "react";
import { SummaryCards } from "./SummaryCards";
import { AssetsList } from "./AssetsList";
import { LiabilitiesList } from "./LiabilitiesList";
import type { FinancialSummary } from "@/lib/finance-types";

export function FinanceDashboard() {
  const [data, setData] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/finance/summary");
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || "Failed to load data");
        }
      } catch (err) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">{error || "No data"}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Financial Overview</h1>
        <p className="text-muted-foreground">
          Last updated: {new Date(data.lastUpdated).toLocaleDateString()}
        </p>
      </header>

      <SummaryCards
        totalAssets={data.totalAssets}
        totalLiabilities={data.totalLiabilities}
        netWorth={data.netWorth}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <AssetsList assets={data.assets} />
        <LiabilitiesList liabilities={data.liabilities} />
      </div>
    </div>
  );
}
