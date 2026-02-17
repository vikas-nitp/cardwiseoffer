import { Link } from "react-router-dom";
import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";

export type ActiveSection = "home" | "results" | "all-offers" | "about" | "how-it-works" | "contact";

interface HeaderProps {
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
}

const Header = ({ activeSection, onSectionChange }: HeaderProps) => {
  const navItems: { label: string; section: ActiveSection }[] = [
    { label: "All Offers", section: "all-offers" },
    { label: "How It Works", section: "how-it-works" },
    { label: "About", section: "about" },
    { label: "Contact Us", section: "contact" },
  ];

  return (
    <header className="w-full py-4 px-6 md:px-10 flex items-center justify-between relative z-10">
      <Link
        to="/"
        className="flex items-center gap-2.5 group"
        onClick={() => onSectionChange("home")}
      >
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
          <Plane className="w-4.5 h-4.5 text-primary-foreground" />
        </div>
        <span className="text-xl font-display font-bold text-foreground tracking-tight">
          SaveWithCard
        </span>
      </Link>
      <nav className="hidden md:flex items-center gap-1">
        {navItems.map(({ label, section }) => (
          <button
            key={section}
            onClick={() => onSectionChange(section)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              activeSection === section
                ? "bg-primary/10 text-primary font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
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
