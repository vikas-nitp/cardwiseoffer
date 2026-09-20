const LegalSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-base font-semibold text-foreground mb-3">{title}</h2>
    <div className="text-[13.5px] text-muted-foreground leading-relaxed space-y-2">{children}</div>
  </section>
);

export default LegalSection;
