import { useState } from "react";
import { Link } from "react-router-dom";
import { Plane, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/AuthModal";

export type ActiveSection = "home" | "results" | "all-offers" | "about" | "how-it-works" | "contact";

interface HeaderProps {
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
}

const Header = ({ activeSection, onSectionChange }: HeaderProps) => {
  const { isLoggedIn, user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const navItems: { label: string; section: ActiveSection }[] = [
    { label: "All Offers", section: "all-offers" },
    { label: "How It Works", section: "how-it-works" },
    { label: "About", section: "about" },
    { label: "Contact Us", section: "contact" },
  ];

  return (
    <>
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

          {isLoggedIn ? (
            <div className="flex items-center gap-2 ml-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10">
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  {user?.name || "User"}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="ml-3 rounded-xl font-semibold gap-1.5"
              onClick={() => setShowAuth(true)}
            >
              <User className="w-4 h-4" />
              Login
            </Button>
          )}
        </nav>
      </header>
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
};

export default Header;
