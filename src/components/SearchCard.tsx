import { useState, useEffect, useMemo } from "react";
import { Calendar as CalendarIcon, Search, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CityAutocomplete, { type CityOption } from "@/components/CityAutocomplete";
import BankMultiSelect from "@/components/BankMultiSelect";
import { useMeta } from "@/contexts/MetaContext";
import { MAX_BANK_FILTERS } from "@/constants";
import { MAX_BOOKING_AMOUNT } from "@/constants";
import { Input } from "@/components/ui/input";
import { useFeatureFlags } from "@/contexts/FeatureFlagContext";
import { resolveFeatureCapabilities } from "@/config/featureCapabilities";
import { bookingWindowEnd, bookingWindowStart, isWithinBookingWindow } from "@/domain/bookingWindow";

const AIRPORT_CODE_PATTERN = /^[A-Z]{3}$/;

const validateAirportCode = (code: string): boolean => {
  return AIRPORT_CODE_PATTERN.test(code.toUpperCase());
};

interface SearchCardProps {
  onSearch: (from: CityOption, to: CityOption, date: Date, banks: string[], bookingAmount?: number) => void;
  initialFrom?: CityOption | null;
  initialTo?: CityOption | null;
  initialDate?: Date;
  initialBanks?: string[];
}

const SearchCard = ({ onSearch, initialFrom, initialTo, initialDate, initialBanks }: SearchCardProps) => {
  const { meta } = useMeta();
  const { flags } = useFeatureFlags();
  const capabilities = resolveFeatureCapabilities(flags);
  
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
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [bookingAmount, setBookingAmount] = useState("");

  const [errors, setErrors] = useState<{
    from?: string;
    to?: string;
    date?: string;
    banks?: string;
    bookingAmount?: string;
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
    } else if (!isWithinBookingWindow(departDate)) {
      newErrors.date = "Choose a date within the available booking window";
      isValid = false;
    }

    if (banks.length > MAX_BANK_FILTERS) {
      newErrors.banks = `Maximum ${MAX_BANK_FILTERS} banks allowed`;
      isValid = false;
    }
    if (capabilities.bookingAmountComparison && bookingAmount) {
      const amount = Number(bookingAmount);
      if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_BOOKING_AMOUNT) {
        newErrors.bookingAmount = `Enter an amount from ₹1 to ₹${MAX_BOOKING_AMOUNT.toLocaleString()}`;
        isValid = false;
      }
    }

    return { errors: newErrors, isValid };
  }, [fromAirport, toAirport, departDate, banks, bookingAmount, capabilities.bookingAmountComparison]);

  const handleSearch = () => {
    setErrors(validation.errors);
    if (!validation.isValid || !fromAirport || !toAirport || !departDate) return;
    onSearch(fromAirport, toAirport, departDate, banks, bookingAmount ? Number(bookingAmount) : undefined);
  };

  const today = useMemo(() => bookingWindowStart(), []);
  const maxDate = useMemo(() => bookingWindowEnd(), []);

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
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button 
                  className={cn(
                    "w-full bg-muted/40 border border-border/30 h-14 text-sm pl-10 pr-3 rounded-xl text-left flex items-center relative hover:border-primary/20 transition-all duration-200",
                    errors.date && "ring-2 ring-destructive"
                  )}
                >
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  {departDate ? (
                    <div className="grid h-9 grid-rows-2 content-center">
                      <span className="font-bold text-foreground block text-[13px]">{format(departDate, "dd MMM yyyy")}</span>
                      <span className="text-[10px] text-muted-foreground">{format(departDate, "EEEE")}</span>
                    </div>
                  ) : (
                    <div className="grid h-9 grid-rows-2 content-center">
                      <span className="text-muted-foreground text-[13px] font-medium">Select date</span>
                      <span className="text-[10px] text-muted-foreground">Choose travel date</span>
                    </div>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[60]" align="start">
                <Calendar
                  mode="single"
                  selected={departDate}
                  onSelect={(date) => {
                    if (!date) return;
                    setDepartDate(date);
                    setCalendarOpen(false);
                  }}
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

      {capabilities.bookingAmountComparison && (
        <div className="mt-4 max-w-md">
          <label htmlFor="booking-amount" className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em]">Expected booking amount</label>
          <p className="text-[11px] text-muted-foreground mb-1.5">Optional — enter an estimated fare to compare actual savings.</p>
          <Input id="booking-amount" inputMode="decimal" value={bookingAmount} onChange={(event) => setBookingAmount(event.target.value.replace(/[^0-9.]/g, ""))} placeholder="e.g. ₹8,000" className="h-12 rounded-xl bg-muted/40" />
          {errors.bookingAmount && <p className="text-xs text-destructive mt-1">{errors.bookingAmount}</p>}
        </div>
      )}

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
