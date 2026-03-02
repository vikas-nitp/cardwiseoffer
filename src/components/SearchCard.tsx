import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Search, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CityAutocomplete from "@/components/CityAutocomplete";
import BankMultiSelect from "@/components/BankMultiSelect";
import type { CityOption } from "@/types/api";

interface SearchCardProps {
  cities: CityOption[];
  onSearch: (from: CityOption, to: CityOption, date: Date, banks: string[]) => void;
  initialFrom?: CityOption | null;
  initialTo?: CityOption | null;
  initialDate?: Date;
  initialBanks?: string[];
}

const SearchCard = ({ cities, onSearch, initialFrom, initialTo, initialDate, initialBanks }: SearchCardProps) => {
  const [from, setFrom] = useState<CityOption | null>(initialFrom ?? null);
  const [to, setTo] = useState<CityOption | null>(initialTo ?? null);
  const [date, setDate] = useState<Date | undefined>(initialDate ?? undefined);
  const [selectedBanks, setSelectedBanks] = useState<string[]>(initialBanks ?? []);
  const [sameError, setSameError] = useState(false);

  useEffect(() => {
    if (initialFrom) setFrom(initialFrom);
    if (initialTo) setTo(initialTo);
    if (initialDate) setDate(initialDate);
    if (initialBanks) setSelectedBanks(initialBanks);
  }, [initialFrom, initialTo, initialDate, initialBanks]);

  useEffect(() => {
    setSameError(!!(from && to && from.code === to.code));
  }, [from, to]);

  const isSearchDisabled = !from || !to || !date || sameError;

  const handleSearch = () => {
    if (!from || !to || !date || sameError) return;
    onSearch(from, to, date, selectedBanks);
  };

  return (
    <div className="w-full max-w-5xl mx-auto glass-card rounded-2xl card-shadow-lg p-6 md:p-8 animate-fade-up glow-ring relative z-30" style={{ animationDelay: "0.2s" }}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="relative z-[40]">
          <CityAutocomplete label="From" cities={cities} value={from} onChange={setFrom} />
        </div>
        <div className="relative z-[40]">
          <CityAutocomplete label="To" cities={cities} value={to} onChange={setTo} excludeCode={from?.code} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Departure</label>
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full bg-secondary/50 border-0 h-auto text-sm pl-10 pr-3 py-2.5 min-h-[56px] rounded-xl text-left flex items-center relative hover:bg-secondary/70 transition-colors">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                {date ? (
                  <div>
                    <span className="font-bold text-foreground block">{format(date, "dd MMM yyyy")}</span>
                    <span className="text-xs text-muted-foreground">{format(date, "EEEE")}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Select date</span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[60]" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="relative z-[35]">
          <BankMultiSelect selected={selectedBanks} onChange={setSelectedBanks} />
        </div>
      </div>

      {sameError && (
        <div className="flex items-center gap-2 mt-3 text-destructive text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4" />
          <span>Source and destination cannot be the same.</span>
        </div>
      )}

      <Button
        onClick={handleSearch}
        disabled={isSearchDisabled}
        className="w-full mt-6 h-12 text-base font-semibold rounded-xl gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
        size="lg"
      >
        <Search className="w-4 h-4" />
        Search Best Offers
      </Button>
    </div>
  );
};

export default SearchCard;
