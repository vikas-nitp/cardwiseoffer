import { useMemo, useState, useRef, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * 10-Day Price Strip - Backend Driven with Arrow Navigation
 * 
 * Displays exactly what the backend returns in strip7days (now 10 items).
 * No date generation logic on frontend.
 * Selected date highlighting does not mutate backend data.
 */

interface PriceStripDay {
  date: string;  // YYYY-MM-DD from backend
  price: number; // Best/lowest price for that day
}

interface DateStripProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  strip7days: PriceStripDay[];
}

const DateStrip = ({ selectedDate, onDateChange, strip7days }: DateStripProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Format selected date for comparison
  const selectedDateStr = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate]);

  // Check scroll position to show/hide arrows
  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", updateScrollButtons);
      window.addEventListener("resize", updateScrollButtons);
      return () => {
        el.removeEventListener("scroll", updateScrollButtons);
        window.removeEventListener("resize", updateScrollButtons);
      };
    }
  }, [strip7days]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // If no strip data, show nothing (loading handled by parent)
  if (!strip7days || strip7days.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 w-full justify-center relative">
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="p-1.5 rounded-full bg-background/80 border shadow-md hover:bg-primary hover:text-primary-foreground transition-colors z-10 shrink-0"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Scrollable Strip */}
      <div
        ref={scrollRef}
        className="flex gap-1.5 md:gap-2 overflow-x-auto scrollbar-hide py-1 scroll-smooth"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {strip7days.map((day) => {
          const isSelected = day.date === selectedDateStr;
          const dateObj = parseISO(day.date);

          return (
            <button
              key={day.date}
              onClick={() => onDateChange(dateObj)}
              style={{ scrollSnapAlign: "start" }}
              className={cn(
                "flex flex-col items-center px-2 md:px-2.5 py-2 md:py-2.5 rounded-xl border transition-all duration-200 min-w-[66px] md:min-w-[78px] shrink-0",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                  : "glass-card hover:border-primary/40 hover:shadow-md hover:scale-[1.02]"
              )}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                {format(dateObj, "EEE")}
              </span>
              <span className="text-xs md:text-sm font-bold">{format(dateObj, "dd MMM")}</span>
              <span
                className={cn(
                  "text-[10px] md:text-xs font-bold mt-0.5",
                  isSelected ? "text-primary-foreground/90" : "text-accent"
                )}
              >
                ₹{day.price.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="p-1.5 rounded-full bg-background/80 border shadow-md hover:bg-primary hover:text-primary-foreground transition-colors z-10 shrink-0"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default DateStrip;
