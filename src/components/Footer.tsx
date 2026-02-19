const Footer = () => {
  return (
    <footer className="w-full py-6 px-4 text-center">
      <p className="text-sm text-muted-foreground font-medium">
        "We don't sell tickets. We only show the truth."
      </p>
      <p className="text-xs text-muted-foreground/60 mt-2">
        © {new Date().getFullYear()} CardWiseOffer. Independent offer comparison.
      </p>
    </footer>
  );
};

export default Footer;
