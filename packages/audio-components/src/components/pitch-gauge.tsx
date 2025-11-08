/**
 * PitchGauge Component
 * Real-time pitch visualization with tuning feedback
 * Shows note name, cents deviation, and color-coded accuracy gauge
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import GaugeChart from 'react-gauge-chart';

// Define props interface for TypeScript
export interface PitchGaugeProps {
  note: string; // e.g., "A4"
  cents: number; // -50 to +50, e.g., 12 for +12¢ sharp
  className?: string; // Optional Tailwind classes for the container
  clarity?: number; // Optional clarity indicator (0-1)
  inTuneThreshold?: number; // Cents threshold for "in tune" (default: 5)
  smoothingFactor?: number; // 0-1, higher = smoother but slower response (default: 0.7)
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

const PitchGaugeComponent: React.FC<PitchGaugeProps> = ({
  note,
  cents,
  className = '',
  clarity,
  inTuneThreshold = 5,
  smoothingFactor = 0.7
}) => {
  // Smooth the cents value to reduce jitter
  const [smoothedCents, setSmoothedCents] = useState(cents);
  const animationFrameRef = useRef<number | null>(null);

  // Smooth cents updates using requestAnimationFrame for butter-smooth 60fps
  useEffect(() => {
    let isAnimating = true;

    const updateSmoothedValue = () => {
      if (!isAnimating) return;

      setSmoothedCents((prevSmoothed) => {
        // Calculate smoothing alpha based on smoothingFactor
        // smoothingFactor: 0 = instant (no smoothing), 1 = very smooth (slow response)
        // Invert and scale to get alpha: 0.0-1.0 -> 0.8-0.05
        const baseAlpha = 0.05 + (1 - smoothingFactor) * 0.75;

        // Adaptive smoothing - faster when far from target, slower when close
        const diff = Math.abs(cents - prevSmoothed);
        const adaptiveFactor = diff > 10 ? 1.5 : diff > 5 ? 1.0 : 0.6;
        const alpha = Math.min(1, baseAlpha * adaptiveFactor);

        const newValue = smoothValue(prevSmoothed, cents, alpha);

        // Stop animation if close enough (within 0.5 cent for smoother convergence)
        if (Math.abs(newValue - cents) < 0.5) {
          return cents;
        }

        return newValue;
      });

      // Continue animation
      if (isAnimating) {
        animationFrameRef.current = requestAnimationFrame(updateSmoothedValue);
      }
    };

    // Start smoothing animation
    animationFrameRef.current = requestAnimationFrame(updateSmoothedValue);

    return () => {
      isAnimating = false;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cents, smoothingFactor]);

  // Memoize computed values to avoid unnecessary recalculations
  const percent = useMemo(() => mapCentsToPercent(smoothedCents), [smoothedCents]);
  const displayCents = useMemo(() => Math.round(smoothedCents), [smoothedCents]);
  const direction = useMemo(() =>
    displayCents < -inTuneThreshold ? '♭' : displayCents > inTuneThreshold ? '♯' : '',
    [displayCents, inTuneThreshold]
  );

  // Determine if in-tune (within the threshold)
  const inTune = Math.abs(displayCents) <= inTuneThreshold;

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
            Math.abs(displayCents) <= inTuneThreshold ? 'text-green-600 dark:text-green-400' :
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
// Only re-render if note, cents, clarity, threshold, or smoothing actually change
export const PitchGauge = React.memo(PitchGaugeComponent, (prevProps, nextProps) => {
  // Custom comparison - only re-render if values change significantly
  return (
    prevProps.note === nextProps.note &&
    Math.abs(prevProps.cents - nextProps.cents) < 0.5 && // Ignore tiny changes
    prevProps.clarity === nextProps.clarity &&
    prevProps.className === nextProps.className &&
    prevProps.inTuneThreshold === nextProps.inTuneThreshold &&
    prevProps.smoothingFactor === nextProps.smoothingFactor
  );
});

export default PitchGauge;
