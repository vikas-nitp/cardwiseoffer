import { Link } from "react-router-dom";
import { Plane, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export type ActiveSection = "home" | "results" | "all-offers" | "about" | "how-it-works" | "help";

interface HeaderProps {
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
}

const Header = ({ activeSection, onSectionChange }: HeaderProps) => {
  const navItems: { label: string; section: ActiveSection }[] = [
    { label: "All Offers", section: "all-offers" },
    { label: "How It Works", section: "how-it-works" },
    { label: "About", section: "about" },
    { label: "Help", section: "help" },
  ];

  return (
    <header className="w-full py-4 px-6 md:px-10 flex items-center justify-between relative z-10">
      <Link
        to="/"
        className="flex items-center gap-2 group"
        onClick={() => onSectionChange("home")}
      >
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Plane className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="text-xl font-display font-bold text-foreground">
          SaveWithCard
        </span>
      </Link>
      <nav className="hidden md:flex items-center gap-1">
        {navItems.map(({ label, section }) => (
          <button
            key={section}
            onClick={() => onSectionChange(section)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeSection === section
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            {label}
          </button>
        ))}
        <div className="ml-2 flex items-center gap-1 text-muted-foreground text-sm">
          <Globe className="w-3.5 h-3.5" />
          <span className="font-medium">EN</span>
        </div>
      </nav>
    </header>
  );
};

export default Header;
