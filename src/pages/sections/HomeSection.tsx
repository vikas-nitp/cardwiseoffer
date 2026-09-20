import { motion } from "motion/react";
import SearchCard from "@/components/SearchCard";
import type { CityOption } from "@/components/CityAutocomplete";
import type { SearchState } from "@/hooks/useOfferSearch";
import { TRUST_LABELS, APP_HERO_SUBTITLE } from "@/constants";
import { useMeta } from "@/contexts/MetaContext";
import { useVisitorCount } from "@/hooks/useVisitorCount";
import { useFeatureFlags } from "@/contexts/FeatureFlagContext";
import { resolveFeatureCapabilities } from "@/config/featureCapabilities";
const animatedContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const animatedItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" as const } },
};
const staticContainer = { hidden: {}, show: {} };
const staticItem = { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } };

interface HomeSectionProps {
  searchState: SearchState | null;
  formDate: Date | null;
  onSearch: (from: CityOption, to: CityOption, date: Date, banks: string[], bookingAmount?: number) => Promise<void>;
}

const HomeSection = ({ searchState, formDate, onSearch }: HomeSectionProps) => {
  const { meta } = useMeta();
  const { flags } = useFeatureFlags();
  const capabilities = resolveFeatureCapabilities(flags);
  const visitorCount = useVisitorCount(capabilities.visitorCount);
  const animated = capabilities.homeEntranceAnimation;
  const container = animated ? animatedContainer : staticContainer;
  const item = animated ? animatedItem : staticItem;

  return (
  <div className="w-full flex flex-col items-center">
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center justify-center pt-6 md:pt-10 pb-4 max-w-2xl mx-auto text-center px-4"
    >
      <motion.div variants={item} className="mb-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/35 bg-accent/8 text-accent text-[11px] font-bold uppercase tracking-[0.14em]">
        <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-gold inline-block" />
        Live card offers · India
      </motion.div>
      <motion.h1 variants={item} className="font-display leading-[1.0]">
        <span className="block text-[28px] md:text-[42px] text-foreground leading-[1.15]">Which card saves the most</span>
        <span className="block text-[42px] md:text-[60px] text-accent mt-1 leading-[1.0]">on your flight?</span>
      </motion.h1>
      <motion.p variants={item} className="mt-4 text-[13px] md:text-[14px] text-foreground/70 leading-snug">
        {APP_HERO_SUBTITLE}
      </motion.p>
    </motion.section>

    <motion.div
      initial={animated ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: "easeOut", delay: animated ? 0.48 : 0 }}
      className="w-full flex flex-col items-center"
    >
      <SearchCard
        onSearch={onSearch}
        initialFrom={searchState?.from ?? null}
        initialTo={searchState?.to ?? null}
        initialDate={formDate ?? searchState?.date ?? undefined}
        initialBanks={searchState?.banks ?? []}
      />

      <motion.div
        initial={animated ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: animated ? 0.72 : 0 }}
        className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-4"
      >
        {meta.total_offers > 0 && (
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground/80">
            <span className="w-1.5 h-1.5 rounded-full bg-accent/80 inline-block shrink-0" />
            {meta.total_offers} offers tracked
          </span>
        )}
        {[TRUST_LABELS.NO_BOOKING_BIAS, TRUST_LABELS.UPDATED_DAILY, TRUST_LABELS.INDEPENDENT_COMPARISON].map((label) => (
          <span key={label} className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground/80">
            <span className="w-1.5 h-1.5 rounded-full bg-accent/80 inline-block shrink-0" />
            {label}
          </span>
        ))}
        {visitorCount !== null && visitorCount > 1 && (
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground/80">
            <span className="w-1.5 h-1.5 rounded-full bg-savings/80 inline-block shrink-0 animate-pulse" />
            {visitorCount} people browsing now
          </span>
        )}
      </motion.div>
    </motion.div>
  </div>
  );
};

export default HomeSection;
