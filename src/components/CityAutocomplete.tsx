import { useState, useRef, useEffect } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CityOption } from "@/types/api";

interface CityAutocompleteProps {
  label: string;
  cities: CityOption[];
  value: CityOption | null;
  onChange: (city: CityOption | null) => void;
  excludeCode?: string;
}

const CityAutocomplete = ({ label, cities, value, onChange, excludeCode }: CityAutocompleteProps) => {
  const availableCities = excludeCode ? cities.filter(c => c.code !== excludeCode) : cities;
  const [query, setQuery] = useState(value ? `${value.city} (${value.code})` : "");
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<CityOption[]>(availableCities);
  const wrapperRef = useRef<HTMLDivElement>(null);

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
    const q = val.toLowerCase();
    setFiltered(
      availableCities.filter(c =>
        c.city.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.airport.toLowerCase().includes(q)
      )
    );
    if (value && val !== `${value.city} (${value.code})`) onChange(null);
  };

  const handleSelect = (city: CityOption) => {
    onChange(city);
    setQuery(`${city.city} (${city.code})`);
    setOpen(false);
  };

  return (
    <div className="space-y-1.5 relative" ref={wrapperRef}>
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => { setOpen(true); setFiltered(availableCities); }}
          placeholder="Type city or airport..."
          className="w-full bg-secondary/50 border-0 h-auto text-sm pl-10 pr-3 py-2.5 min-h-[56px] rounded-xl font-bold text-foreground placeholder:font-normal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-[60] mt-1 bg-card border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c.code}
              onClick={() => handleSelect(c)}
              className={cn(
                "w-full text-left px-4 py-3 hover:bg-secondary/60 transition-colors flex flex-col",
                value?.code === c.code && "bg-primary/10"
              )}
            >
              <span className="font-semibold text-sm text-foreground">
                {c.city} <span className="text-muted-foreground">({c.code})</span>
              </span>
              <span className="text-xs text-muted-foreground">{c.airport}</span>
            </button>
          ))}
        </div>
      )}
      {open && filtered.length === 0 && query.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-[60] mt-1 bg-card border border-border rounded-xl shadow-lg p-4 text-center text-sm text-muted-foreground">
          No matching cities found
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete;
export type { CityOption };
