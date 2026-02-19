# Music Practice Suite — UX Overhaul Plan

## Context

The app has a solid foundation but needs: (1) a unified warm visual identity from the [look-and-feel guide](../look-and-feel-guide.html), (2) fixes for all issues in the [UX research audit](./ux-research.md), and (3) a dev route for testing notation renderers in isolation.

**Style isolation:** `src/index.css` currently imports `@hudak/ui/styles/globals.css` (shared by 4 apps). We'll **remove that import entirely** and make `index.css` self-contained — its own Tailwind import, theme tokens, dark mode, and utility classes. This decouples music-practice from the shared monorepo styles completely.

The shadcn/ui *components* from `@hudak/ui` (Button, Card, Select, etc.) still work because they reference CSS custom property names like `--color-primary` — as long as we define those same vars, the components render correctly with our warm palette.

---

## Phase 0 — Foundation (Theme + Fonts)

No component logic changes. CSS and theme provider only.

### 0.1 Load fonts in `index.html`
Add Google Fonts preconnect + stylesheet for **Lora**, **DM Sans**, **DM Mono**.

### 0.2 Rewrite `src/index.css` as self-contained theme
Remove `@import "@hudak/ui/styles/globals.css"`. Replace with:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));
@source "../**/*.{ts,tsx}";
@source "../../../packages/ui/src/**/*.{ts,tsx}";  /* scan shadcn components */

@theme {
  /* Warm light palette — mapped to shadcn/ui expected token names */
  --color-background: 40 28% 95%;      /* #f7f4ef */
  --color-foreground: 30 11% 9%;       /* #1a1714 */
  --color-card: 40 100% 99%;           /* #fffefb */
  --color-card-foreground: 30 11% 9%;
  --color-primary: 171 45% 33%;        /* #2d7a6e — teal accent */
  --color-primary-foreground: 0 0% 100%;
  --color-secondary: 36 22% 92%;       /* #f0ece5 */
  --color-secondary-foreground: 30 11% 9%;
  --color-muted: 36 22% 92%;
  --color-muted-foreground: 22 6% 34%; /* #5c5650 */
  --color-accent: 171 45% 33%;
  --color-accent-foreground: 0 0% 100%;
  --color-destructive: 7 55% 40%;      /* #9b3a2f */
  --color-destructive-foreground: 0 0% 100%;
  --color-popover: 40 100% 99%;
  --color-popover-foreground: 30 11% 9%;
  --color-border: 30 11% 9% / 0.14;
  --color-input: 30 11% 9% / 0.14;
  --color-ring: 171 45% 33%;
  --radius-lg: 16px;
  --radius-md: 8px;
  --radius-sm: 4px;
}

.dark {
  --color-background: 43 35% 7%;       /* #18160d */
  --color-foreground: 40 23% 91%;      /* #f0ead9 */
  --color-card: 43 30% 10%;            /* #211e14 */
  --color-card-foreground: 40 23% 91%;
  --color-primary: 168 48% 46%;        /* #3daf9b */
  --color-primary-foreground: 43 35% 7%;
  --color-secondary: 40 17% 15%;       /* #2c2920 */
  --color-secondary-foreground: 40 23% 91%;
  --color-muted: 40 17% 15%;
  --color-muted-foreground: 28 16% 58%; /* #a89880 */
  --color-accent: 168 48% 46%;
  --color-accent-foreground: 43 35% 7%;
  --color-destructive: 10 43% 54%;     /* #c4614f */
  --color-destructive-foreground: 0 0% 100%;
  --color-popover: 43 30% 10%;
  --color-popover-foreground: 40 23% 91%;
  --color-border: 40 23% 91% / 0.13;
  --color-input: 40 23% 91% / 0.13;
  --color-ring: 168 48% 46%;
}
```

**Style-guide semantic tokens** (used directly in custom components):
```css
:root {
  --accent-color: #2d7a6e;
  --accent-light: #ebf4f2;
  --accent-hover: #245f56;
  --success-color: #3a7d5c;
  --success-bg: #edf6f1;
  --error-color: #9b3a2f;
  --error-bg: #faf0ef;
  --ink-primary: #1a1714;
  --ink-secondary: #5c5650;
  --ink-tertiary: #9c9590;
  --ink-disabled: #c8c4be;
  --border-subtle: rgba(26, 23, 20, 0.08);
  --border-strong: rgba(26, 23, 20, 0.24);
  --surface-overlay: rgba(247, 244, 239, 0.92);
  --shadow-warm-sm: 0 1px 3px rgba(26,23,20,0.06), 0 1px 2px rgba(26,23,20,0.04);
  --shadow-warm-md: 0 4px 16px rgba(26,23,20,0.08), 0 1px 4px rgba(26,23,20,0.04);
  --shadow-warm-lg: 0 12px 40px rgba(26,23,20,0.1), 0 2px 8px rgba(26,23,20,0.06);
  --font-display: "Lora", Georgia, serif;
  --font-body: "DM Sans", system-ui, sans-serif;
  --font-mono: "DM Mono", "Courier New", monospace;
}
.dark {
  --accent-color: #3daf9b;
  --accent-light: rgba(61, 175, 155, 0.14);
  --accent-hover: #4dbfa9;
  --success-color: #4fa87a;
  --success-bg: rgba(79, 168, 122, 0.12);
  --error-color: #c4614f;
  --error-bg: rgba(196, 97, 79, 0.12);
  --ink-primary: #f0ead9;
  --ink-secondary: #a89880;
  --ink-tertiary: #6e6254;
  --ink-disabled: #3e3a32;
  --border-subtle: rgba(240, 234, 217, 0.07);
  --border-strong: rgba(240, 234, 217, 0.22);
  --surface-overlay: rgba(24, 22, 13, 0.94);
  --shadow-warm-sm: 0 1px 4px rgba(0,0,0,0.28), 0 1px 2px rgba(0,0,0,0.2);
  --shadow-warm-md: 0 4px 20px rgba(0,0,0,0.36), 0 1px 6px rgba(0,0,0,0.24);
  --shadow-warm-lg: 0 12px 48px rgba(0,0,0,0.44), 0 2px 10px rgba(0,0,0,0.28);
}
```

**Base + utility layers:**
```css
@layer base {
  * { border-color: hsl(var(--color-border)); }
  body {
    background-color: hsl(var(--color-background));
    color: hsl(var(--color-foreground));
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
  }
}

@layer utilities {
  /* All bg-*, text-*, border-* utilities from the original globals.css */
  /* Plus new: */
  .font-display { font-family: var(--font-display); }
  .font-mono-app { font-family: var(--font-mono); }
}
```

### 0.3 Update renderer dark-mode colors
**Files:** `src/lib/notation/staff-renderer.ts`, `src/lib/notation/tab-renderer.ts`

Replace hardcoded `#e5e5e5`/`#000000` in `getStrokeColor()` with:
```ts
getComputedStyle(document.documentElement).getPropertyValue('--ink-primary').trim()
  || (this.isDarkMode() ? '#f0ead9' : '#1a1714')
```

### 0.4 Color transitions
Add 220ms ease transitions for `background-color`, `border-color`, `color`, `box-shadow` on body and key selectors.

**Verify:** Warm cream backgrounds, teal accent, Lora/DM Sans/DM Mono fonts, dark mode working. shadcn components pick up warm colors automatically.

---

## Phase 1 — Dev Route + React Renderer Wrappers

### 1.1 React wrapper components
**New files:**
- `src/components/notation/StaffDisplay.tsx` — wraps `StaffRenderer`. Props: `note?`, `notes?`, `clef`, `className`
- `src/components/notation/TabDisplay.tsx` — wraps `TabRenderer`. Props: `midiNote?`, `midiNotes?`, `instrumentId`, `showStaff`, `className`
- `src/components/notation/FallingNotesDisplay.tsx` — wraps `FallingNotesRenderer`. Props: `midiNote`, `noteName`, `speed`, `className`

Pattern: generate unique DOM id via `useRef`, instantiate renderer in `useEffect`, re-render when props change.

### 1.2 Dev route
**New file:** `src/routes/dev.tsx`

TanStack Router auto-registers it. Guard with `import.meta.env.DEV`.

**Sections:**

| Section | Test Cases |
|---------|-----------|
| **Staff** | C4, F#4, Bb3, A3 (ledger), C6 (high), F3+C3 (bass clef), C major scale, C-E-G chord |
| **Tab** | Open strings (E2, A2, D3, G3, B3, E4), high fret (MIDI 64), combined staff+tab (MIDI 60), note sequence |
| **Falling Notes** | Note mid-fall, hit zone visualization, speed comparison |

Each in a labeled `<Card>`, two-column grid, theme toggle at top.

**Verify:** `/dev` route shows all renderers correctly in both themes.

---

## Phase 2 — Critical UX Fixes

### 2.1 Unify CTA colors
**File:** `src/routes/index.tsx`
- All `violet-*`/`purple-*` → `bg-[var(--accent-color)]` / `hover:bg-[var(--accent-hover)]` / `text-white`
- Heading: plain `text-foreground font-display` (no gradient text)
- Selected instrument: `border-[var(--accent-color)] bg-[var(--accent-light)]`

**File:** `src/components/ChordScaleGame/index.tsx` — same pattern.

### 2.2 Quiz answer button grid
**File:** `src/components/ChordScaleGame/DegreeQuiz.tsx`
Add `w-full` to button className.

### 2.3 About page
**File:** `src/components/app-header.tsx` — remove About link.
**File:** `src/routes/about.tsx` — redirect to `/`.

### 2.4 SPA routing 404
**File:** `vite.config.ts` — `closeBundle` plugin copies `index.html` → `404.html`.

---

## Phase 3 — Refinement

### 3.1 Hero spacing: `mb-10` → `mb-16` in `index.tsx`
### 3.2 "Why Choose" section: remove if present (may not exist in React version)
### 3.3 Card icons: verify Lucide throughout, replace any emoji
### 3.4 "Coming Soon" card: `opacity-50` → `opacity-40` in `ChordScaleGame/index.tsx`
### 3.5 Nav active state: add `[&.active]:text-[var(--accent-color)]` in `app-header.tsx`

---

## Phase 4 — Polish

### 4.1 Answer button states
Replace `bg-green-500`/`bg-red-500` → `bg-[var(--success-color)]`/`bg-[var(--error-color)]` in `DegreeQuiz.tsx`.

### 4.2 Stats count-up animation
**New:** `src/hooks/use-count-up.ts` — `requestAnimationFrame` hook (150ms). Apply to score/accuracy/streak.

### 4.3 Mobile nav
Test at 320px. If overflow → hamburger with `Sheet` + `Menu` icon, inline nav at `sm:`.

---

## Phase 5 — Typography + Visual Polish

### 5.1 `font-display` on headings across `index.tsx`, `ChordScaleGame/index.tsx`, `DegreeQuiz.tsx`
### 5.2 `font-mono-app` on stat labels, badges, quiz mode labels
### 5.3 `shadow-[var(--shadow-warm-md)]` / `shadow-[var(--shadow-warm-lg)]` on main cards
### 5.4 Replace gradient backgrounds with plain `bg-background`

---

## Files Modified

| Phase | Files |
|-------|-------|
| 0 | `index.html`, `src/index.css` (rewrite), `staff-renderer.ts`, `tab-renderer.ts` |
| 1 | **New:** `src/routes/dev.tsx`, `src/components/notation/{StaffDisplay,TabDisplay,FallingNotesDisplay}.tsx` |
| 2 | `src/routes/index.tsx`, `DegreeQuiz.tsx`, `app-header.tsx`, `about.tsx`, `vite.config.ts` |
| 3 | `src/routes/index.tsx`, `ChordScaleGame/index.tsx`, `app-header.tsx` |
| 4 | `DegreeQuiz.tsx`, `app-header.tsx`, **New:** `src/hooks/use-count-up.ts` |
| 5 | `index.tsx`, `ChordScaleGame/index.tsx`, `DegreeQuiz.tsx`, `notation-card.tsx`, `play.tsx` |

## Verification (after each phase)

1. `pnpm dev` — visual check at `/dev` route, home, play, chord-scale
2. Toggle dark/light — all tokens switch
3. Test 320px, 768px, 1280px viewports
4. `pnpm run typecheck`
5. `pnpm run test`
6. `pnpm run build`
