import { useMemo, useState, useRef, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PriceStripDay {
  date: string;
  price: number;
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

  const selectedDateStr = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate]);

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
      scrollRef.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  if (!strip7days || strip7days.length === 0) return null;

  // Find cheapest price for highlighting
  const minPrice = Math.min(...strip7days.map(d => d.price));

  return (
    <div className="flex items-center gap-1.5 w-full justify-center relative">
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="p-1.5 rounded-lg bg-card border border-border/40 shadow-sm hover:bg-muted transition-colors z-10 shrink-0"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide py-1 scroll-smooth"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {strip7days.map((day) => {
          const isSelected = day.date === selectedDateStr;
          const isCheapest = day.price === minPrice;
          const dateObj = parseISO(day.date);

          return (
            <button
              key={day.date}
              onClick={() => onDateChange(dateObj)}
              style={{ scrollSnapAlign: "start" }}
              className={cn(
                "flex flex-col items-center px-3 py-2.5 rounded-xl border transition-all duration-200 min-w-[80px] shrink-0",
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
                  isSelected ? "text-primary-foreground/90" : isCheapest ? "text-accent" : "text-muted-foreground"
                )}
              >
                ₹{day.price.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>

      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="p-1.5 rounded-lg bg-card border border-border/40 shadow-sm hover:bg-muted transition-colors z-10 shrink-0"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
};

export default DateStrip;
