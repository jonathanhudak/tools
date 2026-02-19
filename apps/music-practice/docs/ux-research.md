# Music Practice Suite — Design Audit
**URL:** https://jonathanhudak.github.io/tools/music-practice/  
**Date:** February 17, 2026  
**Screens Audited:** Home (desktop + mobile), Chord-Scale Settings, Quiz (active + correct-answer state), About  
**Viewports Tested:** Desktop 1280×767, Mobile 390×844

---

## OVERALL ASSESSMENT

The app has a solid dark-mode foundation and the Chord-Scale quiz flow works cleanly end-to-end. The primary design problems are a fragmented color system with four competing CTA colors on a single screen, an About page that is a stub, SPA routing that 404s on direct navigation, and answer buttons that are ambiguously sized and misaligned. The bones are good. The system needs to be unified.

---

## PHASE 1 — Critical
*(Visual hierarchy, usability, responsiveness, or consistency issues that actively hurt the experience)*

**Home / CTA Color Chaos**  
What's wrong → Four cards with four different CTA button colors: blue (Scales Quiz), purple (Chord Recognition), green (Chord-Scale Matrix), orange (Sight Reading).  
What it should be → One primary CTA color across all cards. Differentiation should come from the icon/badge, not the button.  
Why this matters → The eye has no anchor. Every card competes equally. Nothing feels like the place to start.

**Quiz / Answer Button Grid Misalignment**  
What's wrong → The 2×2 answer grid has inconsistent button widths. "mMaj7" and "m7b5" on the left are ~85px wide; "Maj7" on the right is ~85px; "7" is ~55px — they're all different sizes with no grid logic.  
What it should be → All four buttons should be equal width, filling the available columns on a true 2-col grid.  
Why this matters → Mismatched button sizes signal to users that the options are somehow different in weight or importance. It also looks unfinished.

**About Page — Stub**  
What's wrong → The About page renders only "Hello from About!" — raw placeholder text, no layout, no content.  
What it should be → Either a real About page or remove the nav link entirely until it's ready.  
Why this matters → Every live link must lead somewhere intentional. A stub page erodes trust and looks unshipped.

**SPA Routing — 404 on Direct Navigation**  
What's wrong → Navigating directly to `/about` or any sub-route produces a GitHub Pages 404.  
What it should be → A `404.html` redirect strategy or HashRouter to handle client-side routing on GitHub Pages.  
Why this matters → Any shared link or bookmark to a sub-route breaks. This is a functional/deployment issue that blocks basic usability.

**Phase 1 Review:** These four issues either break the app outright (404 routing, About stub) or create immediate confusion at the most critical moments (CTA fragmentation, button misalignment). They must be resolved before any refinement work.

---

## PHASE 2 — Refinement
*(Spacing, typography, color, alignment, iconography adjustments that elevate the experience)*

**Home / Heading Section Whitespace**  
What's wrong → The hero heading ("Music Practice Suite") has ~40px of space above cards. The gap between the hero section and the card grid is too tight relative to the generous internal card padding.  
What it should be → Increase the gap between the subtitle line and the card grid to ~64px to give the hero room to breathe.  
Why this matters → Right now the page feels compressed at the top. More air makes the cards feel like intentional destinations, not a scrollable list.

**Home / "Why Choose" Section**  
What's wrong → The "Why Choose Music Practice?" section uses three colored feature labels (blue, green, red emoji icons) that introduce a fifth, sixth, and seventh color into the page — and the section itself adds very little value.  
What it should be → Remove the section or collapse it to a single neutral-toned row below the cards.  
Why this matters → Every color introduced without a systematic reason adds noise. This section is a marketing afterthought, not earned UI.

**Home / Card Icon Badges**  
What's wrong → The icon badges in each card corner are inconsistent in style: some are emoji (🎸, 🎹) mixed with custom SVG icons in colored squares. The emoji icons are particularly jarring against the polished dark UI.  
What it should be → Replace all emoji icons with a single cohesive icon set (Lucide or Phosphor) in the same rounded-square badge style used by Chord Recognition.  
Why this matters → Mixing emoji and custom icons breaks visual system unity immediately.

**Chord-Scale Settings / "Coming Soon" Card**  
What's wrong → The dashed-border "Chord → Sources" card reads as broken or unavailable but takes up equal visual weight to the active option.  
What it should be → Reduce opacity to ~40% and collapse its vertical height slightly so it recedes visually without disappearing.  
Why this matters → It should signal "not yet" without competing with the active selection.

**Nav / Active State Typography**  
What's wrong → The active nav item ("Practice", "About", "Chord Scale") is bold, but active vs inactive states look nearly identical at a glance — white bold vs white regular on a dark background.  
What it should be → Active item should use the purple accent color, not just heavier weight. This matches the existing accent already used throughout the app.  
Why this matters → The nav should tell you where you are at a glance, not require reading every label.

**Phase 2 Review:** These are all single-property or single-section changes. None require new components. They compound significantly — resolving all of Phase 2 alongside Phase 1 would produce a visually coherent, calm experience.

---

## PHASE 3 — Polish
*(Micro-interactions, transitions, states, dark mode, subtle details)*

**Quiz / Answer Button States**  
What's wrong → Correct answer state shows a green-bordered success card below the buttons, but the selected button itself doesn't change state. The wrong answers fade to gray. The interaction model requires an extra read to understand what happened.  
What it should be → The selected button should immediately reflect correct (green fill) or incorrect (red fill) before the feedback card appears. The feedback card then explains why.  
Why this matters → The button is where the user's attention is. The state change must happen there first.

**Quiz / Stats Cards Animation**  
What's wrong → The three stats cards (Correct, Accuracy, Streak) update instantly on answer. No acknowledgment of change.  
What it should be → A subtle number count-up animation (100–150ms) when values increment.  
Why this matters → Gamification feedback loop. The streak counter especially should feel rewarding.

**Dark Mode Toggle**  
What's wrong → The moon icon in the nav implies a light/dark toggle, but the app only appears in dark mode.  
What it should be → If light mode is implemented, audit it. If not, remove the toggle until it's ready.  
Why this matters → A toggle that does nothing (or toggles between two nearly identical states) is confusing.

**Mobile Nav**  
What's wrong → On mobile (390px), the nav shows all three links inline: Practice · About · Chord Scale. At this width it's tight but functional. However "Chord Scale" gets close to truncation.  
What it should be → Test at 320px (iPhone SE). At that width the nav likely breaks. Consider a hamburger menu or collapsing to icon-only on smallest breakpoints.  
Why this matters → Small-screen users are likely the primary audience for a practice tool.

**Phase 3 Review:** These micro-interactions are the difference between a functional app and one that feels premium. The answer button state correction in particular is felt every single time a question is answered — it has outsized impact relative to the effort to implement.

---

## DESIGN SYSTEM UPDATES REQUIRED

- **Primary CTA color token** — currently undefined/inconsistent. Propose: use the existing purple (`#7C3AED` or equivalent) as the single CTA color across all four tool cards. Retire blue, green, and orange from button use.
- **Icon badge component** — needs a standard: one icon library, one badge shape (rounded square), consistent 48×48px size.
- **Nav active state color** — currently bold-only. Add active color token using existing purple accent.
- **Answer button grid token** — define equal-width, equal-height answer button as a component with defined correct/incorrect/default/hover states.

---

## IMPLEMENTATION NOTES FOR BUILD AGENT

1. `HomeScreen` card buttons: change `backgroundColor` for all four CTA buttons to the single purple token. Remove per-card color assignments.
2. `QuizScreen` answer buttons: apply `display: grid; grid-template-columns: 1fr 1fr; gap: [spacing-token]` to the answer container. Set all buttons to `width: 100%`.
3. `AboutPage` component: either populate with real content or add a redirect in the router back to `/` until content exists.
4. `vite.config.ts` or deploy config: add GitHub Pages SPA 404 redirect — copy `index.html` to `404.html` in build output, or switch to HashRouter.
5. Nav `<NavLink>` active styles: add `color: var(--color-accent-purple)` to the active class instead of only `font-weight: bold`.
6. `ComingSoonCard` (Chord → Sources): add `opacity: 0.4` and reduce `min-height` by ~30% from current value.
7. `DarkModeToggle`: either wire it to a functional light mode or remove it from the nav.

---

## FUNCTIONAL FLAGS (outside design scope — for build agent)

- **SPA routing 404**: GitHub Pages does not support HTML5 history routing without a redirect workaround. Requires build/deploy config change, not a design change.
- **About page content**: requires content decision before design can be applied.
