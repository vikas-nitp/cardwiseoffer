import { useState, useMemo, useEffect } from "react";
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
import ProfileSetup from "@/components/ProfileSetup";
import GlobalLoginGate from "@/components/GlobalLoginGate";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatureFlags } from "@/contexts/FeatureFlagContext";
import DateStrip, { type StripDay } from "@/components/DateStrip";
import SidebarFilters from "@/components/SidebarFilters";
import MobileOfferFilters from "@/components/MobileOfferFilters";
import OfferCard from "@/components/OfferCard";
import TrustDisclaimer from "@/components/TrustDisclaimer";
import DemoModeBanner from "@/components/DemoModeBanner";
import { format } from "date-fns";
import { ArrowRight, Pencil, AlertCircle, Loader2, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CityOption } from "@/components/CityAutocomplete";
import { MAX_FREE_OFFERS } from "@/constants";
import type { OfferViewModel, PlatformId, PaymentMethod, BookingChannel } from "@/types/offer";
import { repoSearchOffers, repoFetchAllOffers, isLocalMode } from "@/services/dataRepo";
import { betterAltDelta } from "@/domain/offerRanking";
import { filterOffers, EMPTY_FILTERS } from "@/domain/offerFiltering";
import { calculateFacets, type FacetUniverse } from "@/domain/offerFacets";
import { log } from "@/lib/logger";

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
}

const Index = () => {
  const { needsProfile, isLoggedIn } = useAuth();
  const { flags: featureFlags } = useFeatureFlags();
  const [activeSection, setActiveSection] = useState<ActiveSection>("home");
  const [searchState, setSearchState] = useState<SearchState | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [bankFilter, setBankFilter] = useState<string[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<string[]>([]);
  const [channelFilter, setChannelFilter] = useState<string[]>([]);

  const [searchResults, setSearchResults] = useState<OfferViewModel[]>([]);
  const [strip7days, setStrip7days] = useState<StripDay[]>([]);
  const [allOffers, setAllOffers] = useState<OfferViewModel[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [allOffersLoading, setAllOffersLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [allOffersError, setAllOffersError] = useState<string | null>(null);

  const hasSearched = searchState !== null;
  const authEnabled = featureFlags.authEnabled;
  const offerLockingEnabled = featureFlags.offerLockingEnabled;

  const handleAllOffersClick = async () => {
    setAllOffersLoading(true);
    setAllOffersError(null);
    try {
      const offers = await repoFetchAllOffers(isLoggedIn);
      setAllOffers(offers);
    } catch (err) {
      setAllOffersError(err instanceof Error ? err.message : "Failed to fetch offers.");
      setAllOffers([]);
    } finally {
      setAllOffersLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === "all-offers" && allOffers.length === 0 && !allOffersLoading) {
      handleAllOffersClick();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  // Canonical filter object (OR-within-group, AND-across-groups; strict bank in catalog).
  const filters = useMemo(
    () => ({
      ...EMPTY_FILTERS,
      platformIds: platformFilter as PlatformId[],
      bankIds: bankFilter,
      paymentMethods: paymentFilter as PaymentMethod[],
      bookingChannels: channelFilter as BookingChannel[],
    }),
    [platformFilter, bankFilter, paymentFilter, channelFilter]
  );

  const filteredAllOffers = useMemo(() => filterOffers(allOffers, filters), [allOffers, filters]);

  const facetUniverse: FacetUniverse = useMemo(
    () => ({
      platforms: [
        { id: "MAKEMYTRIP", name: "MakeMyTrip" },
        { id: "CLEARTRIP", name: "Cleartrip" },
      ],
      banks: Array.from(
        new Map(allOffers.filter((o) => o.bankId).map((o) => [o.bankId as string, o.bankName ?? o.bankId!])).entries()
      ).map(([id, name]) => ({ id, name })),
      paymentMethods: [
        { id: "CREDIT", name: "Credit Card" },
        { id: "DEBIT", name: "Debit Card" },
        { id: "NO_CARD", name: "No Card" },
      ],
      bookingChannels: [
        { id: "WEB", name: "Web" },
        { id: "APP", name: "App" },
        { id: "WEB_AND_APP", name: "Web + App" },
      ],
    }),
    [allOffers]
  );

  const facets = useMemo(() => calculateFacets(allOffers, filters, facetUniverse), [allOffers, filters, facetUniverse]);

  const handleResetFilters = () => {
    setBankFilter([]); setPlatformFilter([]); setPaymentFilter([]); setChannelFilter([]);
  };

  const handleSearch = async (from: CityOption, to: CityOption, date: Date, banks: string[]) => {
    setSearchState({ from, to, date, banks });
    setActiveSection("results");
    handleResetFilters();
    setSearchError(null);
    setSearchLoading(true);
    setStrip7days([]);
    try {
      const result = await repoSearchOffers(from, to, date, banks, isLoggedIn);
      setSearchResults(result.offers);
      setStrip7days(result.strip7days);
      log.info("Search completed", { offers: result.offers.length, local: isLocalMode() });
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Failed to fetch offers.");
      setSearchResults([]);
      setStrip7days([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleEditSearch = () => setActiveSection("home");

  const handleDateChange = async (newDate: Date) => {
    if (!searchState) return;
    setSearchState({ ...searchState, date: newDate });
    setSearchLoading(true);
    setSearchError(null);
    try {
      const result = await repoSearchOffers(searchState.from, searchState.to, newDate, searchState.banks, isLoggedIn);
      setSearchResults(result.offers);
      setStrip7days(result.strip7days);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Failed to fetch offers.");
    } finally {
      setSearchLoading(false);
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
    const primary = offers[0];
    return offers.map((o, i) => {
      let variant: "primary" | "highlight" | "default" | "neutral" = "neutral";
      let label = o.label;
      let extraLabel: string | undefined;
      if (i === 0) {
        variant = "primary";
        label = "Best Offer";
      } else if (o.bank === null || o.paymentMethod === "NO_CARD") {
        variant = "default";
        label = "Default Offer (No Card)";
      } else if (o.savings > primary.savings) {
        variant = "highlight";
        label = "Better Alternative";
        extraLabel = `Save ₹${betterAltDelta(o, primary).toLocaleString()} more`;
      } else {
        variant = "neutral";
      }
      return { offer: o, variant, label, extraLabel };
    });
  };

  const renderOfferTiles = (offers: OfferViewModel[], wrapperClass: string, kind: "results" | "catalog") => {
    const shouldShowLoginGate = authEnabled && offerLockingEnabled && !isLoggedIn;
    const decorated = kind === "results"
      ? decorateResults(offers)
      : offers.map((o) => ({ offer: o, variant: "neutral" as const, label: o.label, extraLabel: undefined as string | undefined }));

    if (shouldShowLoginGate) {
      const preview = decorated.slice(0, MAX_FREE_OFFERS);
      return (
        <>
          <div className={wrapperClass}>
            {preview.map((d, i) => (
              <motion.div key={d.offer.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.3 }}>
                <OfferCard offer={d.offer} variant={d.variant} label={d.label} extraLabel={d.extraLabel} />
              </motion.div>
            ))}
          </div>
          {offers.length > MAX_FREE_OFFERS && (
            <GlobalLoginGate onLoginClick={() => setShowLoginModal(true)} totalOffers={offers.length} />
          )}
        </>
      );
    }
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
    <div className="min-h-screen flex flex-col relative">
      <div className="fixed inset-0 z-0 sky-gradient airplane-trail cloud-decoration">
        <div className="absolute top-16 left-[8%] w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-[80px]" />
        <div className="absolute bottom-16 right-[8%] w-[400px] h-[400px] rounded-full bg-accent/[0.03] blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <DemoModeBanner />
        <Header activeSection={activeSection} onSectionChange={setActiveSection} authEnabled={authEnabled} />

        <main className="flex-1 flex flex-col items-center px-4 md:px-8 pb-10">
          <AnimatePresence mode="wait">
            {needsProfile && (
              <motion.div key="profile" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full">
                <ProfileSetup />
              </motion.div>
            )}

            {showHome && !needsProfile && (
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

            {showAllOffers && featureFlags.allOffers && (
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
                  <div className="flex flex-col lg:flex-row gap-5">
                    <div className="hidden lg:block w-64 shrink-0">
                      <SidebarFilters
                        bankFilter={bankFilter} onBankFilterChange={setBankFilter}
                        platformFilter={platformFilter} onPlatformFilterChange={setPlatformFilter}
                        paymentFilter={paymentFilter} onPaymentFilterChange={setPaymentFilter}
                        onResetAll={handleResetFilters}
                      />
                    </div>
                    <div className="flex-1">
                      {filteredAllOffers.length === 0 ? (
                        <EmptyState onReset={handleResetFilters} />
                      ) : (
                        renderOfferTiles(filteredAllOffers, "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4", "catalog")
                      )}
                      <p className="text-[11px] text-muted-foreground/50 text-center mt-10 max-w-md mx-auto leading-relaxed">
                        Offers sourced from public bank promotions. Final eligibility depends on platform &amp; bank terms.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {showAllOffers && !featureFlags.allOffers && (
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

          {showHome && !needsProfile && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.35 }} className="w-full max-w-6xl mx-auto mt-12 mb-4">
              <FAQSection />
            </motion.div>
          )}
        </main>

        <TrustDisclaimer />
        <Footer />
      </div>

      <AuthModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
};

export default Index;
