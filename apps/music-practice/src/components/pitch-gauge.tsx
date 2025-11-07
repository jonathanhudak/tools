/**
 * PitchGauge Component
 * Real-time pitch visualization with tuning feedback
 * Shows note name, cents deviation, and color-coded accuracy gauge
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import GaugeChart from 'react-gauge-chart';

// Define props interface for TypeScript
interface PitchGaugeProps {
  note: string; // e.g., "A4"
  cents: number; // -50 to +50, e.g., 12 for +12¢ sharp
  className?: string; // Optional Tailwind classes for the container
  clarity?: number; // Optional clarity indicator (0-1)
}

// Helper to map cents to percentage (0 to 1) for the gauge
const mapCentsToPercent = (cents: number): number => {
  // Clamp to -50/+50 range
  const clampedCents = Math.max(-50, Math.min(50, cents));
  return (clampedCents + 50) / 100; // -50 -> 0, 0 -> 0.5, +50 -> 1
};

// Exponential moving average for smooth value transitions
const smoothValue = (current: number, target: number, alpha: number = 0.3): number => {
  return current + (target - current) * alpha;
};

// Color zones: left (flat, red), center (in-tune, green), right (sharp, yellow/orange)
const FLAT_COLOR = '#ef4444'; // Tailwind red-500
const INTUNE_COLOR = '#10b981'; // Tailwind green-500
const SHARP_COLOR = '#f59e0b'; // Tailwind amber-500

// Memoize color array (constant, doesn't need to be recreated)
const GAUGE_COLORS = [
  ...Array(10).fill(FLAT_COLOR), // Left 1/3: flat (red)
  ...Array(10).fill(INTUNE_COLOR), // Center 1/3: in-tune (green)
  ...Array(10).fill(SHARP_COLOR), // Right 1/3: sharp (yellow)
];

const PitchGaugeComponent: React.FC<PitchGaugeProps> = ({ note, cents, className = '', clarity }) => {
  // Smooth the cents value to reduce jitter
  const [smoothedCents, setSmoothedCents] = useState(cents);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  // Smooth cents updates using requestAnimationFrame for butter-smooth 60fps
  useEffect(() => {
    const updateSmoothedValue = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateRef.current) / 1000; // Convert to seconds
      lastUpdateRef.current = now;

      setSmoothedCents((prevSmoothed) => {
        // Adaptive smoothing - faster when close to target, slower when far
        const diff = Math.abs(cents - prevSmoothed);
        const alpha = diff > 10 ? 0.4 : diff > 5 ? 0.25 : 0.15;

        const newValue = smoothValue(prevSmoothed, cents, alpha);

        // Stop animation if close enough (within 0.1 cent)
        if (Math.abs(newValue - cents) < 0.1) {
          return cents;
        }

        return newValue;
      });

      // Continue animation if not close enough
      if (Math.abs(smoothedCents - cents) >= 0.1) {
        animationFrameRef.current = requestAnimationFrame(updateSmoothedValue);
      }
    };

    // Start smoothing animation
    animationFrameRef.current = requestAnimationFrame(updateSmoothedValue);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cents, smoothedCents]);

  // Memoize computed values to avoid unnecessary recalculations
  const percent = useMemo(() => mapCentsToPercent(smoothedCents), [smoothedCents]);
  const displayCents = useMemo(() => Math.round(smoothedCents), [smoothedCents]);
  const direction = useMemo(() =>
    displayCents < -5 ? '♭' : displayCents > 5 ? '♯' : '',
    [displayCents]
  );

  // Determine if in-tune (within ±5 cents)
  const inTune = Math.abs(displayCents) <= 5;

  return (
    <div className={`flex flex-col items-center p-4 ${className}`}>
      {/* Gauge Container */}
      <div className="relative w-56 h-56 mb-2">
        <GaugeChart
          id="pitch-gauge"
          nrOfLevels={30} // Higher for smoother arcs; divides into 30 equal parts
          colors={GAUGE_COLORS} // Use memoized colors
          arcWidth={0.2} // Thickness of the arc
          percent={percent}
          needleColor="#374151" // Tailwind gray-700
          needleBaseColor="#374151"
          textColor="transparent" // Hide default text
          hideText // Ensure no default text
          animate={false} // Disable animation for real-time updates (we handle smoothing)
          animDelay={0} // No delay
        />
        {/* Overlay for note name in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ marginTop: '20px' }}>
          <span className={`text-4xl font-bold drop-shadow-md transition-colors duration-200 ${
            inTune ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'
          }`}>
            {note}
          </span>
          {clarity !== undefined && (
            <span className="text-xs text-muted-foreground mt-1">
              clarity: {Math.round(clarity * 100)}%
            </span>
          )}
        </div>
      </div>

      {/* Cent offset display */}
      <div className="text-center mt-2">
        <div className="flex items-center justify-center gap-2">
          <span className={`text-2xl font-mono font-semibold transition-colors duration-200 ${
            Math.abs(displayCents) <= 5 ? 'text-green-600 dark:text-green-400' :
            displayCents < 0 ? 'text-red-500 dark:text-red-400' :
            'text-amber-500 dark:text-amber-400'
          }`}>
            {direction && <span className="mr-1">{direction}</span>}
            {Math.abs(displayCents)}¢
          </span>
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {inTune ? 'In tune! ✓' : displayCents < 0 ? 'Too flat' : 'Too sharp'}
        </div>
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders when parent re-renders
// Only re-render if note, cents, or clarity actually change
export const PitchGauge = React.memo(PitchGaugeComponent, (prevProps, nextProps) => {
  // Custom comparison - only re-render if values change significantly
  return (
    prevProps.note === nextProps.note &&
    Math.abs(prevProps.cents - nextProps.cents) < 0.5 && // Ignore tiny changes
    prevProps.clarity === nextProps.clarity &&
    prevProps.className === nextProps.className
  );
});

export default PitchGauge;
