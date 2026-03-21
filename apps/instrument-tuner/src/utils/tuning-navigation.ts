import { INSTRUMENT_CATEGORIES, type InstrumentCategory, type Tuning } from '../data/tunings';

export interface TuningSection {
  id: string;
  name: string;
  tunings: Tuning[];
}

const SECTION_KEYWORDS: Array<{ id: string; name: string; test: (name: string) => boolean }> = [
  { id: 'standard', name: 'Standard', test: (name) => name.includes('standard') },
  { id: 'drop', name: 'Drop', test: (name) => name.includes('drop') },
  { id: 'open', name: 'Open', test: (name) => name.includes('open') },
  { id: 'down-tuned', name: 'Down Tuned', test: (name) => name.includes('half step down') || name.includes('full step down') || name.includes('step down') },
  { id: 'alternate', name: 'Alternate', test: (name) => name.includes('dadgad') || name.includes('double drop') || name.includes('saw mill') || name.includes('cross') || name.includes('calico') },
  { id: 'artist-style', name: 'Artist / Style', test: (name) => name.includes('nick drake') || name.includes('nashville') || name.includes('cajun') || name.includes('irish') || name.includes('jazz') },
  { id: 'extended-range', name: 'Extended Range', test: (name) => name.includes('baritone') || name.includes('octave') || name.includes('5-string') || name.includes('6-string') || name.includes('7-string') || name.includes('8-string') },
];

function getSectionMeta(tuning: Tuning): { id: string; name: string } {
  const name = tuning.name.toLowerCase();
  for (const section of SECTION_KEYWORDS) {
    if (section.test(name)) {
      return { id: section.id, name: section.name };
    }
  }
  return { id: 'other', name: 'Other' };
}

export function getInstrumentById(instrumentId: string): InstrumentCategory | null {
  return INSTRUMENT_CATEGORIES.find((instrument) => instrument.id === instrumentId) || null;
}

export function getInstrumentForTuning(tuningId: string): InstrumentCategory | null {
  return INSTRUMENT_CATEGORIES.find((instrument) => instrument.tunings.some((tuning) => tuning.id === tuningId)) || null;
}

export function getSectionsForInstrument(instrumentId: string): TuningSection[] {
  const instrument = getInstrumentById(instrumentId);
  if (!instrument) return [];

  const sectionMap = new Map<string, TuningSection>();

  for (const tuning of instrument.tunings) {
    const section = getSectionMeta(tuning);
    const existing = sectionMap.get(section.id);

    if (existing) {
      existing.tunings.push(tuning);
    } else {
      sectionMap.set(section.id, {
        id: section.id,
        name: section.name,
        tunings: [tuning],
      });
    }
  }

  return [...sectionMap.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function getSectionForTuning(instrumentId: string, tuningId: string): TuningSection | null {
  const sections = getSectionsForInstrument(instrumentId);
  return sections.find((section) => section.tunings.some((tuning) => tuning.id === tuningId)) || null;
}

export function getSectionById(instrumentId: string, sectionId: string): TuningSection | null {
  const sections = getSectionsForInstrument(instrumentId);
  return sections.find((section) => section.id === sectionId) || null;
}
