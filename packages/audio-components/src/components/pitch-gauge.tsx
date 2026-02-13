/**
 * PitchGauge Component
 * Real-time pitch visualization with tuning feedback
 * Shows note name, cents deviation, and color-coded accuracy gauge
 * Uses a custom SVG gauge (no external dependencies)
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';

// Define props interface for TypeScript
export interface PitchGaugeProps {
  note: string; // e.g., "A4"
  cents: number; // -50 to +50, e.g., 12 for +12¢ sharp
  className?: string; // Optional Tailwind classes for the container
  clarity?: number; // Optional clarity indicator (0-1)
  inTuneThreshold?: number; // Cents threshold for "in tune" (default: 5)
  smoothingFactor?: number; // 0-1, higher = smoother but slower response (default: 0.7)
  subdueNote?: boolean; // When true, reduces note label prominence (for when string cards show the note)
}

// Helper to map cents to percentage (0 to 1) for the gauge
const mapCentsToPercent = (cents: number): number => {
  const clampedCents = Math.max(-50, Math.min(50, cents));
  return (clampedCents + 50) / 100; // -50 -> 0, 0 -> 0.5, +50 -> 1
};

// Exponential moving average for smooth value transitions
const smoothValue = (current: number, target: number, alpha: number = 0.3): number => {
  return current + (target - current) * alpha;
};

// Color zones
const FLAT_COLOR = '#ef4444';    // Tailwind red-500
const INTUNE_COLOR = '#10b981';  // Tailwind green-500
const SHARP_COLOR = '#f59e0b';   // Tailwind amber-500

// SVG arc helper: compute point on circle
const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
};

// Build a thick arc band as a filled path (no stroke overlap issues)
const describeArcBand = (cx: number, cy: number, rOuter: number, rInner: number, startAngle: number, endAngle: number) => {
  const outerStart = polarToCartesian(cx, cy, rOuter, startAngle);
  const outerEnd = polarToCartesian(cx, cy, rOuter, endAngle);
  const innerStart = polarToCartesian(cx, cy, rInner, endAngle);
  const innerEnd = polarToCartesian(cx, cy, rInner, startAngle);
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 1 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ');
};

// Gauge SVG component
const GaugeSVG = React.memo(({ percent }: { percent: number }) => {
  const cx = 100, cy = 100, rOuter = 85, rInner = 68;
  // Arc spans 180° (left) to 0° (right)
  // Three zones with 1° gaps between them for clean separation
  const flatBand = describeArcBand(cx, cy, rOuter, rInner, 121, 179);
  const inTuneBand = describeArcBand(cx, cy, rOuter, rInner, 61, 119);
  const sharpBand = describeArcBand(cx, cy, rOuter, rInner, 1, 59);
  // Background track
  const trackBand = describeArcBand(cx, cy, rOuter + 1, rInner - 1, 0, 180);

  // Needle: percent 0→180°, 1→0°
  const needleAngle = 180 - percent * 180;
  const needleLen = rInner - 4;
  const needleTip = polarToCartesian(cx, cy, needleLen, needleAngle);
  const needleBase1 = polarToCartesian(cx, cy, 5, needleAngle + 90);
  const needleBase2 = polarToCartesian(cx, cy, 5, needleAngle - 90);

  return (
    <svg viewBox="0 0 200 115" className="w-full h-full">
      {/* Background track */}
      <path d={trackBand} fill="#e5e7eb" opacity={0.3} />

      {/* Color zones as filled bands */}
      <path d={flatBand} fill={FLAT_COLOR} opacity={0.75} />
      <path d={inTuneBand} fill={INTUNE_COLOR} opacity={0.75} />
      <path d={sharpBand} fill={SHARP_COLOR} opacity={0.75} />

      {/* Center tick mark (90°) — prominent */}
      {(() => {
        const inner = polarToCartesian(cx, cy, rInner - 5, 90);
        const outer = polarToCartesian(cx, cy, rOuter + 5, 90);
        return <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
          stroke="#4b5563" strokeWidth={2.5} />;
      })()}

      {/* Minor tick marks at ±25 cents (45° and 135°) */}
      {[45, 135].map((angle) => {
        const inner = polarToCartesian(cx, cy, rInner - 3, angle);
        const outer = polarToCartesian(cx, cy, rOuter + 3, angle);
        return (
          <line key={angle} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
            stroke="#6b7280" strokeWidth={1.5} />
        );
      })}

      {/* Flat / Sharp labels */}
      <text x="22" y={cy + 14} fontSize="10" fill="#4b5563" fontWeight="500" textAnchor="middle">♭</text>
      <text x="178" y={cy + 14} fontSize="10" fill="#4b5563" fontWeight="500" textAnchor="middle">♯</text>

      {/* Needle */}
      <polygon
        points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
        fill="#374151"
      />
      <circle cx={cx} cy={cy} r={6} fill="#374151" />
      <circle cx={cx} cy={cy} r={3} fill="#6b7280" />
    </svg>
  );
});

const PitchGaugeComponent: React.FC<PitchGaugeProps> = ({
  note,
  cents,
  className = '',
  clarity,
  inTuneThreshold = 5,
  smoothingFactor = 0.7,
  subdueNote = false
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
        const baseAlpha = 0.05 + (1 - smoothingFactor) * 0.75;
        const diff = Math.abs(cents - prevSmoothed);
        const adaptiveFactor = diff > 10 ? 1.5 : diff > 5 ? 1.0 : 0.6;
        const alpha = Math.min(1, baseAlpha * adaptiveFactor);
        const newValue = smoothValue(prevSmoothed, cents, alpha);

        if (Math.abs(newValue - cents) < 0.5) {
          return cents;
        }
        return newValue;
      });

      if (isAnimating) {
        animationFrameRef.current = requestAnimationFrame(updateSmoothedValue);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateSmoothedValue);

    return () => {
      isAnimating = false;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cents, smoothingFactor]);

  // Memoize computed values
  const percent = useMemo(() => mapCentsToPercent(smoothedCents), [smoothedCents]);
  const displayCents = useMemo(() => Math.round(smoothedCents), [smoothedCents]);
  const direction = useMemo(() =>
    displayCents < -inTuneThreshold ? '♭' : displayCents > inTuneThreshold ? '♯' : '',
    [displayCents, inTuneThreshold]
  );

  const inTune = Math.abs(displayCents) <= inTuneThreshold;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Note name — above the gauge */}
      <span className={`font-bold drop-shadow-md transition-all duration-200 mb-1 ${
        subdueNote ? 'text-2xl opacity-60' : 'text-4xl'
      } ${
        inTune ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'
      }`}>
        {note}
      </span>

      {/* Gauge */}
      <div className="w-56">
        <GaugeSVG percent={percent} />
      </div>

      {/* Cents + status below gauge */}
      <div className="text-center mt-1">
        <span className={`text-2xl font-mono font-semibold transition-colors duration-200 ${
          Math.abs(displayCents) <= inTuneThreshold ? 'text-green-600 dark:text-green-400' :
          displayCents < 0 ? 'text-red-500 dark:text-red-400' :
          'text-amber-500 dark:text-amber-400'
        }`}>
          {direction && <span className="mr-1">{direction}</span>}
          {Math.abs(displayCents)}¢
        </span>
        <div className="text-sm text-muted-foreground mt-0.5">
          {inTune ? 'In tune! ✓' : displayCents < 0 ? 'Too flat' : 'Too sharp'}
        </div>
        {clarity !== undefined && (
          <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-0.5">
            clarity: {Math.round(clarity * 100)}%
          </div>
        )}
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export const PitchGauge = React.memo(PitchGaugeComponent, (prevProps, nextProps) => {
  return (
    prevProps.note === nextProps.note &&
    Math.abs(prevProps.cents - nextProps.cents) < 0.5 &&
    prevProps.clarity === nextProps.clarity &&
    prevProps.className === nextProps.className &&
    prevProps.inTuneThreshold === nextProps.inTuneThreshold &&
    prevProps.smoothingFactor === nextProps.smoothingFactor &&
    prevProps.subdueNote === nextProps.subdueNote
  );
});

export default PitchGauge;
