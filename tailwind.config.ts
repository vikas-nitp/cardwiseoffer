/*
 * tailwind.config.ts — Midnight Sovereign token bridge
 *
 * Pattern: hsl(var(--token) / <alpha-value>)
 *   Connects CSS custom properties → Tailwind utilities while preserving
 *   opacity modifier support (bg-primary/20, text-accent/60, etc.).
 *   v4 equivalent: @theme inline { --color-primary: var(--primary); }
 */
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const hsl = (v: string) => `hsl(var(${v}) / <alpha-value>)`;

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        /* Surfaces */
        border:     hsl("--border"),
        input:      hsl("--input"),
        ring:       hsl("--ring"),
        background: hsl("--background"),
        foreground: hsl("--foreground"),
        card:       { DEFAULT: hsl("--card"),    foreground: hsl("--card-foreground") },
        popover:    { DEFAULT: hsl("--popover"), foreground: hsl("--popover-foreground") },

        /* Brand */
        primary:  { DEFAULT: hsl("--primary"),  foreground: hsl("--primary-foreground") },
        accent:   { DEFAULT: hsl("--accent"),   foreground: hsl("--accent-foreground") },

        /* Secondary / Muted */
        secondary: { DEFAULT: hsl("--secondary"), foreground: hsl("--secondary-foreground") },
        muted:     { DEFAULT: hsl("--muted"),     foreground: hsl("--muted-foreground") },

        /* Feedback */
        destructive: { DEFAULT: hsl("--destructive"), foreground: hsl("--destructive-foreground") },

        /* Semantic status */
        success: {
          DEFAULT:          hsl("--success"),
          foreground:       hsl("--success-foreground"),
          soft:             hsl("--success-soft"),
          "soft-foreground": hsl("--success-soft-foreground"),
        },
        warning: {
          DEFAULT:          hsl("--warning"),
          foreground:       hsl("--warning-foreground"),
          soft:             hsl("--warning-soft"),
          "soft-foreground": hsl("--warning-soft-foreground"),
        },
        danger: {
          DEFAULT:          hsl("--danger"),
          foreground:       hsl("--danger-foreground"),
          soft:             hsl("--danger-soft"),
          "soft-foreground": hsl("--danger-soft-foreground"),
        },

        /* Legacy (OfferCard compat) */
        savings: {
          DEFAULT:    hsl("--savings"),
          foreground: hsl("--savings-foreground"),
          soft:       hsl("--savings-soft"),
        },
        highlight: {
          DEFAULT:    hsl("--highlight"),
          foreground: hsl("--highlight-foreground"),
        },
        glow:             hsl("--glow"),
        "surface-elevated": hsl("--surface-elevated"),

        /* Sidebar */
        sidebar: {
          DEFAULT:              hsl("--sidebar-background"),
          foreground:           hsl("--sidebar-foreground"),
          primary:              hsl("--sidebar-primary"),
          "primary-foreground": hsl("--sidebar-primary-foreground"),
          accent:               hsl("--sidebar-accent"),
          "accent-foreground":  hsl("--sidebar-accent-foreground"),
          border:               hsl("--sidebar-border"),
          ring:                 hsl("--sidebar-ring"),
        },
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-6px)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        /* Shimmer sweep — used on gold CTA button */
        shimmer: {
          "0%":   { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        /* Pulse-glow — gold ring pulse */
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--primary) / 0.25)" },
          "50%":       { boxShadow: "0 0 20px 4px hsl(var(--primary) / 0.15)" },
        },
        /* Subtle border shimmer for the SearchCard gold top stripe */
        "gold-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0.65" },
        },
      },

      animation: {
        "accordion-down":  "accordion-down 0.2s ease-out",
        "accordion-up":    "accordion-up 0.2s ease-out",
        float:             "float 3s ease-in-out infinite",
        "fade-up":         "fade-up 0.5s ease-out forwards",
        "fade-in":         "fade-in 0.4s ease-out forwards",
        "slide-in-right":  "slide-in-right 0.4s ease-out forwards",
        "scale-in":        "scale-in 0.3s ease-out forwards",
        shimmer:           "shimmer 2.4s linear infinite",
        "pulse-glow":      "pulse-glow 2.4s ease-in-out infinite",
        "gold-pulse":      "gold-pulse 2.8s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
