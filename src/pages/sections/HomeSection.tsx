import { useMemo } from "react";
import SearchCard from "@/components/SearchCard";
import type { CityOption } from "@/components/CityAutocomplete";
import type { SearchState } from "@/hooks/useOfferSearch";
import { TRUST_LABELS } from "@/constants";
import { useMeta } from "@/contexts/MetaContext";
import { useFeatureFlags } from "@/contexts/FeatureFlagContext";
import { resolveFeatureCapabilities } from "@/config/featureCapabilities";
import { format, parseISO } from "date-fns";

interface HomeSectionProps {
  searchState: SearchState | null;
  onSearch: (from: CityOption, to: CityOption, date: Date, banks: string[], bookingAmount?: number) => Promise<void>;
}

const HomeSection = ({ searchState, onSearch }: HomeSectionProps) => {
  const { meta } = useMeta();
  const { flags } = useFeatureFlags();
  const capabilities = resolveFeatureCapabilities(flags);
  const lastUpdated = meta.dataset_last_updated_at
    ? format(parseISO(meta.dataset_last_updated_at), "MMM yyyy")
    : null;

  // Simulated daily visitor count seeded by date — replaced by backend metric when ready
  const visitorCount = useMemo(() => {
    const seed = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return 1100 + (parseInt(seed, 10) % 400);
  }, []);

  return (
  <div className="w-full flex flex-col items-center">
    <section className="flex flex-col items-center justify-center pt-6 md:pt-10 pb-4 max-w-2xl mx-auto text-center px-4">
      <div className="mb-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/35 bg-accent/8 text-accent text-[11px] font-bold uppercase tracking-[0.14em]">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse inline-block" />
        Live card offers · India
      </div>
      <h1 className="tracking-[-0.04em] leading-[1.0]">
        <span className="block text-[28px] md:text-[42px] font-bold text-foreground leading-[1.15]">Which card saves the most</span>
        <span className="block text-[42px] md:text-[60px] font-black text-accent mt-1 leading-[1.0]">on your flight?</span>
      </h1>
      <p className="mt-3 text-[14px] md:text-[15px] text-muted-foreground">
        Compare card offers on MakeMyTrip, Cleartrip &amp; more — no card? We compare that too.
      </p>
      <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
        {meta.total_offers > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/30 bg-muted/20 text-[11px] font-medium text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-accent/70 inline-block shrink-0" />
            {meta.total_offers} active offers
            {lastUpdated && <><span className="text-border/60 mx-0.5">·</span>Updated {lastUpdated}</>}
          </span>
        )}
        {capabilities.visitorCount && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/30 bg-muted/20 text-[11px] font-medium text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500/70 inline-block shrink-0" />
            {visitorCount.toLocaleString()} travelers today
          </span>
        )}
      </div>
    </section>

    <SearchCard
      onSearch={onSearch}
      initialFrom={searchState?.from ?? null}
      initialTo={searchState?.to ?? null}
      initialDate={searchState?.date ?? undefined}
      initialBanks={searchState?.banks ?? []}
    />

    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4">
      {[TRUST_LABELS.NO_BOOKING_BIAS, TRUST_LABELS.UPDATED_DAILY, TRUST_LABELS.INDEPENDENT_COMPARISON].map((label) => (
        <span key={label} className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-accent/70 inline-block shrink-0" />
          {label}
        </span>
      ))}
    </div>
  </div>
  );
};

export default HomeSection;
