import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import type { ActiveSection } from "@/components/Header";
import Footer from "@/components/Footer";
import SearchCard from "@/components/SearchCard";
import TrustIndicators from "@/components/TrustIndicators";
import AboutSection from "@/components/AboutSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ContactSection from "@/components/ContactSection";
import FAQSection from "@/components/FAQSection";
import ProfileSetup from "@/components/ProfileSetup";
import GlobalLoginGate from "@/components/GlobalLoginGate";
import LockedOfferCard from "@/components/LockedOfferCard";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import DateStrip from "@/components/DateStrip";
import SidebarFilters from "@/components/SidebarFilters";
import OfferCard from "@/components/OfferCard";
import { Skeleton } from "@/components/ui/skeleton";
import skyBg from "@/assets/sky-bg-2.png";
import { format } from "date-fns";
import { ArrowRight, Pencil, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CityOption, OfferTile, SearchRequest, DateStripEntry } from "@/types/api";
import { useMeta, useSearch, useOffers } from "@/hooks/useApi";
import { isFeatureEnabled } from "@/config/featureFlags";
import { toast } from "@/hooks/use-toast";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const MAX_FREE_OFFERS = 2;

const Index = () => {
  const { needsProfile, isLoggedIn } = useAuth();
  const [activeSection, setActiveSection] = useState<ActiveSection>("home");
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Search state
  const [searchFrom, setSearchFrom] = useState<CityOption | null>(null);
  const [searchTo, setSearchTo] = useState<CityOption | null>(null);
  const [searchDate, setSearchDate] = useState<Date | undefined>();
  const [searchBanks, setSearchBanks] = useState<string[]>([]);
  const [searchReq, setSearchReq] = useState<SearchRequest | null>(null);

  // All Offers filters
  const [bankFilter, setBankFilter] = useState<string[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<string[]>([]);

  // API hooks
  const meta = useMeta();
  const cities = meta.data?.cities ?? [];

  const searchResult = useSearch(searchReq);
  const offersFilters = useMemo(() => {
    const f: any = {};
    if (bankFilter.length) f.bank = bankFilter;
    if (platformFilter.length) f.platform = platformFilter;
    if (paymentFilter.length) f.paymentType = paymentFilter;
    return Object.keys(f).length ? f : undefined;
  }, [bankFilter, platformFilter, paymentFilter]);
  const allOffersResult = useOffers(activeSection === "all-offers" ? offersFilters : undefined);

  const hasSearched = searchReq !== null;

  const handleSearch = (from: CityOption, to: CityOption, date: Date, banks: string[]) => {
    setSearchFrom(from);
    setSearchTo(to);
    setSearchDate(date);
    setSearchBanks(banks);
    setSearchReq({
      from: from.code,
      to: to.code,
      date: format(date, "yyyy-MM-dd"),
      banks,
    });
    setActiveSection("results");
  };

  const handleEditSearch = () => setActiveSection("home");

  const handleDateChange = (dateStr: string) => {
    if (!searchReq) return;
    setSearchDate(new Date(dateStr));
    setSearchReq({ ...searchReq, date: dateStr });
  };

  const handleSectionChange = useCallback((section: ActiveSection) => {
    if (section === "all-offers" && !isFeatureEnabled("allOffers")) {
      toast({ title: "Feature unavailable", description: "All Offers is currently disabled." });
      return;
    }
    // Clear All Offers filters when navigating to it
    if (section === "all-offers") {
      setBankFilter([]);
      setPlatformFilter([]);
      setPaymentFilter([]);
    }
    setActiveSection(section);
  }, []);

  const showHome = activeSection === "home";
  const showResults = activeSection === "results" && hasSearched;
  const showAllOffers = activeSection === "all-offers";
  const showAbout = activeSection === "about";
  const showHowItWorks = activeSection === "how-it-works";
  const showContact = activeSection === "contact";

  const renderOfferTiles = (offers: OfferTile[], wrapperClass: string, loading?: boolean, error?: string | null, retry?: () => void) => {
    if (loading) {
      return (
        <div className={wrapperClass}>
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card rounded-2xl p-5 space-y-4">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="glass-card rounded-2xl card-shadow-lg p-10 text-center max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
          <h3 className="font-display font-bold text-foreground mb-2">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          {retry && (
            <Button variant="outline" onClick={retry} className="gap-2 rounded-xl">
              <RefreshCw className="w-4 h-4" /> Try Again
            </Button>
          )}
        </div>
      );
    }

    if (!offers.length) {
      return (
        <div className="glass-card rounded-2xl card-shadow-lg p-10 text-center max-w-md mx-auto">
          <p className="text-muted-foreground">No offers found. Try adjusting your filters.</p>
        </div>
      );
    }

    if (!isLoggedIn) {
      const preview = offers.slice(0, MAX_FREE_OFFERS);
      const lockedCount = Math.min(offers.length - MAX_FREE_OFFERS, 3);
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
            {Array.from({ length: lockedCount }, (_, i) => (
              <motion.div
                key={`locked-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (preview.length + i) * 0.08, duration: 0.3 }}
              >
                <LockedOfferCard />
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
        <Header activeSection={activeSection} onSectionChange={handleSectionChange} />

        <main className="flex-1 flex flex-col items-center px-4 md:px-6 pb-8">
          <AnimatePresence mode="wait">

            {/* HOME */}
            {showHome && (
              <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full flex flex-col items-center">
                <section className="flex flex-col items-center justify-center pt-10 md:pt-20 pb-6 max-w-2xl mx-auto text-center px-4">
                  <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight leading-tight">
                    <span className="text-gradient">Compare card offers.</span>
                    <br />
                    <span className="text-primary">Book smarter.</span>
                  </h1>
                  <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed max-w-lg">
                    See which credit card saves the most on your next flight — across platforms, with no bias.
                  </p>
                </section>

                {meta.loading ? (
                  <div className="w-full max-w-5xl mx-auto glass-card rounded-2xl p-8 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
                    </div>
                    <Skeleton className="h-12 rounded-xl" />
                  </div>
                ) : (
                  <SearchCard
                    cities={cities}
                    onSearch={handleSearch}
                    initialFrom={searchFrom}
                    initialTo={searchTo}
                    initialDate={searchDate}
                    initialBanks={searchBanks}
                  />
                )}

                <TrustIndicators />
              </motion.div>
            )}

            {/* SEARCH RESULTS */}
            {showResults && searchResult.data && (
              <motion.div key="results" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-6xl mx-auto mt-4 md:mt-6">
                {/* Summary bar */}
                <div className="glass-card rounded-2xl card-shadow-lg p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-2 flex-wrap text-sm md:text-base">
                    <span className="font-display font-bold text-foreground">
                      {searchResult.data.from.city}
                      <span className="text-muted-foreground font-normal text-xs ml-1">({searchResult.data.from.code})</span>
                    </span>
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <ArrowRight className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="font-display font-bold text-foreground">
                      {searchResult.data.to.city}
                      <span className="text-muted-foreground font-normal text-xs ml-1">({searchResult.data.to.code})</span>
                    </span>
                    <span className="text-border hidden sm:inline">|</span>
                    <span className="font-bold text-foreground text-sm">{searchDate ? format(searchDate, "dd MMM yyyy") : ""}</span>
                    {searchBanks.length > 0 && (
                      <>
                        <span className="text-border hidden sm:inline">|</span>
                        {searchBanks.map((b) => (
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

                {/* Date strip */}
                <div className="mb-5">
                  <DateStrip
                    entries={searchResult.data.dateStrip}
                    selectedDate={searchReq!.date}
                    onDateChange={handleDateChange}
                  />
                </div>

                {/* Offer tiles */}
                {renderOfferTiles(
                  searchResult.data.offers,
                  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
                  searchResult.loading,
                  searchResult.error,
                  searchResult.retry,
                )}

                <p className="text-xs text-muted-foreground/70 text-center mt-8 max-w-lg mx-auto leading-relaxed">
                  Offers sourced from public bank promotions. Final eligibility depends on platform & bank terms.
                </p>
              </motion.div>
            )}

            {/* Search loading */}
            {showResults && searchResult.loading && !searchResult.data && (
              <motion.div key="results-loading" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-6xl mx-auto mt-6">
                {renderOfferTiles([], "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", true)}
              </motion.div>
            )}

            {/* Search error */}
            {showResults && searchResult.error && !searchResult.data && (
              <motion.div key="results-error" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-6xl mx-auto mt-6">
                {renderOfferTiles([], "", false, searchResult.error, searchResult.retry)}
              </motion.div>
            )}

            {/* ALL OFFERS — independent global catalog */}
            {showAllOffers && (
              <motion.div key="all-offers" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-6xl mx-auto mt-4 md:mt-6">
                <h2 className="text-xl md:text-3xl font-display font-bold text-foreground mb-1">
                  All Card Offers
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  Browse every active card offer across major travel platforms.
                </p>

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
                    {renderOfferTiles(
                      allOffersResult.data?.offers ?? [],
                      "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4",
                      allOffersResult.loading,
                      allOffersResult.error,
                      allOffersResult.retry,
                    )}
                    <p className="text-xs text-muted-foreground/70 text-center mt-8 max-w-lg mx-auto leading-relaxed">
                      Offers sourced from public bank promotions. Final eligibility depends on platform & bank terms.
                    </p>
                  </div>
                </div>
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
          {showHome && (
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

        <Footer />
      </div>

      {/* Profile overlay — full screen gate */}
      {needsProfile && <ProfileSetup />}

      <AuthModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
};

export default Index;
