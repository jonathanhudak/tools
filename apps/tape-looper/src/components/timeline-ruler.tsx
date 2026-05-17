import { useRef, useEffect, useCallback } from 'react';

const RULER_HEIGHT = 28;

/* ── Timeline Ruler ──
 * Canvas of bar/beat ticks. Width matches `totalWidth` so it scrolls in sync
 * with the timeline column. Click/drag seeks playhead. Pure B&W.
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
  const dragRef = useRef(false);
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
    if (!isSeeking) return;
    onSeek(getTimeFromEvent(e));
    dragRef.current = true;
    e.preventDefault();
  }, [isSeeking, getTimeFromEvent, onSeek]);

  useEffect(() => {
    if (!isSeeking) return;
    const hm = (e: PointerEvent) => { if (dragRef.current) onSeek(getTimeFromEvent(e)); };
    const hu = () => { dragRef.current = false; };
    window.addEventListener('pointermove', hm);
    window.addEventListener('pointerup', hu);
    return () => {
      window.removeEventListener('pointermove', hm);
      window.removeEventListener('pointerup', hu);
    };
  }, [isSeeking, getTimeFromEvent, onSeek]);

  return (
    <div
      className="timeline-ruler"
      onPointerDown={handlePointerDown}
      style={{ cursor: isSeeking ? 'col-resize' : 'default', height: RULER_HEIGHT, width: totalWidth }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', pointerEvents: 'none' }} />
    </div>
  );
}

TimelineRuler.HEIGHT = RULER_HEIGHT;
