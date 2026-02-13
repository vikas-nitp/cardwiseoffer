import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRight, Pencil, ExternalLink, Star, TrendingUp, Tag } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

interface SearchState {
  from: string;
  to: string;
  date: string;
  bank: string;
}

const offers = [
  {
    id: 1,
    label: "Best for your card",
    labelIcon: Star,
    labelColor: "bg-primary text-primary-foreground",
    platform: "MakeMyTrip",
    platformUrl: "https://www.makemytrip.com",
    card: "HDFC Infinia",
    discount: 1200,
    conditions: [
      "Min booking: ₹5,000",
      "Non-EMI transactions only",
      "Valid till 30 Apr 2025",
      "Web & Mobile App",
      "All users eligible",
      "Domestic flights only",
    ],
  },
  {
    id: 2,
    label: "Better option available",
    labelIcon: TrendingUp,
    labelColor: "bg-savings text-savings-foreground",
    platform: "Cleartrip",
    platformUrl: "https://www.cleartrip.com",
    card: "ICICI Sapphiro",
    discount: 1800,
    extraSavings: 600,
    conditions: [
      "Min booking: ₹4,000",
      "EMI & Non-EMI both",
      "Valid till 28 Apr 2025",
      "Mobile App only",
      "First time users",
      "All routes",
    ],
  },
  {
    id: 3,
    label: "No card required",
    labelIcon: Tag,
    labelColor: "bg-secondary text-secondary-foreground",
    platform: "EaseMyTrip",
    platformUrl: "https://www.easemytrip.com",
    card: null,
    discount: 500,
    conditions: [
      "Platform-wide discount",
      "No minimum booking",
      "Valid till 25 Apr 2025",
      "Web & Mobile App",
      "First time users",
      "Domestic flights only",
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

  return (
    <div className="min-h-screen sky-gradient flex flex-col">
      <Header />

      <main className="flex-1 px-6 py-8 md:py-12 max-w-3xl mx-auto w-full">
        {/* Summary bar */}
        <div className="bg-card rounded-2xl card-shadow-lg p-5 md:p-6 flex flex-wrap items-center justify-between gap-4 mb-8 animate-fade-up border border-border/50">
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
            <span className="font-semibold text-foreground">{formattedDate}</span>
            {state.bank && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {state.bank}
                </span>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-primary font-semibold"
            onClick={() => navigate("/")}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit search
          </Button>
        </div>

        {/* Offer cards */}
        <div className="space-y-5">
          {offers.map((offer, index) => (
            <div
              key={offer.id}
              className="bg-card rounded-xl card-shadow p-5 md:p-6 animate-fade-up"
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              {/* Label row */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${offer.labelColor}`}
                >
                  <offer.labelIcon className="w-3.5 h-3.5" />
                  {offer.label}
                  {offer.extraSavings && (
                    <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded text-[10px]">
                      Saves ₹{offer.extraSavings} more
                    </span>
                  )}
                </span>
              </div>

              {/* Main info - discount + card in one line */}
              <div className="flex items-baseline gap-3 mb-4 flex-wrap">
                <p className="text-3xl font-display font-bold text-foreground">
                  Upto ₹{offer.discount.toLocaleString()}
                </p>
                {offer.card && (
                  <span className="text-sm font-semibold bg-secondary px-3 py-1 rounded-full text-secondary-foreground">
                    {offer.card}
                  </span>
                )}
                {!offer.card && (
                  <span className="text-sm font-semibold bg-muted px-3 py-1 rounded-full text-muted-foreground">
                    No card needed
                  </span>
                )}
              </div>

              {/* Two-column conditions */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {offer.conditions.map((cond) => (
                  <div
                    key={cond}
                    className="text-xs font-medium bg-secondary/60 text-secondary-foreground px-3 py-2 rounded-lg flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 flex-shrink-0" />
                    {cond}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <a href={offer.platformUrl} target="_blank" rel="noopener noreferrer">
                <Button className="gap-2 w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  {offer.platform}
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </a>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground/70 text-center mt-8 max-w-lg mx-auto leading-relaxed">
          Offers sourced from public bank promotions. Final eligibility depends on platform & bank terms.
        </p>
      </main>

      <Footer />
    </div>
  );
};

export default Results;
