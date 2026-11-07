import { useState } from "react";
import { format } from "date-fns";
import { ArrowRight, Search, AlertCircle, Calendar as CalendarIcon, Star, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DateStrip, { type StripDay } from "@/components/DateStrip";
import OfferCard from "@/components/OfferCard";
import OfferDetailModal from "@/components/OfferDetailModal";
import type { SearchState } from "@/hooks/useOfferSearch";
import type { OfferViewModel } from "@/types/offer";
import { DATE_STRIP_NO_OFFERS_LABEL } from "@/constants";
import { cn } from "@/lib/utils";
import { useMeta } from "@/contexts/MetaContext";

type PayFilter = "all" | "CREDIT" | "DEBIT";

function decorateResults(offers: OfferViewModel[], hasUserFare: boolean) {
  // Count how many offers share the same bank+paymentType so we know when to add platform
  const bankTypeCount = new Map<string, number>();
  for (const o of offers) {
    if (o.bank && o.paymentMethod !== "NO_CARD") {
      const k = `${o.bank}:${o.paymentMethod}`;
      bankTypeCount.set(k, (bankTypeCount.get(k) ?? 0) + 1);
    }
  }

  return offers.map((offer) => {
    const isDefault = offer.label.includes("Default");
    const isSelected = offer.label === "Selected" || offer.label === "Selected Alt";
    const typeStr = offer.paymentMethod === "CREDIT" ? "Credit" : offer.paymentMethod === "DEBIT" ? "Debit" : null;

    // When multiple offers share the same bank+paymentType, append platform so cards are distinct
    const needsPlatform = isSelected && typeStr &&
      (bankTypeCount.get(`${offer.bank}:${offer.paymentMethod}`) ?? 0) > 1;

    const displayLabel = isDefault
      ? `${offer.platformName} Offer`
      : needsPlatform
      ? `${offer.bankDisplay} ${typeStr} · ${offer.platformName}`
      : isSelected && typeStr
      ? `${offer.bankDisplay} ${typeStr} Card Offer`
      : offer.label;

    const variant = (
      offer.label === "Best Offer" || offer.label === "Selected" ? "primary"
      : offer.label === "Selected Alt" || offer.label === "Better Alternative" ? "highlight"
      : "default"
    ) as "primary" | "highlight" | "default" | "neutral";

    return { offer, variant, label: displayLabel, extraLabel: hasUserFare ? (offer.comparisonText ?? undefined) : undefined };
  });
}

const STRIP_MAX_W = "max-w-4xl";

function offerMaxW(count: number): string {
  if (count <= 1) return "max-w-sm";
  if (count === 2) return "max-w-2xl";
  if (count === 3) return "max-w-4xl";
  if (count === 4) return "max-w-3xl";
  return "max-w-5xl";
}

function gridCols(count: number): string {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2";
  if (count === 4) return "grid-cols-1 sm:grid-cols-2";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
}

const OfferCardSkeleton = () => (
  <div className="rounded-2xl border border-border/40 overflow-hidden bg-card">
    <div className="h-1 w-full bg-muted/60" />
    <div className="px-4 pt-3 pb-2 flex items-center justify-between">
      <Skeleton className="h-5 w-24 rounded-full" />
      <Skeleton className="h-5 w-5 rounded-lg" />
    </div>
    <div className="px-4 pt-4 pb-2">
      <Skeleton className="h-7 w-32 mb-2" />
    </div>
    <div className="mx-4 border-t border-border/30" />
    <div className="px-4 py-3 space-y-2">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-3 w-36" />
      <Skeleton className="h-3 w-24" />
    </div>
    <div className="px-4 pb-4 pt-0">
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  </div>
);

const PayFilterBar = ({ value, onChange, hasCard }: { value: PayFilter; onChange: (v: PayFilter) => void; hasCard: boolean }) => {
  if (!hasCard) return null;
  const opts: { v: PayFilter; label: string }[] = [
    { v: "all", label: "All" },
    { v: "CREDIT", label: "Credit" },
    { v: "DEBIT", label: "Debit" },
  ];
  return (
    <div className="flex items-center gap-1 bg-card border border-border/40 rounded-xl p-1 card-shadow w-fit">
      {opts.map(({ v, label }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={cn(
            "h-7 px-3 rounded-lg text-[12px] font-semibold transition-colors",
            v === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

interface ResultsSectionProps {
  searchState: SearchState;
  searchLoading: boolean;
  searchError: string | null;
  searchResults: OfferViewModel[];
  strip7days: StripDay[];
  onDateChange: (date: Date) => void;
  onEditSearch: () => void;
}

const ResultsSection = ({
  searchState, searchLoading, searchError,
  searchResults, strip7days, onDateChange, onEditSearch,
}: ResultsSectionProps) => {
  const { getBankDisplayName } = useMeta();
  const [payFilter, setPayFilter] = useState<PayFilter>("all");
  const [selectedOffer, setSelectedOffer] = useState<OfferViewModel | null>(null);

  const allDecorated = decorateResults(searchResults, !!searchState.bookingAmount);
  const hasCardResults = searchResults.some((o) => o.paymentMethod !== "NO_CARD");

  const decorated = payFilter === "all"
    ? allDecorated
    : allDecorated.filter((d) => d.offer.paymentMethod === "NO_CARD" || d.offer.paymentMethod === payFilter);

  const maxW = offerMaxW(decorated.length);
  const center = cn("mx-auto w-full", maxW);
  const stripCenter = cn("mx-auto w-full", STRIP_MAX_W);

  const banksWithNoOffers = searchState.banks.filter(
    (bank) => !searchResults.some((o) => o.bank === bank && o.paymentMethod !== "NO_CARD")
  );

  return (
  <div className="w-full max-w-7xl mx-auto mt-4 md:mt-6">
    {/* Compact search bar */}
    <button
      onClick={onEditSearch}
      className={cn(
        stripCenter,
        "flex items-center justify-center gap-3 mb-5 bg-card/80 border border-border/40 rounded-2xl px-4 py-3 card-shadow hover:border-primary/25 hover:shadow-md transition-all group"
      )}
    >
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <span className="text-[15px] font-bold text-foreground">{searchState.from.city}</span>
        <span className="text-[11px] text-muted-foreground font-medium">({searchState.from.code})</span>
        <ArrowRight className="w-3.5 h-3.5 text-accent/70 shrink-0" />
        <span className="text-[15px] font-bold text-foreground">{searchState.to.city}</span>
        <span className="text-[11px] text-muted-foreground font-medium">({searchState.to.code})</span>
        <span className="text-border/40 hidden sm:block">·</span>
        <span className="flex items-center gap-1">
          <CalendarIcon className="w-3 h-3 text-muted-foreground/50 shrink-0" />
          <span className="text-[13px] font-medium text-muted-foreground">{format(searchState.date, "dd MMM yyyy")}</span>
        </span>
        {searchState.banks.length > 0 && (
          <>
            <span className="text-border/40 hidden sm:block">·</span>
            {searchState.banks.map((b) => (
              <span key={b} className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">{b}</span>
            ))}
          </>
        )}
        {searchState.bookingAmount && (
          <>
            <span className="text-border/40 hidden sm:block">·</span>
            <span className="text-[13px] font-medium text-muted-foreground">
              ₹{searchState.bookingAmount.toLocaleString()}
            </span>
          </>
        )}
      </div>
      <Search className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary shrink-0 transition-colors" />
    </button>

    {/* Loading state — skeleton cards */}
    {searchLoading && (
      <div className={cn(center)}>
        <div className={cn("grid gap-4", gridCols(3))}>
          <OfferCardSkeleton />
          <OfferCardSkeleton />
          <OfferCardSkeleton />
        </div>
      </div>
    )}

    {searchError && (
      <Alert variant="destructive" className={cn(center, "mb-6")}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{searchError}</AlertDescription>
      </Alert>
    )}

    {!searchLoading && !searchError && (
      <>
        {strip7days.length > 0 && strip7days.some((d) => d.displayText !== DATE_STRIP_NO_OFFERS_LABEL) && (
          <div className={cn(stripCenter, "mb-5")}>
            <DateStrip selectedDate={searchState.date} onDateChange={onDateChange} strip7days={strip7days} />
          </div>
        )}
        {banksWithNoOffers.length > 0 && searchResults.length > 0 && (
          <div className={cn(center, "mb-4 space-y-2")}>
            {banksWithNoOffers.map((bank) => (
              <div key={bank} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/40 border border-border/30 text-[12px] text-muted-foreground">
                <Info className="w-3.5 h-3.5 shrink-0 text-muted-foreground/60" />
                <span>No {getBankDisplayName(bank)} offers available on {format(searchState.date, "dd MMM")} — try a different date</span>
              </div>
            ))}
          </div>
        )}
        {searchResults.length === 0 ? (
          <div className={cn(center, "bg-card rounded-2xl card-shadow border border-border/40 p-12 text-center")}>
            <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
              <Star className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-2 tracking-tight">No active offers for this route</h3>
            <p className="text-[13px] text-muted-foreground mb-1 max-w-sm mx-auto">
              {searchState.from.city} → {searchState.to.city} · {format(searchState.date, "dd MMM yyyy")}
            </p>
            <p className="text-[12px] text-muted-foreground/70 mb-6 max-w-sm mx-auto">
              Try a different date - offers change frequently.
            </p>
            <Button onClick={onEditSearch} variant="outline" className="rounded-xl font-medium text-[13px] gap-2 mr-2">Edit search</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className={cn(center, "flex flex-col gap-1.5")}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-[12px] text-muted-foreground">
                  {decorated.length} offer{decorated.length !== 1 ? "s" : ""} found
                  {payFilter !== "all" && decorated.length < searchResults.length && (
                    <span className="text-muted-foreground/50 ml-1">({searchResults.length} total)</span>
                  )}
                </p>
                <PayFilterBar value={payFilter} onChange={setPayFilter} hasCard={hasCardResults} />
              </div>
            </div>
            {decorated.length === 0 ? (
              <div className={cn(center, "py-8 text-center text-[13px] text-muted-foreground")}>
                No {payFilter === "CREDIT" ? "credit" : "debit"} card offers on this date — try a different date or select All.
              </div>
            ) : (
              <div className={cn(center, "grid gap-4", gridCols(decorated.length))}>
                {decorated.map((d) => (
                  <OfferCard key={d.offer.id} offer={d.offer} variant={d.variant} label={d.label} extraLabel={d.extraLabel} userFareProvided={!!searchState.bookingAmount} searchDate={searchState.date} onExpand={() => setSelectedOffer(d.offer)} />
                ))}
              </div>
            )}
          </div>
        )}
      </>
    )}
  <OfferDetailModal
    offer={selectedOffer}
    onClose={() => setSelectedOffer(null)}
    userFareProvided={!!searchState.bookingAmount}
    searchDate={searchState.date}
  />
  </div>
  );
};

export default ResultsSection;
