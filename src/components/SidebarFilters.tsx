import { Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

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

const SearchableFilterSection = ({
  title,
  items,
  selected,
  onToggle,
  searchable = false,
}: {
  title: string;
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
  searchable?: boolean;
}) => {
  const [search, setSearch] = useState("");
  const filtered = searchable
    ? items.filter((item) => item.toLowerCase().includes(search.toLowerCase()))
    : items;

  return (
    <div className="mb-6">
      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">{title}</h4>
      {searchable && (
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}...`}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-secondary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
          />
        </div>
      )}
      <div className="space-y-1.5">
        {filtered.map((item) => {
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
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground py-2 px-3">No results</p>
        )}
      </div>
    </div>
  );
};

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
      <SearchableFilterSection
        title="Bank"
        items={allBanks}
        selected={bankFilter}
        onToggle={(b) => toggleItem(bankFilter, b, onBankFilterChange)}
        searchable
      />
      <SearchableFilterSection
        title="Platform"
        items={platforms}
        selected={platformFilter}
        onToggle={(p) => toggleItem(platformFilter, p, onPlatformFilterChange)}
        searchable
      />
      <SearchableFilterSection
        title="Payment Type"
        items={paymentTypes}
        selected={paymentFilter}
        onToggle={(t) => toggleItem(paymentFilter, t, onPaymentFilterChange)}
      />
    </div>
  );
};

export default SidebarFilters;
