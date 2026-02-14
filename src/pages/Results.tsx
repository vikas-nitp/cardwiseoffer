import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRight, Pencil, Star, TrendingUp, Gift, Search, BarChart3, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import OfferCard from "@/components/OfferCard";
import skyBg from "@/assets/sky-bg.png";
import { useMemo } from "react";

interface SearchState {
  from: string;
  to: string;
  date: string;
  bank: string;
}

// Helper to generate pseudo-random price based on search params
const hashCode = (s: string) => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const buildPlatformUrl = (platform: string, from: string, to: string, date: string) => {
  const fromCode = from.match(/\(([A-Z]+)\)/)?.[1] || "";
  const toCode = to.match(/\(([A-Z]+)\)/)?.[1] || "";

  switch (platform) {
    case "MakeMyTrip":
      return `https://www.makemytrip.com/flight/search?itinerary=${fromCode}-${toCode}-${date}&tripType=O&paxType=A-1_C-0_I-0&cabinClass=E`;
    case "Cleartrip":
      return `https://www.cleartrip.com/flights/${fromCode}-${toCode}-${date}`;
    case "EaseMyTrip":
      return `https://www.easemytrip.com/flight-booking/${fromCode}-${toCode}-${date}`;
    default:
      return "#";
  }
};

interface OfferData {
  id: number;
  label: string;
  extraLabel?: string;
  labelIcon: typeof Star;
  accentClass: string;
  accentBorder: string;
  platform: string;
  platformUrl: string;
  bank: string | null;
  card: string | null;
  discount: number;
  conditions: string[];
}

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

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as SearchState) || {
    from: "Bangalore (BLR)",
    to: "Delhi (DEL)",
    date: "2025-04-24",
    bank: "HDFC Bank",
  };

  const formattedDate = (() => {
    try {
      return format(new Date(state.date), "dd MMM yyyy");
    } catch {
      return state.date;
    }
  })();

  const bankChips = state.bank
    ? state.bank.split(",").map((b) => b.trim()).filter(Boolean)
    : [];

  // Generate offers dynamically based on search
  const { offers, hasNoOffers } = useMemo(() => {
    const seed = hashCode(`${state.from}-${state.to}-${state.date}`);
    const priceVariation = (base: number, idx: number) => {
      const variation = ((seed + idx * 137) % 500) - 200;
      return Math.max(300, base + variation);
    };

    const platforms = ["MakeMyTrip", "Cleartrip", "EaseMyTrip"];
    const result: OfferData[] = [];

    if (bankChips.length > 0) {
      // Check if any selected bank has offers
      const matchedBanks = bankChips.filter((b) => bankOffers[b]);

      if (matchedBanks.length === 0) {
        return { offers: [], hasNoOffers: true };
      }

      // Create bank-specific offers
      matchedBanks.forEach((bankName, bIdx) => {
        const bankData = bankOffers[bankName];
        if (bankData) {
          bankData.forEach((offer) => {
            const discount = priceVariation(offer.baseDiscount, bIdx);
            result.push({
              id: bIdx + 1,
              label: "",
              labelIcon: Star,
              accentClass: "",
              accentBorder: "",
              platform: platforms[bIdx % platforms.length],
              platformUrl: buildPlatformUrl(platforms[bIdx % platforms.length], state.from, state.to, state.date),
              bank: bankName,
              card: offer.card,
              discount,
              conditions: [
                `Min booking: ₹${3000 + (seed % 3) * 1000} – ₹9,999`,
                `Valid till 30 Apr 2025`,
                bIdx % 2 === 0 ? "Non-EMI transactions only" : "EMI & Non-EMI allowed",
                bIdx % 2 === 0 ? "Web & Mobile App" : "Mobile App only",
                "Domestic flights only",
              ],
            });
          });
        }
      });

      // Sort by discount descending
      result.sort((a, b) => b.discount - a.discount);

      // Assign labels
      if (result.length > 0) {
        result[0].label = "Best match";
        result[0].labelIcon = Star;
        result[0].accentClass = "bg-primary text-primary-foreground";
        result[0].accentBorder = "border-primary";
      }
      if (result.length > 1) {
        const diff = result[0].discount - result[1].discount;
        result[1].label = "Higher savings available";
        result[1].extraLabel = diff > 0 ? `₹${diff} less` : `₹${Math.abs(diff)} more`;
        result[1].labelIcon = TrendingUp;
        result[1].accentClass = "bg-accent text-accent-foreground";
        result[1].accentBorder = "border-accent";
      }
    } else {
      // No bank selected - show generic offers
      const d1 = priceVariation(1200, 0);
      const d2 = priceVariation(1800, 1);
      const sortedDiscounts = [d1, d2].sort((a, b) => b - a);

      result.push({
        id: 1,
        label: "Best match",
        labelIcon: Star,
        accentClass: "bg-primary text-primary-foreground",
        accentBorder: "border-primary",
        platform: "MakeMyTrip",
        platformUrl: buildPlatformUrl("MakeMyTrip", state.from, state.to, state.date),
        bank: "HDFC",
        card: "HDFC Infinia",
        discount: sortedDiscounts[0],
        conditions: [
          `Min booking: ₹${3000 + (seed % 3) * 1000} – ₹9,999`,
          "Valid till 30 Apr 2025",
          "Non-EMI transactions only",
          "Web & Mobile App",
          "Domestic flights only",
        ],
      });

      const diff = sortedDiscounts[0] - sortedDiscounts[1];
      result.push({
        id: 2,
        label: "Higher savings available",
        extraLabel: `₹${diff} less`,
        labelIcon: TrendingUp,
        accentClass: "bg-accent text-accent-foreground",
        accentBorder: "border-accent",
        platform: "Cleartrip",
        platformUrl: buildPlatformUrl("Cleartrip", state.from, state.to, state.date),
        bank: "ICICI",
        card: "ICICI Sapphiro",
        discount: sortedDiscounts[1],
        conditions: [
          `Min booking: ₹${2000 + (seed % 4) * 1000} – ₹9,999`,
          "EMI & Non-EMI allowed",
          "Mobile App only",
          "All routes",
          "Valid till 28 Apr 2025",
        ],
      });
    }

    // Always add default offer as 3rd card
    const defaultDiscount = priceVariation(500, 2);
    result.push({
      id: 99,
      label: "Default offer",
      labelIcon: Gift,
      accentClass: "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white",
      accentBorder: "border-violet-400",
      platform: "EaseMyTrip",
      platformUrl: buildPlatformUrl("EaseMyTrip", state.from, state.to, state.date),
      bank: null,
      card: null,
      discount: defaultDiscount,
      conditions: [
        "No card required",
        "No minimum booking",
        "Valid till 25 Apr 2025",
        "Web & Mobile App",
        "Domestic flights only",
        "All users eligible",
      ],
    });

    return { offers: result, hasNoOffers: false };
  }, [state.from, state.to, state.date, state.bank]);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Sky background image */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${skyBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 px-4 md:px-6 py-8 md:py-12 max-w-6xl mx-auto w-full">
          {/* Summary bar */}
          <div className="bg-card/90 backdrop-blur-sm rounded-2xl card-shadow-lg p-5 md:p-6 flex flex-wrap items-center justify-between gap-4 mb-8 animate-fade-up border border-border/50">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-display font-bold text-lg text-foreground">
                {state.from}
              </span>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">
                {state.to}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="font-bold text-foreground">{formattedDate}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 font-semibold border-primary/30 text-primary hover:bg-primary/5"
              onClick={() => navigate("/")}
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit search
            </Button>
          </div>

          {/* Section title */}
          <div className="mb-6 animate-fade-up" style={{ animationDelay: "0.05s" }}>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Best travel offers
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Based on selected banks
            </p>
            {bankChips.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-3">
                {bankChips.map((chip) => (
                  <span
                    key={chip}
                    className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* No offers state */}
          {hasNoOffers && (
            <div className="bg-card/90 backdrop-blur-sm rounded-2xl card-shadow-lg p-10 text-center animate-fade-up">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-display font-bold text-foreground mb-2">
                No offers found for your card
              </h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                We couldn't find any active travel offers for the selected bank(s). Try selecting a different bank or check back later.
              </p>
              <Button onClick={() => navigate("/")} className="gap-2">
                <Pencil className="w-4 h-4" />
                Change search
              </Button>
            </div>
          )}

          {/* Offer cards */}
          {!hasNoOffers && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {offers.map((offer, index) => (
                <OfferCard key={offer.id} {...offer} index={index} />
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground/70 text-center mt-10 max-w-lg mx-auto leading-relaxed">
            Offers sourced from public bank promotions. Final eligibility depends on platform & bank terms.
          </p>

          {/* ABOUT SECTION */}
          <section className="w-full max-w-3xl mx-auto mt-20 mb-12">
            <div className="bg-card/95 backdrop-blur-sm rounded-2xl card-shadow-lg p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">
                About SaveWithCard
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-sm md:text-base">
                <p>
                  <span className="text-foreground font-semibold">SaveWithCard</span> helps you find the best real credit card savings before booking your travel.
                </p>
                <p>
                  Travel platforms often run overlapping, time-bound bank offers that are hard to compare. The fine print is confusing, discounts are unclear, and users are left guessing which card actually saves the most.
                </p>
                <p className="text-foreground font-medium">
                  SaveWithCard acts as an independent comparison layer.
                </p>
                <p>We analyze publicly available bank offers across major travel platforms and show you:</p>
                <ul className="space-y-2 pl-1">
                  {["Which offer saves the most", "What conditions apply", "Whether a different card gives better value"].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="border-t border-border pt-4 italic text-muted-foreground">
                  We don't sell tickets and we don't push bookings. Our only goal is to help you make a smarter decision before you pay.
                </p>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS SECTION */}
          <section className="w-full max-w-5xl mx-auto mb-20">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-10">
              How SaveWithCard Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Search,
                  step: "Step 1",
                  title: "Enter your travel details",
                  desc: "Select your flight route, travel date, and the cards or banks you have (optional).",
                },
                {
                  icon: BarChart3,
                  step: "Step 2",
                  title: "We analyze available offers",
                  desc: "We check active bank promotions across major travel platforms — savings amount, eligibility, validity & exclusions.",
                },
                {
                  icon: CheckCircle,
                  step: "Step 3",
                  title: "See the best option",
                  desc: "The best offer for your selected cards, a better option if another card saves more, and a default offer if no card is needed.",
                },
              ].map((item) => (
                <div key={item.step} className="bg-card/95 backdrop-blur-sm rounded-2xl card-shadow p-6 md:p-8 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">{item.step}</span>
                  <h3 className="text-lg font-display font-bold text-foreground mt-2 mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Results;
