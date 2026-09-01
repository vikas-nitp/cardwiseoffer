import { Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, useMemo } from "react";
import { useMeta } from "@/contexts/MetaContext";
const PAYMENT_METHOD_IDS = ["CREDIT", "DEBIT", "NO_CARD"] as const;
const PAYMENT_DISPLAY: Record<string, string> = {
  CREDIT: "Credit Card",
  DEBIT: "Debit Card",
  NO_CARD: "No Card",
};
import { Button } from "@/components/ui/button";

interface FilterSelectProps {
  title: string;
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
  searchable?: boolean;
  displayNames?: Record<string, string>;
}

const FilterSelect = ({ title, items, selected, onToggle, searchable = false, displayNames }: FilterSelectProps) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const getDisplayName = (item: string) => displayNames?.[item] || item;

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
    ? items.filter((item) => getDisplayName(item).toLowerCase().includes(search.toLowerCase()))
    : items;

  const displayText = selected.length === 0
    ? `All ${title}`
    : selected.length <= 2
      ? selected.map(getDisplayName).join(", ")
      : `${selected.length} selected`;

  return (
    <div className="mb-4" ref={wrapperRef}>
      <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.10em] mb-2">{title}</h4>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-full text-left px-3 py-2.5 rounded-xl bg-muted/30 border border-border/40 text-[13px] font-medium text-foreground flex items-center justify-between gap-2 hover:border-primary/20 transition-all duration-200"
        >
          <span className={cn(selected.length === 0 && "text-muted-foreground")}>{displayText}</span>
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border/60 rounded-xl shadow-xl overflow-hidden animate-scale-in">
            {searchable && (
              <div className="p-2 border-b border-border/30">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Search ${title.toLowerCase()}...`}
                    className="w-full pl-8 pr-3 py-2 text-[13px] bg-muted/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
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
                      "w-full text-left px-3 py-2.5 flex items-center gap-2.5 text-[13px] transition-colors",
                      isSelected ? "bg-primary/6 text-primary font-medium" : "text-foreground hover:bg-muted/40"
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                        isSelected ? "bg-primary border-primary" : "border-border"
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    {getDisplayName(item)}
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-xs text-muted-foreground py-3 px-3 text-center">No results</p>
              )}
            </div>
            {selected.length > 0 && (
              <div className="border-t border-border/30 p-2">
                <button
                  onClick={() => selected.forEach(s => onToggle(s))}
                  className="text-xs text-primary font-medium hover:underline w-full text-center py-1"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 text-[10px] font-medium bg-primary/8 text-primary px-2 py-1 rounded-md"
            >
              {getDisplayName(item)}
              <button onClick={() => onToggle(item)} className="hover:text-destructive transition-colors">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

interface SidebarFiltersProps {
  bankFilter: string[];
  onBankFilterChange: (banks: string[]) => void;
  platformFilter: string[];
  onPlatformFilterChange: (platforms: string[]) => void;
  paymentFilter: string[];
  onPaymentFilterChange: (types: string[]) => void;
  onResetAll?: () => void;
}

const SidebarFilters = ({
  bankFilter,
  onBankFilterChange,
  platformFilter,
  onPlatformFilterChange,
  paymentFilter,
  onPaymentFilterChange,
  onResetAll,
}: SidebarFiltersProps) => {
  const { meta } = useMeta();
  
  const bankDisplayNames = useMemo(() => {
    const names: Record<string, string> = {};
    meta.banks.forEach((b) => {
      names[b.id] = b.name;
    });
    return names;
  }, [meta.banks]);

  const bankIds = useMemo(() => meta.banks.map((b) => b.id), [meta.banks]);
  const platformIds = useMemo(() => meta.platforms.map((p) => p.id), [meta.platforms]);
  const platformDisplayNames = useMemo(() => {
    const names: Record<string, string> = {};
    meta.platforms.forEach((platform) => {
      names[platform.id] = platform.name;
    });
    return names;
  }, [meta.platforms]);

  const toggleItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]);
  };

  const hasActiveFilters = bankFilter.length > 0 || platformFilter.length > 0 || paymentFilter.length > 0;

  return (
    <div className="bg-card rounded-2xl card-shadow p-5 sticky top-24 animate-fade-in border border-border/40">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-bold text-foreground">Filters</h3>
        {hasActiveFilters && onResetAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetAll}
            className="text-[11px] text-accent h-auto py-1 px-2 font-medium"
          >
            Reset all
          </Button>
        )}
      </div>
      <FilterSelect
        title="Bank"
        items={bankIds}
        selected={bankFilter}
        onToggle={(b) => toggleItem(bankFilter, b, onBankFilterChange)}
        searchable
        displayNames={bankDisplayNames}
      />
      <FilterSelect
        title="Platform"
        items={platformIds}
        selected={platformFilter}
        onToggle={(p) => toggleItem(platformFilter, p, onPlatformFilterChange)}
        searchable
        displayNames={platformDisplayNames}
      />
      <FilterSelect
        title="Payment Method"
        items={PAYMENT_METHOD_IDS as unknown as string[]}
        selected={paymentFilter}
        onToggle={(t) => toggleItem(paymentFilter, t, onPaymentFilterChange)}
        displayNames={PAYMENT_DISPLAY}
      />
    </div>
  );
};

export default SidebarFilters;
