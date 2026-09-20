import { AlertCircle, Loader2, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useRef, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TopFiltersBar } from "@/components/SidebarFilters";
import OfferCard from "@/components/OfferCard";
import EmptyState from "@/components/EmptyState";
import type { OfferViewModel } from "@/types/offer";

const GRID = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";

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

function catalogVariant(offer: OfferViewModel): "default" | "neutral" {
  if (offer.bank === null || offer.paymentMethod === "NO_CARD") return "neutral";
  return "default";
}

const GUEST_PREVIEW_COUNT = 3;

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
  authEnabled?: boolean;
  isSignedIn?: boolean;
  onSignIn?: () => void;
}

const AllOffersSection = ({
  filteredAllOffers, allOffersLoading, allOffersError,
  bankFilter, platformFilter, paymentFilter, channelFilter,
  offersPage, setOffersPage, offersTotalPages, offersTotalCount,
  offersLimit, setOffersLimit,
  onBankFilterChange, onPlatformFilterChange, onPaymentFilterChange, onChannelFilterChange, onResetFilters,
  authEnabled = false, isSignedIn = false, onSignIn,
}: AllOffersSectionProps) => {
  const gated = authEnabled && !isSignedIn;
  const visibleOffers = gated ? filteredAllOffers.slice(0, GUEST_PREVIEW_COUNT) : filteredAllOffers;
  const hiddenCount = gated ? Math.max(0, offersTotalCount - GUEST_PREVIEW_COUNT) : 0;

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
      <div className={GRID}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/40 overflow-hidden bg-card">
            <div className="h-1 w-full bg-muted/60" />
            <div className="px-4 pt-3 pb-2 flex items-center justify-between">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-5 rounded-lg" />
            </div>
            <div className="px-4 pt-4 pb-2"><Skeleton className="h-7 w-28 mb-2" /></div>
            <div className="mx-4 border-t border-border/30" />
            <div className="px-4 py-3 space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="px-4 pb-4 pt-0"><Skeleton className="h-10 w-full rounded-xl" /></div>
          </div>
        ))}
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
          <div className="relative">
            <div className={GRID}>
              {visibleOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  variant={catalogVariant(offer)}
                  label={offer.bankDisplay ?? "Platform Offer"}
                  compact
                />
              ))}
            </div>

            {gated && hiddenCount > 0 && (
              <div className="relative mt-4">
                {/* fade overlay */}
                <div className="pointer-events-none absolute -top-20 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-background z-10" />
                {/* sign-in gate */}
                <div className="relative z-20 flex flex-col items-center gap-3 py-8 px-6 rounded-2xl border border-accent/20 bg-accent/5 text-center">
                  <p className="text-[13px] font-semibold text-foreground">
                    {hiddenCount} more offer{hiddenCount !== 1 ? "s" : ""} available
                  </p>
                  <p className="text-[12px] text-muted-foreground max-w-xs">
                    Sign in to unlock the full catalogue — free, no booking required.
                  </p>
                  <button
                    onClick={onSignIn}
                    className="mt-1 inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-accent text-accent-foreground text-[13px] font-semibold hover:bg-accent/90 transition-colors shimmer-hover"
                  >
                    Sign in to see all offers
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!gated && filteredAllOffers.length > 0 && (
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
