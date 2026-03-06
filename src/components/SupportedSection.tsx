import { useMeta } from "@/contexts/MetaContext";
import { CreditCard, Globe } from "lucide-react";

const SupportedSection = () => {
  const { meta, loading } = useMeta();

  if (loading) return null;

  const { banks, platforms } = meta;

  return (
    <section className="w-full max-w-3xl mx-auto mt-10">
      <div className="glass-card rounded-2xl card-shadow p-6 md:p-8">
        <h3 className="text-sm font-bold text-foreground mb-6 text-center tracking-tight">
          Currently Supporting
        </h3>
        
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <CreditCard className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em]">Banks</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {banks.map((bank) => (
              <span
                key={bank.id}
                className="px-3 py-1.5 bg-primary/6 text-primary text-xs font-medium rounded-lg border border-primary/10"
              >
                {bank.name}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-border/30 pt-5">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em]">Platforms</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {platforms.map((platform) => (
              <span
                key={platform.id}
                className="px-3 py-1.5 bg-muted/50 text-foreground text-xs font-medium rounded-lg border border-border/40"
              >
                {platform.name}
              </span>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground/70 text-center mt-5">
          More banks and platforms coming soon
        </p>
      </div>
    </section>
  );
};

export default SupportedSection;
