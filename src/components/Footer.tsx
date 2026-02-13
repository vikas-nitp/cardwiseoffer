const Footer = () => {
  return (
    <footer className="w-full py-8 px-6 text-center">
      <p className="text-sm text-muted-foreground italic">
        "We don't sell tickets. We only show the truth."
      </p>
      <p className="text-xs text-muted-foreground/60 mt-3">
        © {new Date().getFullYear()} SaveWithCard. Independent offer comparison.
      </p>
    </footer>
  );
};

export default Footer;
