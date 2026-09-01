import { useMemo, useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DATE_STRIP_NAVIGATION_STEP_DAYS, DATE_STRIP_NO_OFFERS_LABEL, DATE_STRIP_VISIBLE_DAYS } from "@/constants";

export interface StripDay {
  date: string;
  displayText: string;
}

interface DateStripProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  strip7days: StripDay[];
}

const DateStrip = ({ selectedDate, onDateChange, strip7days }: DateStripProps) => {
  const [offset, setOffset] = useState(0);

  const selectedDateStr = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate]);

  useEffect(() => {
    const selectedIndex = strip7days.findIndex((day) => day.date === format(selectedDate, "yyyy-MM-dd"));
    setOffset(Math.max(0, selectedIndex));
  }, [selectedDate, strip7days]);

  const maxOffset = Math.max(0, strip7days.length - DATE_STRIP_VISIBLE_DAYS);
  const visibleDays = strip7days.slice(offset, offset + DATE_STRIP_VISIBLE_DAYS);
  const move = (direction: -1 | 1) => setOffset((current) =>
    Math.min(maxOffset, Math.max(0, current + direction * DATE_STRIP_NAVIGATION_STEP_DAYS))
  );

  if (!strip7days || strip7days.length === 0) return null;

  const showNav = maxOffset > 0;

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground mb-1.5 text-center">
        Eligible offers by date
      </p>
      <div className="flex items-center gap-1.5 w-full">
        {showNav && (
          <button
            onClick={() => move(-1)}
            disabled={offset === 0}
            className="p-1.5 rounded-lg bg-card border border-border/40 shadow-sm hover:bg-muted transition-colors shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous eligible dates"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        <div className="grid gap-1.5 flex-1" style={{ gridTemplateColumns: `repeat(${visibleDays.length}, 1fr)` }}>
          {visibleDays.map((day) => {
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
                  "flex flex-col items-center py-2.5 rounded-xl border transition-all duration-200 w-full",
                  isSelected
                    ? "bg-accent text-accent-foreground border-accent shadow-md"
                    : "bg-card border-border/50 hover:border-accent/40 hover:shadow-sm"
                )}
              >
                <span className={cn("text-[10px] font-semibold uppercase tracking-wider", isSelected ? "opacity-70" : "text-muted-foreground")}>
                  {format(dateObj, "EEE")}
                </span>
                <span className="text-xs font-bold mt-0.5">{format(dateObj, "dd MMM")}</span>
                <span
                  className={cn(
                    "text-[11px] font-bold mt-1",
                    isSelected ? "text-accent-foreground/90" : hasOffers ? "text-accent" : "text-muted-foreground/60"
                  )}
                >
                  {day.displayText}
                </span>
              </button>
            );
          })}
        </div>

        {showNav && (
          <button
            onClick={() => move(1)}
            disabled={offset === maxOffset}
            className="p-1.5 rounded-lg bg-card border border-border/40 shadow-sm hover:bg-muted transition-colors shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next eligible dates"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
};

export default DateStrip;
