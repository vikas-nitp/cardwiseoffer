import { useState } from "react";
import { Link } from "react-router-dom";
import { Plane, User, LogOut, Menu, X } from "lucide-react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: { label: string; section: ActiveSection }[] = [
    { label: "All Offers", section: "all-offers" },
    { label: "How It Works", section: "how-it-works" },
    { label: "About", section: "about" },
    { label: "Contact Us", section: "contact" },
  ];

  const handleNav = (section: ActiveSection) => {
    onSectionChange(section);
    setMobileOpen(false);
  };

  return (
    <>
      <header className="w-full py-3 px-4 md:px-10 flex items-center justify-between relative z-20">
        <Link
          to="/"
          className="flex items-center gap-2 group"
          onClick={() => handleNav("home")}
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <Plane className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-display font-bold text-foreground tracking-tight">
            CardWiseOffer
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ label, section }) => (
            <button
              key={section}
              onClick={() => handleNav(section)}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                activeSection === section
                  ? "bg-primary/10 text-primary font-semibold"
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

        {/* Mobile hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          {isLoggedIn && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10">
              <User className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary max-w-[80px] truncate">
                {user?.name || "User"}
              </span>
            </div>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-foreground hover:bg-secondary/60 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <nav className="absolute top-0 right-0 w-64 h-full bg-card shadow-xl p-6 pt-16 flex flex-col gap-1 animate-slide-in-right">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            {navItems.map(({ label, section }) => (
              <button
                key={section}
                onClick={() => handleNav(section)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  activeSection === section
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                )}
              >
                {label}
              </button>
            ))}
            <div className="border-t border-border mt-4 pt-4">
              {isLoggedIn ? (
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              ) : (
                <Button
                  className="w-full rounded-xl font-semibold gap-1.5"
                  onClick={() => { setShowAuth(true); setMobileOpen(false); }}
                >
                  <User className="w-4 h-4" />
                  Login
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}

      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
};

export default Header;
