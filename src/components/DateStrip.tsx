import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DateStripEntry } from "@/types/api";

interface DateStripProps {
  entries: DateStripEntry[];
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
}

const DateStrip = ({ entries, selectedDate, onDateChange }: DateStripProps) => {
  if (!entries.length) return null;

  return (
    <div className="flex items-center gap-1.5 md:gap-2 w-full">
      <div className="flex gap-1.5 md:gap-2 flex-1 overflow-x-auto md:overflow-hidden justify-start md:justify-center scrollbar-hide py-1">
        {entries.map((entry) => {
          const isSelected = entry.date === selectedDate;
          return (
            <button
              key={entry.date}
              onClick={() => onDateChange(entry.date)}
              className={cn(
                "flex flex-col items-center px-2.5 md:px-3 py-2.5 md:py-3 rounded-xl border transition-all duration-200 min-w-[72px] md:min-w-[88px] shrink-0",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                  : "glass-card hover:border-primary/40 hover:shadow-md hover:scale-[1.02]"
              )}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                {entry.dayLabel}
              </span>
              <span className="text-xs md:text-sm font-bold">{entry.dateLabel}</span>
              <span
                className={cn(
                  "text-[10px] md:text-xs font-bold mt-0.5",
                  isSelected ? "text-primary-foreground/90" : "text-accent"
                )}
              >
                ₹{entry.minPrice.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DateStrip;
