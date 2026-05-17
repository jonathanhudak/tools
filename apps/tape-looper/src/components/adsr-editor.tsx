/**
 * ADSR envelope editor — 4 draggable SVG handles.
 *
 * Time axis (x) maps seconds → pixels using a non-linear scale so that
 * fast envelopes are still readable while long releases still fit.
 *
 * Sustain (y) is 0–1; attack/decay/release peak height is fixed at 1.
 *
 * All interaction via pointer events so touch + mouse both work.
 */
import { useCallback, useRef } from 'react';
import type { ADSR } from '../lib/types';

const W = 340;
const H = 120;
const PAD_LEFT = 6;
const PAD_RIGHT = 6;
const PAD_TOP = 8;
const PAD_BOT = 8;
const PLOT_W = W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = H - PAD_TOP - PAD_BOT;

const MAX_SECONDS = 4; // Each segment can be 0–MAX_SECONDS long.
const SUSTAIN_HOLD_PX = 60; // Width of the "sustain" plateau in pixels.

/** Map a seconds value into a fraction-of-width using sqrt scale (more
 *  resolution near zero, where most envelopes live). */
function secsToPx(secs: number): number {
  const ratio = Math.sqrt(Math.max(0, Math.min(MAX_SECONDS, secs)) / MAX_SECONDS);
  // Each ADSR segment gets ~1/3 of the available width MINUS the sustain
  // hold (which is fixed). Width-per-segment is (PLOT_W - SUSTAIN_HOLD_PX) / 3.
  const perSegment = (PLOT_W - SUSTAIN_HOLD_PX) / 3;
  return ratio * perSegment;
}

function pxToSecs(px: number): number {
  const perSegment = (PLOT_W - SUSTAIN_HOLD_PX) / 3;
  const ratio = Math.max(0, Math.min(1, px / perSegment));
  return ratio * ratio * MAX_SECONDS;
}

interface Point { x: number; y: number; }

function envelopePoints(env: ADSR): { start: Point; peak: Point; sustainStart: Point; sustainEnd: Point; end: Point } {
  const startX = PAD_LEFT;
  const startY = PAD_TOP + PLOT_H; // baseline
  const peakX = startX + secsToPx(env.attack);
  const peakY = PAD_TOP;
  const sustainStartX = peakX + secsToPx(env.decay);
  const sustainY = PAD_TOP + (1 - env.sustain) * PLOT_H;
  const sustainEndX = sustainStartX + SUSTAIN_HOLD_PX;
  const endX = sustainEndX + secsToPx(env.release);
  const endY = startY;
  return {
    start: { x: startX, y: startY },
    peak: { x: peakX, y: peakY },
    sustainStart: { x: sustainStartX, y: sustainY },
    sustainEnd: { x: sustainEndX, y: sustainY },
    end: { x: endX, y: endY },
  };
}

interface ADSREditorProps {
  value: ADSR;
  onChange: (next: ADSR) => void;
}

export function ADSREditor({ value, onChange }: ADSREditorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<'A' | 'D' | 'S' | 'R' | null>(null);

  const pts = envelopePoints(value);
  const pathD = [
    `M ${pts.start.x} ${pts.start.y}`,
    `L ${pts.peak.x} ${pts.peak.y}`,
    `L ${pts.sustainStart.x} ${pts.sustainStart.y}`,
    `L ${pts.sustainEnd.x} ${pts.sustainEnd.y}`,
    `L ${pts.end.x} ${pts.end.y}`,
  ].join(' ');

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const y = ((e.clientY - rect.top) / rect.height) * H;

    const which = dragRef.current;
    const recomputed = envelopePoints(value);

    if (which === 'A') {
      // Attack handle = peak point. X distance from start = attack seconds.
      const dx = Math.max(0, x - PAD_LEFT);
      onChange({ ...value, attack: pxToSecs(dx) });
    } else if (which === 'D') {
      // Decay handle = sustainStart. X distance from peak = decay seconds.
      const dx = Math.max(0, x - recomputed.peak.x);
      const sustain = Math.max(0, Math.min(1, 1 - (y - PAD_TOP) / PLOT_H));
      onChange({ ...value, decay: pxToSecs(dx), sustain });
    } else if (which === 'S') {
      // Sustain handle = sustainEnd. Only Y is meaningful here.
      const sustain = Math.max(0, Math.min(1, 1 - (y - PAD_TOP) / PLOT_H));
      onChange({ ...value, sustain });
    } else if (which === 'R') {
      // Release handle = end point. X distance from sustainEnd.
      const dx = Math.max(0, x - recomputed.sustainEnd.x);
      onChange({ ...value, release: pxToSecs(dx) });
    }
  }, [value, onChange]);

  const handlePointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (dragRef.current && svgRef.current) {
      try { svgRef.current.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
    }
    dragRef.current = null;
  }, []);

  const startDrag = (which: 'A' | 'D' | 'S' | 'R') => (e: React.PointerEvent<SVGCircleElement>) => {
    e.stopPropagation();
    dragRef.current = which;
    if (svgRef.current) {
      try { svgRef.current.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    }
  };

  return (
    <svg
      ref={svgRef}
      className="adsr-svg"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ width: '100%', height: 120, touchAction: 'none', background: '#fff', border: '2px solid var(--color-border)' }}
    >
      {/* Baseline */}
      <line x1={PAD_LEFT} y1={PAD_TOP + PLOT_H} x2={W - PAD_RIGHT} y2={PAD_TOP + PLOT_H} stroke="#bbb" strokeWidth={1} strokeDasharray="2 4" />
      {/* Top reference */}
      <line x1={PAD_LEFT} y1={PAD_TOP} x2={W - PAD_RIGHT} y2={PAD_TOP} stroke="#eee" strokeWidth={1} />

      {/* Envelope shape */}
      <path d={pathD} stroke="#000" strokeWidth={2} fill="none" />

      {/* Handles — large hit areas for touch */}
      <Handle p={pts.peak} onPointerDown={startDrag('A')} label="A" />
      <Handle p={pts.sustainStart} onPointerDown={startDrag('D')} label="D" />
      <Handle p={pts.sustainEnd} onPointerDown={startDrag('S')} label="S" />
      <Handle p={pts.end} onPointerDown={startDrag('R')} label="R" />
    </svg>
  );
}

function Handle({ p, onPointerDown, label }: { p: Point; onPointerDown: (e: React.PointerEvent<SVGCircleElement>) => void; label: string }) {
  return (
    <g>
      {/* Big invisible hit target for touch */}
      <circle cx={p.x} cy={p.y} r={14} fill="transparent" onPointerDown={onPointerDown} style={{ cursor: 'grab' }} />
      <circle cx={p.x} cy={p.y} r={5} fill="#fff" stroke="#000" strokeWidth={2} pointerEvents="none" />
      <text x={p.x} y={p.y - 9} fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle" pointerEvents="none" fill="#000">{label}</text>
    </g>
  );
}
