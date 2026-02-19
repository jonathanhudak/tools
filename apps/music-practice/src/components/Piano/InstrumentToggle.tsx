import React from 'react'

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
        🎸 Guitar
      </button>
      <button
        onClick={() => onChange('piano')}
        className={`px-4 py-2 rounded ${
          instrument === 'piano'
            ? 'bg-[var(--accent-color)] text-white'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        🎹 Piano
      </button>
    </div>
  )
}
