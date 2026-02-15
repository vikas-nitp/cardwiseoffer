import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchCard from "@/components/SearchCard";
import TrustIndicators from "@/components/TrustIndicators";
import AboutSection from "@/components/AboutSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import DateStrip from "@/components/DateStrip";
import SidebarFilters from "@/components/SidebarFilters";
import OfferCard from "@/components/OfferCard";
import skyBg from "@/assets/sky-bg-2.png";
import { format, addDays } from "date-fns";
import { ArrowRight, Pencil, Star, TrendingUp, Gift, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CityOption } from "@/components/CityAutocomplete";

type ActiveSection = "offers" | "about" | "how-it-works";

interface SearchState {
  from: CityOption;
  to: CityOption;
  date: Date;
  banks: string[];
}

// Hash helper for pseudo-random prices
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

const allPlatforms = ["MakeMyTrip", "Cleartrip", "EaseMyTrip", "Goibibo"];

const generateOffers = (from: CityOption, to: CityOption, date: Date, banks: string[]) => {
  const dateStr = format(date, "yyyy-MM-dd");
  const seed = hashCode(`${from.code}-${to.code}-${dateStr}`);
  const priceVariation = (base: number, idx: number) => {
    const variation = ((seed + idx * 137) % 500) - 200;
    return Math.max(300, base + variation);
  };

  const result: any[] = [];

  if (banks.length > 0) {
    const matchedBanks = banks.filter((b) => bankOffers[b]);
    if (matchedBanks.length === 0) return { offers: [], hasNoOffers: true };

    matchedBanks.forEach((bankName, bIdx) => {
      const bankData = bankOffers[bankName];
      if (bankData) {
        bankData.forEach((offer) => {
          const discount = priceVariation(offer.baseDiscount, bIdx);
          const platformIdx = (bIdx + seed) % allPlatforms.length;
          const platform = allPlatforms[platformIdx];
          result.push({
            id: `${bankName}-${bIdx}`,
            label: "",
            labelIcon: Star,
            accentClass: "",
            accentBorder: "",
            platform,
            platformUrl: buildPlatformUrl(platform, from.code, to.code, dateStr),
            bank: bankName,
            card: offer.card,
            discount,
            paymentType: "Credit Card",
            conditions: [
              `Min booking: ₹${3000 + (seed % 3) * 1000} – ₹9,999`,
              `Valid till 30 Apr 2026`,
              bIdx % 2 === 0 ? "Non-EMI transactions only" : "EMI & Non-EMI allowed",
              bIdx % 2 === 0 ? "Web & Mobile App" : "Mobile App only",
              "Domestic flights only",
            ],
          });
        });
      }
    });

    result.sort((a, b) => b.discount - a.discount);

    if (result.length > 0) {
      result[0].label = "Best Offer";
      result[0].labelIcon = Star;
      result[0].accentClass = "bg-primary text-primary-foreground";
      result[0].accentBorder = "border-primary";
    }
    if (result.length > 1) {
      const diff = result[0].discount - result[1].discount;
      result[1].label = "Selected Card";
      result[1].extraLabel = diff > 0 ? `₹${diff} less` : undefined;
      result[1].labelIcon = TrendingUp;
      result[1].accentClass = "bg-accent text-accent-foreground";
      result[1].accentBorder = "border-accent";
    }
  } else {
    // No bank selected - generic offers
    const d1 = priceVariation(1200, 0);
    const d2 = priceVariation(1800, 1);
    const sorted = [d1, d2].sort((a, b) => b - a);

    result.push({
      id: "generic-1",
      label: "Best Offer",
      labelIcon: Star,
      accentClass: "bg-primary text-primary-foreground",
      accentBorder: "border-primary",
      platform: "MakeMyTrip",
      platformUrl: buildPlatformUrl("MakeMyTrip", from.code, to.code, dateStr),
      bank: "HDFC",
      card: "HDFC Infinia",
      discount: sorted[0],
      paymentType: "Credit Card",
      conditions: [
        `Min booking: ₹${3000 + (seed % 3) * 1000} – ₹9,999`,
        "Valid till 30 Apr 2026",
        "Non-EMI transactions only",
        "Web & Mobile App",
        "Domestic flights only",
      ],
    });

    const diff = sorted[0] - sorted[1];
    result.push({
      id: "generic-2",
      label: "Selected Card",
      extraLabel: `₹${diff} less`,
      labelIcon: TrendingUp,
      accentClass: "bg-accent text-accent-foreground",
      accentBorder: "border-accent",
      platform: "Cleartrip",
      platformUrl: buildPlatformUrl("Cleartrip", from.code, to.code, dateStr),
      bank: "ICICI",
      card: "ICICI Sapphiro",
      discount: sorted[1],
      paymentType: "Credit Card",
      conditions: [
        `Min booking: ₹${2000 + (seed % 4) * 1000} – ₹9,999`,
        "EMI & Non-EMI allowed",
        "Mobile App only",
        "All routes",
        "Valid till 28 Apr 2026",
      ],
    });
  }

  // Default offer (no card needed)
  const defaultDiscount = priceVariation(500, 2);
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

  return { offers: result, hasNoOffers: false };
};

const Index = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>("offers");
  const [searchState, setSearchState] = useState<SearchState | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Sidebar filters
  const [bankFilter, setBankFilter] = useState<string[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<string[]>([]);

  const hasSearched = searchState !== null;

  const handleSearch = (from: CityOption, to: CityOption, date: Date, banks: string[]) => {
    setSearchState({ from, to, date, banks });
    setActiveSection("offers");
    setIsEditing(false);
    // Initialize bank filter from search banks
    setBankFilter(banks);
    setPlatformFilter([]);
    setPaymentFilter([]);
  };

  const handleDateChange = (newDate: Date) => {
    if (searchState) {
      setSearchState({ ...searchState, date: newDate });
    }
  };

  const getMinPrice = (date: Date) => {
    if (!searchState) return 0;
    const seed = hashCode(`${searchState.from.code}-${searchState.to.code}-${format(date, "yyyy-MM-dd")}`);
    return 800 + (seed % 1200);
  };

  const { offers, hasNoOffers } = useMemo(() => {
    if (!searchState) return { offers: [], hasNoOffers: false };
    return generateOffers(searchState.from, searchState.to, searchState.date, searchState.banks);
  }, [searchState]);

  // Apply sidebar filters
  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      if (bankFilter.length > 0 && o.bank && !bankFilter.includes(o.bank)) return false;
      if (platformFilter.length > 0 && !platformFilter.includes(o.platform)) return false;
      if (paymentFilter.length > 0 && !paymentFilter.includes(o.paymentType)) return false;
      return true;
    });
  }, [offers, bankFilter, platformFilter, paymentFilter]);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Fixed sky background */}
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
          {/* HERO + SEARCH (always visible) */}
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

          {/* SEARCH SUMMARY BAR (after search, not editing) */}
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

          {/* CONTENT AREA (section switching) */}
          <div className="w-full max-w-6xl mx-auto py-8">
            {/* Before search: show About + How It Works based on nav */}
            {!hasSearched && activeSection === "about" && <AboutSection />}
            {!hasSearched && activeSection === "how-it-works" && <HowItWorksSection />}

            {/* After search */}
            {hasSearched && !isEditing && (
              <>
                {activeSection === "offers" && (
                  <div className="animate-fade-up">
                    {/* 7-day strip */}
                    <div className="mb-6">
                      <DateStrip
                        selectedDate={searchState.date}
                        onDateChange={handleDateChange}
                        getMinPrice={getMinPrice}
                      />
                    </div>

                    {hasNoOffers ? (
                      <div className="bg-card/90 backdrop-blur-sm rounded-2xl card-shadow-lg p-10 text-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                          <SearchIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-display font-bold text-foreground mb-2">
                          No active offers found for your selected card on this date.
                        </h2>
                        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                          Try selecting a different bank or check back later.
                        </p>
                        <Button onClick={() => setIsEditing(true)} className="gap-2">
                          <Pencil className="w-4 h-4" />
                          Change search
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-6">
                        {/* Sidebar */}
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

                        {/* Offer cards */}
                        <div className="flex-1">
                          {filteredOffers.length === 0 ? (
                            <div className="bg-card/90 backdrop-blur-sm rounded-2xl card-shadow-lg p-10 text-center">
                              <p className="text-muted-foreground">No offers match your filters. Try adjusting filters.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                              {filteredOffers.map((offer, index) => (
                                <OfferCard key={offer.id} {...offer} index={index} />
                              ))}
                            </div>
                          )}

                          <p className="text-xs text-muted-foreground/70 text-center mt-8 max-w-lg mx-auto leading-relaxed">
                            Offers sourced from public bank promotions. Final eligibility depends on platform & bank terms.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeSection === "about" && <AboutSection />}
                {activeSection === "how-it-works" && <HowItWorksSection />}
              </>
            )}

            {/* Default pre-search content (no nav clicked) */}
            {!hasSearched && activeSection === "offers" && (
              <div className="space-y-16">
                <AboutSection />
                <HowItWorksSection />
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Index;
