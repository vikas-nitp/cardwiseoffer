import { useMemo } from "react";
import { format, parseISO, subDays, addDays } from "date-fns";
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

// Parse savings amount from displayText like "₹2,500" or "Save ₹1,200"
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

  // Compute savings intensities for bar heights
  const savingsAmounts = useMemo(
    () => strip7days.map((d) => parseSavingsAmount(d.displayText)),
    [strip7days]
  );
  const maxSavings = useMemo(() => Math.max(...savingsAmounts, 1), [savingsAmounts]);
  const bestDayIndex = useMemo(
    () => savingsAmounts.indexOf(Math.max(...savingsAmounts)),
    [savingsAmounts]
  );

  const moveToPrev = () => {
    if (selectedIndex > 0) {
      onDateChange(parseISO(strip7days[selectedIndex - 1].date));
    } else {
      onDateChange(subDays(parseISO(strip7days[0].date), 1));
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
    <div className="flex items-stretch gap-1.5 w-full overflow-hidden">
      <button
        onClick={moveToPrev}
        className="p-1.5 rounded-lg bg-card border border-border/40 shadow-sm hover:bg-muted transition-colors shrink-0 self-center"
        aria-label="Previous date"
      >
        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
      </button>

      <div className="flex gap-1.5 flex-1 min-w-0">
        {strip7days.map((day, i) => {
          const isSelected = day.date === selectedDateStr;
          const isBestDay = i === bestDayIndex && savingsAmounts[i] > 0;
          const dateObj = parseISO(day.date);
          const hasOffers = day.displayText !== DATE_STRIP_NO_OFFERS_LABEL;
          const intensity = maxSavings > 0 ? savingsAmounts[i] / maxSavings : 0;
          // Bar height: 4px min (no offers) to 28px max
          const barH = hasOffers ? Math.max(4, Math.round(intensity * 28)) : 2;

          return (
            <button
              key={day.date}
              onClick={() => onDateChange(dateObj)}
              aria-label={`Select ${format(dateObj, "EEEE dd MMMM")}${hasOffers ? ` — ${day.displayText}` : ""}`}
              aria-pressed={isSelected}
              className={cn(
                "flex flex-col items-center pt-1 pb-2.5 px-1 rounded-xl border transition-all duration-200 flex-1 min-w-0 overflow-hidden relative",
                isSelected
                  ? "bg-accent/15 border-accent shadow-md"
                  : "bg-card border-border/50 hover:border-accent/40 hover:shadow-sm"
              )}
            >
              {/* Best day badge */}
              {isBestDay && (
                <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-accent-foreground bg-accent px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap">
                  Best
                </span>
              )}

              {/* Savings intensity bar */}
              <div className="flex items-end justify-center w-full mt-4 mb-1.5" style={{ height: "28px" }}>
                <div
                  className={cn(
                    "w-[6px] rounded-t-sm transition-all duration-300",
                    hasOffers
                      ? isSelected
                        ? "bg-savings"
                        : isBestDay
                        ? "bg-savings"
                        : "bg-savings/50"
                      : "bg-border/30"
                  )}
                  style={{ height: `${barH}px` }}
                />
              </div>

              <span className={cn("text-[10px] font-semibold whitespace-nowrap", isSelected ? "text-accent" : "text-muted-foreground")}>
                {format(dateObj, "EEE")}
              </span>
              <span className={cn("text-[9px] font-medium", isSelected ? "text-accent/80" : "text-muted-foreground/60")}>
                {format(dateObj, "d MMM")}
              </span>
              <span
                className={cn(
                  "text-[10px] font-bold mt-1 w-full text-center leading-tight",
                  isSelected
                    ? "text-savings"
                    : hasOffers
                    ? "text-savings/80"
                    : "text-muted-foreground/40"
                )}
              >
                {day.displayText}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={moveToNext}
        className="p-1.5 rounded-lg bg-card border border-border/40 shadow-sm hover:bg-muted transition-colors shrink-0 self-center"
        aria-label="Next date"
      >
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
};

export default DateStrip;
