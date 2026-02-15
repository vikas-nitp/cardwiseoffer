import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const allBanks = [
  "HDFC Bank", "ICICI Bank", "SBI Card", "Axis Bank", "Kotak Mahindra",
  "American Express", "Yes Bank", "IndusInd Bank", "RBL Bank", "HSBC",
];

const platforms = ["MakeMyTrip", "Cleartrip", "EaseMyTrip", "Goibibo"];
const paymentTypes = ["Credit Card", "Debit Card", "No Card"];

interface SidebarFiltersProps {
  bankFilter: string[];
  onBankFilterChange: (banks: string[]) => void;
  platformFilter: string[];
  onPlatformFilterChange: (platforms: string[]) => void;
  paymentFilter: string[];
  onPaymentFilterChange: (types: string[]) => void;
}

const FilterSection = ({
  title,
  items,
  selected,
  onToggle,
}: {
  title: string;
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
}) => (
  <div className="mb-6">
    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">{title}</h4>
    <div className="space-y-1.5">
      {items.map((item) => {
        const isSelected = selected.includes(item);
        return (
          <button
            key={item}
            onClick={() => onToggle(item)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 text-sm transition-colors",
              isSelected ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-secondary/60"
            )}
          >
            <div
              className={cn(
                "w-4 h-4 rounded-sm border flex items-center justify-center shrink-0",
                isSelected ? "bg-primary border-primary" : "border-border"
              )}
            >
              {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
            {item}
          </button>
        );
      })}
    </div>
  </div>
);

const SidebarFilters = ({
  bankFilter,
  onBankFilterChange,
  platformFilter,
  onPlatformFilterChange,
  paymentFilter,
  onPaymentFilterChange,
}: SidebarFiltersProps) => {
  const toggleItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]);
  };

  return (
    <div className="bg-card/95 backdrop-blur-sm rounded-2xl card-shadow p-5 sticky top-24">
      <h3 className="text-sm font-bold text-foreground mb-5">Filters</h3>
      <FilterSection
        title="Bank"
        items={allBanks}
        selected={bankFilter}
        onToggle={(b) => toggleItem(bankFilter, b, onBankFilterChange)}
      />
      <FilterSection
        title="Platform"
        items={platforms}
        selected={platformFilter}
        onToggle={(p) => toggleItem(platformFilter, p, onPlatformFilterChange)}
      />
      <FilterSection
        title="Payment Type"
        items={paymentTypes}
        selected={paymentFilter}
        onToggle={(t) => toggleItem(paymentFilter, t, onPaymentFilterChange)}
      />
    </div>
  );
};

export default SidebarFilters;
