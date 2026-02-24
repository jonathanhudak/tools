import React from 'react'
import { Guitar, Piano } from 'lucide-react'

interface InstrumentToggleProps {
  instrument: 'guitar' | 'piano'
  onChange: (instrument: 'guitar' | 'piano') => void
}

export const InstrumentToggle: React.FC<InstrumentToggleProps> = ({
  instrument,
  onChange,
}) => {
  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => onChange('guitar')}
        className={`px-4 py-2 rounded ${
          instrument === 'guitar'
            ? 'bg-[var(--accent-color)] text-white'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        <Guitar className="w-4 h-4 inline mr-1" /> Guitar
      </button>
      <button
        onClick={() => onChange('piano')}
        className={`px-4 py-2 rounded ${
          instrument === 'piano'
            ? 'bg-[var(--accent-color)] text-white'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        <Piano className="w-4 h-4 inline mr-1" /> Piano
      </button>
    </div>
  )
}
