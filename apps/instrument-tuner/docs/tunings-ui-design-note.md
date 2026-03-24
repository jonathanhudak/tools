# Tunings UI Design Note

Date: 2026-03-20
Scope: `/tunings` flow visual implementation

This note records the utility-level design decisions applied from `tunings-ui-implementation-spec.md` until the app adopts a dedicated design-system document.

## Applied Values

### Page Shell

- `page-max-width-wide`: `max-w-6xl`
- `page-gutter-mobile`: `px-4 py-5`
- `page-gutter-tablet`: `sm:px-6 sm:py-8`
- `page-gutter-desktop`: `lg:px-8`
- `section-gap-sm`: `space-y-6`
- `section-gap-lg`: `sm:space-y-8`

### Typography

- `heading-display-sm`: `text-2xl font-semibold tracking-tight sm:text-3xl`
- `heading-section`: `text-lg font-semibold leading-tight`
- `text-meta`: `text-sm text-muted-foreground`
- `text-meta-spaced`: `text-sm tracking-[0.08em] text-muted-foreground/90`
- `text-chip`: `text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground`

### Surfaces

- `surface-card-subtle`: `bg-card/80`
- `surface-card-quiet-strong`: `bg-card/85`
- `surface-chip-subtle`: `bg-muted/70`
- `border-subtle`: `border border-border/60`
- `border-quiet`: `border border-border/50`

### Components

- `breadcrumb-height`: `px-3 py-2` on shell, `px-2.5 py-1.5` on crumbs
- `nav-tile-min-height`: `min-h-[112px]` for instruments, `min-h-[120px]` for sections
- `tuning-chip-height`: `px-2 py-2.5`
- `cta-inline-min-width`: `lg:min-w-[180px]`

### Palette

- `primary-hue`: `212 72% 42%` light, `210 88% 72%` dark
- `shell-gradient`: `--tuner-shell-start` to `--tuner-shell-end`, exposed via `.bg-tuner-shell`
- `focus-ring`: aligned to primary hue through `--color-ring`

## Notes

- Existing pitch gauge variables remain unchanged.
- The implementation uses existing Tailwind and shared UI tokens only.
- A muted blue/slate palette replaced the earlier green-forward app primary for calmer navigation and CTA emphasis.
- Restrained motion is limited to short page-entry and card-hover/press transitions in the tunings flow.
