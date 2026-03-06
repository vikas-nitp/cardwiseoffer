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
import DateStrip from "@/components/DateStrip";
import SidebarFilters from "@/components/SidebarFilters";
import OfferCard from "@/components/OfferCard";
import TrustDisclaimer from "@/components/TrustDisclaimer";
import skyBg from "@/assets/sky-bg-2.png";
import { format } from "date-fns";
import { ArrowRight, Pencil, AlertCircle, Loader2, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CityOption } from "@/components/CityAutocomplete";
import { MAX_FREE_OFFERS } from "@/constants";
import type { OfferTile } from "@/services/api";
import { repoSearchOffers, repoFetchAllOffers, isMockMode } from "@/services/dataRepo";
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

interface PriceStripDay {
  date: string;
  price: number;
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

  const [searchResults, setSearchResults] = useState<OfferTile[]>([]);
  const [strip7days, setStrip7days] = useState<PriceStripDay[]>([]);
  const [allOffers, setAllOffers] = useState<OfferTile[]>([]);
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
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch offers. Please try again.";
      setAllOffersError(errorMsg);
      setAllOffers([]);
    } finally {
      setAllOffersLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === "all-offers" && allOffers.length === 0 && !allOffersLoading) {
      handleAllOffersClick();
    }
  }, [activeSection]);

  // ── Deterministic filtering: OR within category, AND across categories ──
  const filteredAllOffers = useMemo(() => {
    return allOffers.filter((o) => {
      // Bank filter: OR logic within
      if (bankFilter.length > 0) {
        if (!o.bank || !bankFilter.includes(o.bank)) return false;
      }
      // Platform filter: OR logic within
      if (platformFilter.length > 0) {
        if (!platformFilter.includes(o.platform)) return false;
      }
      // Payment filter: OR logic within
      if (paymentFilter.length > 0) {
        if (!paymentFilter.includes(o.paymentType)) return false;
      }
      return true;
    });
  }, [allOffers, bankFilter, platformFilter, paymentFilter]);

  const handleResetFilters = () => {
    setBankFilter([]);
    setPlatformFilter([]);
    setPaymentFilter([]);
  };

  const handleSearch = async (from: CityOption, to: CityOption, date: Date, banks: string[]) => {
    setSearchState({ from, to, date, banks });
    setActiveSection("results");
    setBankFilter([]);
    setPlatformFilter([]);
    setPaymentFilter([]);
    setSearchError(null);
    setSearchLoading(true);
    setStrip7days([]);

    try {
      const result = await repoSearchOffers(from, to, date, banks, isLoggedIn);
      setSearchResults(result.offers);
      setStrip7days(result.strip7days);
      log.info("Search completed", { offers: result.offers.length, strip: result.strip7days.length, mock: isMockMode() });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch offers. Please try again.";
      log.error("Search failed", err);
      setSearchError(errorMsg);
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
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch offers.";
      setSearchError(errorMsg);
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

  const renderOfferTiles = (offers: typeof searchResults, wrapperClass: string) => {
    const shouldShowLoginGate = authEnabled && offerLockingEnabled && !isLoggedIn;
    
    if (shouldShowLoginGate) {
      const preview = offers.slice(0, MAX_FREE_OFFERS);
      return (
        <>
          <div className={wrapperClass}>
            {preview.map((offer, index) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.3 }}
              >
                <OfferCard {...offer} index={index} />
              </motion.div>
            ))}
          </div>
          {offers.length > MAX_FREE_OFFERS && (
            <GlobalLoginGate
              onLoginClick={() => setShowLoginModal(true)}
              totalOffers={offers.length}
            />
          )}
        </>
      );
    }

    return (
      <div className={wrapperClass}>
        {offers.map((offer, index) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
          >
            <OfferCard {...offer} index={index} />
          </motion.div>
        ))}
      </div>
    );
  };

  // ── Empty state component ──
  const EmptyState = ({ onReset }: { onReset: () => void }) => (
    <div className="bg-card rounded-2xl card-shadow border border-border/40 p-12 text-center">
      <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
        <SearchX className="w-5 h-5 text-muted-foreground" />
      </div>
      <h3 className="text-base font-bold text-foreground mb-2 tracking-tight">No offers match your filters</h3>
      <p className="text-[13px] text-muted-foreground mb-6 max-w-sm mx-auto">
        Try adjusting your filter combination to see more results.
      </p>
      <Button onClick={onReset} variant="outline" className="rounded-xl font-medium text-[13px] gap-2">
        Reset Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background — soft sky gradient with subtle cloud/trail decorations */}
      <div className="fixed inset-0 z-0 sky-gradient airplane-trail cloud-decoration">
        <div className="absolute top-16 left-[8%] w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-[80px]" />
        <div className="absolute bottom-16 right-[8%] w-[400px] h-[400px] rounded-full bg-accent/[0.03] blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
          authEnabled={authEnabled}
        />

        <main className="flex-1 flex flex-col items-center px-4 md:px-8 pb-10">
          <AnimatePresence mode="wait">

            {/* PROFILE SETUP */}
            {needsProfile && (
              <motion.div key="profile" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full">
                <ProfileSetup />
              </motion.div>
            )}

            {/* HOME */}
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

            {/* SEARCH RESULTS */}
            {showResults && searchState && (
              <motion.div key="results" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-6xl mx-auto mt-4 md:mt-6">
                {/* Summary bar */}
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 font-medium text-[13px] border-border/60 text-foreground hover:bg-muted/40 rounded-lg shrink-0 self-start sm:self-auto h-8"
                    onClick={handleEditSearch}
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </Button>
                </div>

                {/* Loading State */}
                {searchLoading && (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    <p className="text-[13px] text-muted-foreground">Fetching best offers for your route...</p>
                  </div>
                )}

                {/* Error State */}
                {searchError && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{searchError}</AlertDescription>
                  </Alert>
                )}

                {/* Success State */}
                {!searchLoading && !searchError && (
                  <>
                    {strip7days.length > 0 && (
                      <div className="mb-5">
                        <DateStrip
                          selectedDate={searchState.date}
                          onDateChange={handleDateChange}
                          strip7days={strip7days}
                        />
                      </div>
                    )}

                    {searchResults.length === 0 ? (
                      <EmptyState onReset={handleEditSearch} />
                    ) : (
                      renderOfferTiles(
                        searchResults,
                        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                      )
                    )}

                    <p className="text-xs text-muted-foreground/70 text-center mt-8 max-w-lg mx-auto leading-relaxed">
                      Offers sourced from public bank promotions. Final eligibility depends on platform & bank terms.
                    </p>
                  </>
                )}
              </motion.div>
            )}

            {/* ALL OFFERS */}
            {showAllOffers && featureFlags.allOffers && (
              <motion.div key="all-offers" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-6xl mx-auto mt-4 md:mt-6">
                <h2 className="text-xl md:text-3xl font-display font-bold text-foreground mb-1">
                  All Card Offers
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  Browse every active card offer across major travel platforms.
                </p>

                {allOffersLoading && (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading all offers...</p>
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
                        bankFilter={bankFilter}
                        onBankFilterChange={setBankFilter}
                        platformFilter={platformFilter}
                        onPlatformFilterChange={setPlatformFilter}
                        paymentFilter={paymentFilter}
                        onPaymentFilterChange={setPaymentFilter}
                        onResetAll={handleResetFilters}
                      />
                    </div>
                    <div className="flex-1">
                      {filteredAllOffers.length === 0 ? (
                        <EmptyState onReset={handleResetFilters} />
                      ) : (
                        renderOfferTiles(
                          filteredAllOffers,
                          "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                        )
                      )}
                      <p className="text-xs text-muted-foreground/70 text-center mt-8 max-w-lg mx-auto leading-relaxed">
                        Offers sourced from public bank promotions. Final eligibility depends on platform & bank terms.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ALL OFFERS — Disabled by feature flag */}
            {showAllOffers && !featureFlags.allOffers && (
              <motion.div key="all-offers-disabled" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-6xl mx-auto mt-4 md:mt-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    All Offers catalog is currently unavailable. Please check back later.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* CONTENT SECTIONS */}
            {showAbout && (
              <motion.div key="about" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-6xl mx-auto py-6 md:py-8">
                <AboutSection />
              </motion.div>
            )}
            {showHowItWorks && (
              <motion.div key="how-it-works" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-6xl mx-auto py-6 md:py-8">
                <HowItWorksSection />
              </motion.div>
            )}
            {showContact && (
              <motion.div key="contact" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-6xl mx-auto py-6 md:py-8">
                <ContactSection />
              </motion.div>
            )}

          </AnimatePresence>

          {/* FAQ on home */}
          {showHome && !needsProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.35 }}
              className="w-full max-w-6xl mx-auto mt-12 mb-4"
            >
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
