/**
 * Currently Supporting Section
 * 
 * Displays supported banks and platforms from backend meta.
 * Shows clean badges for each supported item.
 */

import { useMeta } from "@/contexts/MetaContext";
import { CreditCard, Globe } from "lucide-react";

const SupportedSection = () => {
  const { meta, loading } = useMeta();

  if (loading) {
    return null;
  }

  const { banks, platforms } = meta;

  return (
    <section className="w-full max-w-3xl mx-auto mt-8">
      <div className="glass-card rounded-2xl card-shadow p-6 md:p-8">
        <h3 className="text-lg font-display font-bold text-foreground mb-4 text-center">
          Currently Supporting
        </h3>
        
        {/* Banks */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <CreditCard className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Banks</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {banks.map((bank) => (
              <span
                key={bank.id}
                className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-full"
              >
                {bank.name}
              </span>
            ))}
          </div>
        </div>

        {/* Platforms */}
        <div>
          <div className="flex items-center gap-2 mb-3 justify-center">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Platforms</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {platforms.map((platform) => (
              <span
                key={platform.id}
                className="px-3 py-1.5 bg-secondary text-foreground text-xs font-semibold rounded-full"
              >
                {platform.name}
              </span>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          More banks and platforms coming soon!
        </p>
      </div>
    </section>
  );
};

export default SupportedSection;
