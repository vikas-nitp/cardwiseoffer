import { useMemo } from "react";
import { format, parseISO, subDays, addDays, isAfter, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DATE_STRIP_NO_OFFERS_LABEL } from "@/constants";
import type { StripDayEntry } from "@/data/repositories/OfferRepository";

export type StripDay = StripDayEntry;

interface DateStripProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  strip7days: StripDay[];
}

function parseSavingsAmount(displayText: string): number {
  if (!displayText || displayText === DATE_STRIP_NO_OFFERS_LABEL) return 0;
  const match = displayText.replace(/,/g, "").match(/[\d]+/);
  return match ? parseInt(match[0], 10) : 0;
}

const DateStrip = ({ selectedDate, onDateChange, strip7days }: DateStripProps) => {
  const selectedDateStr = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate]);
  const selectedIndex = useMemo(
    () => strip7days.findIndex((d) => d.date === selectedDateStr),
    [strip7days, selectedDateStr]
  );

  const savingsAmounts = useMemo(
    () => strip7days.map((d) => parseSavingsAmount(d.displayText)),
    [strip7days]
  );
  const maxSavings = useMemo(() => Math.max(...savingsAmounts, 1), [savingsAmounts]);
  const bestDayIndex = useMemo(
    () => savingsAmounts.indexOf(Math.max(...savingsAmounts)),
    [savingsAmounts]
  );
  const hasMeaningfulBest = useMemo(
    () => maxSavings > 0 && savingsAmounts.some((v) => v > 0 && v < maxSavings),
    [savingsAmounts, maxSavings]
  );

  const firstStripDate = useMemo(() => strip7days[0] ? parseISO(strip7days[0].date) : new Date(), [strip7days]);
  const canGoPrev = selectedIndex > 0 || isAfter(firstStripDate, startOfDay(new Date()));

  const moveToPrev = () => {
    if (selectedIndex > 0) {
      onDateChange(parseISO(strip7days[selectedIndex - 1].date));
    } else if (isAfter(firstStripDate, startOfDay(new Date()))) {
      onDateChange(subDays(firstStripDate, 1));
    }
  };
  const moveToNext = () => {
    if (selectedIndex < strip7days.length - 1) {
      onDateChange(parseISO(strip7days[selectedIndex + 1].date));
    } else {
      onDateChange(addDays(parseISO(strip7days[strip7days.length - 1].date), 1));
    }
  };

  if (!strip7days || strip7days.length === 0) return null;

  return (
    <div className="flex items-stretch gap-2 w-full overflow-hidden">
      <button
        onClick={moveToPrev}
        disabled={!canGoPrev}
        className="p-2 rounded-xl bg-card border border-border/40 shadow-sm hover:bg-muted transition-colors shrink-0 self-center disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Previous date"
      >
        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
      </button>

      <div className="flex gap-1.5 flex-1 min-w-0">
        {strip7days.map((day, i) => {
          const isSelected = day.date === selectedDateStr;
          const isBestDay = i === bestDayIndex && hasMeaningfulBest;
          const dateObj = parseISO(day.date);
          const hasOffers = day.displayText !== DATE_STRIP_NO_OFFERS_LABEL;
          const intensity = maxSavings > 0 ? savingsAmounts[i] / maxSavings : 0;
          // Bar height: min 3px (no offers) to 32px max
          const barH = hasOffers ? Math.max(6, Math.round(intensity * 32)) : 3;

          // Compact amount: "₹2,800" stripped from either format
          const isUpTo = hasOffers && /^Save up to/i.test(day.displayText);
          const savingsShort = hasOffers
            ? day.displayText.replace(/Save up to\s*/i, "").replace(/Save\s*/i, "")
            : null;

          return (
            <button
              key={day.date}
              onClick={() => onDateChange(dateObj)}
              aria-label={`Select ${format(dateObj, "EEEE dd MMMM")}${hasOffers ? ` - ${day.displayText}` : ""}`}
              aria-pressed={isSelected}
              className={cn(
                "flex flex-col items-center justify-end gap-0 rounded-xl border transition-all duration-200 flex-1 min-w-0 overflow-hidden relative",
                "pb-2.5 pt-1 px-1",
                isSelected
                  ? "bg-accent/15 border-accent shadow-md"
                  : "bg-card border-border/50 hover:border-accent/40 hover:shadow-sm"
              )}
            >
              {/* Best day badge — positioned absolutely so bar alignment is consistent */}
              {isBestDay && (
                <span className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-accent-foreground bg-accent px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap z-10">
                  Best
                </span>
              )}

              {/* Savings bar — fixed 36px container, bar grows from bottom */}
              <div className="flex items-end justify-center w-full mb-1.5 mt-5" style={{ height: "36px" }}>
                <div
                  className={cn(
                    "w-4 rounded-t transition-all duration-300",
                    hasOffers
                      ? isSelected
                        ? "bg-accent"
                        : isBestDay
                        ? "bg-savings"
                        : "bg-savings/45"
                      : "bg-border/25"
                  )}
                  style={{ height: `${barH}px` }}
                />
              </div>

              {/* Day name */}
              <span className={cn(
                "text-[11px] font-bold leading-none",
                isSelected ? "text-accent" : "text-foreground/70"
              )}>
                {format(dateObj, "EEE")}
              </span>

              {/* Date */}
              <span className={cn(
                "text-[9px] font-medium leading-none mt-0.5",
                isSelected ? "text-accent/70" : "text-muted-foreground/55"
              )}>
                {format(dateObj, "d MMM")}
              </span>

              {/* Savings amount — compact form; "up to" label when no fare entered */}
              <div className="flex flex-col items-center mt-1.5">
                {isUpTo && (
                  <span className="text-[7px] font-semibold leading-none text-savings/50 mb-0.5">
                    up to
                  </span>
                )}
                <span className={cn(
                  "text-[10px] font-bold leading-none w-full text-center",
                  isSelected
                    ? "text-accent"
                    : hasOffers
                    ? "text-savings/75"
                    : "text-muted-foreground/30"
                )}>
                  {savingsShort ?? "-"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={moveToNext}
        className="p-2 rounded-xl bg-card border border-border/40 shadow-sm hover:bg-muted transition-colors shrink-0 self-center"
        aria-label="Next date"
      >
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
};

export default DateStrip;
