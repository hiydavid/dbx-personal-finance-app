import { useState, useEffect } from "react";
import { X, Wallet, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Asset, Liability, AssetApiResponse, LiabilityApiResponse } from "@/lib/finance-types";

type ItemType = "asset" | "liability";

interface AddFinanceItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetAdded: (asset: Asset) => void;
  onLiabilityAdded: (liability: Liability) => void;
  defaultType?: ItemType;
}

const assetCategories = [
  { value: "cash", label: "Cash" },
  { value: "investment", label: "Investments" },
  { value: "property", label: "Property" },
] as const;

const liabilityCategories = [
  { value: "loan", label: "Loan" },
  { value: "credit_card", label: "Credit Card" },
  { value: "mortgage", label: "Mortgage" },
  { value: "other", label: "Other" },
] as const;

export function AddFinanceItemModal({
  isOpen,
  onClose,
  onAssetAdded,
  onLiabilityAdded,
  defaultType = "asset",
}: AddFinanceItemModalProps) {
  const [itemType, setItemType] = useState<ItemType>(defaultType);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setCategory("");
      setValue("");
      setDescription("");
      setError(null);
      setItemType(defaultType);
    }
  }, [isOpen, defaultType]);

  useEffect(() => {
    setCategory("");
  }, [itemType]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = itemType === "asset" ? assetCategories : liabilityCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!category) {
      setError("Category is required");
      return;
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setError("Please enter a valid positive amount");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const endpoint = itemType === "asset" ? "/api/finance/assets" : "/api/finance/liabilities";
      const body = itemType === "asset"
        ? { name: name.trim(), category, value: numValue, description: description.trim() || undefined }
        : { name: name.trim(), category, amount: numValue, description: description.trim() || undefined };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = itemType === "asset"
        ? (await response.json()) as AssetApiResponse
        : (await response.json()) as LiabilityApiResponse;

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to add item");
      }

      if (itemType === "asset") {
        onAssetAdded(result.data as Asset);
      } else {
        onLiabilityAdded(result.data as Liability);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[var(--color-backdrop)] backdrop-blur-sm z-[var(--z-modal)] animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[calc(var(--z-modal)+1)] w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="bg-[var(--color-background)] rounded-2xl shadow-xl border border-[var(--color-border)]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              {itemType === "asset" ? (
                <Wallet className="h-5 w-5 text-green-600" />
              ) : (
                <CreditCard className="h-5 w-5 text-red-600" />
              )}
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                Add {itemType === "asset" ? "Asset" : "Liability"}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Type Toggle */}
            <div className="flex gap-2 p-1 bg-[var(--color-muted)]/50 rounded-lg">
              <button
                type="button"
                onClick={() => setItemType("asset")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  itemType === "asset"
                    ? "bg-[var(--color-background)] text-green-600 shadow-sm"
                    : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                }`}
              >
                Asset
              </button>
              <button
                type="button"
                onClick={() => setItemType("liability")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  itemType === "liability"
                    ? "bg-[var(--color-background)] text-red-600 shadow-sm"
                    : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                }`}
              >
                Liability
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="block mb-2 text-sm font-medium text-[var(--color-foreground)]">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={itemType === "asset" ? "e.g., Savings Account" : "e.g., Car Loan"}
                className="w-full px-4 py-3 bg-[var(--color-background)]/70 border border-[var(--color-border)]/50 rounded-xl outline-none focus:border-[var(--color-accent-primary)]/50 transition-all text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block mb-2 text-sm font-medium text-[var(--color-foreground)]">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--color-background)]/70 border border-[var(--color-border)]/50 rounded-xl outline-none focus:border-[var(--color-accent-primary)]/50 transition-all text-[var(--color-foreground)]"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Value/Amount */}
            <div>
              <label className="block mb-2 text-sm font-medium text-[var(--color-foreground)]">
                {itemType === "asset" ? "Value" : "Amount"}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]">
                  $
                </span>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 bg-[var(--color-background)]/70 border border-[var(--color-border)]/50 rounded-xl outline-none focus:border-[var(--color-accent-primary)]/50 transition-all text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2 text-sm font-medium text-[var(--color-foreground)]">
                Description <span className="text-[var(--color-muted-foreground)]">(optional)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a brief description"
                className="w-full px-4 py-3 bg-[var(--color-background)]/70 border border-[var(--color-border)]/50 rounded-xl outline-none focus:border-[var(--color-accent-primary)]/50 transition-all text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)]">
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                `Add ${itemType === "asset" ? "Asset" : "Liability"}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
