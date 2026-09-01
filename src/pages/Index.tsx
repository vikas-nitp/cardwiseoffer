import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import type { ActiveSection } from "@/components/Header";
import Footer from "@/components/Footer";
import SearchCard from "@/components/SearchCard";
import TrustIndicators from "@/components/TrustIndicators";
import SupportedSection from "@/components/SupportedSection";
import AboutSection from "@/components/AboutSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ContactSection from "@/components/ContactSection";
import FAQSection from "@/components/FAQSection";
import { useFeatureFlags } from "@/contexts/FeatureFlagContext";
import DateStrip, { type StripDay } from "@/components/DateStrip";
import SidebarFilters from "@/components/SidebarFilters";
import OfferCard from "@/components/OfferCard";
import TrustDisclaimer from "@/components/TrustDisclaimer";
import { format } from "date-fns";
import { ArrowRight, Pencil, AlertCircle, Loader2, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CityOption } from "@/components/CityAutocomplete";
import type { OfferViewModel } from "@/types/offer";
import { repoSearchOffers, repoFetchAllOffersPage, isLocalMode } from "@/services/dataRepo";
import { filterCatalogueOffers } from "@/domain/offerFiltering";
import { log } from "@/lib/logger";
import { resolveFeatureCapabilities } from "@/config/featureCapabilities";
import { analytics } from "@/services/analytics";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const } },
};

interface SearchState {
  from: CityOption;
  to: CityOption;
  date: Date;
  banks: string[];
  bookingAmount?: number;
}

const Index = () => {
  const { flags: featureFlags } = useFeatureFlags();
  const capabilities = useMemo(() => resolveFeatureCapabilities(featureFlags), [featureFlags]);
  const [activeSection, setActiveSection] = useState<ActiveSection>("home");
  const [searchState, setSearchState] = useState<SearchState | null>(null);

  const [bankFilter, setBankFilter] = useState<string[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<string[]>([]);

  const [searchResults, setSearchResults] = useState<OfferViewModel[]>([]);
  const [strip7days, setStrip7days] = useState<StripDay[]>([]);
  const [allOffers, setAllOffers] = useState<OfferViewModel[]>([]);
  const [offersPage, setOffersPage] = useState(1);
  const [offersTotalPages, setOffersTotalPages] = useState(1);
  const [searchLoading, setSearchLoading] = useState(false);
  const [allOffersLoading, setAllOffersLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [allOffersError, setAllOffersError] = useState<string | null>(null);
  const searchController = useRef<AbortController | null>(null);
  const offersController = useRef<AbortController | null>(null);

  const hasSearched = searchState !== null;

  useEffect(() => analytics.configure(capabilities.analytics), [capabilities.analytics]);

  useEffect(() => () => {
    searchController.current?.abort();
    offersController.current?.abort();
  }, []);

  const handleAllOffersClick = useCallback(async () => {
    analytics.track("all_offers");
    offersController.current?.abort();
    const controller = new AbortController();
    offersController.current = controller;
    setAllOffersLoading(true);
    setAllOffersError(null);
    try {
      const result = await repoFetchAllOffersPage({
        bank: bankFilter,
        platform: platformFilter,
        payment_method: paymentFilter,
        page: offersPage,
        limit: 20,
      }, controller.signal);
      if (controller.signal.aborted) return;
      setAllOffers(result.offers);
      setOffersTotalPages(result.pagination.total_pages);
    } catch (err) {
      if (controller.signal.aborted) return;
      setAllOffersError(err instanceof Error ? err.message : "Failed to fetch offers.");
      setAllOffers([]);
    } finally {
      if (offersController.current === controller) setAllOffersLoading(false);
    }
  }, [bankFilter, paymentFilter, platformFilter, offersPage]);

  useEffect(() => {
    if (capabilities.publicAllOffers && activeSection === "all-offers") {
      handleAllOffersClick();
    }
  }, [activeSection, capabilities.publicAllOffers, handleAllOffersClick]);

  // OR within each category, AND across categories. Canonical IDs (CREDIT/DEBIT/NO_CARD, bank code, platform id).
  const filteredAllOffers = useMemo(() => {
    if (!isLocalMode()) return allOffers;
    return filterCatalogueOffers(allOffers, {
      bank: bankFilter,
      platform: platformFilter,
      paymentMethod: paymentFilter,
    });
  }, [allOffers, bankFilter, platformFilter, paymentFilter]);

  const handleResetFilters = () => {
    setBankFilter([]); setPlatformFilter([]); setPaymentFilter([]);
    setOffersPage(1);
  };

  const handleSearch = async (from: CityOption, to: CityOption, date: Date, banks: string[], bookingAmount?: number) => {
    analytics.track("search", { from: from.code, to: to.code, date: format(date, "yyyy-MM-dd") });
    searchController.current?.abort();
    const controller = new AbortController();
    searchController.current = controller;
    setSearchState({ from, to, date, banks, bookingAmount });
    setActiveSection("results");
    handleResetFilters();
    setSearchError(null);
    setSearchLoading(true);
    setStrip7days([]);
    try {
      const result = await repoSearchOffers(from, to, date, banks, false, controller.signal, bookingAmount);
      if (controller.signal.aborted) return;
      setSearchResults(result.offers);
      setStrip7days(result.strip7days);
      log.info("Search completed", { offers: result.offers.length, mode: isLocalMode() ? "local" : "api" });
    } catch (err) {
      if (controller.signal.aborted) return;
      setSearchError(err instanceof Error ? err.message : "Failed to fetch offers.");
      setSearchResults([]);
      setStrip7days([]);
    } finally {
      if (searchController.current === controller) setSearchLoading(false);
    }
  };

  const handleEditSearch = () => setActiveSection("home");

  const handleDateChange = async (newDate: Date) => {
    analytics.track("date_selection", { date: format(newDate, "yyyy-MM-dd") });
    if (!searchState) return;
    searchController.current?.abort();
    const controller = new AbortController();
    searchController.current = controller;
    setSearchState({ ...searchState, date: newDate });
    setSearchLoading(true);
    setSearchError(null);
    try {
      const result = await repoSearchOffers(searchState.from, searchState.to, newDate, searchState.banks, false, controller.signal, searchState.bookingAmount);
      if (controller.signal.aborted) return;
      setSearchResults(result.offers);
      setStrip7days(result.strip7days);
    } catch (err) {
      if (controller.signal.aborted) return;
      setSearchError(err instanceof Error ? err.message : "Failed to fetch offers.");
    } finally {
      if (searchController.current === controller) setSearchLoading(false);
    }
  };

  const showHome = activeSection === "home";
  const showResults = activeSection === "results" && hasSearched;
  const showAllOffers = activeSection === "all-offers";
  const showAbout = activeSection === "about";
  const showHowItWorks = activeSection === "how-it-works";
  const showContact = activeSection === "contact";

  // Variant + label helpers for search result tiles.
  const decorateResults = (offers: OfferViewModel[]) => {
    if (offers.length === 0) return [];
    return offers.map((offer) => ({
      offer,
      variant: offer.label === "Best Offer" || offer.label === "Your Card Offer"
        ? "primary" as const
        : offer.label === "Better Alternative"
          ? "highlight" as const
          : offer.label.includes("Default") ? "default" as const : "neutral" as const,
      label: offer.label,
      extraLabel: offer.comparisonText ?? undefined,
    }));
  };

  const renderOfferTiles = (offers: OfferViewModel[], wrapperClass: string, kind: "results" | "catalog") => {
    const decorated = kind === "results"
      ? decorateResults(offers)
      : offers.map((o) => ({ offer: o, variant: "neutral" as const, label: o.label, extraLabel: undefined as string | undefined }));

    return (
      <div className={wrapperClass}>
        {decorated.map((d, i) => (
          <motion.div key={d.offer.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.3 }}>
            <OfferCard offer={d.offer} variant={d.variant} label={d.label} extraLabel={d.extraLabel} />
          </motion.div>
        ))}
      </div>
    );
  };

  const EmptyState = ({ onReset, message }: { onReset: () => void; message?: string }) => (
    <div className="bg-card rounded-2xl card-shadow border border-border/40 p-12 text-center">
      <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
        <SearchX className="w-5 h-5 text-muted-foreground" />
      </div>
      <h3 className="text-base font-bold text-foreground mb-2 tracking-tight">
        {message ?? "No offers match your filters"}
      </h3>
      <p className="text-[13px] text-muted-foreground mb-6 max-w-sm mx-auto">
        Try adjusting your selection to see more results.
      </p>
      <Button onClick={onReset} variant="outline" className="rounded-xl font-medium text-[13px] gap-2">Reset</Button>
    </div>
  );

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-clip flex flex-col relative">
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 sky-gradient airplane-trail cloud-decoration">
        <div className="absolute top-16 left-[8%] w-[min(500px,90vw)] h-[min(500px,90vw)] rounded-full bg-primary/[0.03] blur-[80px]" />
        <div className="absolute bottom-16 right-[8%] w-[min(400px,85vw)] h-[min(400px,85vw)] rounded-full bg-accent/[0.03] blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header activeSection={activeSection} onSectionChange={setActiveSection} allOffersEnabled={capabilities.publicAllOffers} />

        <main className="flex-1 flex flex-col items-center px-4 md:px-8 pb-10">
          <AnimatePresence mode="wait">
            {showHome && (
              <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full flex flex-col items-center">
                <section className="flex flex-col items-center justify-center pt-14 md:pt-28 pb-8 max-w-xl mx-auto text-center px-4">
                  <h1 className="text-3xl md:text-[44px] font-extrabold tracking-tight leading-[1.12]">
                    <span className="text-gradient">Compare card offers.</span>
                    <br />
                    <span className="text-primary">Book smarter.</span>
                  </h1>
                  <p className="mt-4 text-[13px] md:text-sm text-muted-foreground leading-relaxed max-w-md">
                    Make every flight booking cheaper — transparently across platforms.
                  </p>
                </section>

                <SearchCard
                  onSearch={handleSearch}
                  initialFrom={searchState?.from ?? null}
                  initialTo={searchState?.to ?? null}
                  initialDate={searchState?.date ?? undefined}
                  initialBanks={searchState?.banks ?? []}
                />

                <TrustIndicators />
                <SupportedSection />
              </motion.div>
            )}

            {showResults && searchState && (
              <motion.div key="results" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-6xl mx-auto mt-4 md:mt-6">
                <div className="bg-card rounded-2xl card-shadow border border-border/40 p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-2 flex-wrap text-[13px]">
                    <span className="font-bold text-foreground">
                      {searchState.from.city}
                      <span className="text-muted-foreground font-normal text-[11px] ml-1">({searchState.from.code})</span>
                    </span>
                    <div className="w-6 h-6 rounded-md bg-primary/8 flex items-center justify-center shrink-0">
                      <ArrowRight className="w-3 h-3 text-primary" />
                    </div>
                    <span className="font-bold text-foreground">
                      {searchState.to.city}
                      <span className="text-muted-foreground font-normal text-[11px] ml-1">({searchState.to.code})</span>
                    </span>
                    <span className="text-border/60 hidden sm:inline">·</span>
                    <span className="font-semibold text-foreground">{format(searchState.date, "dd MMM yyyy")}</span>
                    {searchState.banks.length > 0 && (
                      <>
                        <span className="text-border/60 hidden sm:inline">·</span>
                        {searchState.banks.map((b) => (
                          <span key={b} className="text-[11px] font-medium bg-primary/6 text-primary px-2 py-0.5 rounded-md">{b}</span>
                        ))}
                      </>
                    )}
                  </div>
                  <Button variant="outline" size="sm"
                    className="gap-1.5 font-medium text-[13px] border-border/60 text-foreground hover:bg-muted/40 rounded-lg shrink-0 self-start sm:self-auto h-8"
                    onClick={handleEditSearch}
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                </div>

                {searchLoading && (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    <p className="text-[13px] text-muted-foreground">Fetching best offers for your route...</p>
                  </div>
                )}
                {searchError && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{searchError}</AlertDescription>
                  </Alert>
                )}
                {!searchLoading && !searchError && (
                  <>
                    {strip7days.length > 0 && (
                      <div className="mb-5">
                        <DateStrip selectedDate={searchState.date} onDateChange={handleDateChange} strip7days={strip7days} />
                      </div>
                    )}
                    {searchResults.length === 0 ? (
                      <EmptyState onReset={handleEditSearch} message="No active offers for this route." />
                    ) : (
                      renderOfferTiles(searchResults, "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", "results")
                    )}
                    <p className="text-[11px] text-muted-foreground/50 text-center mt-10 max-w-md mx-auto leading-relaxed">
                      Offers sourced from public bank promotions. Final eligibility depends on platform &amp; bank terms.
                    </p>
                  </>
                )}
              </motion.div>
            )}

            {showAllOffers && capabilities.publicAllOffers && (
              <motion.div key="all-offers" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-6xl mx-auto mt-4 md:mt-6">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1 tracking-tight">All Card Offers</h2>
                <p className="text-[13px] text-muted-foreground mb-5">Browse every active card offer across major travel platforms.</p>

                {allOffersLoading && (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    <p className="text-[13px] text-muted-foreground">Loading all offers...</p>
                  </div>
                )}
                {allOffersError && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{allOffersError}</AlertDescription>
                  </Alert>
                )}
                {!allOffersLoading && !allOffersError && (
                  <div className="flex min-w-0 flex-col lg:flex-row gap-5">
                    <div className="lg:hidden">
                      <SidebarFilters
                        bankFilter={bankFilter} onBankFilterChange={setBankFilter}
                        platformFilter={platformFilter} onPlatformFilterChange={setPlatformFilter}
                        paymentFilter={paymentFilter} onPaymentFilterChange={setPaymentFilter}
                        onResetAll={handleResetFilters}
                      />
                    </div>
                    <div className="hidden lg:block w-64 shrink-0">
                      <SidebarFilters
                        bankFilter={bankFilter} onBankFilterChange={setBankFilter}
                        platformFilter={platformFilter} onPlatformFilterChange={setPlatformFilter}
                        paymentFilter={paymentFilter} onPaymentFilterChange={setPaymentFilter}
                        onResetAll={handleResetFilters}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      {filteredAllOffers.length === 0 ? (
                        <EmptyState onReset={handleResetFilters} />
                      ) : (
                        renderOfferTiles(filteredAllOffers, "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4", "catalog")
                      )}
                      <div className="mt-6 flex items-center justify-center gap-3">
                        <Button variant="outline" disabled={offersPage <= 1} onClick={() => setOffersPage((page) => page - 1)}>Previous</Button>
                        <span className="text-sm text-muted-foreground">Page {offersPage} of {offersTotalPages}</span>
                        <Button variant="outline" disabled={offersPage >= offersTotalPages} onClick={() => setOffersPage((page) => page + 1)}>Next</Button>
                      </div>
                      <p className="text-[11px] text-muted-foreground/50 text-center mt-10 max-w-md mx-auto leading-relaxed">
                        Offers sourced from public bank promotions. Final eligibility depends on platform &amp; bank terms.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {showAllOffers && !capabilities.publicAllOffers && (
              <motion.div key="all-offers-disabled" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-6xl mx-auto mt-4 md:mt-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>All Offers catalog is currently unavailable. Please check back later.</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {showAbout && (
              <motion.div key="about" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-6xl mx-auto py-6 md:py-8"><AboutSection /></motion.div>
            )}
            {showHowItWorks && (
              <motion.div key="how-it-works" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-6xl mx-auto py-6 md:py-8"><HowItWorksSection /></motion.div>
            )}
            {showContact && (
              <motion.div key="contact" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-6xl mx-auto py-6 md:py-8"><ContactSection /></motion.div>
            )}
          </AnimatePresence>

          {showHome && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.35 }} className="w-full max-w-6xl mx-auto mt-12 mb-4">
              <FAQSection />
            </motion.div>
          )}
        </main>

        <TrustDisclaimer />
        <Footer />
      </div>

    </div>
  );
};

export default Index;
