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
import LockedOfferCard from "@/components/LockedOfferCard";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import DateStrip from "@/components/DateStrip";
import SidebarFilters from "@/components/SidebarFilters";
import OfferCard from "@/components/OfferCard";
import skyBg from "@/assets/sky-bg-2.png";
import { format } from "date-fns";
import { ArrowRight, Pencil, Star, TrendingUp, Gift, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CityOption } from "@/components/CityAutocomplete";

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

// --- Data utilities ---
const hashCode = (s: string) => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const buildPlatformUrl = (platform: string, fromCode: string, toCode: string, date: string) => {
  switch (platform) {
    case "MakeMyTrip":
      return `https://www.makemytrip.com/flight/search?itinerary=${fromCode}-${toCode}-${date}&tripType=O&paxType=A-1_C-0_I-0&cabinClass=E`;
    case "Cleartrip":
      return `https://www.cleartrip.com/flights/${fromCode}-${toCode}-${date}`;
    case "EaseMyTrip":
      return `https://www.easemytrip.com/flight-booking/${fromCode}-${toCode}-${date}`;
    case "Goibibo":
      return `https://www.goibibo.com/flights/${fromCode}-${toCode}-${date}`;
    default:
      return "#";
  }
};

const bankOffers: Record<string, { card: string; baseDiscount: number }[]> = {
  "HDFC Bank": [{ card: "HDFC Infinia", baseDiscount: 1200 }],
  "ICICI Bank": [{ card: "ICICI Sapphiro", baseDiscount: 1400 }],
  "SBI Card": [{ card: "SBI Elite", baseDiscount: 1000 }],
  "Axis Bank": [{ card: "Axis Vistara", baseDiscount: 1100 }],
  "Kotak Mahindra": [{ card: "Kotak Privy League", baseDiscount: 900 }],
  "American Express": [{ card: "Amex Platinum Travel", baseDiscount: 1500 }],
  "Yes Bank": [{ card: "Yes First Exclusive", baseDiscount: 800 }],
  "IndusInd Bank": [{ card: "IndusInd Legend", baseDiscount: 950 }],
  "RBL Bank": [{ card: "RBL ShopRite", baseDiscount: 700 }],
  "HSBC": [{ card: "HSBC Smart Value", baseDiscount: 850 }],
};

const allBankNames = Object.keys(bankOffers);
const allPlatforms = ["MakeMyTrip", "Cleartrip", "EaseMyTrip", "Goibibo"];

const priceVariation = (seed: number, base: number, idx: number) => {
  const variation = ((seed + idx * 137) % 500) - 200;
  return Math.max(300, base + variation);
};

const getBankDiscount = (seed: number, bankName: string) => {
  const idx = allBankNames.indexOf(bankName);
  return priceVariation(seed, bankOffers[bankName][0].baseDiscount, idx);
};

const findBestOffer = (seed: number) => {
  let bestDiscount = 0;
  let bestBank = "";
  allBankNames.forEach((bankName) => {
    const d = getBankDiscount(seed, bankName);
    if (d > bestDiscount) { bestDiscount = d; bestBank = bankName; }
  });
  return { bestBank, bestDiscount };
};

const findBestOtherOffer = (seed: number, excludeBanks: string[]) => {
  let bestDiscount = 0;
  let bestBank = "";
  allBankNames.forEach((bankName) => {
    if (excludeBanks.includes(bankName)) return;
    const d = getBankDiscount(seed, bankName);
    if (d > bestDiscount) { bestDiscount = d; bestBank = bankName; }
  });
  return { bestBank, bestDiscount };
};

const makeConditions = (seed: number, idx: number) => [
  `Min booking: ₹${3000 + (seed % 3) * 1000} – ₹9,999`,
  idx % 2 === 0 ? "Non-EMI transactions only" : "EMI & Non-EMI allowed",
  idx % 2 === 0 ? "Web & Mobile App" : "Mobile App only",
  "Domestic flights only",
  "Valid till 30 Apr 2026",
];

const generateSearchResults = (from: CityOption, to: CityOption, date: Date, banks: string[]) => {
  const dateStr = format(date, "yyyy-MM-dd");
  const seed = hashCode(`${from.code}-${to.code}-${dateStr}`);
  const tiles: any[] = [];
  const defaultDiscount = priceVariation(seed, 500, 99);
  const defaultPlatformIdx = (seed + 3) % allPlatforms.length;

  if (banks.length === 0) {
    const { bestBank, bestDiscount } = findBestOffer(seed);
    const pIdx = seed % allPlatforms.length;
    tiles.push({
      id: "best", label: "Best Offer", labelIcon: Star,
      accentClass: "bg-primary text-primary-foreground", accentBorder: "border-primary",
      platform: allPlatforms[pIdx],
      platformUrl: buildPlatformUrl(allPlatforms[pIdx], from.code, to.code, dateStr),
      bank: bestBank, card: bankOffers[bestBank][0].card, discount: bestDiscount,
      paymentType: "Credit Card", conditions: makeConditions(seed, 0),
    });
    tiles.push({
      id: "default", label: "Default Offer", labelIcon: Gift,
      accentClass: "bg-accent text-accent-foreground", accentBorder: "border-accent",
      platform: allPlatforms[defaultPlatformIdx],
      platformUrl: buildPlatformUrl(allPlatforms[defaultPlatformIdx], from.code, to.code, dateStr),
      bank: null, card: null, discount: defaultDiscount, paymentType: "No Card",
      conditions: ["Available for all users", "No minimum booking", "Valid till 25 Apr 2026", "Web & Mobile App", "Domestic flights only"],
    });
    return tiles;
  }

  const selectedDiscounts = banks.map((b) => ({
    bank: b, card: bankOffers[b]?.[0]?.card ?? b, discount: getBankDiscount(seed, b),
  }));
  const { bestBank: bestOtherBank, bestDiscount: bestOtherDiscount } = findBestOtherOffer(seed, banks);

  if (banks.length === 1) {
    const sel = selectedDiscounts[0];
    if (bestOtherDiscount > sel.discount) {
      tiles.push({ id: "selected-0", label: "Best Offer on Selected Card", labelIcon: CreditCard, accentClass: "bg-primary text-primary-foreground", accentBorder: "border-primary", platform: allPlatforms[seed % allPlatforms.length], platformUrl: buildPlatformUrl(allPlatforms[seed % allPlatforms.length], from.code, to.code, dateStr), bank: sel.bank, card: sel.card, discount: sel.discount, paymentType: "Credit Card", conditions: makeConditions(seed, 0) });
      tiles.push({ id: "best-other", label: "Best Offer on Other Card", extraLabel: `₹${bestOtherDiscount - sel.discount} more savings`, labelIcon: TrendingUp, accentClass: "bg-highlight text-highlight-foreground", accentBorder: "border-highlight", platform: allPlatforms[(seed + 1) % allPlatforms.length], platformUrl: buildPlatformUrl(allPlatforms[(seed + 1) % allPlatforms.length], from.code, to.code, dateStr), bank: bestOtherBank, card: bankOffers[bestOtherBank][0].card, discount: bestOtherDiscount, paymentType: "Credit Card", conditions: makeConditions(seed, 1) });
    } else {
      tiles.push({ id: "selected-0", label: "Best Offer on Selected Card", labelIcon: Star, accentClass: "bg-primary text-primary-foreground", accentBorder: "border-primary", platform: allPlatforms[seed % allPlatforms.length], platformUrl: buildPlatformUrl(allPlatforms[seed % allPlatforms.length], from.code, to.code, dateStr), bank: sel.bank, card: sel.card, discount: sel.discount, paymentType: "Credit Card", conditions: makeConditions(seed, 0) });
    }
  } else {
    const sel0 = selectedDiscounts[0];
    const sel1 = selectedDiscounts[1];
    const sameDiscount = sel0.discount === sel1.discount;
    const maxSelected = Math.max(sel0.discount, sel1.discount);

    if (sameDiscount) {
      tiles.push({ id: "selected-0", label: sel0.bank, labelIcon: CreditCard, accentClass: "bg-primary text-primary-foreground", accentBorder: "border-primary", platform: allPlatforms[seed % allPlatforms.length], platformUrl: buildPlatformUrl(allPlatforms[seed % allPlatforms.length], from.code, to.code, dateStr), bank: sel0.bank, card: sel0.card, discount: sel0.discount, paymentType: "Credit Card", conditions: makeConditions(seed, 0) });
      tiles.push({ id: "selected-1", label: sel1.bank, labelIcon: CreditCard, accentClass: "bg-primary text-primary-foreground", accentBorder: "border-primary", platform: allPlatforms[(seed + 1) % allPlatforms.length], platformUrl: buildPlatformUrl(allPlatforms[(seed + 1) % allPlatforms.length], from.code, to.code, dateStr), bank: sel1.bank, card: sel1.card, discount: sel1.discount, paymentType: "Credit Card", conditions: makeConditions(seed, 1) });
      if (bestOtherDiscount > maxSelected) {
        tiles.push({ id: "best-other", label: "Best Offer on Other Card", extraLabel: `₹${bestOtherDiscount - maxSelected} more savings`, labelIcon: TrendingUp, accentClass: "bg-highlight text-highlight-foreground", accentBorder: "border-highlight", platform: allPlatforms[(seed + 2) % allPlatforms.length], platformUrl: buildPlatformUrl(allPlatforms[(seed + 2) % allPlatforms.length], from.code, to.code, dateStr), bank: bestOtherBank, card: bankOffers[bestOtherBank][0].card, discount: bestOtherDiscount, paymentType: "Credit Card", conditions: makeConditions(seed, 2) });
      }
    } else {
      const bestSelected = sel0.discount >= sel1.discount ? sel0 : sel1;
      const otherSelected = sel0.discount >= sel1.discount ? sel1 : sel0;
      tiles.push({ id: "selected-best", label: "Best Offer on Selected Card", labelIcon: Star, accentClass: "bg-primary text-primary-foreground", accentBorder: "border-primary", platform: allPlatforms[seed % allPlatforms.length], platformUrl: buildPlatformUrl(allPlatforms[seed % allPlatforms.length], from.code, to.code, dateStr), bank: bestSelected.bank, card: bestSelected.card, discount: bestSelected.discount, paymentType: "Credit Card", conditions: makeConditions(seed, 0) });
      if (bestOtherDiscount > bestSelected.discount) {
        tiles.push({ id: "best-other", label: "Best Offer on Other Card", extraLabel: `₹${bestOtherDiscount - bestSelected.discount} more savings`, labelIcon: TrendingUp, accentClass: "bg-highlight text-highlight-foreground", accentBorder: "border-highlight", platform: allPlatforms[(seed + 1) % allPlatforms.length], platformUrl: buildPlatformUrl(allPlatforms[(seed + 1) % allPlatforms.length], from.code, to.code, dateStr), bank: bestOtherBank, card: bankOffers[bestOtherBank][0].card, discount: bestOtherDiscount, paymentType: "Credit Card", conditions: makeConditions(seed, 1) });
      } else {
        tiles.push({ id: "selected-other", label: otherSelected.bank, extraLabel: `₹${bestSelected.discount - otherSelected.discount} less`, labelIcon: CreditCard, accentClass: "bg-secondary text-secondary-foreground", accentBorder: "border-secondary", platform: allPlatforms[(seed + 1) % allPlatforms.length], platformUrl: buildPlatformUrl(allPlatforms[(seed + 1) % allPlatforms.length], from.code, to.code, dateStr), bank: otherSelected.bank, card: otherSelected.card, discount: otherSelected.discount, paymentType: "Credit Card", conditions: makeConditions(seed, 1) });
      }
    }
  }

  tiles.push({
    id: "default", label: "Default Offer", labelIcon: Gift,
    accentClass: "bg-accent text-accent-foreground", accentBorder: "border-accent",
    platform: allPlatforms[defaultPlatformIdx],
    platformUrl: buildPlatformUrl(allPlatforms[defaultPlatformIdx], from.code, to.code, dateStr),
    bank: null, card: null, discount: defaultDiscount, paymentType: "No Card",
    conditions: ["Available for all users", "No minimum booking", "Valid till 25 Apr 2026", "Web & Mobile App", "Domestic flights only"],
  });
  return tiles;
};

const generateAllOffers = (from: CityOption, to: CityOption, date: Date) => {
  const dateStr = format(date, "yyyy-MM-dd");
  const seed = hashCode(`${from.code}-${to.code}-${dateStr}`);
  const { bestDiscount } = findBestOffer(seed);
  const result: any[] = [];

  allBankNames.forEach((bankName, idx) => {
    const discount = getBankDiscount(seed, bankName);
    const pIdx = (idx + seed) % allPlatforms.length;
    const isBest = discount === bestDiscount;
    result.push({
      id: `all-${bankName}`, label: isBest ? "Best Offer" : bankName,
      labelIcon: isBest ? Star : TrendingUp,
      accentClass: isBest ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
      accentBorder: isBest ? "border-primary" : "border-secondary",
      platform: allPlatforms[pIdx],
      platformUrl: buildPlatformUrl(allPlatforms[pIdx], from.code, to.code, dateStr),
      bank: bankName, card: bankOffers[bankName][0].card, discount,
      paymentType: idx % 3 === 2 ? "Debit Card" : "Credit Card",
      conditions: makeConditions(seed, idx),
    });
  });

  const defaultDiscount = priceVariation(seed, 500, 99);
  result.push({
    id: "all-default", label: "Default Offer", labelIcon: Gift,
    accentClass: "bg-accent text-accent-foreground", accentBorder: "border-accent",
    platform: "EaseMyTrip",
    platformUrl: buildPlatformUrl("EaseMyTrip", from.code, to.code, dateStr),
    bank: null, card: null, discount: defaultDiscount, paymentType: "No Card",
    conditions: ["Available for all users", "No minimum booking", "Valid till 25 Apr 2026", "Web & Mobile App", "Domestic flights only"],
  });

  result.sort((a, b) => b.discount - a.discount);
  return result;
};

const generateDefaultAllOffers = () => {
  const seed = hashCode("default-all-offers");
  const result: any[] = [];
  const { bestDiscount } = findBestOffer(seed);

  allBankNames.forEach((bankName, idx) => {
    const discount = getBankDiscount(seed, bankName);
    const pIdx = (idx + seed) % allPlatforms.length;
    const isBest = discount === bestDiscount;
    result.push({
      id: `all-${bankName}`, label: isBest ? "Best Offer" : bankName,
      labelIcon: isBest ? Star : TrendingUp,
      accentClass: isBest ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
      accentBorder: isBest ? "border-primary" : "border-secondary",
      platform: allPlatforms[pIdx], platformUrl: "#",
      bank: bankName, card: bankOffers[bankName][0].card, discount,
      paymentType: idx % 3 === 2 ? "Debit Card" : "Credit Card",
      conditions: makeConditions(seed, idx),
    });
  });

  result.push({
    id: "all-default", label: "Default Offer", labelIcon: Gift,
    accentClass: "bg-accent text-accent-foreground", accentBorder: "border-accent",
    platform: "EaseMyTrip", platformUrl: "#",
    bank: null, card: null, discount: priceVariation(seed, 500, 99), paymentType: "No Card",
    conditions: ["Available for all users", "No minimum booking", "Valid till 25 Apr 2026", "Web & Mobile App", "Domestic flights only"],
  });

  result.sort((a, b) => b.discount - a.discount);
  return result;
};

// Max visible offers for non-logged-in users
const MAX_FREE_OFFERS = 2;

// ============ COMPONENT ============

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

  const handleEditSearch = () => {
    setActiveSection("home");
  };

  const handleDateChange = (newDate: Date) => {
    if (searchState) {
      setSearchState({ ...searchState, date: newDate });
    }
  };

  const getMinPrice = (date: Date) => {
    if (!searchState) return 0;
    const seed = hashCode(`${searchState.from.code}-${searchState.to.code}-${format(date, "yyyy-MM-dd")}`);
    return findBestOffer(seed).bestDiscount;
  };

  const searchResults = useMemo(() => {
    if (!searchState) return [];
    return generateSearchResults(searchState.from, searchState.to, searchState.date, searchState.banks);
  }, [searchState]);

  const allOffers = useMemo(() => {
    if (searchState) return generateAllOffers(searchState.from, searchState.to, searchState.date);
    return generateDefaultAllOffers();
  }, [searchState]);

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

  const renderOfferTiles = (offers: any[], wrapperClass: string) => {
    const visibleCount = isLoggedIn ? offers.length : Math.min(MAX_FREE_OFFERS, offers.length);
    const lockedCount = isLoggedIn ? 0 : Math.max(0, offers.length - MAX_FREE_OFFERS);

    return (
      <div className={wrapperClass}>
        {offers.slice(0, visibleCount).map((offer, index) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
            className="w-full"
          >
            <OfferCard {...offer} index={index} />
          </motion.div>
        ))}
        {Array.from({ length: lockedCount }).map((_, i) => (
          <motion.div
            key={`locked-${i}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (visibleCount + i) * 0.08, duration: 0.3 }}
            className="w-full"
          >
            <LockedOfferCard onLoginClick={() => setShowLoginModal(true)} />
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
        <div className="absolute inset-0 bg-background/30 backdrop-blur-[1px]" />
        <div className="absolute top-20 left-[10%] w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-[10%] w-80 h-80 rounded-full bg-accent/5 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header activeSection={activeSection} onSectionChange={setActiveSection} />

        <main className="flex-1 flex flex-col items-center px-4 md:px-6 pb-8">
          <AnimatePresence mode="wait">

            {/* ===== PROFILE SETUP ===== */}
            {needsProfile && (
              <motion.div key="profile" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full">
                <ProfileSetup />
              </motion.div>
            )}

            {/* ===== HOME VIEW ===== */}
            {showHome && !needsProfile && (
              <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full flex flex-col items-center">
                <section className="flex flex-col items-center justify-center pt-12 md:pt-20 pb-6 max-w-2xl mx-auto text-center px-4">
                  <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight leading-tight">
                    <span className="text-gradient">Compare card offers.</span>
                    <br />
                    <span className="text-primary">Book smarter.</span>
                  </h1>
                  <p className="mt-3 text-sm md:text-lg text-muted-foreground leading-relaxed max-w-lg">
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

            {/* ===== SEARCH RESULTS VIEW ===== */}
            {showResults && searchState && (
              <motion.div key="results" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-6xl mx-auto mt-4 md:mt-6">
                {/* Summary bar */}
                <div className="glass-card rounded-2xl card-shadow-lg p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
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
                          <span key={b} className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                            {b}
                          </span>
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

            {/* ===== ALL OFFERS VIEW ===== */}
            {showAllOffers && (
              <motion.div key="all-offers" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-6xl mx-auto mt-4 md:mt-6">
                <h2 className="text-xl md:text-3xl font-display font-bold text-foreground mb-1">
                  {hasSearched ? `All Offers: ${searchState!.from.city} → ${searchState!.to.city}` : "All Offers"}
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  {hasSearched ? "Compare all available card offers for your route." : "Browse all available card offers across platforms."}
                </p>

                {hasSearched && searchState && (
                  <div className="mb-5">
                    <DateStrip
                      selectedDate={searchState.date}
                      onDateChange={handleDateChange}
                      getMinPrice={getMinPrice}
                    />
                  </div>
                )}

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

            {/* ===== CONTENT SECTIONS ===== */}
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

          {/* FAQ always visible at bottom on home */}
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

      {/* Login modal triggered by locked offer cards */}
      <AuthModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
};

export default Index;
