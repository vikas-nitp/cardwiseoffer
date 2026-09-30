import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-3",
        caption: "flex justify-center pt-1 pb-1 relative items-center",
        caption_label: "text-[13px] font-semibold text-foreground tracking-wide",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "inline-flex items-center justify-center rounded-lg p-0 w-7 h-7",
          "bg-secondary/60 border border-border/40 text-muted-foreground",
          "hover:bg-secondary hover:text-foreground transition-colors",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell: "text-muted-foreground/60 rounded-md w-9 font-medium text-[11px] uppercase tracking-wider",
        row: "flex w-full mt-1",
        cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day: cn(
          "h-9 w-9 p-0 font-normal rounded-lg text-sm text-foreground/80",
          "hover:bg-secondary/70 hover:text-foreground transition-colors",
          "aria-selected:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        ),
        day_range_end: "day-range-end",
        day_selected: [
          "bg-accent text-accent-foreground font-semibold",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:bg-accent focus:text-accent-foreground",
          "shadow-[0_0_12px_-2px_hsl(var(--accent)/0.5)]",
        ].join(" "),
        day_today: "ring-1 ring-accent/60 text-accent font-bold",
        day_outside: "text-muted-foreground/35 aria-selected:bg-accent/30 aria-selected:text-muted-foreground aria-selected:opacity-50",
        day_disabled: "text-muted-foreground/25 cursor-not-allowed",
        day_range_middle: "aria-selected:bg-accent/20 aria-selected:text-foreground rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-3.5 w-3.5" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-3.5 w-3.5" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
