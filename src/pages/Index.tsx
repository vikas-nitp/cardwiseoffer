import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchCard from "@/components/SearchCard";
import TrustIndicators from "@/components/TrustIndicators";
import { Plane } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen sky-gradient flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-20">
        {/* Floating plane icon */}
        <div className="mb-6 animate-float">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Plane className="w-7 h-7 text-primary" />
          </div>
        </div>

        {/* Hero text */}
        <div className="text-center max-w-xl mx-auto mb-10 animate-fade-up">
          <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-gradient leading-tight">
            Know the real savings before you book.
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
            Compare bank offers across travel platforms — without the fine print.
          </p>
        </div>

        {/* Search card */}
        <SearchCard />

        {/* Trust indicators */}
        <div className="animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <TrustIndicators />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
