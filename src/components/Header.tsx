import { Link, useLocation } from "react-router-dom";
import { Plane } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className="w-full py-4 px-6 md:px-10 flex items-center justify-between relative z-10">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Plane className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="text-xl font-display font-bold text-foreground">
          Cardwise
        </span>
      </Link>
      {isHome && (
        <nav className="hidden md:flex items-center gap-8">
          {["How it works", "Offers", "About"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
