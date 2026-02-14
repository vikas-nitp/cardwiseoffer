import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchCard from "@/components/SearchCard";
import TrustIndicators from "@/components/TrustIndicators";
import skyBg from "@/assets/sky-bg-2.png";
import { Search, BarChart3, CheckCircle, ShieldCheck, RefreshCw, Scale } from "lucide-react";

const Index = () => {
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
        <Header />

        <main className="flex-1 flex flex-col items-center px-6">
          {/* HERO SECTION */}
          <section className="flex flex-col items-center justify-center pt-12 md:pt-20 pb-8 max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-foreground leading-tight">
              Find the Best Travel Deals
              <br />
              <span className="text-primary">Across Cards & Platforms</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
              Compare real credit card savings across travel platforms — before you book.
            </p>
          </section>

          {/* Search card */}
          <SearchCard />

          {/* Trust indicators */}
          <div className="mt-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <TrustIndicators />
          </div>

          {/* ABOUT SECTION */}
          <section id="about" className="w-full max-w-3xl mx-auto mt-20 mb-12">
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
                <p>
                  We analyze publicly available bank offers across major travel platforms and show you:
                </p>
                <ul className="space-y-2 pl-1">
                  {[
                    "Which offer saves the most",
                    "What conditions apply",
                    "Whether a different card gives better value",
                  ].map((item) => (
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
          <section id="how-it-works" className="w-full max-w-5xl mx-auto mb-20">
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
                  desc: "We check active bank promotions across major travel platforms — savings amount, eligibility, validity & exclusions. No tricks, just structured data.",
                },
                {
                  icon: CheckCircle,
                  step: "Step 3",
                  title: "See the best option",
                  desc: "The best offer for your selected cards, a better option if another card saves more, and a default offer if no card is needed.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-card/95 backdrop-blur-sm rounded-2xl card-shadow p-6 md:p-8 text-center"
                >
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

export default Index;
