import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Plane, X, User, LogOut, ChevronDown, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import ProfileModal from "@/components/ProfileModal";

export type ActiveSection = "home" | "results" | "all-offers" | "about" | "how-it-works" | "contact";

interface HeaderProps {
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
  allOffersEnabled?: boolean;
  authEnabled?: boolean;
}

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  if (!user) return null;

  return (
    <>
      <div className="relative ml-2">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20 text-[13px] font-semibold text-accent hover:bg-accent/15 transition-colors"
        >
          <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
            <User className="w-3 h-3 text-accent" />
          </div>
          <span className="hidden sm:inline">{user.maskedPhone}</span>
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
        </button>

        {open && (
          <>
            <button
              aria-label="Close menu"
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-card border border-border/60 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
              <div className="px-3 py-2.5 border-b border-border/40">
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Signed in as</p>
                <p className="text-[13px] font-semibold text-foreground mt-0.5">{user.maskedPhone}</p>
              </div>
              <button
                onClick={() => { setProfileOpen(true); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> My Profile
              </button>
              <button
                onClick={() => { signOut(); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          </>
        )}
      </div>
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
};

const Header = ({ activeSection, onSectionChange, allOffersEnabled = true, authEnabled = false }: HeaderProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isSignedIn, openSignIn } = useAuth();

  const navItems: { label: string; section: ActiveSection }[] = [
    ...(allOffersEnabled ? [{ label: "All Offers", section: "all-offers" as ActiveSection }] : []),
    { label: "How It Works", section: "how-it-works" },
  ];
  const handleNav = (section: ActiveSection) => { onSectionChange(section); setMobileOpen(false); };

  return (
    <>
      <header className="w-full py-4 px-4 md:px-8 flex items-center justify-between relative z-20 border-b border-white/[0.08] bg-background/[0.15] backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-2.5 group" onClick={() => handleNav("home")}>
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-sm">
            <Plane className="w-4.5 h-4.5 text-accent-foreground" />
          </div>
          <span className="hidden sm:inline text-lg font-bold text-foreground tracking-tight">{APP_NAME}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map(({ label, section }) => (
            <button
              key={section}
              onClick={() => handleNav(section)}
              className={cn(
                "px-3.5 py-2 rounded-lg text-[13px] font-medium transition-colors",
                activeSection === section
                  ? "bg-accent/12 text-accent font-semibold"
                  : "text-foreground/60 hover:text-foreground hover:bg-white/[0.06]"
              )}
            >
              {label}
            </button>
          ))}

          {authEnabled && (
            isSignedIn ? (
              <UserMenu />
            ) : (
              <button
                onClick={openSignIn}
                className="ml-2 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-semibold border border-border/50 text-foreground/70 hover:text-foreground hover:border-accent/40 hover:bg-accent/5 transition-colors"
              >
                <User className="w-3.5 h-3.5" /> Sign in
              </button>
            )
          )}
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-foreground hover:bg-muted/60 md:hidden"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 w-full bg-foreground/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <nav className="absolute top-0 right-0 w-72 h-full bg-card shadow-2xl p-6 pt-16 flex flex-col gap-1">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            {navItems.map(({ label, section }) => (
              <button
                key={section}
                onClick={() => handleNav(section)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl text-sm font-medium",
                  activeSection === section
                    ? "bg-accent/8 text-accent font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {label}
              </button>
            ))}
            {authEnabled && !isSignedIn && (
              <button
                onClick={() => { openSignIn(); setMobileOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center gap-2 border border-border/40 mt-2"
              >
                <User className="w-4 h-4" /> Sign in
              </button>
            )}
            {authEnabled && isSignedIn && (
              <div className="mt-2 border-t border-border/40 pt-2">
                <p className="px-4 py-1 text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Account</p>
                <UserMenu />
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;
