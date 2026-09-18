import { motion } from "motion/react";
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
    desc: "We check bank promotions across major travel platforms - savings, eligibility, and exclusions.",
  },
  {
    icon: CheckCircle,
    step: "03",
    title: "See the best option",
    desc: "The best offer for your card, a better option if one exists, and a default no-card offer.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};
const cardVariant = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" as const } },
};

const HowItWorksSection = () => (
  <section className="w-full max-w-5xl mx-auto">
    <div className="text-center mb-5">
      <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
        How It Works
      </h2>
    </div>
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className="grid grid-cols-1 md:grid-cols-3 gap-3"
    >
      {steps.map((item) => (
        <motion.div
          key={item.step}
          variants={cardVariant}
          className={`bg-card rounded-2xl border card-shadow p-4 md:p-5 text-center hover:card-shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${item.step === "03" ? "border-accent/30 hover:border-accent/50" : "border-border hover:border-accent/20"}`}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <item.icon className="w-4 h-4 text-accent" />
            </div>
            <span className="text-[11px] font-bold text-accent uppercase tracking-[0.12em]">Step {item.step}</span>
          </div>
          <h3 className="text-[15px] font-bold text-foreground mb-2 tracking-tight">{item.title}</h3>
          <p className="text-[13px] text-muted-foreground leading-relaxed">{item.desc}</p>
        </motion.div>
      ))}
    </motion.div>
  </section>
);

export default HowItWorksSection;
