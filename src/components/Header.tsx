import { Link } from "react-router-dom";
import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";

export type ActiveSection = "results" | "all-offers" | "about" | "how-it-works";

interface HeaderProps {
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
  hasSearched: boolean;
}

const Header = ({ activeSection, onSectionChange, hasSearched }: HeaderProps) => {
  const navItems: { label: string; section: ActiveSection }[] = [
    ...(hasSearched ? [{ label: "Search Results", section: "results" as ActiveSection }] : []),
    { label: "All Offers", section: "all-offers" as ActiveSection },
    { label: "About", section: "about" as ActiveSection },
    { label: "How It Works", section: "how-it-works" as ActiveSection },
  ];

  return (
    <header className="w-full py-4 px-6 md:px-10 flex items-center justify-between relative z-10">
      <Link
        to="/"
        className="flex items-center gap-2 group"
        onClick={() => onSectionChange(hasSearched ? "results" : "about")}
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
      </nav>
    </header>
  );
};

export default Header;
