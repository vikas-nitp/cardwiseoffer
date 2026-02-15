import { Search, BarChart3, CheckCircle } from "lucide-react";

const steps = [
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
];

const HowItWorksSection = () => (
  <section className="w-full max-w-5xl mx-auto animate-fade-up">
    <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-10">
      How SaveWithCard Works
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {steps.map((item) => (
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
);

export default HowItWorksSection;
