import { useState, useMemo } from "react";
import Header from "@/components/Header";
import type { ActiveSection } from "@/components/Header";
import Footer from "@/components/Footer";
import SearchCard from "@/components/SearchCard";
import TrustIndicators from "@/components/TrustIndicators";
import AboutSection from "@/components/AboutSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import FAQSection from "@/components/FAQSection";
import DateStrip from "@/components/DateStrip";
import SidebarFilters from "@/components/SidebarFilters";
import OfferCard from "@/components/OfferCard";
import skyBg from "@/assets/sky-bg-2.png";
import { format } from "date-fns";
import { ArrowRight, Pencil, Star, TrendingUp, Gift, CreditCard, ShieldCheck, RefreshCw, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CityOption } from "@/components/CityAutocomplete";

interface SearchState {
  from: CityOption;
  to: CityOption;
  date: Date;
  banks: string[];
}

// --- Data utilities (unchanged logic) ---
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
      accentClass: "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white", accentBorder: "border-violet-400",
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
      tiles.push({ id: "best-other", label: "Best Offer on Other Card", extraLabel: `₹${bestOtherDiscount - sel.discount} more savings`, labelIcon: TrendingUp, accentClass: "bg-accent text-accent-foreground", accentBorder: "border-accent", platform: allPlatforms[(seed + 1) % allPlatforms.length], platformUrl: buildPlatformUrl(allPlatforms[(seed + 1) % allPlatforms.length], from.code, to.code, dateStr), bank: bestOtherBank, card: bankOffers[bestOtherBank][0].card, discount: bestOtherDiscount, paymentType: "Credit Card", conditions: makeConditions(seed, 1) });
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
        tiles.push({ id: "best-other", label: "Best Offer on Other Card", extraLabel: `₹${bestOtherDiscount - maxSelected} more savings`, labelIcon: TrendingUp, accentClass: "bg-accent text-accent-foreground", accentBorder: "border-accent", platform: allPlatforms[(seed + 2) % allPlatforms.length], platformUrl: buildPlatformUrl(allPlatforms[(seed + 2) % allPlatforms.length], from.code, to.code, dateStr), bank: bestOtherBank, card: bankOffers[bestOtherBank][0].card, discount: bestOtherDiscount, paymentType: "Credit Card", conditions: makeConditions(seed, 2) });
      }
    } else {
      const bestSelected = sel0.discount >= sel1.discount ? sel0 : sel1;
      const otherSelected = sel0.discount >= sel1.discount ? sel1 : sel0;
      tiles.push({ id: "selected-best", label: "Best Offer on Selected Card", labelIcon: Star, accentClass: "bg-primary text-primary-foreground", accentBorder: "border-primary", platform: allPlatforms[seed % allPlatforms.length], platformUrl: buildPlatformUrl(allPlatforms[seed % allPlatforms.length], from.code, to.code, dateStr), bank: bestSelected.bank, card: bestSelected.card, discount: bestSelected.discount, paymentType: "Credit Card", conditions: makeConditions(seed, 0) });
      if (bestOtherDiscount > bestSelected.discount) {
        tiles.push({ id: "best-other", label: "Best Offer on Other Card", extraLabel: `₹${bestOtherDiscount - bestSelected.discount} more savings`, labelIcon: TrendingUp, accentClass: "bg-accent text-accent-foreground", accentBorder: "border-accent", platform: allPlatforms[(seed + 1) % allPlatforms.length], platformUrl: buildPlatformUrl(allPlatforms[(seed + 1) % allPlatforms.length], from.code, to.code, dateStr), bank: bestOtherBank, card: bankOffers[bestOtherBank][0].card, discount: bestOtherDiscount, paymentType: "Credit Card", conditions: makeConditions(seed, 1) });
      } else {
        tiles.push({ id: "selected-other", label: otherSelected.bank, extraLabel: `₹${bestSelected.discount - otherSelected.discount} less`, labelIcon: CreditCard, accentClass: "bg-accent text-accent-foreground", accentBorder: "border-accent", platform: allPlatforms[(seed + 1) % allPlatforms.length], platformUrl: buildPlatformUrl(allPlatforms[(seed + 1) % allPlatforms.length], from.code, to.code, dateStr), bank: otherSelected.bank, card: otherSelected.card, discount: otherSelected.discount, paymentType: "Credit Card", conditions: makeConditions(seed, 1) });
      }
    }
  }

  tiles.push({
    id: "default", label: "Default Offer", labelIcon: Gift,
    accentClass: "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white", accentBorder: "border-violet-400",
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
      accentClass: isBest ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground",
      accentBorder: isBest ? "border-primary" : "border-accent",
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
    accentClass: "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white", accentBorder: "border-violet-400",
    platform: "EaseMyTrip",
    platformUrl: buildPlatformUrl("EaseMyTrip", from.code, to.code, dateStr),
    bank: null, card: null, discount: defaultDiscount, paymentType: "No Card",
    conditions: ["Available for all users", "No minimum booking", "Valid till 25 Apr 2026", "Web & Mobile App", "Domestic flights only"],
  });

  result.sort((a, b) => b.discount - a.discount);
  return result;
};

// Default All Offers (no search needed)
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
      accentClass: isBest ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground",
      accentBorder: isBest ? "border-primary" : "border-accent",
      platform: allPlatforms[pIdx], platformUrl: "#",
      bank: bankName, card: bankOffers[bankName][0].card, discount,
      paymentType: idx % 3 === 2 ? "Debit Card" : "Credit Card",
      conditions: makeConditions(seed, idx),
    });
  });

  result.push({
    id: "all-default", label: "Default Offer", labelIcon: Gift,
    accentClass: "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white", accentBorder: "border-violet-400",
    platform: "EaseMyTrip", platformUrl: "#",
    bank: null, card: null, discount: priceVariation(seed, 500, 99), paymentType: "No Card",
    conditions: ["Available for all users", "No minimum booking", "Valid till 25 Apr 2026", "Web & Mobile App", "Domestic flights only"],
  });

  result.sort((a, b) => b.discount - a.discount);
  return result;
};

// ============ COMPONENT ============

const Index = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>("home");
  const [searchState, setSearchState] = useState<SearchState | null>(null);

  // Sidebar filters (All Offers view only)
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
    // Go back to home with form values preserved
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

  const handleSectionChange = (section: ActiveSection) => {
    setActiveSection(section);
  };

  // Determine what to show
  const showHome = activeSection === "home";
  const showResults = activeSection === "results" && hasSearched;
  const showAllOffers = activeSection === "all-offers";
  const showAbout = activeSection === "about";
  const showHowItWorks = activeSection === "how-it-works";
  const showHelp = activeSection === "help";

  return (
    <div className="min-h-screen flex flex-col relative">
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${skyBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="fixed inset-0 z-0 bg-background/20" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header activeSection={activeSection} onSectionChange={handleSectionChange} />

        <main className="flex-1 flex flex-col items-center px-6">

          {/* ===== HOME VIEW ===== */}
          {showHome && (
            <>
              {/* Lightweight hero */}
              <section className="flex flex-col items-center justify-center pt-12 md:pt-16 pb-6 max-w-2xl mx-auto text-center">
                <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground leading-tight">
                  Compare card offers.
                  <br />
                  <span className="text-primary">Book smarter.</span>
                </h1>
                <p className="mt-3 text-base text-muted-foreground leading-relaxed max-w-lg">
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

              {/* Minimal trust strip */}
              <div className="flex items-center justify-center gap-8 mt-8 animate-fade-up" style={{ animationDelay: "0.3s" }}>
                {[
                  { icon: ShieldCheck, text: "No booking bias" },
                  { icon: RefreshCw, text: "Updated daily" },
                  { icon: Scale, text: "Independent" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-muted-foreground">
                    <Icon className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-medium">{text}</span>
                  </div>
                ))}
              </div>

              {/* FAQ at bottom */}
              <div className="w-full max-w-6xl mx-auto py-16">
                <FAQSection />
              </div>
            </>
          )}

          {/* ===== SEARCH RESULTS VIEW ===== */}
          {showResults && searchState && (
            <div className="w-full max-w-6xl mx-auto mt-6 animate-fade-up">
              {/* Summary bar */}
              <div className="bg-card/90 backdrop-blur-sm rounded-2xl card-shadow-lg p-5 md:p-6 flex flex-wrap items-center justify-between gap-4 border border-border/50 mb-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-display font-bold text-lg text-foreground">
                    {searchState.from.city} ({searchState.from.code})
                  </span>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-display font-bold text-lg text-foreground">
                    {searchState.to.city} ({searchState.to.code})
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="font-bold text-foreground">{format(searchState.date, "dd MMM yyyy")}</span>
                  {searchState.banks.length > 0 && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      {searchState.banks.map((b) => (
                        <span key={b} className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20">
                          {b}
                        </span>
                      ))}
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 font-semibold border-primary/30 text-primary hover:bg-primary/5"
                  onClick={handleEditSearch}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Search
                </Button>
              </div>

              {/* Date strip */}
              <div className="mb-6">
                <DateStrip
                  selectedDate={searchState.date}
                  onDateChange={handleDateChange}
                  getMinPrice={getMinPrice}
                />
              </div>

              {/* Offer tiles */}
              <div className="flex gap-5 justify-center flex-wrap">
                {searchResults.map((offer, index) => (
                  <div key={offer.id} className="w-[320px] shrink-0">
                    <OfferCard {...offer} index={index} />
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground/70 text-center mt-8 max-w-lg mx-auto leading-relaxed">
                Offers sourced from public bank promotions. Final eligibility depends on platform & bank terms.
              </p>
            </div>
          )}

          {/* ===== ALL OFFERS VIEW ===== */}
          {showAllOffers && (
            <div className="w-full max-w-6xl mx-auto mt-6 animate-fade-up">
              <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                {hasSearched ? `All Offers: ${searchState!.from.city} → ${searchState!.to.city}` : "All Offers"}
              </h2>

              {hasSearched && searchState && (
                <div className="mb-6">
                  <DateStrip
                    selectedDate={searchState.date}
                    onDateChange={handleDateChange}
                    getMinPrice={getMinPrice}
                  />
                </div>
              )}

              <div className="flex gap-6">
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
                    <div className="bg-card/90 backdrop-blur-sm rounded-2xl card-shadow-lg p-10 text-center">
                      <p className="text-muted-foreground">No offers match your filters. Try adjusting filters.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {filteredAllOffers.map((offer, index) => (
                        <OfferCard key={offer.id} {...offer} index={index} />
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground/70 text-center mt-8 max-w-lg mx-auto leading-relaxed">
                    Offers sourced from public bank promotions. Final eligibility depends on platform & bank terms.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ===== CONTENT SECTIONS ===== */}
          {showAbout && (
            <div className="w-full max-w-6xl mx-auto py-8">
              <AboutSection />
            </div>
          )}
          {showHowItWorks && (
            <div className="w-full max-w-6xl mx-auto py-8">
              <HowItWorksSection />
            </div>
          )}
          {showHelp && (
            <div className="w-full max-w-6xl mx-auto py-8">
              <FAQSection />
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Index;
