import { AlertCircle, Loader2, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TopFiltersBar } from "@/components/SidebarFilters";
import OfferCard from "@/components/OfferCard";
import EmptyState from "@/components/EmptyState";
import type { OfferViewModel } from "@/types/offer";
import { useMeta } from "@/contexts/MetaContext";
import { format, parseISO } from "date-fns";

const GRID = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

const PerPageDropdown = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} className="flex items-center gap-2 text-[12px] text-muted-foreground relative">
      <span className="shrink-0">Per page:</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 h-7 px-2.5 bg-card border border-border/40 rounded-lg text-[12px] font-medium text-foreground hover:border-primary/25 transition-colors card-shadow"
        >
          {value}
          <ChevronDown className={`w-3 h-3 text-muted-foreground/60 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="absolute bottom-full mb-1.5 left-0 bg-card border border-border/40 rounded-xl card-shadow py-1 min-w-[60px] z-50">
            {[10, 20].map((n) => (
              <button
                key={n}
                onClick={() => { onChange(n); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-[12px] font-medium transition-colors flex items-center gap-1.5 ${n === value ? "text-accent" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}
              >
                {n === value && <span className="w-1 h-1 rounded-full bg-accent inline-block" />}
                {n === value ? null : <span className="w-1 h-1 inline-block" />}
                {n}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function catalogVariant(offer: OfferViewModel): "highlight" | "default" | "neutral" {
  const s = offer.savings;
  if (s >= 1400) return "highlight";
  if (s >= 700) return "default";
  return "neutral";
}

interface AllOffersSectionProps {
  filteredAllOffers: OfferViewModel[];
  allOffersLoading: boolean;
  allOffersError: string | null;
  bankFilter: string[];
  platformFilter: string[];
  paymentFilter: string[];
  channelFilter: string[];
  offersPage: number;
  setOffersPage: (p: number | ((p: number) => number)) => void;
  offersTotalPages: number;
  offersTotalCount: number;
  offersLimit: number;
  setOffersLimit: (l: number) => void;
  onBankFilterChange: (v: string[]) => void;
  onPlatformFilterChange: (v: string[]) => void;
  onPaymentFilterChange: (v: string[]) => void;
  onChannelFilterChange: (v: string[]) => void;
  onResetFilters: () => void;
}

const AllOffersSection = ({
  filteredAllOffers, allOffersLoading, allOffersError,
  bankFilter, platformFilter, paymentFilter, channelFilter,
  offersPage, setOffersPage, offersTotalPages, offersTotalCount,
  offersLimit, setOffersLimit,
  onBankFilterChange, onPlatformFilterChange, onPaymentFilterChange, onChannelFilterChange, onResetFilters,
}: AllOffersSectionProps) => {
  const { meta } = useMeta();
  const lastUpdated = meta.dataset_last_updated_at
    ? format(parseISO(meta.dataset_last_updated_at), "MMM yyyy")
    : null;

  return (
  <div className="w-full max-w-6xl mx-auto mt-4 md:mt-6 flex flex-col gap-4">
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-3">
        <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">All Card Offers</h2>
        {!allOffersLoading && offersTotalCount > 0 && (
          <span className="text-[12px] text-muted-foreground">
            {offersTotalCount} offer{offersTotalCount !== 1 ? "s" : ""}
          </span>
        )}
        {allOffersLoading && <Loader2 className="w-3.5 h-3.5 text-muted-foreground/50 animate-spin ml-1" />}
        {lastUpdated && (
          <span className="text-[11px] text-muted-foreground/50 ml-auto">Updated {lastUpdated}</span>
        )}
      </div>
      <TopFiltersBar
        bankFilter={bankFilter} onBankFilterChange={onBankFilterChange}
        platformFilter={platformFilter} onPlatformFilterChange={onPlatformFilterChange}
        paymentFilter={paymentFilter} onPaymentFilterChange={onPaymentFilterChange}
        channelFilter={channelFilter} onChannelFilterChange={onChannelFilterChange}
        onResetAll={onResetFilters}
      />
    </div>

    {allOffersLoading && (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-[13px] text-muted-foreground">Loading all offers...</p>
      </div>
    )}
    {allOffersError && (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{allOffersError}</AlertDescription>
      </Alert>
    )}
    {!allOffersLoading && !allOffersError && (
      <>
        {filteredAllOffers.length === 0 ? (
          <EmptyState onReset={onResetFilters} />
        ) : (
          <div className={GRID}>
            {filteredAllOffers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                variant={catalogVariant(offer)}
                label={offer.bankDisplay ?? "Default"}
                compact
              />
            ))}
          </div>
        )}
        {filteredAllOffers.length > 0 && (
          <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
            <PerPageDropdown value={offersLimit} onChange={(n) => { setOffersLimit(n); setOffersPage(1); }} />
            {offersTotalPages > 1 && (
              <div className="flex items-center gap-1 bg-card border border-border/40 rounded-xl p-1 card-shadow">
                <Button
                  variant="ghost" size="sm" disabled={offersPage <= 1}
                  onClick={() => setOffersPage((p) => p - 1)}
                  className="rounded-lg h-8 px-2.5 text-[13px] font-medium disabled:opacity-40"
                >
                  ←
                </Button>
                {Array.from({ length: offersTotalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setOffersPage(p)}
                    className={`h-8 min-w-[32px] px-2 rounded-lg text-[13px] font-medium transition-colors ${p === offersPage ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted/40"}`}
                  >
                    {p}
                  </button>
                ))}
                <Button
                  variant="ghost" size="sm" disabled={offersPage >= offersTotalPages}
                  onClick={() => setOffersPage((p) => p + 1)}
                  className="rounded-lg h-8 px-2.5 text-[13px] font-medium disabled:opacity-40"
                >
                  →
                </Button>
              </div>
            )}
          </div>
        )}
      </>
    )}
  </div>
  );
};

export default AllOffersSection;
