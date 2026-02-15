import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Search, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CityAutocomplete, { type CityOption } from "@/components/CityAutocomplete";
import BankMultiSelect from "@/components/BankMultiSelect";

const cities: CityOption[] = [
  { city: "Bangalore", code: "BLR", airport: "Kempegowda International Airport" },
  { city: "Delhi", code: "DEL", airport: "Indira Gandhi International Airport" },
  { city: "Mumbai", code: "BOM", airport: "Chhatrapati Shivaji Maharaj International Airport" },
  { city: "Chennai", code: "MAA", airport: "Chennai International Airport" },
  { city: "Hyderabad", code: "HYD", airport: "Rajiv Gandhi International Airport" },
  { city: "Kolkata", code: "CCU", airport: "Netaji Subhas Chandra Bose International Airport" },
  { city: "Pune", code: "PNQ", airport: "Pune Airport" },
  { city: "Goa", code: "GOI", airport: "Manohar International Airport" },
  { city: "Jaipur", code: "JAI", airport: "Jaipur International Airport" },
  { city: "Ahmedabad", code: "AMD", airport: "Sardar Vallabhbhai Patel International Airport" },
];

interface SearchCardProps {
  onSearch: (from: CityOption, to: CityOption, date: Date, banks: string[]) => void;
  initialFrom?: CityOption | null;
  initialTo?: CityOption | null;
  initialDate?: Date;
  initialBanks?: string[];
}

const SearchCard = ({ onSearch, initialFrom, initialTo, initialDate, initialBanks }: SearchCardProps) => {
  const [from, setFrom] = useState<CityOption | null>(initialFrom ?? null);
  const [to, setTo] = useState<CityOption | null>(initialTo ?? null);
  const [date, setDate] = useState<Date | undefined>(initialDate ?? new Date());
  const [selectedBanks, setSelectedBanks] = useState<string[]>(initialBanks ?? []);
  const [sameError, setSameError] = useState(false);

  // Sync initial values when editing
  useEffect(() => {
    if (initialFrom) setFrom(initialFrom);
    if (initialTo) setTo(initialTo);
    if (initialDate) setDate(initialDate);
    if (initialBanks) setSelectedBanks(initialBanks);
  }, [initialFrom, initialTo, initialDate, initialBanks]);

  // Validate same city
  useEffect(() => {
    if (from && to && from.code === to.code) {
      setSameError(true);
    } else {
      setSameError(false);
    }
  }, [from, to]);

  const isSearchDisabled = !from || !to || !date || sameError;

  const handleSearch = () => {
    if (!from || !to || !date || sameError) return;
    onSearch(from, to, date, selectedBanks);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-card/95 backdrop-blur-sm rounded-2xl card-shadow-lg p-6 md:p-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CityAutocomplete
          label="From"
          cities={cities}
          value={from}
          onChange={setFrom}
        />
        <CityAutocomplete
          label="To"
          cities={cities}
          value={to}
          onChange={setTo}
        />

        {/* Departure */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Departure</label>
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full bg-secondary/50 border-0 h-auto text-sm pl-10 pr-3 py-2.5 min-h-[56px] rounded-md text-left flex items-center relative">
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
            <PopoverContent className="w-auto p-0" align="start">
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

        <BankMultiSelect
          selected={selectedBanks}
          onChange={setSelectedBanks}
        />
      </div>

      {/* Same city error */}
      {sameError && (
        <div className="flex items-center gap-2 mt-3 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Source and destination cannot be the same.</span>
        </div>
      )}

      <Button
        onClick={handleSearch}
        disabled={isSearchDisabled}
        className="w-full mt-6 h-12 text-base font-semibold rounded-xl gap-2"
        size="lg"
      >
        <Search className="w-4 h-4" />
        Search Best Offers
      </Button>
    </div>
  );
};

export default SearchCard;
