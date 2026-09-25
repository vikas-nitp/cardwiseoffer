import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import Header from "@/components/Header";
import type { ActiveSection } from "@/components/Header";
import Footer from "@/components/Footer";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useFeatureFlags } from "@/contexts/FeatureFlagContext";
import { resolveFeatureCapabilities } from "@/config/featureCapabilities";
import { useAuth } from "@/contexts/AuthContext";
import { analytics } from "@/services/analytics";
import { useUserCards } from "@/hooks/useUserCards";
import { useOfferSearch } from "@/hooks/useOfferSearch";
import { useAllOffers } from "@/hooks/useAllOffers";
import HomeSection from "@/pages/sections/HomeSection";
import ResultsSection from "@/pages/sections/ResultsSection";
import StarField from "@/components/StarField";

const SplashScreen = lazy(() => import("@/components/SplashScreen"));
const AllOffersSection = lazy(() => import("@/pages/sections/AllOffersSection"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
const HowItWorksSection = lazy(() => import("@/components/HowItWorksSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));

const Index = () => {
  const { flags: featureFlags } = useFeatureFlags();
  const capabilities = useMemo(() => resolveFeatureCapabilities(featureFlags), [featureFlags]);
  const [activeSection, setActiveSection] = useState<ActiveSection>("home");
  const [splashDone, setSplashDone] = useState(!capabilities.splashScreen);
  const { isSignedIn, openSignIn } = useAuth();

  const { cards: userCards } = useUserCards({
    enabled: isSignedIn && capabilities.userCards,
  });

  useEffect(
    () => analytics.configure(capabilities.analytics, capabilities.cookieConsent),
    [capabilities.analytics, capabilities.cookieConsent],
  );

  const {
    searchState, formDate, searchResults, strip7days,
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
      {!splashDone && (
        <Suspense fallback={null}>
          <SplashScreen onDone={() => setSplashDone(true)} />
        </Suspense>
      )}
      <div className="pointer-events-none fixed inset-0 z-0 page-ground" />
      <StarField />

      <div className="relative z-10 flex flex-col h-full">
        <Header
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          allOffersEnabled={capabilities.publicAllOffers}
          authEnabled={capabilities.auth}
          howItWorksEnabled={capabilities.howItWorks}
          userCardsEnabled={capabilities.userCards}
        />

        <main className={`flex-1 min-h-0 flex flex-col items-center px-4 md:px-8 pb-4 scrollbar-hide ${
          (showHome || activeSection === "about" || activeSection === "contact") ? "overflow-hidden" : "overflow-y-auto"
        }`}>
          {showHome && (
            <div className="page-fade-in w-full flex flex-col items-center">
              <HomeSection searchState={searchState} formDate={formDate} onSearch={handleSearchAndNavigate} />
            </div>
          )}

          {showResults && searchState && (
            <div className="page-fade-in w-full">
              <ResultsSection
                searchState={searchState}
                searchLoading={searchLoading}
                searchError={searchError}
                searchResults={searchResults}
                strip7days={strip7days}
                onDateChange={handleDateChange}
                onEditSearch={() => setActiveSection("home")}
              />
            </div>
          )}

          {showAllOffers && capabilities.publicAllOffers && (
            <Suspense fallback={null}>
              <div className="page-fade-in w-full">
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
                  authEnabled={capabilities.auth}
                  isSignedIn={isSignedIn}
                  onSignIn={openSignIn}
                  userCards={userCards}
                />
              </div>
            </Suspense>
          )}

          {showAllOffers && !capabilities.publicAllOffers && (
            <div className="page-fade-in w-full max-w-6xl mx-auto mt-4 md:mt-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>All Offers catalog is currently unavailable. Please check back later.</AlertDescription>
              </Alert>
            </div>
          )}

          {activeSection === "about" && capabilities.about && (
            <Suspense fallback={null}>
              <div className="page-fade-in w-full max-w-6xl mx-auto py-8 md:py-12 flex-1 flex flex-col justify-center">
                <AboutSection />
              </div>
            </Suspense>
          )}

          {activeSection === "how-it-works" && capabilities.howItWorks && (
            <Suspense fallback={null}>
              <div className="page-fade-in w-full max-w-6xl mx-auto py-4 md:py-6 flex flex-col gap-5">
                <HowItWorksSection />
                <FAQSection />
              </div>
            </Suspense>
          )}

          {activeSection === "contact" && capabilities.contact && (
            <Suspense fallback={null}>
              <div className="page-fade-in w-full max-w-6xl mx-auto py-8 md:py-12 flex-1 flex flex-col justify-center">
                <ContactSection />
              </div>
            </Suspense>
          )}
        </main>

        <Footer onSectionChange={setActiveSection} />
      </div>
    </div>
  );
};

export default Index;
