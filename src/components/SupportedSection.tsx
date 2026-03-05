import { useMeta } from "@/contexts/MetaContext";
import { CreditCard, Globe } from "lucide-react";

const SupportedSection = () => {
  const { meta, loading } = useMeta();

  if (loading) return null;

  const { banks, platforms } = meta;

  return (
    <section className="w-full max-w-3xl mx-auto mt-8">
      <div className="bg-card rounded-2xl card-shadow p-6 md:p-8 border border-border/50">
        <h3 className="text-base font-display font-bold text-foreground mb-5 text-center">
          Currently Supporting
        </h3>
        
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <CreditCard className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Banks</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {banks.map((bank) => (
              <span
                key={bank.id}
                className="px-3 py-1.5 bg-primary/8 text-primary text-xs font-semibold rounded-full border border-primary/15"
              >
                {bank.name}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-border/40 pt-5">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Platforms</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {platforms.map((platform) => (
              <span
                key={platform.id}
                className="px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full border border-border/40"
              >
                {platform.name}
              </span>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-5">
          More banks and platforms coming soon!
        </p>
      </div>
    </section>
  );
};

export default SupportedSection;
