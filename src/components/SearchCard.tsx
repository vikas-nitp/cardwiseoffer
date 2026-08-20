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
import { useState, useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Calendar as CalendarIcon, Search, AlertCircle } from "lucide-react";
import { format, parseISO, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CityAutocomplete, { type CityOption } from "@/components/CityAutocomplete";
import BankMultiSelect from "@/components/BankMultiSelect";
import { useMeta } from "@/contexts/MetaContext";
import { MAX_BANK_FILTERS, MAX_BOOKING_AMOUNT } from "@/constants";
import { Input } from "@/components/ui/input";
import { useFeatureFlags } from "@/contexts/FeatureFlagContext";
import { resolveFeatureCapabilities } from "@/config/featureCapabilities";

const AIRPORT_CODE_PATTERN = /^[A-Z]{3}$/;
const validateAirportCode = (code: string) => AIRPORT_CODE_PATTERN.test(code.toUpperCase());

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
      !meta.availability_start ||
      !meta.availability_end ||
      departDate < parseISO(meta.availability_start) ||
      departDate > parseISO(meta.availability_end)
    ) {
      newErrors.date = "Choose a date with available offers";
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
  }, [fromAirport, toAirport, departDate, banks, bookingAmount, capabilities.bookingAmountComparison, meta.availability_start, meta.availability_end]);

  const handleSearch = () => {
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
    () => (meta.availability_end ? parseISO(meta.availability_end) : minDate),
    [meta.availability_end, minDate],
  );

  const hasError = Object.keys(validation.errors).length > 0;

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
      className="w-full max-w-5xl mx-auto bg-card rounded-2xl border border-border border-t-[3px] border-t-accent card-shadow-xl gold-ring p-6 md:p-8 relative z-30"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em]">
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
                  disabled={(d) => d < minDate || d > maxDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
        </div>

        {/* Bank filter */}
        <div className="space-y-1">
          <BankMultiSelect selected={banks} onChange={setBanks} />
          {errors.banks && <p className="text-xs text-destructive">{errors.banks}</p>}
        </div>
      </div>

      {capabilities.bookingAmountComparison && (
        <div className="mt-4 max-w-md">
          <label
            htmlFor="booking-amount"
            className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em]"
          >
            Expected booking amount
          </label>
          <p className="text-[11px] text-muted-foreground mb-1.5">
            Optional — enter an estimated fare to compare actual savings.
          </p>
          <Input
            id="booking-amount"
            inputMode="decimal"
            value={bookingAmount}
            onChange={(e) => setBookingAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="e.g. ₹8,000"
            className="h-12 rounded-xl bg-input border-border"
          />
          {errors.bookingAmount && (
            <p className="text-xs text-destructive mt-1">{errors.bookingAmount}</p>
          )}
        </div>
      )}

      {hasError && Object.keys(errors).length === 0 && (
        <div className="flex items-center gap-2 mt-3 text-destructive text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4" />
          <span>Please fill in all required fields.</span>
        </div>
      )}

      <Button
        onClick={handleSearch}
        disabled={!validation.isValid}
        className="w-full mt-6"
        size="lg"
      >
        <Search className="w-4 h-4" />
        Search Best Offers
      </Button>
    </motion.div>
  );
};

export default SearchCard;
