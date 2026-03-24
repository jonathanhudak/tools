# Instrument Tuner Tunings Flow UI Implementation Spec

Date: 2026-03-20
Author: Codex
Scope: Visual design and layout only for the `/tunings` flow
Out of scope: Logic, routing behavior, search params, data shape, API behavior, state management

## 1. Purpose

This document translates the tunings-flow design audit into a build-ready implementation spec.
The goal is to improve hierarchy, spacing, responsiveness, and overall polish without changing functionality.

Routes in scope:

- `/tunings`
- `/tunings/$instrumentId`
- `/tunings/$instrumentId/$sectionId`

Files in scope:

- `apps/instrument-tuner/src/routes/tunings/index.tsx`
- `apps/instrument-tuner/src/routes/tunings/$instrumentId.tsx`
- `apps/instrument-tuner/src/routes/tunings/$instrumentId.$sectionId.tsx`
- `apps/instrument-tuner/src/components/TuningBreadcrumbs.tsx`
- `apps/instrument-tuner/src/index.css`

## 2. Audit Summary

Current strengths:

- The flow is consistent.
- The information architecture is understandable.
- Mobile behavior is functional.
- Components already use a shared UI base.

Current problems:

- The first screen is a dense wall of equal-weight cards.
- The breadcrumb treatment is visually too heavy for its importance.
- Section cards are too large and under-informative on tablet and desktop.
- Tuning cards give equal visual weight to metadata, chips, and action.
- Desktop layouts stop adapting after the first small breakpoint.
- Typography does not create enough distinction between title, metadata, and interaction.

Observed viewport notes:

- Mobile index: the vertical list works, but scan quality is weak because every card looks identical and tightly repeated.
- Mobile section page: the page is clear, but cards are oversized relative to their content and feel empty.
- Mobile tuning list: the stack is usable but visually noisy because the green CTA dominates each card.
- Tablet index: two-column layout works, but cards still feel generic.
- Tablet section page: excessive empty space under the two-column grid.
- Desktop index: still constrained to two columns, which underuses width and extends scroll unnecessarily.
- Desktop section page: only six cards, but the page still feels sparse and unfinished.
- Desktop tuning list: better breathing room, but hierarchy remains action-heavy.

## 3. Design Intent

The tunings flow should feel like a guided catalog, not a raw list of records.

Desired qualities:

- Calm
- Quiet
- Scan-first
- Precise
- Consistent
- Responsive without feeling stretched

Design principles for implementation:

- The title should anchor the page immediately.
- Navigation chrome should recede.
- Content cards should feel lighter and more intentional.
- The user should understand the current decision at a glance.
- Buttons should support the content, not overpower it.

## 4. Phase Plan

### Phase 1: Structural Hierarchy

Goals:

- Improve scan speed.
- Reduce visual competition.
- Fix large-screen composition.

Work items:

- Upgrade page shell spacing and heading scale.
- Reduce breadcrumb weight and height.
- Improve instrument and section card hierarchy.
- Reduce CTA dominance on tuning cards.
- Introduce desktop-specific grid behavior.

### Phase 2: Refinement

Goals:

- Improve rhythm and typography.
- Make the surfaces feel more premium.

Work items:

- Adjust card border/surface balance.
- Improve text sizing and metadata contrast.
- Refine chip spacing and note-cell styling.
- Normalize icon treatment.

### Phase 3: Polish

Goals:

- Make interaction states and edge states feel designed.

Work items:

- Improve hover/focus/pressed states.
- Design proper not-found/error shells.
- Add restrained motion where appropriate.

## 5. Design System Additions Required

There is no dedicated `DESIGN_SYSTEM.md` for this app. Before implementation, document these token decisions wherever the app’s design-system conventions are tracked.

Proposed token groups:

### Page Shell

- `page-max-width-wide`
- `page-gutter-mobile`
- `page-gutter-tablet`
- `page-gutter-desktop`
- `section-gap-sm`
- `section-gap-lg`

### Typography

- `heading-display-sm`
- `heading-section`
- `text-meta`
- `text-chip`

### Surfaces

- `surface-card-subtle`
- `surface-card-hover`
- `border-subtle`
- `border-strong`

### Components

- `breadcrumb-height`
- `nav-tile-min-height`
- `tuning-chip-height`
- `cta-inline-min-width`

If the project does not want to formalize new token names yet, the implementation may proceed with existing Tailwind utility values, but those values should still be recorded in a follow-up design-system note.

## 6. Exact Implementation Notes

This section is intentionally concrete. The build agent should follow these instructions literally unless a technical conflict is discovered.

### 6.1 `src/routes/tunings/index.tsx`

#### Page Shell

Current:

- Outer content container: `container mx-auto max-w-5xl space-y-4 px-4 py-3`

Change to:

- `container mx-auto max-w-6xl space-y-6 px-4 py-5 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8`

Reason:

- Creates clearer top breathing room.
- Uses large screens more intentionally.

#### Heading Block

Current:

- Wrapper: `flex items-center gap-2`
- Icon: `h-6 w-6 text-primary`
- Title: `text-lg font-bold`

Change to:

- Wrapper: `flex items-center gap-3`
- Icon: `h-5 w-5 text-primary`
- Title: `text-2xl font-semibold tracking-tight sm:text-3xl`

Reason:

- The title should lead the page.
- Slightly smaller icon and stronger type create better balance.

#### Instrument Grid

Current:

- `grid gap-3 sm:grid-cols-2`

Change to:

- `grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3`

Reason:

- Desktop should not remain locked to two columns.

#### Instrument Card

Current:

- Card: `h-full border-2 transition hover:border-primary/40`
- Content: `flex items-center justify-between p-4`
- Name: `text-base font-semibold`
- Count: `text-sm text-muted-foreground`
- Icon: `text-2xl`

Change to:

- Card: `h-full border border-border/60 bg-card/80 transition-colors duration-150 hover:border-primary/25 focus-within:border-primary/35`
- Content: `flex min-h-[112px] items-start justify-between gap-4 p-5`
- Name: keep semantic element, change class to `text-base font-semibold leading-tight`
- Count: keep semantic element, change class to `mt-1 text-sm text-muted-foreground`
- Icon: `text-xl leading-none opacity-90`

Reason:

- Removes heavy framing.
- Makes content feel less cramped.
- Keeps the icon decorative rather than dominant.

### 6.2 `src/routes/tunings/$instrumentId.tsx`

#### Page Shell

Apply the same container update used on `index.tsx`.

#### Heading

Current:

- `text-lg font-bold`

Change to:

- `text-2xl font-semibold tracking-tight sm:text-3xl`

Reason:

- This is the page anchor and needs more authority.

#### Sections Grid

Current:

- `grid gap-3 sm:grid-cols-2`

Change to:

- `grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3`

Reason:

- Prevents the desktop page from feeling under-composed.

#### Section Card

Current:

- Card: `h-full border-2 transition hover:border-primary/40`
- Content: `p-4`

Change to:

- Card: `h-full border border-border/60 bg-card/80 transition-colors duration-150 hover:border-primary/25 focus-within:border-primary/35`
- Content: `flex min-h-[120px] flex-col justify-end p-5`

Keep text structure:

- Section name remains primary line.
- Tuning count remains secondary line.

Reason:

- These cards are currently oversized but visually empty.
- The new treatment keeps them substantial without feeling vacant.

### 6.3 `src/routes/tunings/$instrumentId.$sectionId.tsx`

#### Page Shell

Current:

- `container mx-auto max-w-5xl space-y-4 px-4 py-3`

Change to:

- `container mx-auto max-w-6xl space-y-6 px-4 py-5 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8`

#### Heading

Current:

- `text-lg font-bold`

Change to:

- `text-2xl font-semibold tracking-tight sm:text-3xl`

#### Cards Stack

Current:

- `space-y-3`

Change to:

- `space-y-4 sm:space-y-5`

Reason:

- Gives the dense list room to breathe.

#### Tuning Card Shell

Current:

- Card: `border-2`
- Content: `space-y-3 p-4`

Change to:

- Card: `border border-border/60 bg-card/80`
- Content: `space-y-4 p-5`

Reason:

- Reduces heaviness.
- Creates a better rhythm between sections inside the card.

#### Tuning Header

Current:

- Title: `text-base font-semibold`
- Metadata row: `text-sm text-muted-foreground`

Change to:

- Title: `text-lg font-semibold leading-tight`
- Metadata row: `mt-1 text-sm tracking-[0.08em] text-muted-foreground/90`

Reason:

- Tuning name must lead decisively.
- Note pattern should read as supporting metadata.

#### Note Grid

Current:

- Grid: `grid grid-cols-3 gap-2 sm:grid-cols-6`
- Cell: `rounded-md bg-muted p-2 text-center text-sm`
- String label: `text-muted-foreground`
- Note label: `font-semibold`

Change to:

- Grid: `grid grid-cols-3 gap-2.5 sm:grid-cols-6`
- Cell: `rounded-lg bg-muted/70 px-2 py-2.5 text-center`
- String label: `text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground`
- Note label: `text-sm font-semibold`

Reason:

- Current cells are dense and visually flat.
- Labels and values need stronger separation.

#### CTA Button

Current:

- `className="h-11 w-full"`

Change to:

- `className="h-11 w-full sm:h-12 lg:w-auto lg:min-w-[180px]"`

Do not change:

- Button text
- `onClick`
- route destination
- search param behavior

Reason:

- On mobile, full width is appropriate.
- On larger viewports, full-width repetition overwhelms the content.

#### Back Link

Current:

- `inline-block px-1 py-2 text-sm font-medium text-primary`

Change to:

- `inline-flex items-center py-2 text-sm font-medium text-primary/90 hover:text-primary`

Reason:

- Slightly calmer and more deliberate.

### 6.4 `src/components/TuningBreadcrumbs.tsx`

#### Wrapper

Current:

- Outer wrapper: `w-full overflow-x-auto pb-1 ...`
- Nav: `flex min-w-max items-center gap-1 rounded-lg border bg-background/80 px-2 py-1.5`

Change to:

- Keep horizontal scroll behavior.
- Change nav to: `flex min-w-max items-center gap-1 rounded-xl border border-border/50 bg-background/40 px-3 py-2`

Reason:

- Breadcrumbs currently read as a full component block rather than quiet context.

#### Individual Crumbs

Current:

- Link class: `rounded-md px-3 py-2 text-sm font-medium text-primary ...`
- Current crumb: `px-3 py-2 text-sm font-medium`

Change to:

- Link class: `rounded-md px-2.5 py-1.5 text-sm font-medium text-primary hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`
- Current crumb class: `px-2.5 py-1.5 text-sm font-medium`

Reason:

- Reduce vertical height.
- Preserve accessibility and clickability.

#### Chevron

Current:

- `h-4 w-4 text-muted-foreground`

Change to:

- `h-3.5 w-3.5 text-muted-foreground`

Reason:

- Keeps separators quieter.

### 6.5 `src/index.css`

Keep existing pitch gauge tokens untouched.

Add only minimal app-level visual support if needed for the revised shells, for example:

- optional utility-compatible CSS variables for surface softness
- optional card background/border overrides if existing UI package tokens are insufficient

Do not:

- change primary brand hue
- alter pitch gauge colors
- introduce new animation for this phase

Reason:

- The tunings flow improvements should come from layout and component styling first, not cosmetic theme changes.

## 7. Not Found and Error States

These are currently raw text:

- `Instrument not found.`
- `Section not found.`

Do not leave them as plain padded text after the main visual work is complete.

Approved future treatment:

- center-aligned constrained content shell
- clear title
- one short explanatory line
- one recovery action back into the tunings flow

Functional behavior must remain unchanged unless a follow-up task explicitly approves adding navigation UI for recovery.

## 8. Responsiveness Rules

These are mandatory implementation checks:

- Mobile must remain single-column on index and section pages.
- Tablet should use two columns where already appropriate.
- Desktop should use three columns on the index and sections pages.
- Tuning cards should remain stacked in a single content column.
- Tuning CTA stays full-width on mobile and becomes content-width on desktop.
- Breadcrumbs must remain horizontally scrollable when needed.

## 9. Accessibility Requirements

Do not regress:

- Link hit areas
- button hit areas
- focus-visible states
- text contrast
- keyboard navigation order

Specific checks:

- Breadcrumb links remain keyboard visible.
- Card links remain clearly interactive.
- CTA remains visually distinct from muted note chips.
- Small string labels must retain readable contrast.

## 10. Acceptance Criteria

Phase 1 is complete when:

- The `/tunings` page scans clearly in under two seconds.
- Desktop `/tunings` uses three columns.
- Breadcrumbs no longer dominate vertical space.
- `/tunings/guitar` no longer feels sparse and unfinished on tablet/desktop.
- `/tunings/guitar/standard` no longer reads as a stack of green bars first and content second.

Phase 2 is complete when:

- Card surfaces feel lighter and more intentional.
- Typography clearly distinguishes page title, card title, metadata, and chip labels.
- Instrument icons feel decorative rather than noisy.

Phase 3 is complete when:

- Hover/focus states feel cohesive.
- Error states feel designed.
- The flow feels responsive and polished rather than merely styled.

## 11. Verification Checklist

Before closing implementation:

- Review `/tunings` at 390px, 768px, and 1440px widths.
- Review `/tunings/guitar` at 390px, 768px, and 1440px widths.
- Review `/tunings/guitar/standard` at 390px, 768px, and 1440px widths.
- Confirm no layout regressions in breadcrumb overflow.
- Confirm `Use this tuning` still applies the correct search param.
- Confirm links still navigate exactly as before.

## 12. Non-Negotiables

- No functionality changes.
- No route changes.
- No copy changes beyond visual hierarchy adjustments.
- No new features.
- No hidden hardcoded one-off values without recording them as design decisions.

