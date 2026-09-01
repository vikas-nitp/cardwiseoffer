import { useState, useRef, useEffect, useMemo } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CityOption {
  city: string;
  code: string;
  airport: string;
}

interface CityAutocompleteProps {
  label: string;
  cities: CityOption[];
  value: CityOption | null;
  onChange: (city: CityOption | null) => void;
  excludeCode?: string;
}

const CityAutocomplete = ({ label, cities, value, onChange, excludeCode }: CityAutocompleteProps) => {
  const availableCities = useMemo(
    () => excludeCode ? cities.filter((city) => city.code !== excludeCode) : cities,
    [cities, excludeCode]
  );
  const [query, setQuery] = useState(value ? `${value.city} (${value.code})` : "");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return availableCities;
    return availableCities.filter(
      (city) =>
        city.city.toLowerCase().includes(normalizedQuery) ||
        city.code.toLowerCase().includes(normalizedQuery) ||
        city.airport.toLowerCase().includes(normalizedQuery)
    );
  }, [availableCities, query]);

  useEffect(() => {
    if (value) setQuery(`${value.city} (${value.code})`);
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (!value) setQuery("");
        else setQuery(`${value.city} (${value.code})`);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [value]);

  const handleInputChange = (val: string) => {
    setQuery(val);
    setOpen(true);
    if (value && val !== `${value.city} (${value.code})`) onChange(null);
  };

  const handleSelect = (city: CityOption) => {
    onChange(city);
    setQuery(`${city.city} (${city.code})`);
    setOpen(false);
  };

  return (
    <div className="space-y-1.5 relative z-40" ref={wrapperRef}>
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em]">
        {label}
      </label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Type city or airport..."
          className="w-full bg-muted/40 border border-border/30 h-auto text-[13px] pl-10 pr-3 py-2.5 min-h-[56px] rounded-xl font-semibold text-foreground placeholder:font-normal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring hover:border-primary/20 transition-all duration-200"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-[60] mt-1 bg-card border border-border/60 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c.code}
              onClick={() => handleSelect(c)}
              className={cn(
                "w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors flex flex-col",
                value?.code === c.code && "bg-primary/6"
              )}
            >
              <span className="font-medium text-[13px] text-foreground">
                {c.city} <span className="text-muted-foreground">({c.code})</span>
              </span>
              <span className="text-[11px] text-muted-foreground">{c.airport}</span>
            </button>
          ))}
        </div>
      )}
      {open && filtered.length === 0 && query.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-[60] mt-1 bg-card border border-border/60 rounded-xl shadow-lg p-4 text-center text-[13px] text-muted-foreground">
          No matching cities found
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete;
