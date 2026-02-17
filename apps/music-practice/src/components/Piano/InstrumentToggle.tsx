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
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        🎸 Guitar
      </button>
      <button
        onClick={() => onChange('piano')}
        className={`px-4 py-2 rounded ${
          instrument === 'piano'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        🎹 Piano
      </button>
    </div>
  )
}
