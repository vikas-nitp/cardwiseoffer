import { Mail, Phone } from "lucide-react";

const ContactSection = () => (
  <section className="w-full max-w-3xl mx-auto animate-fade-up">
    <div className="glass-card rounded-2xl card-shadow-lg p-8 md:p-12">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 tracking-tight">
        Contact Us
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        Have questions or feedback? We'd love to hear from you.
      </p>

      <div className="space-y-3">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/30 hover:border-border/60 transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em]">Email</p>
            <a href="mailto:support@cardwiseoffer.com" className="text-sm font-semibold text-primary hover:underline">
              support@cardwiseoffer.com
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/30 hover:border-border/60 transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em]">Phone</p>
            <a href="tel:+919876543210" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
              +91 98765 43210
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ContactSection;
