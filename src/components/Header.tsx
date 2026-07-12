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
  authEnabled?: boolean;
  allOffersEnabled?: boolean;
}

const Header = ({ activeSection, onSectionChange, authEnabled = true, allOffersEnabled = true }: HeaderProps) => {
  const { isLoggedIn, user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: { label: string; section: ActiveSection }[] = [
    ...(allOffersEnabled ? [{ label: "All Offers", section: "all-offers" as ActiveSection }] : []),
    { label: "How It Works", section: "how-it-works" },
    { label: "About", section: "about" },
    { label: "Contact", section: "contact" },
  ];

  const handleNav = (section: ActiveSection) => {
    onSectionChange(section);
    setMobileOpen(false);
  };

  return (
    <>
      <header className="w-full py-4 px-4 md:px-8 flex items-center justify-between relative z-20">
        <Link
          to="/"
          className="flex items-center gap-2.5 group"
          onClick={() => handleNav("home")}
        >
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
            <Plane className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">
            CardWiseOffer
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map(({ label, section }) => (
            <button
              key={section}
              onClick={() => handleNav(section)}
              className={cn(
                "px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
                activeSection === section
                  ? "bg-primary/8 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {label}
            </button>
          ))}

          {isLoggedIn ? (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/6">
                <div className="w-6 h-6 rounded-full bg-primary/12 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-[13px] font-semibold text-foreground">
                  {user?.name || "User"}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : authEnabled ? (
            <Button
              variant="default"
              size="sm"
              className="ml-4 rounded-lg font-semibold gap-1.5 h-9 px-4 text-[13px] shadow-sm"
              onClick={() => setShowAuth(true)}
            >
              <User className="w-3.5 h-3.5" />
              Sign In
            </Button>
          ) : null}
        </nav>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          {isLoggedIn && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/6">
              <User className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground max-w-[80px] truncate">
                {user?.name || "User"}
              </span>
            </div>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-foreground hover:bg-muted/60 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <nav className="absolute top-0 right-0 w-72 h-full bg-card shadow-2xl p-6 pt-16 flex flex-col gap-1 animate-slide-in-right">
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
                    ? "bg-primary/8 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {label}
              </button>
            ))}
            <div className="border-t border-border mt-4 pt-4">
              {isLoggedIn ? (
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/8 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              ) : authEnabled ? (
                <Button
                  className="w-full rounded-xl font-semibold gap-1.5"
                  onClick={() => { setShowAuth(true); setMobileOpen(false); }}
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Button>
              ) : null}
            </div>
          </nav>
        </div>
      )}

      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
};

export default Header;
