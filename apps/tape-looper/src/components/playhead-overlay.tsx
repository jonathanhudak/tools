/* ── Playhead Overlay ──
 * Absolutely-positioned 2px red line inside the timeline scroll container.
 * Single DOM update per frame instead of N canvas redraws.
 * Pointer-events: none so it doesn't steal clicks from the lanes/ruler.
 */
export function PlayheadOverlay({
  playheadTime,
  zoom,
  totalHeight,
}: {
  playheadTime: number;
  zoom: number;
  totalHeight: number;
}) {
  const x = playheadTime * zoom;
  return (
    <div
      className="playhead-line"
      style={{
        transform: `translateX(${x}px)`,
        height: totalHeight,
      }}
      aria-hidden
    />
  );
}
