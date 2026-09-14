import { useMemo } from "react";
import { format, parseISO, subDays, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DATE_STRIP_NO_OFFERS_LABEL } from "@/constants";
import type { StripDayEntry } from "@/data/repositories/OfferRepository";

// Re-export as StripDay for backward compat with existing imports
export type StripDay = StripDayEntry;

interface DateStripProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  strip7days: StripDay[];
}

const DateStrip = ({ selectedDate, onDateChange, strip7days }: DateStripProps) => {
  const selectedDateStr = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate]);
  const selectedIndex = useMemo(
    () => strip7days.findIndex((d) => d.date === selectedDateStr),
    [strip7days, selectedDateStr]
  );

  const moveToPrev = () => {
    if (selectedIndex > 0) {
      onDateChange(parseISO(strip7days[selectedIndex - 1].date));
    } else {
      // Navigate before the strip window — triggers full re-search anchored to that date
      onDateChange(subDays(parseISO(strip7days[0].date), 1));
    }
  };
  const moveToNext = () => {
    if (selectedIndex < strip7days.length - 1) {
      onDateChange(parseISO(strip7days[selectedIndex + 1].date));
    } else {
      // Navigate past the strip window — triggers full re-search anchored to that date
      onDateChange(addDays(parseISO(strip7days[strip7days.length - 1].date), 1));
    }
  };

  if (!strip7days || strip7days.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 w-full overflow-hidden">
      <button
        onClick={moveToPrev}
        className="p-1.5 rounded-lg bg-card border border-border/40 shadow-sm hover:bg-muted transition-colors shrink-0"
        aria-label="Previous date"
      >
        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
      </button>

      <div className="flex gap-1.5 flex-1 min-w-0">
        {strip7days.map((day) => {
          const isSelected = day.date === selectedDateStr;
          const dateObj = parseISO(day.date);
          const hasOffers = day.displayText !== DATE_STRIP_NO_OFFERS_LABEL;

          return (
            <button
              key={day.date}
              onClick={() => onDateChange(dateObj)}
              aria-label={`Select ${format(dateObj, "EEEE dd MMMM")}${hasOffers ? ` — ${day.displayText}` : ""}`}
              aria-pressed={isSelected}
              className={cn(
                "flex flex-col items-center py-2.5 px-1 rounded-xl border transition-all duration-200 flex-1 min-w-0 overflow-hidden",
                isSelected
                  ? "bg-accent text-accent-foreground border-accent shadow-md"
                  : "bg-card border-border/50 hover:border-accent/40 hover:shadow-sm"
              )}
            >
              <span className={cn("text-[11px] font-semibold whitespace-nowrap", isSelected ? "opacity-80" : "text-muted-foreground")}>
                {format(dateObj, "EEE, d MMM")}
              </span>
              <span
                className={cn(
                  "text-[10px] font-bold mt-1 w-full text-center leading-tight",
                  isSelected ? "text-accent-foreground/90" : hasOffers ? "text-accent" : "text-muted-foreground/60"
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
        className="p-1.5 rounded-lg bg-card border border-border/40 shadow-sm hover:bg-muted transition-colors shrink-0"
        aria-label="Next date"
      >
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
};

export default DateStrip;
