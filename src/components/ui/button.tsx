/*
 * Button — Midnight Sovereign variants
 *
 *  default     Sovereign gold bg · near-black text · shimmer-on-hover sweep
 *  secondary   Raised dark surface · near-white text · subtle border
 *  ghost       Transparent · muted text · gold text + muted bg on hover
 *  outline     Border only · muted bg on hover
 *  destructive Danger red
 *  link        Gold underline
 *
 * Sizes follow 8pt grid: sm=32px · default=40px · lg=48px
 * Radius: 14px (--radius) on all interactive variants.
 */
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    /* base */
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-semibold select-none cursor-pointer",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        /*
         * Sovereign gold — the primary CTA.
         * Gold background, near-black text (8.5:1 contrast).
         * Shimmer sweep on hover via the `.shimmer-hover` utility.
         */
        default: [
          "rounded-[14px]",
          "shimmer-hover",
          "bg-primary text-primary-foreground",
          /* depth: top-edge inner highlight + directional outer shadow */
          "[box-shadow:inset_0_1px_0_hsl(0_0%_100%/0.12),0_1px_2px_hsl(225_37%_2%/0.6),0_4px_16px_hsl(var(--primary)/0.30)]",
          "hover:brightness-115 hover:[box-shadow:inset_0_1px_0_hsl(0_0%_100%/0.18),0_1px_2px_hsl(225_37%_2%/0.6),0_6px_24px_hsl(var(--primary)/0.40)]",
          "active:brightness-95 active:scale-[0.98]",
          "transition-all duration-150",
        ],

        /* Raised dark surface — supporting actions */
        secondary: [
          "rounded-[14px]",
          "bg-secondary text-secondary-foreground",
          "border border-border",
          "hover:bg-secondary/70 hover:border-primary/30",
          "active:scale-[0.98]",
        ],

        /* Transparent — low-priority or icon-adjacent */
        ghost: [
          "rounded-[14px]",
          "text-muted-foreground",
          "hover:bg-muted hover:text-foreground",
          "active:scale-[0.98]",
        ],

        /* Border only */
        outline: [
          "rounded-[14px]",
          "border border-border text-foreground",
          "hover:bg-muted hover:border-primary/30",
          "active:scale-[0.98]",
        ],

        /* Danger */
        destructive: [
          "rounded-[14px]",
          "bg-destructive text-destructive-foreground",
          "hover:bg-destructive/90 active:scale-[0.98]",
        ],

        /* Inline anchor */
        link: [
          "text-primary underline-offset-4",
          "hover:underline",
          "p-0 h-auto rounded-none",
        ],
      },

      size: {
        sm:      "h-8  px-4   text-[13px] [&_svg]:size-3.5",
        default: "h-10 px-5   text-sm     [&_svg]:size-4",
        lg:      "h-12 px-7   text-[15px] [&_svg]:size-[18px]",
        icon:    "h-10 w-10              [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
