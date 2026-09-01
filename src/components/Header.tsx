import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Plane, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ActiveSection = "home" | "results" | "all-offers" | "about" | "how-it-works" | "contact";

interface HeaderProps {
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
  allOffersEnabled?: boolean;
}

const Header = ({ activeSection, onSectionChange, allOffersEnabled = true }: HeaderProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems: { label: string; section: ActiveSection }[] = [
    ...(allOffersEnabled ? [{ label: "All Offers", section: "all-offers" as ActiveSection }] : []),
    { label: "How It Works", section: "how-it-works" },
    { label: "About", section: "about" },
    { label: "Contact", section: "contact" },
  ];
  const handleNav = (section: ActiveSection) => { onSectionChange(section); setMobileOpen(false); };
  return (
    <>
      <header className="w-full py-4 px-4 md:px-8 flex items-center justify-between relative z-20 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2.5 group" onClick={() => handleNav("home")}>
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-sm"><Plane className="w-4.5 h-4.5 text-accent-foreground" /></div>
          <span className="text-lg font-bold text-foreground tracking-tight">CardWiseOffer</span>
        </Link>
        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map(({ label, section }) => <button key={section} onClick={() => handleNav(section)} className={cn("px-3.5 py-2 rounded-lg text-[13px] font-medium", activeSection === section ? "bg-accent/8 text-accent font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}>{label}</button>)}
        </nav>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg text-foreground hover:bg-muted/60 md:hidden" aria-label="Toggle navigation">{mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
      </header>
      {mobileOpen && <div className="fixed inset-0 z-30 md:hidden">
        <button aria-label="Close navigation" className="absolute inset-0 w-full bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <nav className="absolute top-0 right-0 w-72 h-full bg-card shadow-2xl p-6 pt-16 flex flex-col gap-1">
          <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-muted-foreground" aria-label="Close"><X className="w-5 h-5" /></button>
          {navItems.map(({ label, section }) => <button key={section} onClick={() => handleNav(section)} className={cn("w-full text-left px-4 py-3 rounded-xl text-sm font-medium", activeSection === section ? "bg-accent/8 text-accent font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}>{label}</button>)}
        </nav>
      </div>}
    </>
  );
};

export default Header;
