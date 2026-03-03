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
import { ArrowRight, Pencil, AlertCircle, Loader2 } from "lucide-react";
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

// Backend response types for 7-day strip
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

  // API State
  const [searchResults, setSearchResults] = useState<OfferTile[]>([]);
  const [strip7days, setStrip7days] = useState<PriceStripDay[]>([]);
  const [allOffers, setAllOffers] = useState<OfferTile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [allOffersLoading, setAllOffersLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [allOffersError, setAllOffersError] = useState<string | null>(null);

  const hasSearched = searchState !== null;
  
  // Derived state from feature flags
  const authEnabled = featureFlags.authEnabled;
  const offerLockingEnabled = featureFlags.offerLockingEnabled;

  // Load all offers when All Offers section is accessed
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

  // Update activeSection to trigger all offers load
  useEffect(() => {
    if (activeSection === "all-offers" && allOffers.length === 0 && !allOffersLoading) {
      handleAllOffersClick();
    }
  }, [activeSection]);

  const filteredAllOffers = useMemo(() => {
    return allOffers.filter((o) => {
      if (bankFilter.length > 0 && o.bank && !bankFilter.includes(o.bank)) return false;
      if (platformFilter.length > 0 && !platformFilter.includes(o.platform)) return false;
      if (paymentFilter.length > 0 && !paymentFilter.includes(o.paymentType)) return false;
      return true;
    });
  }, [allOffers, bankFilter, platformFilter, paymentFilter]);

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

  // Handle date change from strip - re-fetch with new date
  const handleDateChange = async (newDate: Date) => {
    if (!searchState) return;
    
    // Update local state
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
    // If auth is disabled OR offer locking is disabled, show all offers without login gate
    const shouldShowLoginGate = authEnabled && offerLockingEnabled && !isLoggedIn;
    
    if (shouldShowLoginGate) {
      // Show limited offers + global login gate
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

    // Show all offers without login gate
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

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${skyBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "blur(1px)",
          }}
        />
        <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px]" />
        <div className="absolute top-20 left-[10%] w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-[10%] w-80 h-80 rounded-full bg-accent/5 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
          authEnabled={authEnabled}
        />

        <main className="flex-1 flex flex-col items-center px-4 md:px-6 pb-8">
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
                <section className="flex flex-col items-center justify-center pt-12 md:pt-24 pb-8 max-w-2xl mx-auto text-center px-4">
                  <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight leading-[1.15]">
                    <span className="text-gradient">Compare card offers.</span>
                    <br />
                    <span className="text-primary">Book smarter.</span>
                  </h1>
                  <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed max-w-lg font-medium">
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
                <div className="glass-card rounded-2xl card-shadow-lg p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-2 flex-wrap text-sm md:text-base">
                    <span className="font-display font-bold text-foreground">
                      {searchState.from.city}
                      <span className="text-muted-foreground font-normal text-xs ml-1">({searchState.from.code})</span>
                    </span>
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <ArrowRight className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="font-display font-bold text-foreground">
                      {searchState.to.city}
                      <span className="text-muted-foreground font-normal text-xs ml-1">({searchState.to.code})</span>
                    </span>
                    <span className="text-border hidden sm:inline">|</span>
                    <span className="font-bold text-foreground text-sm">{format(searchState.date, "dd MMM yyyy")}</span>
                    {searchState.banks.length > 0 && (
                      <>
                        <span className="text-border hidden sm:inline">|</span>
                        {searchState.banks.map((b) => (
                          <span key={b} className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">{b}</span>
                        ))}
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 font-semibold border-primary/30 text-primary hover:bg-primary/5 rounded-xl shrink-0 self-start sm:self-auto"
                    onClick={handleEditSearch}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Search
                  </Button>
                </div>

                {/* Loading State */}
                {searchLoading && (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Fetching best offers for your route...</p>
                  </div>
                )}

                {/* Error State */}
                {searchError && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {searchError}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Success State */}
                {!searchLoading && !searchError && (
                  <>
                    {/* Date strip - backend driven, always 7 days */}
                    {strip7days.length > 0 && (
                      <div className="mb-5">
                        <DateStrip
                          selectedDate={searchState.date}
                          onDateChange={handleDateChange}
                          strip7days={strip7days}
                        />
                      </div>
                    )}

                    {/* Offer tiles */}
                    {renderOfferTiles(
                      searchResults,
                      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    )}

                    <p className="text-xs text-muted-foreground/70 text-center mt-8 max-w-lg mx-auto leading-relaxed">
                      Offers sourced from public bank promotions. Final eligibility depends on platform & bank terms.
                    </p>
                  </>
                )}
              </motion.div>
            )}

            {/* ALL OFFERS — independent global catalog */}
            {showAllOffers && featureFlags.allOffers && (
              <motion.div key="all-offers" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-6xl mx-auto mt-4 md:mt-6">
                <h2 className="text-xl md:text-3xl font-display font-bold text-foreground mb-1">
                  All Card Offers
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  Browse every active card offer across major travel platforms.
                </p>

                {/* Loading State */}
                {allOffersLoading && (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading all offers...</p>
                  </div>
                )}

                {/* Error State */}
                {allOffersError && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {allOffersError}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Success State */}
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
                      />
                    </div>
                    <div className="flex-1">
                      {filteredAllOffers.length === 0 ? (
                        <div className="glass-card rounded-2xl card-shadow-lg p-10 text-center">
                          <p className="text-muted-foreground">No offers match your filters. Try adjusting filters.</p>
                        </div>
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
