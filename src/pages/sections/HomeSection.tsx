import { motion } from "motion/react";
import SearchCard from "@/components/SearchCard";
import type { CityOption } from "@/components/CityAutocomplete";
import type { SearchState } from "@/hooks/useOfferSearch";
import { TRUST_LABELS, APP_HERO_SUBTITLE } from "@/constants";
import { useMeta } from "@/contexts/MetaContext";
import { format, parseISO } from "date-fns";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" as const } },
};

interface HomeSectionProps {
  searchState: SearchState | null;
  onSearch: (from: CityOption, to: CityOption, date: Date, banks: string[], bookingAmount?: number) => Promise<void>;
}

const HomeSection = ({ searchState, onSearch }: HomeSectionProps) => {
  const { meta } = useMeta();
  const lastUpdated = meta.dataset_last_updated_at
    ? format(parseISO(meta.dataset_last_updated_at), "MMM yyyy")
    : null;


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
      <motion.p variants={item} className="mt-4 text-[15px] md:text-[17px] text-foreground/75 leading-relaxed">
        {APP_HERO_SUBTITLE}
        <span className="text-accent font-semibold"> — instantly.</span>
      </motion.p>
      {meta.total_offers > 0 && (
        <motion.div variants={item} className="mt-3 flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/40 bg-muted/25 text-[12px] font-semibold text-foreground/55">
            <span className="w-1.5 h-1.5 rounded-full bg-accent/70 inline-block shrink-0" />
            {meta.total_offers} active offers
            {lastUpdated && <><span className="text-border/50 mx-0.5">·</span>Updated {lastUpdated}</>}
          </span>
        </motion.div>
      )}
    </motion.section>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: "easeOut", delay: 0.48 }}
      className="w-full flex flex-col items-center"
    >
      <SearchCard
        onSearch={onSearch}
        initialFrom={searchState?.from ?? null}
        initialTo={searchState?.to ?? null}
        initialDate={searchState?.date ?? undefined}
        initialBanks={searchState?.banks ?? []}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.72 }}
        className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4"
      >
        {[TRUST_LABELS.NO_BOOKING_BIAS, TRUST_LABELS.UPDATED_DAILY, TRUST_LABELS.INDEPENDENT_COMPARISON].map((label) => (
          <span key={label} className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground/65">
            <span className="w-1.5 h-1.5 rounded-full bg-accent/80 inline-block shrink-0" />
            {label}
          </span>
        ))}
      </motion.div>
    </motion.div>
  </div>
  );
};

export default HomeSection;
