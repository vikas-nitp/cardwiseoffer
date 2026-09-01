import { Mail } from "lucide-react";
import { SUPPORT_EMAIL } from "@/constants";

const ContactSection = () => (
  <section className="w-full max-w-2xl mx-auto animate-fade-up">
    <div className="bg-card rounded-2xl border border-border border-t-2 border-t-accent/40 card-shadow-lg p-8">
      <h2 className="text-2xl font-bold text-foreground mb-1 tracking-tight">Contact</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Found a missing offer, a data error, or have feedback? Email us.
      </p>
      <a
        href={`mailto:${SUPPORT_EMAIL}`}
        className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 border border-border hover:border-accent/30 transition-all duration-200 group w-fit"
      >
        <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
          <Mail className="w-4 h-4 text-accent" />
        </div>
        <span className="text-sm font-semibold text-primary group-hover:underline">
          {SUPPORT_EMAIL}
        </span>
      </a>
    </div>
  </section>
);

export default ContactSection;
