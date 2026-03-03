/**
 * Index.mock.tsx - Mock version for testing UI without backend
 * This version uses mock data and mock API calls
 * Switch to this file to test UI independently
 */

import { useState, useMemo, useEffect } from "react";
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
import { ArrowRight, Pencil, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CityOption } from "@/components/CityAutocomplete";
import { MAX_FREE_OFFERS, DEFAULT_FEATURE_FLAGS, ERROR_MESSAGES } from "@/constants";
import {
  transformSearchResponse,
  transformAllOffers,
  type OfferTile,
  type FeatureFlags,
  type SearchResponse,
  type OfferResponse,
} from "@/services/api";
import {
  mockSearchOffers,
  mockFetchAllOffers,
  mockFetchFeatureFlags,
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

const IndexMock = () => {
  const { needsProfile, isLoggedIn } = useAuth();
  const [activeSection, setActiveSection] = useState<ActiveSection>("home");
  const [searchState, setSearchState] = useState<SearchState | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [bankFilter, setBankFilter] = useState<string[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<string[]>([]);

  // API State
  const [searchResults, setSearchResults] = useState<OfferTile[]>([]);
  const [allOffers, setAllOffers] = useState<OfferTile[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    allOffers: true,
    savedCards: false,
    authRequiredForAllOffers: true,
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [allOffersLoading, setAllOffersLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [allOffersError, setAllOffersError] = useState<string | null>(null);

  const hasSearched = searchState !== null;

  // Load feature flags on mount
  useEffect(() => {
    loadFeatureFlags();
  }, []);

  const loadFeatureFlags = async () => {
    try {
      const flags = await mockFetchFeatureFlags();
      setFeatureFlags(flags);
      console.log("✅ Feature flags loaded from mock:", flags);
    } catch (err) {
      console.error("Failed to load feature flags:", err);
      // Use defaults on error
    }
  };

  // Load all offers when All Offers section is accessed
  const handleAllOffersClick = async () => {
    setAllOffersLoading(true);
    setAllOffersError(null);
    try {
      const offers = await mockFetchAllOffers(isLoggedIn);
      console.log(`✅ Fetched ${offers.length} offers from mock API (${isLoggedIn ? "authenticated" : "guest"})`);
      const transformed = transformAllOffers(offers);
      setAllOffers(transformed);
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

    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const response = await mockSearchOffers(from.code, to.code, dateStr, isLoggedIn);
      console.log(`✅ Mock search completed: ${response.offers.length} offers for ${from.city} → ${to.city}`);
      const transformed = transformSearchResponse(response);
      setSearchResults(transformed);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch offers. Please try again.";
      setSearchError(errorMsg);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleEditSearch = () => setActiveSection("home");

  const handleDateChange = (newDate: Date) => {
    if (searchState) {
      setSearchState({ ...searchState, date: newDate });
      setSearchError(null);
      setSearchLoading(true);

      mockSearchOffers(
        searchState.from.code,
        searchState.to.code,
        format(newDate, "yyyy-MM-dd"),
        isLoggedIn
      )
        .then((response) => {
          const transformed = transformSearchResponse(response);
          setSearchResults(transformed);
        })
        .catch((err) => {
          setSearchError(err instanceof Error ? err.message : "Failed to fetch offers");
        })
        .finally(() => setSearchLoading(false));
    }
  };

  const handleAuthClick = () => {
    setShowLoginModal(true);
  };

  const visibleOffers = useMemo(() => {
    const offers = hasSearched ? searchResults : [];
    if (isLoggedIn) return offers;
    return offers.slice(0, MAX_FREE_OFFERS);
  }, [searchResults, hasSearched, isLoggedIn]);

  return (
    <GlobalLoginGate onLoginClick={handleAuthClick} totalOffers={searchResults.length}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {showLoginModal && <AuthModal open={true} onClose={() => setShowLoginModal(false)} />}
        {needsProfile && <ProfileSetup />}

        <Header activeSection={activeSection} setActiveSection={setActiveSection} />

        <AnimatePresence mode="wait">
          {activeSection === "home" && (
            <motion.div
              key="home"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative"
            >
              <div
                className="absolute inset-0 h-[500px] bg-cover bg-center opacity-10"
                style={{ backgroundImage: `url(${skyBg})` }}
              />

              <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-center mb-8 max-w-2xl"
                >
                  <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                    Find Best Flight Offers
                  </h1>
                  <p className="text-xl text-gray-600">
                    Compare exclusive deals from all major platforms in one place
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <SearchCard onSearch={handleSearch} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mt-12"
                >
                  <TrustIndicators />
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeSection === "results" && hasSearched && searchState && (
            <motion.div
              key="results"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="py-12 px-4"
            >
              <div className="max-w-7xl mx-auto">
                {/* Edit Search Button */}
                <button
                  onClick={handleEditSearch}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
                >
                  <Pencil size={18} />
                  <span>Edit Search</span>
                </button>

                {/* Search Summary */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-8">
                      <div>
                        <p className="text-sm text-gray-500">From</p>
                        <p className="text-lg font-semibold">{searchState.from.city}</p>
                      </div>
                      <ArrowRight className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">To</p>
                        <p className="text-lg font-semibold">{searchState.to.city}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="text-lg font-semibold">
                          {format(searchState.date, "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date Strip */}
                <DateStrip
                  baseDate={searchState.date}
                  onDateChange={handleDateChange}
                  prices={[1600, 1610, 1620, 1630, 1640, 1650, 1660]}
                />

                {/* Filters */}
                <div className="my-8">
                  <SidebarFilters
                    bankFilter={bankFilter}
                    platformFilter={platformFilter}
                    paymentFilter={paymentFilter}
                    onBankFilterChange={setBankFilter}
                    onPlatformFilterChange={setPlatformFilter}
                    onPaymentFilterChange={setPaymentFilter}
                  />
                </div>

                {/* Loading State */}
                {searchLoading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                      <p className="text-gray-600">Loading offers...</p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {searchError && (
                  <Alert className="mb-8 bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-600">
                      {searchError}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Results */}
                {!searchLoading && !searchError && visibleOffers.length === 0 && (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No offers found</p>
                  </div>
                )}

                {/* Auth Gate Message */}
                {!isLoggedIn && searchResults.length > MAX_FREE_OFFERS && (
                  <Alert className="mb-8 bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="flex items-center justify-between">
                      <span className="text-blue-600">
                        Sign in to see all {searchResults.length} offers
                      </span>
                      <Button
                        size="sm"
                        onClick={handleAuthClick}
                        className="ml-4 bg-blue-600 hover:bg-blue-700"
                      >
                        Sign In
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Offers Grid */}
                {!searchLoading && visibleOffers.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visibleOffers.map((offer) => (
                      <OfferCard
                        key={offer.id}
                        offer={offer}
                        onCTAClick={() => window.open(offer.ctaUrl, "_blank")}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeSection === "all-offers" && (
            <motion.div
              key="all-offers"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="py-12 px-4"
            >
              <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold mb-8">All Available Offers</h2>

                {/* Filters */}
                <div className="my-8">
                  <SidebarFilters
                    bankFilter={bankFilter}
                    platformFilter={platformFilter}
                    paymentFilter={paymentFilter}
                    onBankFilterChange={setBankFilter}
                    onPlatformFilterChange={setPlatformFilter}
                    onPaymentFilterChange={setPaymentFilter}
                  />
                </div>

                {/* Loading */}
                {allOffersLoading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                )}

                {/* Error */}
                {allOffersError && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-600">{allOffersError}</AlertDescription>
                  </Alert>
                )}

                {/* Results */}
                {!allOffersLoading && filteredAllOffers.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAllOffers.map((offer) => (
                      <OfferCard
                        key={offer.id}
                        offer={offer}
                        onCTAClick={() => window.open(offer.ctaUrl, "_blank")}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeSection === "about" && (
            <motion.div
              key="about"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AboutSection />
            </motion.div>
          )}

          {activeSection === "how-it-works" && (
            <motion.div
              key="how-it-works"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <HowItWorksSection />
            </motion.div>
          )}

          {activeSection === "contact" && (
            <motion.div
              key="contact"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <ContactSection />
            </motion.div>
          )}

          {activeSection === "faq" && (
            <motion.div
              key="faq"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <FAQSection />
            </motion.div>
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </GlobalLoginGate>
  );
};

export default IndexMock;
