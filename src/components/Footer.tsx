import { Link } from "react-router-dom";
import { APP_NAME, DISCLAIMER_TEXT } from "@/constants";

interface FooterProps {
  onSectionChange?: (section: "about" | "contact") => void;
}

const Footer = ({ onSectionChange }: FooterProps) => (
  <footer className="w-full border-t border-border/40">
    <p className="text-[11px] text-foreground/40 text-center px-4 pt-3 pb-1 leading-relaxed">
      {DISCLAIMER_TEXT}
    </p>
    <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-center">
      <div className="flex items-center gap-4 flex-wrap justify-center">
        {onSectionChange && (
          <>
            <button onClick={() => onSectionChange("about")} className="text-[12px] text-foreground/50 hover:text-foreground transition-colors">About</button>
            <button onClick={() => onSectionChange("contact")} className="text-[12px] text-foreground/50 hover:text-foreground transition-colors">Contact</button>
          </>
        )}
        <Link to="/privacy" className="text-[12px] text-foreground/50 hover:text-foreground transition-colors">Privacy</Link>
        <Link to="/terms" className="text-[12px] text-foreground/50 hover:text-foreground transition-colors">Terms</Link>
        <span className="text-[11px] text-foreground/35">© {new Date().getFullYear()} {APP_NAME}</span>
      </div>
    </div>
  </footer>
);

export default Footer;
