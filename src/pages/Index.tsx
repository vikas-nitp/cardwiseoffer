import { useState, useMemo } from "react";
import Header from "@/components/Header";
import type { ActiveSection } from "@/components/Header";
import Footer from "@/components/Footer";
import SearchCard from "@/components/SearchCard";
import TrustIndicators from "@/components/TrustIndicators";
import AboutSection from "@/components/AboutSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import DateStrip from "@/components/DateStrip";
import SidebarFilters from "@/components/SidebarFilters";
import OfferCard from "@/components/OfferCard";
import skyBg from "@/assets/sky-bg-2.png";
import { format } from "date-fns";
import { ArrowRight, Pencil, Star, TrendingUp, Gift, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CityOption } from "@/components/CityAutocomplete";

interface SearchState {
  from: CityOption;
  to: CityOption;
  date: Date;
  banks: string[];
}

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

/**
 * Generate the 3 search-result cards: Best Offer, Selected Card (if bank chosen), Default Offer.
 * The Best Offer discount MUST equal getMinPrice for the same date so prices stay consistent.
 */
const generateSearchResults = (from: CityOption, to: CityOption, date: Date, banks: string[]) => {
  const dateStr = format(date, "yyyy-MM-dd");
  const seed = hashCode(`${from.code}-${to.code}-${dateStr}`);

  // Best offer across ALL banks for this date
  let bestDiscount = 0;
  let bestBank = "";
  let bestCard = "";
  allBankNames.forEach((bankName, idx) => {
    const d = priceVariation(seed, bankOffers[bankName][0].baseDiscount, idx);
    if (d > bestDiscount) {
      bestDiscount = d;
      bestBank = bankName;
      bestCard = bankOffers[bankName][0].card;
    }
  });

  const bestPlatformIdx = seed % allPlatforms.length;
  const result: any[] = [];

  // 1. Best Offer card
  result.push({
    id: "best",
    label: "Best Offer",
    labelIcon: Star,
    accentClass: "bg-primary text-primary-foreground",
    accentBorder: "border-primary",
    platform: allPlatforms[bestPlatformIdx],
    platformUrl: buildPlatformUrl(allPlatforms[bestPlatformIdx], from.code, to.code, dateStr),
    bank: bestBank,
    card: bestCard,
    discount: bestDiscount,
    paymentType: "Credit Card",
    conditions: [
      `Min booking: ₹${3000 + (seed % 3) * 1000} – ₹9,999`,
      "Valid till 30 Apr 2026",
      "Non-EMI transactions only",
      "Web & Mobile App",
      "Domestic flights only",
    ],
  });

  // 2. Selected Card offer(s)
  if (banks.length > 0) {
    banks.forEach((bankName, bIdx) => {
      const bankData = bankOffers[bankName];
      if (!bankData) return;
      const discount = priceVariation(seed, bankData[0].baseDiscount, allBankNames.indexOf(bankName));
      // Skip if it's already the best offer
      if (bankName === bestBank) return;
      const pIdx = (bIdx + 1 + seed) % allPlatforms.length;
      const diff = bestDiscount - discount;
      result.push({
        id: `selected-${bankName}`,
        label: "Selected Card",
        extraLabel: diff > 0 ? `₹${diff} less` : undefined,
        labelIcon: TrendingUp,
        accentClass: "bg-accent text-accent-foreground",
        accentBorder: "border-accent",
        platform: allPlatforms[pIdx],
        platformUrl: buildPlatformUrl(allPlatforms[pIdx], from.code, to.code, dateStr),
        bank: bankName,
        card: bankData[0].card,
        discount,
        paymentType: "Credit Card",
        conditions: [
          `Min booking: ₹${2000 + (seed % 4) * 1000} – ₹9,999`,
          bIdx % 2 === 0 ? "EMI & Non-EMI allowed" : "Non-EMI only",
          bIdx % 2 === 0 ? "Mobile App only" : "Web & Mobile App",
          "All routes",
          "Valid till 28 Apr 2026",
        ],
      });
    });
  }

  // 3. Default Offer (no card)
  const defaultDiscount = priceVariation(seed, 500, 99);
  result.push({
    id: "default",
    label: "Default Offer",
    labelIcon: Gift,
    accentClass: "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white",
    accentBorder: "border-violet-400",
    platform: "EaseMyTrip",
    platformUrl: buildPlatformUrl("EaseMyTrip", from.code, to.code, dateStr),
    bank: null,
    card: null,
    discount: defaultDiscount,
    paymentType: "No Card",
    conditions: [
      "Available for all users",
      "No minimum booking",
      "Valid till 25 Apr 2026",
      "Web & Mobile App",
      "Domestic flights only",
    ],
  });

  return result;
};

/**
 * Generate ALL bank offers for the All Offers view.
 */
const generateAllOffers = (from: CityOption, to: CityOption, date: Date) => {
  const dateStr = format(date, "yyyy-MM-dd");
  const seed = hashCode(`${from.code}-${to.code}-${dateStr}`);
  const result: any[] = [];

  // Find best discount for badge
  let bestDiscount = 0;
  allBankNames.forEach((bankName, idx) => {
    const d = priceVariation(seed, bankOffers[bankName][0].baseDiscount, idx);
    if (d > bestDiscount) bestDiscount = d;
  });

  allBankNames.forEach((bankName, idx) => {
    const bankData = bankOffers[bankName][0];
    const discount = priceVariation(seed, bankData.baseDiscount, idx);
    const pIdx = (idx + seed) % allPlatforms.length;
    const isBest = discount === bestDiscount;

    result.push({
      id: `all-${bankName}`,
      label: isBest ? "Best Offer" : bankName,
      labelIcon: isBest ? Star : TrendingUp,
      accentClass: isBest ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground",
      accentBorder: isBest ? "border-primary" : "border-accent",
      platform: allPlatforms[pIdx],
      platformUrl: buildPlatformUrl(allPlatforms[pIdx], from.code, to.code, dateStr),
      bank: bankName,
      card: bankData.card,
      discount,
      paymentType: idx % 3 === 2 ? "Debit Card" : "Credit Card",
      conditions: [
        `Min booking: ₹${3000 + (seed % 3) * 1000} – ₹9,999`,
        "Valid till 30 Apr 2026",
        idx % 2 === 0 ? "Non-EMI transactions only" : "EMI & Non-EMI allowed",
        idx % 2 === 0 ? "Web & Mobile App" : "Mobile App only",
        "Domestic flights only",
      ],
    });
  });

  // Default offer
  const defaultDiscount = priceVariation(seed, 500, 99);
  result.push({
    id: "all-default",
    label: "Default Offer",
    labelIcon: Gift,
    accentClass: "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white",
    accentBorder: "border-violet-400",
    platform: "EaseMyTrip",
    platformUrl: buildPlatformUrl("EaseMyTrip", from.code, to.code, dateStr),
    bank: null,
    card: null,
    discount: defaultDiscount,
    paymentType: "No Card",
    conditions: [
      "Available for all users",
      "No minimum booking",
      "Valid till 25 Apr 2026",
      "Web & Mobile App",
      "Domestic flights only",
    ],
  });

  result.sort((a, b) => b.discount - a.discount);
  return result;
};

const Index = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>("about");
  const [searchState, setSearchState] = useState<SearchState | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Sidebar filters (All Offers view only)
  const [bankFilter, setBankFilter] = useState<string[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<string[]>([]);

  const hasSearched = searchState !== null;

  const handleSearch = (from: CityOption, to: CityOption, date: Date, banks: string[]) => {
    setSearchState({ from, to, date, banks });
    setActiveSection("results");
    setIsEditing(false);
    setBankFilter([]);
    setPlatformFilter([]);
    setPaymentFilter([]);
  };

  const handleDateChange = (newDate: Date) => {
    if (searchState) {
      setSearchState({ ...searchState, date: newDate });
    }
  };

  // getMinPrice must match best offer logic
  const getMinPrice = (date: Date) => {
    if (!searchState) return 0;
    const seed = hashCode(`${searchState.from.code}-${searchState.to.code}-${format(date, "yyyy-MM-dd")}`);
    let best = 0;
    allBankNames.forEach((bankName, idx) => {
      const d = priceVariation(seed, bankOffers[bankName][0].baseDiscount, idx);
      if (d > best) best = d;
    });
    return best;
  };

  // Search Results cards
  const searchResults = useMemo(() => {
    if (!searchState) return [];
    return generateSearchResults(searchState.from, searchState.to, searchState.date, searchState.banks);
  }, [searchState]);

  // All Offers cards
  const allOffers = useMemo(() => {
    if (!searchState) return [];
    return generateAllOffers(searchState.from, searchState.to, searchState.date);
  }, [searchState]);

  // Filtered all offers
  const filteredAllOffers = useMemo(() => {
    return allOffers.filter((o) => {
      if (bankFilter.length > 0 && o.bank && !bankFilter.includes(o.bank)) return false;
      if (platformFilter.length > 0 && !platformFilter.includes(o.platform)) return false;
      if (paymentFilter.length > 0 && !paymentFilter.includes(o.paymentType)) return false;
      return true;
    });
  }, [allOffers, bankFilter, platformFilter, paymentFilter]);

  // Check if selected banks have offers in search results
  const hasSelectedCardOffers = searchState?.banks.length
    ? searchResults.some((o) => o.label === "Selected Card")
    : true;

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
        <Header
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          hasSearched={hasSearched}
        />

        <main className="flex-1 flex flex-col items-center px-6">
          {/* HERO + SEARCH */}
          {(!hasSearched || isEditing) && (
            <>
              <section className="flex flex-col items-center justify-center pt-12 md:pt-20 pb-8 max-w-3xl mx-auto text-center">
                <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-foreground leading-tight">
                  Find the Best Travel Deals
                  <br />
                  <span className="text-primary">Across Cards & Platforms</span>
                </h1>
                <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
                  Compare real credit card and bank offers across travel platforms before you book.
                </p>
              </section>

              <SearchCard
                onSearch={handleSearch}
                initialFrom={searchState?.from ?? null}
                initialTo={searchState?.to ?? null}
                initialDate={searchState?.date ?? undefined}
                initialBanks={searchState?.banks ?? []}
              />

              <div className="mt-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
                <TrustIndicators />
              </div>
            </>
          )}

          {/* SEARCH SUMMARY BAR */}
          {hasSearched && !isEditing && (
            <div className="w-full max-w-6xl mx-auto mt-6 mb-4 animate-fade-up">
              <div className="bg-card/90 backdrop-blur-sm rounded-2xl card-shadow-lg p-5 md:p-6 flex flex-wrap items-center justify-between gap-4 border border-border/50">
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
                  <span className="text-muted-foreground">•</span>
                  <span className="font-bold text-foreground">
                    {format(searchState.date, "dd MMM yyyy")}
                  </span>
                  {searchState.banks.length > 0 && (
                    <>
                      <span className="text-muted-foreground">•</span>
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
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Search
                </Button>
              </div>
            </div>
          )}

          {/* CONTENT AREA */}
          <div className="w-full max-w-6xl mx-auto py-8">
            {/* Pre-search: About / How It Works */}
            {!hasSearched && activeSection === "about" && <AboutSection />}
            {!hasSearched && activeSection === "how-it-works" && <HowItWorksSection />}
            {!hasSearched && (activeSection === "results" || activeSection === "all-offers") && (
              <div className="space-y-16">
                <AboutSection />
                <HowItWorksSection />
              </div>
            )}

            {/* Post-search */}
            {hasSearched && !isEditing && (
              <>
                {/* SEARCH RESULTS VIEW */}
                {activeSection === "results" && (
                  <div className="animate-fade-up">
                    <div className="mb-6">
                      <DateStrip
                        selectedDate={searchState.date}
                        onDateChange={handleDateChange}
                        getMinPrice={getMinPrice}
                      />
                    </div>

                    {/* No offers for selected card message */}
                    {searchState.banks.length > 0 && !hasSelectedCardOffers && (
                      <div className="bg-card/90 backdrop-blur-sm rounded-2xl card-shadow p-6 mb-6 text-center">
                        <p className="text-muted-foreground font-medium">
                          No active offers on your selected card for this date. Showing best available and default offers.
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {searchResults.map((offer, index) => (
                        <OfferCard key={offer.id} {...offer} index={index} />
                      ))}
                    </div>

                    <p className="text-xs text-muted-foreground/70 text-center mt-8 max-w-lg mx-auto leading-relaxed">
                      Offers sourced from public bank promotions. Final eligibility depends on platform & bank terms.
                    </p>
                  </div>
                )}

                {/* ALL OFFERS VIEW (with filters) */}
                {activeSection === "all-offers" && (
                  <div className="animate-fade-up">
                    <div className="mb-6">
                      <DateStrip
                        selectedDate={searchState.date}
                        onDateChange={handleDateChange}
                        getMinPrice={getMinPrice}
                      />
                    </div>

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

                {activeSection === "about" && <AboutSection />}
                {activeSection === "how-it-works" && <HowItWorksSection />}
              </>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Index;
