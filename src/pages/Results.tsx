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
    card: "HDFC Infinia",
    discount: 1200,
    conditions: [
      "Min booking: ₹5,000",
      "Non-EMI transactions only",
      "Valid till 30 Apr 2025",
    ],
  },
  {
    id: 2,
    label: "Better option available",
    labelIcon: TrendingUp,
    labelColor: "bg-savings text-savings-foreground",
    platform: "Cleartrip",
    card: "ICICI Sapphiro",
    discount: 1800,
    extraSavings: 600,
    conditions: [
      "Min booking: ₹4,000",
      "EMI & Non-EMI both",
      "Valid till 28 Apr 2025",
    ],
  },
  {
    id: 3,
    label: "No card required",
    labelIcon: Tag,
    labelColor: "bg-secondary text-secondary-foreground",
    platform: "EaseMyTrip",
    card: null,
    discount: 500,
    conditions: [
      "Platform-wide discount",
      "No minimum booking",
      "Valid till 25 Apr 2025",
    ],
  },
];

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as SearchState) || {
    from: "Bangalore",
    to: "Delhi",
    date: "2025-04-24",
    bank: "HDFC",
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
        <div className="bg-card rounded-xl card-shadow p-4 md:p-5 flex flex-wrap items-center justify-between gap-3 mb-8 animate-fade-up">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-display font-semibold text-foreground">
              {state.from}
            </span>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <span className="font-display font-semibold text-foreground">
              {state.to}
            </span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">{formattedDate}</span>
            {state.bank && (
              <>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-xs font-medium bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground">
                  {state.bank}
                </span>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-primary"
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
              {/* Label */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${offer.labelColor}`}
                >
                  <offer.labelIcon className="w-3.5 h-3.5" />
                  {offer.label}
                </span>
                <span className="text-xs text-muted-foreground">{offer.platform}</span>
              </div>

              {/* Main info */}
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-3xl font-display font-bold text-foreground">
                    ₹{offer.discount.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {offer.card ? `on ${offer.card}` : "No card needed"}
                  </p>
                </div>
                {offer.extraSavings && (
                  <div className="text-right">
                    <span className="inline-block bg-savings-soft text-savings text-xs font-semibold px-2.5 py-1 rounded-lg">
                      Saves ₹{offer.extraSavings} more
                    </span>
                  </div>
                )}
              </div>

              {/* Conditions */}
              <ul className="space-y-1.5 mb-5">
                {offer.conditions.map((cond) => (
                  <li key={cond} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40 mt-2 flex-shrink-0" />
                    {cond}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                variant="outline"
                className="gap-2 w-full md:w-auto"
              >
                Go to platform
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
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
