/**
 * /styleguide — Look & Feel Guide + Component Prototypes
 *
 * Showcases the app's design system tokens, typography, color palette,
 * component examples, and prototype components like the horizontal
 * guitar fretboard scale diagram.
 */

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { GuitarFretboard } from '@/components/GuitarFretboard/GuitarFretboard';

export const Route = createFileRoute('/styleguide')({
  component: StyleGuide,
});

// ── Demo data ────────────────────────────────────────────

const DEMO_SCALES: { name: string; root: string; notes: string[] }[] = [
  { name: 'C Major', root: 'C', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
  { name: 'A Minor Pentatonic', root: 'A', notes: ['A', 'C', 'D', 'E', 'G'] },
  { name: 'G Mixolydian', root: 'G', notes: ['G', 'A', 'B', 'C', 'D', 'E', 'F'] },
  { name: 'D Dorian', root: 'D', notes: ['D', 'E', 'F', 'G', 'A', 'B', 'C'] },
  { name: 'E Minor', root: 'E', notes: ['E', 'F#', 'G', 'A', 'B', 'C', 'D'] },
  { name: 'Bb Major', root: 'Bb', notes: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'] },
  { name: 'F# Minor Pentatonic', root: 'F#', notes: ['F#', 'A', 'B', 'C#', 'E'] },
  { name: 'A Blues', root: 'A', notes: ['A', 'C', 'D', 'Eb', 'E', 'G'] },
];

// ── Color swatches ───────────────────────────────────────

function Swatch({ label, bg, text }: { label: string; bg: string; text?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 border border-border"
        style={{ backgroundColor: bg }}
      />
      <div>
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-xs font-mono-app text-muted-foreground">{text || bg}</p>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────

function StyleGuide() {
  const [selectedScale, setSelectedScale] = useState(0);
  const [showDegrees, setShowDegrees] = useState(false);
  const [fretCount, setFretCount] = useState(15);

  const scale = DEMO_SCALES[selectedScale];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* ── Header ─────────────────────────────────── */}
      <header>
        <h1 className="text-3xl font-display font-bold text-foreground">Style Guide</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Design system tokens, typography, and component prototypes
        </p>
      </header>

      {/* ── Colors ─────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-foreground border-b border-border pb-2">
          Colors
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <Swatch label="Background" bg="hsl(var(--color-background))" text="--color-background" />
          <Swatch label="Foreground" bg="hsl(var(--color-foreground))" text="--color-foreground" />
          <Swatch label="Primary" bg="hsl(var(--color-primary))" text="--color-primary" />
          <Swatch label="Secondary" bg="hsl(var(--color-secondary))" text="--color-secondary" />
          <Swatch label="Muted" bg="hsl(var(--color-muted))" text="--color-muted" />
          <Swatch label="Accent" bg="var(--accent-color)" text="--accent-color" />
          <Swatch label="Destructive" bg="hsl(var(--color-destructive))" text="--color-destructive" />
          <Swatch label="Card" bg="hsl(var(--color-card))" text="--color-card" />
        </div>

        <h3 className="text-sm font-semibold text-foreground mt-6">Ink Hierarchy</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Swatch label="Ink Primary" bg="var(--ink-primary)" text="--ink-primary" />
          <Swatch label="Ink Secondary" bg="var(--ink-secondary)" text="--ink-secondary" />
          <Swatch label="Ink Tertiary" bg="var(--ink-tertiary)" text="--ink-tertiary" />
          <Swatch label="Ink Disabled" bg="var(--ink-disabled)" text="--ink-disabled" />
        </div>

        <h3 className="text-sm font-semibold text-foreground mt-6">Semantic</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Swatch label="Success" bg="var(--success-color)" text="--success-color" />
          <Swatch label="Error" bg="var(--error-color)" text="--error-color" />
          <Swatch label="Warning" bg="var(--warning-color)" text="--warning-color" />
          <Swatch label="Accent Hover" bg="var(--accent-hover)" text="--accent-hover" />
        </div>
      </section>

      {/* ── Typography ─────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-foreground border-b border-border pb-2">
          Typography
        </h2>
        <div className="space-y-3">
          <div>
            <span className="text-xs text-muted-foreground font-mono-app">font-display — Lora</span>
            <p className="text-2xl font-display text-foreground">
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-mono-app">font-body — DM Sans</span>
            <p className="text-lg text-foreground">
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-mono-app">font-mono — DM Mono</span>
            <p className="text-base font-mono-app text-foreground">
              C D E F G A B — 1 2 3 4 5 6 7
            </p>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-foreground mt-6">Scale</h3>
        <div className="space-y-1">
          {(['text-3xl', 'text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm', 'text-xs'] as const).map(size => (
            <p key={size} className={`${size} text-foreground`}>
              <span className="text-xs font-mono-app text-muted-foreground inline-block w-20">{size}</span>
              Music Practice
            </p>
          ))}
        </div>
      </section>

      {/* ── Spacing & Borders ──────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-foreground border-b border-border pb-2">
          Spacing &amp; Borders
        </h2>
        <div className="flex flex-wrap gap-4">
          {[
            { label: 'radius-sm', cls: 'rounded-sm' },
            { label: 'radius-md', cls: 'rounded-md' },
            { label: 'radius-lg', cls: 'rounded-lg' },
          ].map(({ label, cls }) => (
            <div key={label} className="text-center">
              <div className={`w-16 h-16 bg-primary ${cls} border border-border`} />
              <span className="text-xs font-mono-app text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="border border-border p-4 text-xs text-muted-foreground">border-border</div>
          <div className="border-2 border-dashed border-border p-4 text-xs text-muted-foreground">dashed</div>
          <div style={{ borderColor: 'var(--ink-primary)' }} className="border-2 p-4 text-xs text-foreground">ink-primary border</div>
        </div>
      </section>

      {/* ── Component Samples ──────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-foreground border-b border-border pb-2">
          Interactive Tokens
        </h2>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity rounded-sm">
            Primary Button
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground text-sm font-semibold hover:opacity-90 transition-opacity rounded-sm border border-border">
            Secondary Button
          </button>
          <button className="px-4 py-2 bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-opacity rounded-sm">
            Destructive
          </button>
          <button className="px-4 py-2 border-2 border-dashed border-border text-foreground text-sm font-semibold hover:bg-muted transition-colors rounded-none">
            Dashed Outline
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="bg-card p-4 border border-border rounded-sm">
            <h4 className="text-sm font-semibold text-card-foreground">Card</h4>
            <p className="text-xs text-muted-foreground">Standard card with border</p>
          </div>
          <div className="bg-card p-4 border-2 border-dashed border-border rounded-none">
            <h4 className="text-sm font-semibold text-card-foreground">Dashed Card</h4>
            <p className="text-xs text-muted-foreground">Punk-aesthetic dashed variant</p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════ */}
      {/* ── Guitar Fretboard Scale Diagram (Prototype) ──────── */}
      {/* ════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-foreground border-b border-border pb-2">
          Guitar Fretboard — Scale Diagram <span className="text-xs font-mono-app text-muted-foreground ml-2">PROTOTYPE</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Full horizontal guitar neck showing scale note positions. 
          Colored dots = root note (accent), dark dots = scale tones.
        </p>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-foreground">Scale</label>
            <select
              value={selectedScale}
              onChange={e => setSelectedScale(Number(e.target.value))}
              className="text-sm px-2 py-1 bg-card border border-border text-foreground rounded-sm font-mono-app"
            >
              {DEMO_SCALES.map((s, i) => (
                <option key={s.name} value={i}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-foreground">Frets</label>
            <select
              value={fretCount}
              onChange={e => setFretCount(Number(e.target.value))}
              className="text-sm px-2 py-1 bg-card border border-border text-foreground rounded-sm font-mono-app"
            >
              {[12, 15, 17, 19, 22].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={showDegrees}
              onChange={e => setShowDegrees(e.target.checked)}
              className="accent-[var(--accent-color)]"
            />
            Show degrees
          </label>
        </div>

        {/* Fretboard */}
        <div className="bg-card border border-border p-4 rounded-sm overflow-hidden">
          <GuitarFretboard
            notes={scale.notes}
            root={scale.root}
            fretCount={fretCount}
            showNoteNames={!showDegrees}
            showDegrees={showDegrees}
            label={scale.name}
          />
        </div>

        {/* Compact variant */}
        <h3 className="text-sm font-semibold text-foreground mt-6">Compact Variant</h3>
        <div className="bg-card border border-border p-3 rounded-sm overflow-hidden">
          <GuitarFretboard
            notes={scale.notes}
            root={scale.root}
            fretCount={12}
            showNoteNames
            compact
          />
        </div>

        {/* Multiple scales comparison */}
        <h3 className="text-sm font-semibold text-foreground mt-6">Scale Comparison</h3>
        <div className="space-y-4">
          {DEMO_SCALES.slice(0, 3).map(s => (
            <div key={s.name} className="bg-card border border-border p-3 rounded-sm overflow-hidden">
              <GuitarFretboard
                notes={s.notes}
                root={s.root}
                fretCount={12}
                showNoteNames
                compact
                label={s.name}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Implementation Notes ───────────────────── */}
      <section className="space-y-4 pb-12">
        <h2 className="text-xl font-display font-semibold text-foreground border-b border-border pb-2">
          Implementation Notes
        </h2>
        <div className="bg-card border border-border p-4 rounded-sm space-y-2 text-sm text-muted-foreground">
          <p><strong className="text-foreground">Fretboard component:</strong>{' '}
            Pure SVG, no dependencies beyond Tonal.js (already in use). Uses equal fret spacing. 
            Strings have graduated thickness (thicker = bass). Fret inlay markers at 3, 5, 7, 9, 12, 15.
          </p>
          <p><strong className="text-foreground">Theming:</strong>{' '}
            All colors use CSS custom properties (<code className="font-mono-app">--ink-*</code>,{' '}
            <code className="font-mono-app">--accent-color</code>) so it auto-adapts to light/dark mode.
          </p>
          <p><strong className="text-foreground">Enharmonic handling:</strong>{' '}
            Notes are normalized to sharps internally for comparison (Db→C#) but displayed
            in the original spelling provided by the scale data.
          </p>
          <p><strong className="text-foreground">Next steps:</strong>{' '}
            Integrate into ScaleDisplay (replace TODO), add interactive note highlighting,
            optional audio playback on tap, interval labels, position/box filtering.
          </p>
        </div>
      </section>
    </div>
  );
}
