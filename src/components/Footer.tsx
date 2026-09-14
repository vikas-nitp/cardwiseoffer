import { APP_NAME, APP_TAGLINE } from "@/constants";

interface FooterProps {
  onSectionChange?: (section: "about" | "contact") => void;
}

const Footer = ({ onSectionChange }: FooterProps) => (
  <footer className="w-full py-4 px-4 border-t border-border/40">
    <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
      <p className="text-[13px] font-medium text-foreground/70">
        {APP_NAME} <span className="text-foreground/40 mx-1"> - </span> {APP_TAGLINE}.
      </p>
      <div className="flex items-center gap-4">
        {onSectionChange && (
          <>
            <button onClick={() => onSectionChange("about")} className="text-[13px] text-foreground/60 hover:text-foreground transition-colors font-medium">About</button>
            <button onClick={() => onSectionChange("contact")} className="text-[13px] text-foreground/60 hover:text-foreground transition-colors font-medium">Contact</button>
          </>
        )}
        <p className="text-[12px] text-foreground/40">
          © {new Date().getFullYear()} {APP_NAME}
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
