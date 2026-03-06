import { useState, useEffect, useMemo } from "react";
import { Calendar as CalendarIcon, Search, AlertCircle } from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CityAutocomplete, { type CityOption } from "@/components/CityAutocomplete";
import BankMultiSelect from "@/components/BankMultiSelect";
import { useMeta } from "@/contexts/MetaContext";
import { MAX_BANK_FILTERS } from "@/constants";

const AIRPORT_CODE_PATTERN = /^[A-Z]{3}$/;

const validateAirportCode = (code: string): boolean => {
  return AIRPORT_CODE_PATTERN.test(code.toUpperCase());
};

const validateDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

interface SearchCardProps {
  onSearch: (from: CityOption, to: CityOption, date: Date, banks: string[]) => void;
  initialFrom?: CityOption | null;
  initialTo?: CityOption | null;
  initialDate?: Date;
  initialBanks?: string[];
}

const SearchCard = ({ onSearch, initialFrom, initialTo, initialDate, initialBanks }: SearchCardProps) => {
  const { meta } = useMeta();
  
  const cities: CityOption[] = useMemo(() => {
    return meta.airports.map((airport) => ({
      city: airport.city,
      code: airport.code,
      airport: airport.name,
    }));
  }, [meta.airports]);

  const [fromAirport, setFromAirport] = useState<CityOption | null>(initialFrom ?? null);
  const [toAirport, setToAirport] = useState<CityOption | null>(initialTo ?? null);
  const [departDate, setDepartDate] = useState<Date | undefined>(initialDate ?? undefined);
  const [banks, setBanks] = useState<string[]>(initialBanks ?? []);

  const [errors, setErrors] = useState<{
    from?: string;
    to?: string;
    date?: string;
    banks?: string;
  }>({});

  useEffect(() => {
    if (initialFrom) setFromAirport(initialFrom);
    if (initialTo) setToAirport(initialTo);
    if (initialDate) setDepartDate(initialDate);
    if (initialBanks) setBanks(initialBanks);
  }, [initialFrom, initialTo, initialDate, initialBanks]);

  const validation = useMemo(() => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!fromAirport) {
      isValid = false;
    } else if (!validateAirportCode(fromAirport.code)) {
      newErrors.from = "Invalid airport code";
      isValid = false;
    }

    if (!toAirport) {
      isValid = false;
    } else if (!validateAirportCode(toAirport.code)) {
      newErrors.to = "Invalid airport code";
      isValid = false;
    }

    if (fromAirport && toAirport && fromAirport.code === toAirport.code) {
      newErrors.to = "Destination cannot be same as source";
      isValid = false;
    }

    if (!departDate) {
      isValid = false;
    } else if (!validateDate(departDate)) {
      newErrors.date = "Date must be today or later";
      isValid = false;
    }

    if (banks.length > MAX_BANK_FILTERS) {
      newErrors.banks = `Maximum ${MAX_BANK_FILTERS} banks allowed`;
      isValid = false;
    }

    return { errors: newErrors, isValid };
  }, [fromAirport, toAirport, departDate, banks]);

  const handleSearch = () => {
    setErrors(validation.errors);
    if (!validation.isValid || !fromAirport || !toAirport || !departDate) return;
    onSearch(fromAirport, toAirport, departDate, banks);
  };

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const maxDate = useMemo(() => addDays(today, 365), [today]);

  const hasError = Object.keys(validation.errors).length > 0;

  return (
    <div className="w-full max-w-5xl mx-auto glass-card rounded-2xl card-shadow-lg p-6 md:p-8 animate-fade-up glow-ring relative z-30" style={{ animationDelay: "0.2s" }}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* From Airport */}
        <div className="space-y-1">
          <CityAutocomplete 
            label="From" 
            cities={cities} 
            value={fromAirport} 
            onChange={setFromAirport} 
          />
          {errors.from && (
            <p className="text-xs text-destructive">{errors.from}</p>
          )}
        </div>

        {/* To Airport */}
        <div className="space-y-1">
          <CityAutocomplete 
            label="To" 
            cities={cities} 
            value={toAirport} 
            onChange={setToAirport} 
            excludeCode={fromAirport?.code} 
          />
          {errors.to && (
            <p className="text-xs text-destructive">{errors.to}</p>
          )}
        </div>

        {/* Departure Date */}
        <div className="space-y-1">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em]">Departure</label>
            <Popover>
              <PopoverTrigger asChild>
                <button 
                  className={cn(
                    "w-full bg-muted/40 border border-border/30 h-auto text-sm pl-10 pr-3 py-2.5 min-h-[56px] rounded-xl text-left flex items-center relative hover:border-primary/20 transition-all duration-200",
                    errors.date && "ring-2 ring-destructive"
                  )}
                >
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  {departDate ? (
                    <div>
                      <span className="font-bold text-foreground block text-[13px]">{format(departDate, "dd MMM yyyy")}</span>
                      <span className="text-[10px] text-muted-foreground">{format(departDate, "EEEE")}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-[13px]">Select date</span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[60]" align="start">
                <Calendar
                  mode="single"
                  selected={departDate}
                  onSelect={(d) => d && setDepartDate(d)}
                  disabled={(d) => d < today || d > maxDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          {errors.date && (
            <p className="text-xs text-destructive">{errors.date}</p>
          )}
        </div>

        {/* Bank Filter */}
        <div className="space-y-1">
          <BankMultiSelect selected={banks} onChange={setBanks} />
          {errors.banks && (
            <p className="text-xs text-destructive">{errors.banks}</p>
          )}
        </div>
      </div>

      {/* General error display */}
      {hasError && Object.keys(errors).length === 0 && (
        <div className="flex items-center gap-2 mt-3 text-destructive text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4" />
          <span>Please fill in all required fields.</span>
        </div>
      )}

      <Button
        onClick={handleSearch}
        disabled={!validation.isValid}
        className="w-full mt-6 h-12 text-sm font-semibold rounded-xl gap-2 shadow-sm hover:shadow-md transition-all duration-200"
        size="lg"
      >
        <Search className="w-4 h-4" />
        Search Best Offers
      </Button>
    </div>
  );
};

export default SearchCard;
