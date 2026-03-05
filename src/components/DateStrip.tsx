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

  return (
    <div className="flex items-center gap-1 w-full justify-center relative">
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="p-1.5 rounded-full bg-card border border-border/50 shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors z-10 shrink-0"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

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
                "flex flex-col items-center px-2.5 md:px-3 py-2.5 md:py-3 rounded-xl border transition-all duration-200 min-w-[72px] md:min-w-[82px] shrink-0",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                  : "bg-card border-border/50 hover:border-primary/40 hover:shadow-md hover:scale-[1.02]"
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

      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="p-1.5 rounded-full bg-card border border-border/50 shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors z-10 shrink-0"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default DateStrip;
