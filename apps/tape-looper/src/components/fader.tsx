/**
 * Fader — vertical volume slider (range input rotated -90deg).
 * Renders a B&W slider plus a dB readout. Linear 0–1 input value.
 *
 * Touch-first: 40×90px footprint, 28px-tall thumb meets the ≥40px
 * tap-area-after-rotation requirement (the rotated slider's effective
 * touch surface spans ~80px tall).
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
    <div className="fader-wrap" title={label ?? 'Volume'}>
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
      <div className="fader-readout">{db} dB</div>
    </div>
  );
}
