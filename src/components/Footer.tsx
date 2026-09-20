import { Link } from "react-router-dom";
import { APP_NAME, DISCLAIMER_TEXT } from "@/constants";
import { useFeatureFlags } from "@/contexts/FeatureFlagContext";
import { resolveFeatureCapabilities } from "@/config/featureCapabilities";

interface FooterProps {
  onSectionChange?: (section: "about" | "contact") => void;
}

const Footer = ({ onSectionChange }: FooterProps) => {
  const { flags } = useFeatureFlags();
  const caps = resolveFeatureCapabilities(flags);
  return (
    <footer className="w-full border-t border-border/40">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col items-center gap-2">
        <p className="text-[11px] text-foreground/35 text-center leading-relaxed">
          {DISCLAIMER_TEXT}{" "}
          Anonymous session data used for visitor counting only.
        </p>
        <div className="flex items-center gap-4 flex-wrap justify-center">
          {onSectionChange && caps.about && (
            <button onClick={() => onSectionChange("about")} className="text-[12px] text-foreground/50 hover:text-foreground transition-colors">About</button>
          )}
          {onSectionChange && caps.contact && (
            <button onClick={() => onSectionChange("contact")} className="text-[12px] text-foreground/50 hover:text-foreground transition-colors">Contact</button>
          )}
          {caps.privacyPolicy && (
            <Link to="/privacy" className="text-[12px] text-foreground/50 hover:text-foreground transition-colors">Privacy</Link>
          )}
          {caps.termsOfService && (
            <Link to="/terms" className="text-[12px] text-foreground/50 hover:text-foreground transition-colors">Terms</Link>
          )}
          <span className="text-[11px] text-foreground/35">© {new Date().getFullYear()} {APP_NAME}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
