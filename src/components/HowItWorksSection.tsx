import { Search, BarChart3, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Enter your travel details",
    desc: "Select your flight route, travel date, and the cards you have.",
  },
  {
    icon: BarChart3,
    step: "02",
    title: "We compare active offers",
    desc: "We check bank promotions across major travel platforms — savings, eligibility, and exclusions.",
  },
  {
    icon: CheckCircle,
    step: "03",
    title: "See the best option",
    desc: "The best offer for your card, a better option if one exists, and a default no-card offer.",
  },
];

const HowItWorksSection = () => (
  <section className="w-full max-w-5xl mx-auto animate-fade-up">
    <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-3">
      How It Works
    </h2>
    <p className="text-center text-muted-foreground mb-10 max-w-lg mx-auto">
      Three simple steps to find the best card offer for your flight.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {steps.map((item, i) => (
        <div
          key={item.step}
          className="glass-card rounded-2xl card-shadow p-6 md:p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-up"
          style={{ animationDelay: `${i * 0.15}s` }}
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <item.icon className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xs font-bold text-primary uppercase tracking-widest">{item.step}</span>
          <h3 className="text-lg font-display font-bold text-foreground mt-2 mb-3">{item.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default HowItWorksSection;
