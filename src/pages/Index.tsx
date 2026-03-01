import { useState, useMemo } from "react";
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
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import DateStrip from "@/components/DateStrip";
import SidebarFilters from "@/components/SidebarFilters";
import OfferCard from "@/components/OfferCard";
import skyBg from "@/assets/sky-bg-2.png";
import { format } from "date-fns";
import { ArrowRight, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CityOption } from "@/components/CityAutocomplete";
import {
  fetchSearchResults,
  fetchAllOffers,
  findBestOffer,
  hashCode,
} from "@/services/mockApi";

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

const MAX_FREE_OFFERS = 2;

const Index = () => {
  const { needsProfile, isLoggedIn } = useAuth();
  const [activeSection, setActiveSection] = useState<ActiveSection>("home");
  const [searchState, setSearchState] = useState<SearchState | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [bankFilter, setBankFilter] = useState<string[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<string[]>([]);

  const hasSearched = searchState !== null;

  const handleSearch = (from: CityOption, to: CityOption, date: Date, banks: string[]) => {
    setSearchState({ from, to, date, banks });
    setActiveSection("results");
    setBankFilter([]);
    setPlatformFilter([]);
    setPaymentFilter([]);
  };

  const handleEditSearch = () => setActiveSection("home");

  const handleDateChange = (newDate: Date) => {
    if (searchState) setSearchState({ ...searchState, date: newDate });
  };

  const getMinPrice = (date: Date) => {
    if (!searchState) return 0;
    const seed = hashCode(`${searchState.from.code}-${searchState.to.code}-${format(date, "yyyy-MM-dd")}`);
    return findBestOffer(seed).bestDiscount;
  };

  const searchResults = useMemo(() => {
    if (!searchState) return [];
    return fetchSearchResults(searchState.from, searchState.to, searchState.date, searchState.banks);
  }, [searchState]);

  // All Offers is always independent — no route state
  const allOffers = useMemo(() => fetchAllOffers(), []);

  const filteredAllOffers = useMemo(() => {
    return allOffers.filter((o) => {
      if (bankFilter.length > 0 && o.bank && !bankFilter.includes(o.bank)) return false;
      if (platformFilter.length > 0 && !platformFilter.includes(o.platform)) return false;
      if (paymentFilter.length > 0 && !paymentFilter.includes(o.paymentType)) return false;
      return true;
    });
  }, [allOffers, bankFilter, platformFilter, paymentFilter]);

  const showHome = activeSection === "home";
  const showResults = activeSection === "results" && hasSearched;
  const showAllOffers = activeSection === "all-offers";
  const showAbout = activeSection === "about";
  const showHowItWorks = activeSection === "how-it-works";
  const showContact = activeSection === "contact";

  const renderOfferTiles = (offers: typeof searchResults, wrapperClass: string) => {
    if (!isLoggedIn) {
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
        <Header activeSection={activeSection} onSectionChange={setActiveSection} />

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

                <SearchCard
                  onSearch={handleSearch}
                  initialFrom={searchState?.from ?? null}
                  initialTo={searchState?.to ?? null}
                  initialDate={searchState?.date ?? undefined}
                  initialBanks={searchState?.banks ?? []}
                />

                <TrustIndicators />
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

                {/* Date strip */}
                <div className="mb-5">
                  <DateStrip
                    selectedDate={searchState.date}
                    onDateChange={handleDateChange}
                    getMinPrice={getMinPrice}
                  />
                </div>

                {/* Offer tiles */}
                {renderOfferTiles(
                  searchResults,
                  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                )}

                <p className="text-xs text-muted-foreground/70 text-center mt-8 max-w-lg mx-auto leading-relaxed">
                  Offers sourced from public bank promotions. Final eligibility depends on platform & bank terms.
                </p>
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

        <Footer />
      </div>

      <AuthModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
};

export default Index;
