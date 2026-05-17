import { useRef, useEffect, useCallback } from 'react';
import { useStore } from '../lib/store';

const RULER_HEIGHT = 28;

/* ── Timeline Ruler ──
 * Canvas of bar/beat ticks. Width matches `totalWidth` so it scrolls in sync
 * with the timeline column. Click/drag seeks playhead. Pure B&W.
 *
 * Shift+drag (desktop) sets the loop region: pointerdown captures `start`,
 * pointermove updates `end`, pointerup commits via setLoop({enabled,start,end}).
 * Plain click/drag retains the existing seek behavior.
 */
export function TimelineRuler({
  bpm,
  zoom,
  totalWidth,
  transport,
  onSeek,
}: {
  bpm: number;
  zoom: number;
  totalWidth: number;
  transport: string;
  onSeek: (time: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** Mode of the current drag: null (none), 'seek' (plain), 'loop' (shift). */
  const dragModeRef = useRef<null | 'seek' | 'loop'>(null);
  /** Loop drag anchor — the time at which the drag began. */
  const loopAnchorRef = useRef(0);
  const setLoop = useStore((s) => s.setLoop);
  const isSeeking = transport === 'stopped';

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = totalWidth;
    const h = RULER_HEIGHT;
    const dpr = window.devicePixelRatio || 1;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);

    // Bottom border (separates ruler from track lanes)
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h - 0.5);
    ctx.lineTo(w, h - 0.5);
    ctx.stroke();

    const beatSec = 60 / bpm;
    const beatPx = beatSec * zoom;
    if (beatPx <= 0) return;

    // Skip drawing if beats would be too dense (<4px) — only draw bars
    const drawBeats = beatPx >= 6;

    const totalBeats = Math.ceil(w / beatPx) + 1;

    ctx.fillStyle = '#000';
    ctx.strokeStyle = '#000';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textBaseline = 'top';

    for (let beat = 0; beat <= totalBeats; beat++) {
      const x = beat * beatPx;
      if (x > w) break;
      const isBar = beat % 4 === 0;

      if (isBar) {
        // Major tick — full height
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 12);
        ctx.lineTo(x + 0.5, h);
        ctx.stroke();

        // Bar number label
        const barNumber = beat / 4 + 1;
        ctx.fillText(String(barNumber), x + 3, 2);
      } else if (drawBeats) {
        // Minor tick — short
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x + 0.5, h - 8);
        ctx.lineTo(x + 0.5, h);
        ctx.stroke();
      }
    }
  }, [bpm, zoom, totalWidth]);

  useEffect(() => { draw(); }, [draw]);

  const getTimeFromEvent = useCallback((e: React.PointerEvent | PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    return Math.max(0, x / zoom);
  }, [zoom]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const t = getTimeFromEvent(e);
    if (e.shiftKey) {
      // Begin a loop-set drag. Seed start=end=anchor; the final commit
      // happens on pointerup so a zero-length drag (a plain shift-click)
      // is treated as "no change".
      dragModeRef.current = 'loop';
      loopAnchorRef.current = t;
      setLoop({ enabled: true, start: t, end: t });
      e.preventDefault();
      return;
    }
    if (!isSeeking) return;
    onSeek(t);
    dragModeRef.current = 'seek';
    e.preventDefault();
  }, [getTimeFromEvent, isSeeking, onSeek, setLoop]);

  useEffect(() => {
    const hm = (e: PointerEvent) => {
      const mode = dragModeRef.current;
      if (!mode) return;
      const t = getTimeFromEvent(e);
      if (mode === 'seek') {
        if (!isSeeking) return;
        onSeek(t);
      } else {
        const anchor = loopAnchorRef.current;
        const start = Math.min(anchor, t);
        const end = Math.max(anchor, t);
        setLoop({ enabled: true, start, end });
      }
    };
    const hu = () => {
      if (dragModeRef.current === 'loop') {
        // If the user shift-clicked without dragging, the region has
        // zero length — disable the loop so we don't trip on a stuck
        // empty range later. Otherwise leave it enabled.
        const { loop } = useStore.getState();
        if (loop.end <= loop.start) {
          setLoop({ enabled: false });
        }
      }
      dragModeRef.current = null;
    };
    window.addEventListener('pointermove', hm);
    window.addEventListener('pointerup', hu);
    return () => {
      window.removeEventListener('pointermove', hm);
      window.removeEventListener('pointerup', hu);
    };
  }, [getTimeFromEvent, isSeeking, onSeek, setLoop]);

  return (
    <div
      className="timeline-ruler"
      onPointerDown={handlePointerDown}
      style={{ cursor: isSeeking ? 'col-resize' : 'default', height: RULER_HEIGHT, width: totalWidth }}
      title="Click to seek · Shift+drag to set loop region"
    >
      <canvas ref={canvasRef} style={{ display: 'block', pointerEvents: 'none' }} />
    </div>
  );
}

TimelineRuler.HEIGHT = RULER_HEIGHT;
