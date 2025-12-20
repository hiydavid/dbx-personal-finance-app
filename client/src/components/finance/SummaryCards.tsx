import { formatCurrency } from "./formatters";

interface SummaryCardsProps {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

export function SummaryCards({
  totalAssets,
  totalLiabilities,
  netWorth,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Assets Card */}
      <div className="bg-card rounded-lg border p-6 shadow-sm">
        <div className="text-sm font-medium text-muted-foreground mb-2">
          Total Assets
        </div>
        <div className="text-3xl font-bold text-green-600">
          {formatCurrency(totalAssets)}
        </div>
      </div>

      {/* Liabilities Card */}
      <div className="bg-card rounded-lg border p-6 shadow-sm">
        <div className="text-sm font-medium text-muted-foreground mb-2">
          Total Liabilities
        </div>
        <div className="text-3xl font-bold text-red-600">
          {formatCurrency(totalLiabilities)}
        </div>
      </div>

      {/* Net Worth Card */}
      <div className="bg-card rounded-lg border p-6 shadow-sm">
        <div className="text-sm font-medium text-muted-foreground mb-2">
          Net Worth
        </div>
        <div
          className={`text-3xl font-bold ${netWorth >= 0 ? "text-blue-600" : "text-red-600"}`}
        >
          {formatCurrency(netWorth)}
        </div>
      </div>
    </div>
  );
}
