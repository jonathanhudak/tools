/**
 * PanControl — horizontal pan slider, range -1..+1.
 * Snaps to 0 (center) within a ±0.05 dead-zone for predictable centering.
 * Label format: L## / C / R##.
 */
export function PanControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}): JSX.Element {
  const label =
    Math.abs(value) < 0.05
      ? 'C'
      : value < 0
        ? `L${Math.abs(Math.round(value * 100))}`
        : `R${Math.round(value * 100)}`;
  return (
    <div className="pan-wrap" title="Pan">
      <input
        type="range"
        min={-1}
        max={1}
        step={0.02}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          onChange(Math.abs(v) < 0.05 ? 0 : v);
        }}
        className="pan-slider"
        aria-label="Pan"
      />
      <div className="pan-readout">{label}</div>
    </div>
  );
}
