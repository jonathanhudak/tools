import { useStore } from '../lib/store';
import { TimelineRuler } from './timeline-ruler';

/* ── Loop Region ──
 * Absolutely-positioned overlay inside the timeline-scroll container,
 * spanning loop.start → loop.end. Diagonal hatch fill (inline SVG so we
 * don't have to thread #pat-diag through CSS) plus dashed vertical
 * borders at each edge. Pure B&W.
 *
 * Sits below the playhead (z-index 4) but above track lanes — its
 * pointer-events are disabled so it never steals clicks from the ruler
 * or lanes.
 */
export function LoopRegion({ zoom, totalHeight }: { zoom: number; totalHeight: number }) {
  const loop = useStore((s) => s.loop);
  if (!loop.enabled) return null;
  const left = loop.start * zoom;
  const width = Math.max(0, (loop.end - loop.start) * zoom);
  if (width <= 0) return null;
  return (
    <div
      className="loop-region"
      style={{
        left,
        width,
        top: TimelineRuler.HEIGHT,
        height: Math.max(0, totalHeight - TimelineRuler.HEIGHT),
      }}
      aria-hidden
    />
  );
}
