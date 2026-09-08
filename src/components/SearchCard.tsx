/*
 * SearchCard — accessible motion entrance
 *
 * Motion contract:
 *   prefers-reduced-motion = true  → opacity-only fade, duration 0.01s (imperceptible).
 *                                     No spatial translation, no scale.
 *   prefers-reduced-motion = false → physics spring (damping 28, stiffness 280).
 *                                     Translates on Y axis only — does not animate
 *                                     layout-triggering properties (margin, top, height).
 *
 * Package: motion/react (Framer Motion v12+ canonical import).
 */
import { useState, useEffect, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Calendar as CalendarIcon, Search, AlertCircle, ChevronDown, X } from "lucide-react";
import { format, parseISO, startOfDay, addMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CityAutocomplete, { type CityOption } from "@/components/CityAutocomplete";
import BankMultiSelect from "@/components/BankMultiSelect";
import { useMeta } from "@/contexts/MetaContext";
import { MAX_BANK_FILTERS, MAX_BOOKING_AMOUNT } from "@/constants";
import { useFeatureFlags } from "@/contexts/FeatureFlagContext";
import { resolveFeatureCapabilities } from "@/config/featureCapabilities";
import { useAuth } from "@/contexts/AuthContext";

const AIRPORT_CODE_PATTERN = /^[A-Z]{3}$/;
const validateAirportCode = (code: string) => AIRPORT_CODE_PATTERN.test(code.toUpperCase());

const PRESET_FARES = [3000, 5000, 8000, 10000, 15000, 20000];

const FareDropdown = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayValue = value ? `₹${Number(value).toLocaleString("en-IN")}` : null;

  return (
    <div ref={ref} className="relative z-20">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-secondary/50 border-0 h-auto text-sm pl-4 pr-3 py-2.5 min-h-[56px] rounded-xl text-left flex items-center justify-between hover:bg-secondary/70 transition-colors"
      >
        {displayValue
          ? <span className="font-bold text-foreground">{displayValue}</span>
          : <span className="text-muted-foreground">e.g. ₹10,000</span>}
        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); onChange(""); setCustom(""); }}
              onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), onChange(""), setCustom(""))}
              className="p-0.5 rounded hover:bg-muted/60 transition-colors"
              aria-label="Clear fare"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground/70" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-muted-foreground/60 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-[70] p-2.5">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1 mb-2">Quick select</p>
          <div className="grid grid-cols-2 gap-1.5 mb-2.5">
            {PRESET_FARES.map((fare) => (
              <button
                key={fare}
                type="button"
                onClick={() => { onChange(String(fare)); setOpen(false); setCustom(""); }}
                className={cn(
                  "px-2 py-2 rounded-lg text-[13px] font-semibold transition-colors text-center",
                  value === String(fare)
                    ? "bg-accent/20 text-accent border border-accent/30"
                    : "bg-muted/40 text-foreground hover:bg-muted/70"
                )}
              >
                ₹{fare.toLocaleString("en-IN")}
              </button>
            ))}
          </div>
          <div className="border-t border-border/50 pt-2.5">
            <input
              type="number"
              placeholder="Custom amount"
              value={custom}
              autoComplete="off"
              onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ""))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && custom) { onChange(custom); setOpen(false); setCustom(""); }
              }}
              className="w-full px-3 py-2 text-sm bg-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
      )}
    </div>
  );
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
  const { isSignedIn } = useAuth();
  const maxBankSelect = isSignedIn ? 4 : MAX_BANK_FILTERS;
  const prefersReduced = useReducedMotion();

  const cities: CityOption[] = useMemo(
    () => meta.airports.map((a) => ({ city: a.city, code: a.code, airport: a.name })),
    [meta.airports],
  );

  const [fromAirport, setFromAirport] = useState<CityOption | null>(initialFrom ?? null);
  const [toAirport, setToAirport] = useState<CityOption | null>(initialTo ?? null);
  const [departDate, setDepartDate] = useState<Date | undefined>(initialDate ?? undefined);
  const [banks, setBanks] = useState<string[]>(initialBanks ?? []);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [bookingAmount, setBookingAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{
    from?: string;
    to?: string;
    date?: string;
    banks?: string;
    bookingAmount?: string;
  }>({});

  useEffect(() => {
    if (initialFrom)  setFromAirport(initialFrom);
    if (initialTo)    setToAirport(initialTo);
    if (initialDate)  setDepartDate(initialDate);
    if (initialBanks) setBanks(initialBanks);
  }, [initialFrom, initialTo, initialDate, initialBanks]);

  useEffect(() => {
    if (!capabilities.bookingAmountComparison) setBookingAmount("");
  }, [capabilities.bookingAmountComparison]);

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
    } else if (
      meta.availability_start &&
      meta.availability_end &&
      (departDate < parseISO(meta.availability_start) ||
       departDate > parseISO(meta.availability_end))
    ) {
      newErrors.date = "Choose a date with available offers";
      isValid = false;
    }

    if (banks.length > maxBankSelect) {
      newErrors.banks = `Maximum ${maxBankSelect} cards allowed`;
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
  }, [fromAirport, toAirport, departDate, banks, bookingAmount, capabilities.bookingAmountComparison, meta.availability_start, meta.availability_end]);

  const handleSearch = () => {
    setSubmitted(true);
    setErrors(validation.errors);
    if (!validation.isValid || !fromAirport || !toAirport || !departDate) return;
    const effectiveAmount =
      capabilities.bookingAmountComparison && bookingAmount ? Number(bookingAmount) : undefined;
    onSearch(fromAirport, toAirport, departDate, banks, effectiveAmount);
  };

  const minDate = useMemo(
    () => (meta.availability_start ? parseISO(meta.availability_start) : startOfDay(new Date())),
    [meta.availability_start],
  );
  const maxDate = useMemo(
    () => (meta.availability_end ? parseISO(meta.availability_end) : addMonths(new Date(), 6)),
    [meta.availability_end],
  );

  const hasNoSpecificErrors = Object.values(validation.errors).filter(Boolean).length === 0;

  /*
   * Reduced-motion guard:
   *   - true  → collapse duration to 0.01s, fade only (no spatial translation).
   *   - false → physics spring with heavy damping; Y-translate only.
   */
  const motionProps = prefersReduced
    ? {
        initial:    { opacity: 0 },
        animate:    { opacity: 1 },
        transition: { duration: 0.01 },
      }
    : {
        initial:    { opacity: 0, y: 24 },
        animate:    { opacity: 1, y: 0 },
        transition: {
          type:     "spring" as const,
          damping:  28,
          stiffness: 280,
          mass:     0.9,
        },
      };

  return (
    <motion.div
      {...motionProps}
      className="w-full max-w-5xl mx-auto glass-search-card rounded-2xl gold-ring p-6 md:p-8 relative z-30"
    >
      <div className={`grid grid-cols-1 gap-4 items-end ${capabilities.bookingAmountComparison ? "md:grid-cols-5" : "md:grid-cols-4"}`}>
        {/* From */}
        <div className="space-y-1">
          <CityAutocomplete
            label="From"
            cities={cities}
            value={fromAirport}
            onChange={setFromAirport}
          />
          {errors.from && <p className="text-xs text-destructive">{errors.from}</p>}
        </div>

        {/* To */}
        <div className="space-y-1">
          <CityAutocomplete
            label="To"
            cities={cities}
            value={toAirport}
            onChange={setToAirport}
            excludeCode={fromAirport?.code}
          />
          {errors.to && <p className="text-xs text-destructive">{errors.to}</p>}
        </div>

        {/* Departure date */}
        <div className="space-y-1">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.10em]">
              Departure
            </label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "w-full bg-input border border-border h-14 text-sm pl-10 pr-3 rounded-xl text-left flex items-center relative",
                    "hover:border-primary/40 transition-all duration-200",
                    errors.date && "ring-2 ring-destructive",
                  )}
                >
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  {departDate ? (
                    <div className="grid h-9 grid-rows-2 content-center">
                      <span className="font-bold text-foreground block text-[13px]">
                        {format(departDate, "dd MMM yyyy")}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {format(departDate, "EEEE")}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center h-9">
                      <span className="text-muted-foreground text-[13px] font-medium">Select date</span>
                    </div>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[60]" align="start" side="bottom">
                <Calendar
                  mode="single"
                  selected={departDate}
                  onSelect={(date) => {
                    if (!date) return;
                    setDepartDate(date);
                    setCalendarOpen(false);
                  }}
                  disabled={(d) => d < minDate || d > maxDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
                <div className="px-3 pb-3 pt-0">
                  <button
                    onClick={() => setCalendarOpen(false)}
                    className="w-full text-[12px] text-muted-foreground hover:text-foreground font-medium py-1.5 rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
        </div>

        {/* Bank filter */}
        <div className="space-y-1">
          <BankMultiSelect selected={banks} onChange={setBanks} maxSelect={maxBankSelect} showSignInHint={!isSignedIn && capabilities.auth} />
          {errors.banks && <p className="text-xs text-destructive">{errors.banks}</p>}
        </div>

        {/* Booking amount — 5th column, only when feature enabled */}
        {capabilities.bookingAmountComparison && (
          <div className="space-y-1">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.10em] flex items-center gap-1.5">
                Fare <span className="font-normal normal-case tracking-normal text-[10px] opacity-60">(optional)</span>
              </label>
              <FareDropdown value={bookingAmount} onChange={setBookingAmount} />
            </div>
            {errors.bookingAmount && <p className="text-xs text-destructive">{errors.bookingAmount}</p>}
          </div>
        )}
      </div>

      {submitted && !validation.isValid && hasNoSpecificErrors && (
        <div className="flex items-center gap-2 mt-3 text-destructive text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4" />
          <span>Please fill in all required fields.</span>
        </div>
      )}

      <Button
        onClick={handleSearch}
        className={`w-full mt-6 transition-opacity ${validation.isValid ? "" : "opacity-60"}`}
        size="lg"
      >
        <Search className="w-4 h-4" />
        Show Best Offers
      </Button>
    </motion.div>
  );
};

export default SearchCard;
