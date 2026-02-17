import { Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface FilterSelectProps {
  title: string;
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
  searchable?: boolean;
}

const FilterSelect = ({ title, items, selected, onToggle, searchable = false }: FilterSelectProps) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = searchable
    ? items.filter((item) => item.toLowerCase().includes(search.toLowerCase()))
    : items;

  const displayText = selected.length === 0
    ? `All ${title}`
    : selected.length <= 2
      ? selected.join(", ")
      : `${selected.length} selected`;

  return (
    <div className="mb-5" ref={wrapperRef}>
      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{title}</h4>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-full text-left px-3 py-2.5 rounded-xl glass-card text-sm font-medium text-foreground flex items-center justify-between gap-2 hover:shadow-md transition-all duration-200"
        >
          <span className={cn(selected.length === 0 && "text-muted-foreground")}>{displayText}</span>
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-scale-in">
            {searchable && (
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Search ${title.toLowerCase()}...`}
                    className="w-full pl-8 pr-3 py-2 text-sm bg-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                    autoFocus
                  />
                </div>
              </div>
            )}
            <div className="max-h-48 overflow-y-auto py-1">
              {filtered.map((item) => {
                const isSelected = selected.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => onToggle(item)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 flex items-center gap-2.5 text-sm transition-colors",
                      isSelected ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-secondary/60"
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors",
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
                <p className="text-xs text-muted-foreground py-3 px-3 text-center">No results</p>
              )}
            </div>
            {selected.length > 0 && (
              <div className="border-t border-border p-2">
                <button
                  onClick={() => selected.forEach(s => onToggle(s))}
                  className="text-xs text-primary font-semibold hover:underline w-full text-center py-1"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

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
    <div className="glass-card rounded-2xl card-shadow p-5 sticky top-24 animate-fade-in">
      <h3 className="text-sm font-bold text-foreground mb-5 font-display">Filters</h3>
      <FilterSelect
        title="Bank"
        items={allBanks}
        selected={bankFilter}
        onToggle={(b) => toggleItem(bankFilter, b, onBankFilterChange)}
        searchable
      />
      <FilterSelect
        title="Platform"
        items={platforms}
        selected={platformFilter}
        onToggle={(p) => toggleItem(platformFilter, p, onPlatformFilterChange)}
        searchable
      />
      <FilterSelect
        title="Payment Method"
        items={paymentTypes}
        selected={paymentFilter}
        onToggle={(t) => toggleItem(paymentFilter, t, onPaymentFilterChange)}
      />
    </div>
  );
};

export default SidebarFilters;
