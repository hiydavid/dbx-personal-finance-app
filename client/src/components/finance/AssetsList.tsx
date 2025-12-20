import type { Asset } from "@/lib/finance-types";
import { formatCurrency } from "./formatters";

interface AssetsListProps {
  assets: Asset[];
}

const categoryLabels: Record<string, string> = {
  cash: "Cash & Savings",
  investment: "Investments",
  property: "Property",
};

export function AssetsList({ assets }: AssetsListProps) {
  const grouped = assets.reduce(
    (acc, asset) => {
      if (!acc[asset.category]) acc[asset.category] = [];
      acc[asset.category].push(asset);
      return acc;
    },
    {} as Record<string, Asset[]>
  );

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-green-600">Assets</h2>
      </div>
      <div className="p-4 space-y-4">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              {categoryLabels[category] || category}
            </h3>
            <div className="space-y-2">
              {items.map((asset) => (
                <div
                  key={asset.id}
                  className="flex justify-between items-center py-2 border-b last:border-0"
                >
                  <div>
                    <div className="font-medium">{asset.name}</div>
                    {asset.description && (
                      <div className="text-sm text-muted-foreground">
                        {asset.description}
                      </div>
                    )}
                  </div>
                  <div className="font-semibold text-green-600">
                    {formatCurrency(asset.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
