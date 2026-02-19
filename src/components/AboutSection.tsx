import { CheckCircle } from "lucide-react";

const AboutSection = () => (
  <section className="w-full max-w-3xl mx-auto animate-fade-up">
    <div className="glass-card rounded-2xl card-shadow-lg p-8 md:p-12">
      <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">
        About CardWiseOffer
      </h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed text-sm md:text-base">
        <p>
          <span className="text-foreground font-semibold">CardWiseOffer</span> helps you find the best real credit card savings before booking your travel.
        </p>
        <p>
          Travel platforms often run overlapping, time-bound bank offers that are hard to compare. The fine print is confusing, discounts are unclear, and users are left guessing which card actually saves the most.
        </p>
        <p className="text-foreground font-medium">
          CardWiseOffer acts as an independent comparison layer.
        </p>
        <p>We analyze publicly available bank offers across major travel platforms and show you:</p>
        <ul className="space-y-2.5 pl-1">
          {["Which offer saves the most", "What conditions apply", "Whether a different card gives better value"].map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="border-t border-border pt-4 italic text-muted-foreground">
          We don't sell tickets. We don't push bookings. Our only goal is to help you make a smarter decision before you pay.
        </p>
      </div>
    </div>
  </section>
);

export default AboutSection;
