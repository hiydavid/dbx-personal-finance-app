import type { Liability } from "@/lib/finance-types";
import { formatCurrency } from "./formatters";

interface LiabilitiesListProps {
  liabilities: Liability[];
}

const categoryLabels: Record<string, string> = {
  mortgage: "Mortgage",
  loan: "Loans",
  credit_card: "Credit Cards",
  other: "Other",
};

export function LiabilitiesList({ liabilities }: LiabilitiesListProps) {
  const grouped = liabilities.reduce(
    (acc, liability) => {
      if (!acc[liability.category]) acc[liability.category] = [];
      acc[liability.category].push(liability);
      return acc;
    },
    {} as Record<string, Liability[]>
  );

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-red-600">Liabilities</h2>
      </div>
      <div className="p-4 space-y-4">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              {categoryLabels[category] || category}
            </h3>
            <div className="space-y-2">
              {items.map((liability) => (
                <div
                  key={liability.id}
                  className="flex justify-between items-center py-2 border-b last:border-0"
                >
                  <div>
                    <div className="font-medium">{liability.name}</div>
                    {liability.description && (
                      <div className="text-sm text-muted-foreground">
                        {liability.description}
                      </div>
                    )}
                  </div>
                  <div className="font-semibold text-red-600">
                    {formatCurrency(liability.amount)}
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
