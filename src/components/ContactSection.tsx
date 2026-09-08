import { Mail, AlertCircle, MessageSquare } from "lucide-react";
import { SUPPORT_EMAIL, APP_NAME } from "@/constants";

const ContactSection = () => (
  <section className="w-full max-w-3xl mx-auto animate-fade-up">
    <div className="bg-card rounded-2xl border border-border border-t-2 border-t-accent/40 card-shadow-lg p-8 md:p-10">
      <h2 className="text-xl font-bold text-foreground mb-6 tracking-tight">Get in touch</h2>

      <div className="space-y-3">
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border hover:border-accent/30 hover:bg-muted/60 transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
            <Mail className="w-4.5 h-4.5 text-accent" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.10em] mb-0.5">Email</p>
            <span className="text-sm font-semibold text-primary group-hover:underline truncate block">
              {SUPPORT_EMAIL}
            </span>
          </div>
        </a>
      </div>

      <div className="mt-8 pt-6 border-t border-border/40 space-y-3">
        <p className="text-[13px] font-semibold text-foreground mb-3">Common reasons to reach out</p>
        {[
          { icon: AlertCircle, text: "Report a missing or incorrect offer" },
          { icon: MessageSquare, text: "Suggest a bank or platform to add" },
          { icon: Mail, text: "Data errors or outdated information" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3 text-[13px] text-muted-foreground">
            <Icon className="w-4 h-4 text-accent/60 shrink-0" />
            <span>{text}</span>
          </div>
        ))}
      </div>

      <p className="mt-6 text-[12px] text-muted-foreground/60">
        {APP_NAME} is an independent tool. We are not affiliated with any bank or travel platform.
      </p>
    </div>
  </section>
);

export default ContactSection;
