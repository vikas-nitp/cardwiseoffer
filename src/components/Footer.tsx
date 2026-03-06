const Footer = () => {
  return (
    <footer className="w-full py-8 px-4 border-t border-border/40">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[13px] text-muted-foreground font-medium">
          "We don't sell tickets. We only show the truth."
        </p>
        <p className="text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} CardWiseOffer
        </p>
      </div>
    </footer>
  );
};

export default Footer;
