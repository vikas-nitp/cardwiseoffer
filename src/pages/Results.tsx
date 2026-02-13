import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRight, Pencil, Star, TrendingUp, Tag } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import OfferCard from "@/components/OfferCard";
import skyBg from "@/assets/sky-bg.png";

interface SearchState {
  from: string;
  to: string;
  date: string;
  bank: string;
}

const offers = [
  {
    id: 1,
    label: "Best match",
    labelIcon: Star,
    accentClass: "bg-primary text-primary-foreground",
    accentBorder: "border-primary",
    platform: "MakeMyTrip",
    platformUrl: "https://www.makemytrip.com",
    bank: "HDFC",
    card: "HDFC Infinia",
    discount: 1200,
    conditions: [
      "Min booking: ₹5,000 – ₹9,999",
      "Valid till 30 Apr 2025",
      "Non-EMI transactions only",
      "Web & Mobile App",
      "Domestic flights only",
      "Not valid on Multi-City flights",
      "Not valid on Mondays",
      "Cannot be combined with other offers",
    ],
  },
  {
    id: 2,
    label: "Higher savings available",
    labelIcon: TrendingUp,
    accentClass: "bg-accent text-accent-foreground",
    accentBorder: "border-accent",
    platform: "Cleartrip",
    platformUrl: "https://www.cleartrip.com",
    bank: "ICICI",
    card: "ICICI Sapphiro",
    discount: 1800,
    conditions: [
      "Min booking: ₹4,000 – ₹9,999",
      "EMI & Non-EMI allowed",
      "Mobile App only",
      "All routes",
      "Valid till 28 Apr 2025",
      "Not valid on Multi-City flights",
      "Not valid on Mondays",
      "Cannot be combined with other offers",
    ],
  },
  {
    id: 3,
    label: "No card needed",
    labelIcon: Tag,
    accentClass: "bg-secondary text-secondary-foreground",
    accentBorder: "border-border",
    platform: "EaseMyTrip",
    platformUrl: "https://www.easemytrip.com",
    bank: null,
    card: null,
    discount: 500,
    conditions: [
      "No card required",
      "No minimum booking",
      "Valid till 25 Apr 2025",
      "Web & Mobile App",
      "Domestic flights only",
      "All users eligible",
    ],
  },
];

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

  // Extract bank chips from the bank string
  const bankChips = state.bank
    ? state.bank.split(",").map((b) => b.trim()).filter(Boolean)
    : [];

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

          {/* Offer cards — 3 columns on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {offers.map((offer, index) => (
              <OfferCard key={offer.id} {...offer} index={index} />
            ))}
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground/70 text-center mt-10 max-w-lg mx-auto leading-relaxed">
            Offers sourced from public bank promotions. Final eligibility depends on platform & bank terms.
          </p>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Results;
