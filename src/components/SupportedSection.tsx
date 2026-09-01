import { useMeta } from "@/contexts/MetaContext";

const SupportedSection = () => {
  const { meta, loading } = useMeta();
  if (loading || !meta.banks.length) return null;

  const bankNames = meta.banks.map((b) => b.name).join(", ");
  const platformNames = meta.platforms.map((p) => p.name).join(", ");

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 text-center space-y-1">
      <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
        <span className="font-semibold text-muted-foreground">Banks:</span> {bankNames}
      </p>
      <p className="text-[12px] text-muted-foreground/80 leading-relaxed">
        <span className="font-semibold text-muted-foreground">Platforms:</span> {platformNames}
      </p>
    </div>
  );
};

export default SupportedSection;
