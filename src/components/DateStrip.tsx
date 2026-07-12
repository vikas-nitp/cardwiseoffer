import { useMemo, useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DATE_STRIP_NAVIGATION_STEP_DAYS, DATE_STRIP_VISIBLE_DAYS } from "@/constants";
import { stripWindowOffset } from "@/domain/bookingWindow";

export interface StripDay {
  date: string;
  bestBenefit: number | null;
}

interface DateStripProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  strip7days: StripDay[];
}

const DateStrip = ({ selectedDate, onDateChange, strip7days }: DateStripProps) => {
  const [offset, setOffset] = useState(() => stripWindowOffset(selectedDate, strip7days.length));

  const selectedDateStr = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate]);

  useEffect(() => {
    setOffset(stripWindowOffset(selectedDate, strip7days.length));
  }, [selectedDate, strip7days.length]);

  const maxOffset = Math.max(0, strip7days.length - DATE_STRIP_VISIBLE_DAYS);
  const visibleDays = strip7days.slice(offset, offset + DATE_STRIP_VISIBLE_DAYS);
  const move = (direction: -1 | 1) => setOffset((current) =>
    Math.min(maxOffset, Math.max(0, current + direction * DATE_STRIP_NAVIGATION_STEP_DAYS))
  );

  if (!strip7days || strip7days.length === 0) return null;

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-1.5 text-center">
        Eligible offers by date
      </p>
      <div className="flex items-center gap-1.5 w-full justify-center relative">
        <button
          onClick={() => move(-1)}
          disabled={offset === 0}
          className="p-1.5 rounded-lg bg-card border border-border/40 shadow-sm hover:bg-muted transition-colors z-10 shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous eligible dates"
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>

        <div
          className="flex min-w-0 gap-2 overflow-x-auto scrollbar-hide py-1"
        >
          {visibleDays.map((day) => {
            const isSelected = day.date === selectedDateStr;
            const dateObj = parseISO(day.date);

            return (
              <button
                key={day.date}
                onClick={() => onDateChange(dateObj)}
                className={cn(
                  "flex flex-col items-center px-3 py-2.5 rounded-xl border transition-all duration-200 min-w-[88px] shrink-0",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-card border-border/40 hover:border-primary/30 hover:shadow-sm"
                )}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                  {format(dateObj, "EEE")}
                </span>
                <span className="text-xs font-bold mt-0.5">{format(dateObj, "dd MMM")}</span>
                <span
                  className={cn(
                    "text-[11px] font-bold mt-1",
                    isSelected ? "text-primary-foreground/90" : day.bestBenefit ? "text-accent" : "text-muted-foreground"
                  )}
                >
                  {day.bestBenefit
                    ? `Up to ₹${day.bestBenefit.toLocaleString()}`
                    : "No offers"}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => move(1)}
          disabled={offset === maxOffset}
          className="p-1.5 rounded-lg bg-card border border-border/40 shadow-sm hover:bg-muted transition-colors z-10 shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next eligible dates"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default DateStrip;
