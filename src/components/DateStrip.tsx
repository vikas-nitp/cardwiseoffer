import { useState, useMemo } from "react";
import { format, addDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateStripProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  getMinPrice: (date: Date) => number;
}

const DateStrip = ({ selectedDate, onDateChange, getMinPrice }: DateStripProps) => {
  const [startOffset, setStartOffset] = useState(0);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Always generate exactly 7 dates
  const dates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) =>
      addDays(selectedDate, startOffset + i - 3)
    ).filter(d => d >= today);
  }, [selectedDate, startOffset, today]);

  // Ensure we always show 7 dates by adjusting if some got filtered
  const visibleDates = useMemo(() => {
    if (dates.length >= 7) return dates.slice(0, 7);
    // If past dates were filtered, extend forward
    const needed = 7 - dates.length;
    const last = dates[dates.length - 1] || selectedDate;
    const extra = Array.from({ length: needed }, (_, i) => addDays(last, i + 1));
    return [...dates, ...extra];
  }, [dates, selectedDate]);

  return (
    <div className="flex items-center gap-1.5 md:gap-2 w-full">
      <button
        onClick={() => setStartOffset((o) => o - 1)}
        disabled={visibleDates[0] <= today}
        className="shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-full glass-card flex items-center justify-center hover:bg-secondary transition-all duration-200 disabled:opacity-30"
      >
        <ChevronLeft className="w-4 h-4 text-foreground" />
      </button>

      <div className="flex gap-1.5 md:gap-2 flex-1 overflow-x-auto md:overflow-hidden justify-start md:justify-center scrollbar-hide">
        {visibleDates.map((d) => {
          const isSelected = format(d, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
          const price = getMinPrice(d);

          return (
            <button
              key={format(d, "yyyy-MM-dd")}
              onClick={() => onDateChange(d)}
              className={cn(
                "flex flex-col items-center px-2.5 md:px-3 py-2.5 md:py-3 rounded-xl border transition-all duration-200 min-w-[72px] md:min-w-[88px] shrink-0",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                  : "glass-card hover:border-primary/40 hover:shadow-md hover:scale-[1.02]"
              )}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                {format(d, "EEE")}
              </span>
              <span className="text-xs md:text-sm font-bold">{format(d, "dd MMM")}</span>
              <span
                className={cn(
                  "text-[10px] md:text-xs font-bold mt-0.5",
                  isSelected ? "text-primary-foreground/90" : "text-accent"
                )}
              >
                ₹{price.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setStartOffset((o) => o + 1)}
        className="shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-full glass-card flex items-center justify-center hover:bg-secondary transition-all duration-200"
      >
        <ChevronRight className="w-4 h-4 text-foreground" />
      </button>
    </div>
  );
};

export default DateStrip;
