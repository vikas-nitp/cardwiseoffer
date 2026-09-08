import { format } from "date-fns";
import { ArrowRight, Search, AlertCircle, Loader2, Calendar as CalendarIcon, Star } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import DateStrip, { type StripDay } from "@/components/DateStrip";
import OfferCard from "@/components/OfferCard";
import type { SearchState } from "@/hooks/useOfferSearch";
import type { OfferViewModel } from "@/types/offer";
import { DATE_STRIP_NO_OFFERS_LABEL } from "@/constants";
import { cn } from "@/lib/utils";

function decorateResults(offers: OfferViewModel[], hasUserFare: boolean) {
  return offers.map((offer) => {
    const isDefault = offer.label.includes("Default");
    return {
      offer,
      variant: (
        offer.label === "Best Offer" || offer.label === "Your Card Offer" ? "primary"
        : offer.label === "Better Alternative" || offer.label === "Second Selected Card" ? "highlight"
        : "default"
      ) as "primary" | "highlight" | "default" | "neutral",
      label: isDefault ? "Default" : offer.label,
      extraLabel: hasUserFare ? (offer.comparisonText ?? undefined) : undefined,
    };
  });
}

// Returns a consistent max-width class for all sections based on result count.
// 0/1 → md (448px), 2 → 2xl (672px), 3 → 4xl (896px), 4+ → 6xl (1152px)
function sectionMaxW(count: number): string {
  if (count <= 1) return "max-w-md";
  if (count === 2) return "max-w-2xl";
  if (count === 3) return "max-w-4xl";
  return "max-w-6xl";
}

function gridCols(count: number): string {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2";
  if (count === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
}

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
  const decorated = decorateResults(searchResults, !!searchState.bookingAmount);
  const maxW = sectionMaxW(decorated.length);
  const center = cn("mx-auto w-full", maxW);

  return (
  <div className="w-full max-w-7xl mx-auto mt-4 md:mt-6">
    {/* Compact search bar — always aligned with the result tiles below */}
    <button
      onClick={onEditSearch}
      className={cn(
        center,
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
              <span key={b} className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full border border-accent/20">{b}</span>
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
      <Search className="w-4 h-4 text-muted-foreground/40 group-hover:text-accent shrink-0 transition-colors" />
    </button>

    {searchLoading && (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-[13px] text-muted-foreground">Fetching best offers for your route...</p>
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
          <div className={cn(center, "mb-5")}>
            <DateStrip selectedDate={searchState.date} onDateChange={onDateChange} strip7days={strip7days} />
          </div>
        )}
        {searchResults.length === 0 ? (
          <div className={cn(center, "bg-card rounded-2xl card-shadow border border-border/40 p-12 text-center")}>
            <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
              <Star className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-2 tracking-tight">
              No active offers for this route
            </h3>
            <p className="text-[13px] text-muted-foreground mb-1 max-w-sm mx-auto">
              {searchState.from.city} → {searchState.to.city} · {format(searchState.date, "dd MMM yyyy")}
            </p>
            <p className="text-[12px] text-muted-foreground/70 mb-6 max-w-sm mx-auto">
              Try a different date — offers change frequently.
            </p>
            <Button onClick={onEditSearch} variant="outline" className="rounded-xl font-medium text-[13px] gap-2 mr-2">Edit search</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className={cn(center, "text-[12px] text-muted-foreground text-center")}>
              {searchResults.length} offer{searchResults.length !== 1 ? "s" : ""} found
            </p>
            <div className={cn(center, "grid gap-4", gridCols(decorated.length))}>
              {decorated.map((d) => (
                <OfferCard key={d.offer.id} offer={d.offer} variant={d.variant} label={d.label} extraLabel={d.extraLabel} userFareProvided={!!searchState.bookingAmount} searchDate={searchState.date} />
              ))}
            </div>
          </div>
        )}
      </>
    )}
  </div>
  );
};

export default ResultsSection;
