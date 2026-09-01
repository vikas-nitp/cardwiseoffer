import { APP_NAME, APP_TAGLINE } from "@/constants";

const Footer = () => (
  <footer className="w-full py-6 px-4 border-t border-border/40">
    <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
      <p className="text-[12px] text-muted-foreground/70">
        {APP_NAME} — {APP_TAGLINE}.
      </p>
      <p className="text-[12px] text-muted-foreground/50">
        © {new Date().getFullYear()} {APP_NAME}
      </p>
    </div>
  </footer>
);

export default Footer;
