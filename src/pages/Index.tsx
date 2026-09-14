import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import type { ActiveSection } from "@/components/Header";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ContactSection from "@/components/ContactSection";
import FAQSection from "@/components/FAQSection";
import TrustDisclaimer from "@/components/TrustDisclaimer";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useFeatureFlags } from "@/contexts/FeatureFlagContext";
import { resolveFeatureCapabilities } from "@/config/featureCapabilities";
import { analytics } from "@/services/analytics";
import { useOfferSearch } from "@/hooks/useOfferSearch";
import { useAllOffers } from "@/hooks/useAllOffers";
import HomeSection from "@/pages/sections/HomeSection";
import ResultsSection from "@/pages/sections/ResultsSection";
import AllOffersSection from "@/pages/sections/AllOffersSection";

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.22, ease: "easeOut" as const } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: "easeIn" as const } },
};

const Index = () => {
  const { flags: featureFlags } = useFeatureFlags();
  const capabilities = useMemo(() => resolveFeatureCapabilities(featureFlags), [featureFlags]);
  const [activeSection, setActiveSection] = useState<ActiveSection>("home");

  useEffect(() => analytics.configure(capabilities.analytics), [capabilities.analytics]);

  const {
    searchState, searchResults, strip7days,
    searchLoading, searchError,
    handleSearch, handleDateChange,
  } = useOfferSearch();

  const {
    filteredAllOffers, allOffersLoading, allOffersError,
    bankFilter, platformFilter, paymentFilter, channelFilter,
    offersPage, setOffersPage, offersTotalPages, offersTotalCount,
    offersLimit, setOffersLimit,
    handleBankFilterChange, handlePlatformFilterChange, handlePaymentFilterChange, handleChannelFilterChange,
    handleResetFilters,
  } = useAllOffers(activeSection === "all-offers", capabilities.publicAllOffers);

  const showHome = activeSection === "home";
  const showResults = activeSection === "results" && searchState !== null;
  const showAllOffers = activeSection === "all-offers";

  const handleSearchAndNavigate = async (
    ...args: Parameters<typeof handleSearch>
  ) => {
    setActiveSection("results");
    await handleSearch(...args);
  };

  return (
    <div className="h-screen w-full min-w-0 overflow-hidden flex flex-col relative">
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 sovereign-ground" />

      <div className="relative z-10 flex flex-col h-full">
        <Header
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          allOffersEnabled={capabilities.publicAllOffers}
          authEnabled={capabilities.auth}
        />

        <main className={`flex-1 min-h-0 flex flex-col items-center px-4 md:px-8 pb-4 scrollbar-hide ${
          (showHome || activeSection === "about" || activeSection === "contact") ? "overflow-hidden" : "overflow-y-auto"
        }`}>
          <AnimatePresence mode="wait">
            {showHome && (
              <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full flex flex-col items-center">
                <HomeSection searchState={searchState} onSearch={handleSearchAndNavigate} />
              </motion.div>
            )}

            {showResults && searchState && (
              <motion.div key="results" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full">
                <ResultsSection
                  searchState={searchState}
                  searchLoading={searchLoading}
                  searchError={searchError}
                  searchResults={searchResults}
                  strip7days={strip7days}
                  onDateChange={handleDateChange}
                  onEditSearch={() => setActiveSection("home")}
                />
              </motion.div>
            )}

            {showAllOffers && capabilities.publicAllOffers && (
              <motion.div key="all-offers" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full">
                <AllOffersSection
                  filteredAllOffers={filteredAllOffers}
                  allOffersLoading={allOffersLoading}
                  allOffersError={allOffersError}
                  bankFilter={bankFilter}
                  platformFilter={platformFilter}
                  paymentFilter={paymentFilter}
                  channelFilter={channelFilter}
                  offersPage={offersPage}
                  setOffersPage={setOffersPage}
                  offersTotalPages={offersTotalPages}
                  offersTotalCount={offersTotalCount}
                  offersLimit={offersLimit}
                  setOffersLimit={setOffersLimit}
                  onBankFilterChange={handleBankFilterChange}
                  onPlatformFilterChange={handlePlatformFilterChange}
                  onPaymentFilterChange={handlePaymentFilterChange}
                  onChannelFilterChange={handleChannelFilterChange}
                  onResetFilters={handleResetFilters}
                />
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

            {activeSection === "about" && (
              <motion.div key="about" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-6xl mx-auto py-8 md:py-12 flex-1 flex flex-col justify-center">
                <AboutSection />
              </motion.div>
            )}
            {activeSection === "how-it-works" && (
              <motion.div key="how-it-works" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-6xl mx-auto py-4 md:py-6 flex flex-col gap-5">
                <HowItWorksSection />
                <FAQSection />
              </motion.div>
            )}
            {activeSection === "contact" && (
              <motion.div key="contact" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-6xl mx-auto py-8 md:py-12 flex-1 flex flex-col justify-center">
                <ContactSection />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {showHome && <TrustDisclaimer />}
        <Footer onSectionChange={setActiveSection} />
      </div>
    </div>
  );
};

export default Index;
