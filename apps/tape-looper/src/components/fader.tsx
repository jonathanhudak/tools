/**
 * Fader — compact horizontal volume slider with inline dB readout.
 * Linear 0–1 input. B&W styling lives in index.css (`.fader-row`).
 */
export function Fader({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label?: string;
}): JSX.Element {
  const db = value === 0 ? '-∞' : `${(20 * Math.log10(value)).toFixed(1)}`;
  return (
    <div className="fader-row" title={label ?? 'Volume'}>
      <span className="fader-label">Vol</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="fader-slider"
        aria-label={label ?? 'Volume'}
      />
      <span className="fader-readout">{db}</span>
    </div>
  );
}
