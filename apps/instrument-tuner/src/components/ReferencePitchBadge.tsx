/**
 * Badge shown whenever the reference pitch deviates from concert standard.
 */

import { STANDARD_A4 } from '@hudak/tuning-data';

export function ReferencePitchBadge({ hz, className = '' }: { hz: number; className?: string }) {
  if (hz === STANDARD_A4) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary ${className}`}
      title={`Reference pitch: every frequency is scaled by exactly ${hz}/440`}
    >
      A4 = {hz} Hz
    </span>
  );
}
