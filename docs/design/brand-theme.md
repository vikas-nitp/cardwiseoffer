# CardOptimal Brand & Theme

## Brand name
**CardOptimal** — active as of 2026-09-25.

- `APP_NAME` single source of truth: `src/constants/index.ts`
- Domain: TBD (`cardoptimal.com` / `.in` / `.app`); placeholder `cardsage.in` in use until locked
- Support/grievance emails: `cardsage.in` placeholders until domain confirmed

## Logo marks (shortlist from Sep 2026 review)
- **Spark** (C): Card + lightning bolt — "instant savings insight"
- **Best Pick** (E): Card + upward arrow — "best offer direction"

Current code uses a `CardSageMark` JSX component in `Header.tsx` (legacy name; it is the card-chip mark from the original design). Update when a new mark is commissioned.

## Theme — Institutional Slate (adopted Sep 2026)

### Why we switched from golden/amber
Cool blue + slate was chosen over the golden theme because:
- Finance + travel = trust (institutional blue) over excitement (gold)
- Sky/aviation associations are literal — blue = sky, flight
- Green savings callout (`--accent`) is psychologically tied to money saved

### CSS tokens (`src/index.css`)

| Token | Value | Role |
|---|---|---|
| `--primary` | `hsl(230 72% 52%)` | Indigo-blue — primary actions |
| `--accent` | `hsl(160 50% 42%)` | Emerald — savings callouts |
| `--highlight` | `hsl(38 85% 52%)` | Amber — highlight |
| `--background` (light) | `hsl(220 20% 97%)` | Slate off-white |
| `--background` (dark) | `hsl(224 24% 8%)` | Deep slate |
| `--muted-foreground` | `hsl(214 20% 69%)` | `#94A3B8` — WCAG AA on dark surface |

Custom tokens: `--savings`, `--savings-soft`, `--highlight`, `--sky-start`, `--sky-mid`, `--sky-end`, `--glow`

Dark mode: class-based (`darkMode: ["class"]`). No toggle UI yet.

Fonts: Inter (primary). Space Grotesk imported but unused in Tailwind config.

### Hero gradient text (HomeSection.tsx:50)

Applied to "on your flight?" — `from-accent` (emerald) → sky-blue → cyan:

```tsx
<span className="block text-[42px] md:text-[60px] mt-1 leading-[1.0]
  bg-gradient-to-r from-accent via-[hsl(200_90%_58%)] to-[hsl(185_85%_55%)]
  bg-clip-text text-transparent">
  on your flight?
</span>
```

### Hero headline A/B (deferred — week 4+ post-launch)

Current: "Which card saves the most / on your flight?"

Alternative to test: "Find the optimal card for your next flight."

```tsx
<span className="block text-[42px] md:text-[60px] leading-[1.0]">
  Find the optimal card
</span>
<span className="block text-[42px] md:text-[60px] mt-1 leading-[1.0]
  bg-gradient-to-r from-accent via-[hsl(200_90%_58%)] to-[hsl(185_85%_55%)]
  bg-clip-text text-transparent">
  for your next flight.
</span>
```

Measure: time-on-page + search initiations in GA4. Run after 4+ weeks of real traffic.
