import React from 'react'
import { Guitar, Piano } from 'lucide-react'

export type ToggleInstrument = 'guitar' | 'banjo' | 'piano'

interface InstrumentToggleProps {
  instrument: ToggleInstrument
  onChange: (instrument: ToggleInstrument) => void
  /** Which instruments to offer (default all) */
  options?: ToggleInstrument[]
}

const OPTIONS: Array<{ id: ToggleInstrument; label: string; icon: React.ReactNode }> = [
  { id: 'guitar', label: 'Guitar', icon: <Guitar className="w-4 h-4 inline mr-1" /> },
  // Lucide has no banjo icon — the emoji stands in.
  { id: 'banjo', label: 'Banjo', icon: <span className="inline mr-1" aria-hidden>🪕</span> },
  { id: 'piano', label: 'Piano', icon: <Piano className="w-4 h-4 inline mr-1" /> },
]

export const InstrumentToggle: React.FC<InstrumentToggleProps> = ({
  instrument,
  onChange,
  options,
}) => {
  const visible = options ? OPTIONS.filter((opt) => options.includes(opt.id)) : OPTIONS
  return (
    <div className="flex gap-2 mb-4">
      {visible.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`px-4 py-2 rounded ${
            instrument === opt.id
              ? 'bg-[var(--accent-color)] text-white'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {opt.icon} {opt.label}
        </button>
      ))}
    </div>
  )
}
