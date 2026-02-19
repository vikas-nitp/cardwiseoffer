import { Mail, Phone } from "lucide-react";

const ContactSection = () => (
  <section className="w-full max-w-3xl mx-auto animate-fade-up">
    <div className="glass-card rounded-2xl card-shadow-lg p-8 md:p-12">
      <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
        Contact Us
      </h2>
      <p className="text-muted-foreground mb-8">
        Have questions or feedback? We'd love to hear from you.
      </p>

      <div className="space-y-4">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</p>
            <a href="mailto:support@cardwiseoffer.com" className="font-semibold text-primary hover:underline">
              support@cardwiseoffer.com
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone</p>
            <a href="tel:+919876543210" className="font-semibold text-foreground hover:text-primary transition-colors">
              +91 98765 43210
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ContactSection;
