/**
 * Curated cross-instrument list of featured tunings for landing pages and the
 * embedded practice-app tuner. Order matters: most common first.
 */

import { findTuningById, type InstrumentCategory, type Tuning } from './tunings';
import { getInstrumentForTuning } from './navigation';

export const FEATURED_TUNING_IDS: string[] = [
  'guitar-standard',
  'guitar-drop-d',
  'guitar-half-step-down',
  'guitar-dadgad',
  'guitar-open-g',
  'guitar-open-d',
  'bass4-standard',
  'uke-standard',
  'violin-standard',
  'mandolin-standard',
  'banjo5-open-g',
  'cello-standard',
  'guitar7-standard',
  'guitar-just-open-d',
];

export interface FeaturedTuning {
  tuning: Tuning;
  instrument: InstrumentCategory;
}

/** Resolve the featured IDs against the catalog, skipping any that vanish. */
export function getFeaturedTunings(): FeaturedTuning[] {
  const featured: FeaturedTuning[] = [];
  for (const id of FEATURED_TUNING_IDS) {
    const tuning = findTuningById(id);
    const instrument = getInstrumentForTuning(id);
    if (tuning && instrument) {
      featured.push({ tuning, instrument });
    }
  }
  return featured;
}
