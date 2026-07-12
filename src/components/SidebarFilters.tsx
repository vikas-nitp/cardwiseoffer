import { Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, useMemo } from "react";
import { useMeta } from "@/contexts/MetaContext";
import { Button } from "@/components/ui/button";
import type { OfferFacets, FacetOption } from "@/domain/offerFacets";

const PAYMENT_UNIVERSE = [
  { id: "CREDIT", name: "Credit Card" },
  { id: "DEBIT", name: "Debit Card" },
  { id: "NO_CARD", name: "No Card" },
];

const CHANNEL_UNIVERSE = [
  { id: "WEB", name: "Web" },
  { id: "APP", name: "App" },
  { id: "WEB_AND_APP", name: "Web + App" },
];

interface FilterSelectProps {
  title: string;
  options: FacetOption[];
  selected: string[];
  onToggle: (id: string) => void;
  onClearAll?: () => void;
  searchable?: boolean;
}

const FilterSelect = ({ title, options, selected, onToggle, onClearAll, searchable = false }: FilterSelectProps) => {
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
    ? options.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()))
    : options;

  const displayText =
    selected.length === 0
      ? `All ${title}`
      : selected.length <= 2
      ? options.filter((o) => selected.includes(o.id)).map((o) => o.name).join(", ")
      : `${selected.length} selected`;

  return (
    <div className="mb-4" ref={wrapperRef}>
      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] mb-2">{title}</h4>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-full text-left px-3 py-2.5 rounded-xl bg-muted/30 border border-border/40 text-[13px] font-medium text-foreground flex items-center justify-between gap-2 hover:border-primary/20 transition-all duration-200"
          aria-expanded={open}
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
            <div className="max-h-52 overflow-y-auto py-1">
              {filtered.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => !opt.disabled && onToggle(opt.id)}
                  disabled={opt.disabled}
                  className={cn(
                    "w-full text-left px-3 py-2.5 flex items-center gap-2.5 text-[13px] transition-colors",
                    opt.selected ? "bg-primary/6 text-primary font-medium" : "text-foreground hover:bg-muted/40",
                    opt.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                  )}
                  title={opt.disabled ? "No offers match this option with current filters" : undefined}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                      opt.selected ? "bg-primary border-primary" : "border-border"
                    )}
                  >
                    {opt.selected && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <span className="flex-1">{opt.name}</span>
                  <span className={cn("text-[11px] font-medium", opt.count === 0 ? "text-muted-foreground/60" : "text-muted-foreground")}>
                    {opt.count}
                  </span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-xs text-muted-foreground py-3 px-3 text-center">No results</p>
              )}
            </div>
            {selected.length > 0 && onClearAll && (
              <div className="border-t border-border/30 p-2">
                <button
                  onClick={onClearAll}
                  className="text-xs text-primary font-medium hover:underline w-full text-center py-1"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {options
            .filter((o) => selected.includes(o.id))
            .map((o) => (
              <span
                key={o.id}
                className="inline-flex items-center gap-1 text-[10px] font-medium bg-primary/8 text-primary px-2 py-1 rounded-md"
              >
                {o.name}
                <button onClick={() => onToggle(o.id)} className="hover:text-destructive transition-colors" aria-label={`Remove ${o.name}`}>
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
  channelFilter?: string[];
  onChannelFilterChange?: (channels: string[]) => void;
  facets?: OfferFacets;
  onResetAll?: () => void;
}

const SidebarFilters = ({
  bankFilter,
  onBankFilterChange,
  platformFilter,
  onPlatformFilterChange,
  paymentFilter,
  onPaymentFilterChange,
  channelFilter = [],
  onChannelFilterChange,
  facets,
  onResetAll,
}: SidebarFiltersProps) => {
  const { meta } = useMeta();

  // Fallback options built from meta when facets aren't yet provided.
  const bankOptions: FacetOption[] = useMemo(
    () =>
      facets?.banks ??
      meta.banks.map((b) => ({ id: b.id, name: b.name, count: 0, selected: bankFilter.includes(b.id), disabled: false })),
    [facets, meta.banks, bankFilter]
  );

  const platformOptions: FacetOption[] = useMemo(
    () =>
      facets?.platforms ??
      meta.platforms.map((p) => ({
        id: p.id,
        name: p.name,
        count: 0,
        selected: platformFilter.includes(p.id),
        disabled: false,
      })),
    [facets, meta.platforms, platformFilter]
  );

  const paymentOptions: FacetOption[] = useMemo(
    () =>
      facets?.paymentMethods ??
      PAYMENT_UNIVERSE.map((p) => ({ ...p, count: 0, selected: paymentFilter.includes(p.id), disabled: false })),
    [facets, paymentFilter]
  );

  const channelOptions: FacetOption[] = useMemo(
    () =>
      facets?.bookingChannels ??
      CHANNEL_UNIVERSE.map((c) => ({ ...c, count: 0, selected: channelFilter.includes(c.id), disabled: false })),
    [facets, channelFilter]
  );

  const toggle = (arr: string[], id: string, setter: (v: string[]) => void) =>
    setter(arr.includes(id) ? arr.filter((i) => i !== id) : [...arr, id]);

  const hasActiveFilters =
    bankFilter.length + platformFilter.length + paymentFilter.length + channelFilter.length > 0;

  return (
    <div className="bg-card rounded-2xl card-shadow p-5 sticky top-24 animate-fade-in border border-border/40">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-bold text-foreground">Filters</h3>
        {hasActiveFilters && onResetAll && (
          <Button variant="ghost" size="sm" onClick={onResetAll} className="text-[11px] text-primary h-auto py-1 px-2 font-medium">
            Reset all
          </Button>
        )}
      </div>
      <FilterSelect
        title="Platform"
        options={platformOptions}
        selected={platformFilter}
        onToggle={(id) => toggle(platformFilter, id, onPlatformFilterChange)}
        onClearAll={() => onPlatformFilterChange([])}
      />
      <FilterSelect
        title="Bank"
        options={bankOptions}
        selected={bankFilter}
        onToggle={(id) => toggle(bankFilter, id, onBankFilterChange)}
        onClearAll={() => onBankFilterChange([])}
        searchable
      />
      <FilterSelect
        title="Payment Method"
        options={paymentOptions}
        selected={paymentFilter}
        onToggle={(id) => toggle(paymentFilter, id, onPaymentFilterChange)}
        onClearAll={() => onPaymentFilterChange([])}
      />
      {onChannelFilterChange && (
        <FilterSelect
          title="Booking Channel"
          options={channelOptions}
          selected={channelFilter}
          onToggle={(id) => toggle(channelFilter, id, onChannelFilterChange)}
          onClearAll={() => onChannelFilterChange([])}
        />
      )}
    </div>
  );
};

export default SidebarFilters;
