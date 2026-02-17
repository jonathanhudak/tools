import React from 'react'
import { motion } from 'framer-motion'

interface PianoKeyboardProps {
  highlightedKeys?: number[]
  size?: 'small' | 'medium' | 'large'
  onKeyClick?: (keyIndex: number) => void
}

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  highlightedKeys = [],
  size = 'medium',
  onKeyClick,
}) => {
  const keyWidth = size === 'small' ? 20 : size === 'medium' ? 24 : 28
  const totalKeys = 88

  return (
    <div className="flex justify-center py-4">
      <div className="relative" style={{ width: keyWidth * totalKeys }}>
        {/* White keys */}
        <div className="flex gap-px bg-gray-200 p-1 rounded">
          {Array.from({ length: totalKeys }).map((_, i) => (
            <motion.div
              key={`white-${i}`}
              onClick={() => onKeyClick?.(i)}
              className={`w-6 h-24 rounded-b cursor-pointer border border-gray-300 transition-colors ${
                highlightedKeys.includes(i)
                  ? 'bg-blue-400'
                  : 'bg-white hover:bg-gray-50'
              }`}
              whileHover={{ scale: 1.02 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
