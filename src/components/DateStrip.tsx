import { useState } from "react";
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
  const visibleCount = 7;

  const dates = Array.from({ length: visibleCount }, (_, i) =>
    addDays(selectedDate, startOffset + i - 3)
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="flex items-center gap-2 w-full">
      <button
        onClick={() => setStartOffset((o) => o - 1)}
        disabled={addDays(selectedDate, startOffset - 3) < today}
        className="shrink-0 w-9 h-9 rounded-full glass-card flex items-center justify-center hover:bg-secondary transition-all duration-200 disabled:opacity-30"
      >
        <ChevronLeft className="w-4 h-4 text-foreground" />
      </button>

      <div className="flex gap-2 flex-1 overflow-hidden justify-center">
        {dates.map((d) => {
          const isPast = d < today;
          const isSelected =
            format(d, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
          const price = getMinPrice(d);

          if (isPast) return null;

          return (
            <button
              key={format(d, "yyyy-MM-dd")}
              onClick={() => onDateChange(d)}
              className={cn(
                "flex flex-col items-center px-3 py-3 rounded-xl border transition-all duration-200 min-w-[90px]",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                  : "glass-card hover:border-primary/40 hover:shadow-md hover:scale-[1.02]"
              )}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                {format(d, "EEE")}
              </span>
              <span className="text-sm font-bold">{format(d, "dd MMM")}</span>
              <span
                className={cn(
                  "text-xs font-bold mt-1",
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
        className="shrink-0 w-9 h-9 rounded-full glass-card flex items-center justify-center hover:bg-secondary transition-all duration-200"
      >
        <ChevronRight className="w-4 h-4 text-foreground" />
      </button>
    </div>
  );
};

export default DateStrip;
