/**
 * Arpeggio Registry
 *
 * Defines all arpeggio types with their semitone structures, interval names,
 * and chord type references. Each arpeggio maps to a chord type from chord-types.ts.
 */

/** Arpeggio family classification */
export type ArpeggioFamily = 'triadic' | 'seventh' | 'extended' | 'sixth' | 'altered';

/** Definition of a single arpeggio type */
export interface ArpeggioDefinition {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** References chord-types.ts ID */
  chordTypeId: string;
  /** Semitone intervals ascending from root (through octave where applicable) */
  semitones: number[];
  /** Interval names corresponding to each semitone */
  intervals: string[];
  /** Arpeggio family classification */
  family: ArpeggioFamily;
  /** Descriptive tags for filtering/search */
  tags: string[];
}

// ---------------------------------------------------------------------------
// Triadic Arpeggios (6)
// ---------------------------------------------------------------------------

const triadicArpeggios: ArpeggioDefinition[] = [
  {
    id: 'major',
    name: 'Major',
    chordTypeId: 'major',
    semitones: [0, 4, 7, 12],
    intervals: ['R', 'M3', 'P5', 'R(8va)'],
    family: 'triadic',
    tags: ['basic', 'major', 'triad'],
  },
  {
    id: 'minor',
    name: 'Minor',
    chordTypeId: 'minor',
    semitones: [0, 3, 7, 12],
    intervals: ['R', 'm3', 'P5', 'R(8va)'],
    family: 'triadic',
    tags: ['basic', 'minor', 'triad'],
  },
  {
    id: 'diminished',
    name: 'Diminished',
    chordTypeId: 'dim',
    semitones: [0, 3, 6, 12],
    intervals: ['R', 'm3', 'dim5', 'R(8va)'],
    family: 'triadic',
    tags: ['diminished', 'triad'],
  },
  {
    id: 'augmented',
    name: 'Augmented',
    chordTypeId: 'aug',
    semitones: [0, 4, 8, 12],
    intervals: ['R', 'M3', 'aug5', 'R(8va)'],
    family: 'triadic',
    tags: ['augmented', 'triad'],
  },
  {
    id: 'sus4',
    name: 'Suspended 4th',
    chordTypeId: 'sus4',
    semitones: [0, 5, 7, 12],
    intervals: ['R', 'P4', 'P5', 'R(8va)'],
    family: 'triadic',
    tags: ['suspended', 'triad'],
  },
  {
    id: 'sus2',
    name: 'Suspended 2nd',
    chordTypeId: 'sus2',
    semitones: [0, 2, 7, 12],
    intervals: ['R', 'M2', 'P5', 'R(8va)'],
    family: 'triadic',
    tags: ['suspended', 'triad'],
  },
];

// ---------------------------------------------------------------------------
// Seventh Arpeggios (8)
// ---------------------------------------------------------------------------

const seventhArpeggios: ArpeggioDefinition[] = [
  {
    id: 'maj7',
    name: 'Major 7th',
    chordTypeId: 'maj7',
    semitones: [0, 4, 7, 11, 12],
    intervals: ['R', 'M3', 'P5', 'M7', 'R(8va)'],
    family: 'seventh',
    tags: ['major', 'seventh'],
  },
  {
    id: 'dom7',
    name: 'Dominant 7th',
    chordTypeId: '7',
    semitones: [0, 4, 7, 10, 12],
    intervals: ['R', 'M3', 'P5', 'm7', 'R(8va)'],
    family: 'seventh',
    tags: ['dominant', 'seventh'],
  },
  {
    id: 'min7',
    name: 'Minor 7th',
    chordTypeId: 'm7',
    semitones: [0, 3, 7, 10, 12],
    intervals: ['R', 'm3', 'P5', 'm7', 'R(8va)'],
    family: 'seventh',
    tags: ['minor', 'seventh'],
  },
  {
    id: 'minMaj7',
    name: 'Minor Major 7th',
    chordTypeId: 'm-maj7',
    semitones: [0, 3, 7, 11, 12],
    intervals: ['R', 'm3', 'P5', 'M7', 'R(8va)'],
    family: 'seventh',
    tags: ['minor', 'major', 'seventh'],
  },
  {
    id: 'dim7',
    name: 'Diminished 7th',
    chordTypeId: 'dim7',
    semitones: [0, 3, 6, 9, 12],
    intervals: ['R', 'm3', 'dim5', 'dim7', 'R(8va)'],
    family: 'seventh',
    tags: ['diminished', 'seventh'],
  },
  {
    id: 'halfDim7',
    name: 'Half-Diminished 7th',
    chordTypeId: 'm7b5',
    semitones: [0, 3, 6, 10, 12],
    intervals: ['R', 'm3', 'dim5', 'm7', 'R(8va)'],
    family: 'seventh',
    tags: ['diminished', 'half-diminished', 'seventh'],
  },
  {
    id: 'aug7',
    name: 'Augmented 7th',
    chordTypeId: 'aug7',
    semitones: [0, 4, 8, 10, 12],
    intervals: ['R', 'M3', 'aug5', 'm7', 'R(8va)'],
    family: 'seventh',
    tags: ['augmented', 'dominant', 'seventh'],
  },
  {
    id: 'augMaj7',
    name: 'Augmented Major 7th',
    chordTypeId: 'aug-maj7',
    semitones: [0, 4, 8, 11, 12],
    intervals: ['R', 'M3', 'aug5', 'M7', 'R(8va)'],
    family: 'seventh',
    tags: ['augmented', 'major', 'seventh'],
  },
];

// ---------------------------------------------------------------------------
// Extended Arpeggios (9)
// ---------------------------------------------------------------------------

const extendedArpeggios: ArpeggioDefinition[] = [
  {
    id: 'maj9',
    name: 'Major 9th',
    chordTypeId: 'maj9',
    semitones: [0, 4, 7, 11, 14],
    intervals: ['R', 'M3', 'P5', 'M7', 'M9'],
    family: 'extended',
    tags: ['major', 'ninth', 'extended'],
  },
  {
    id: 'dom9',
    name: 'Dominant 9th',
    chordTypeId: '9',
    semitones: [0, 4, 7, 10, 14],
    intervals: ['R', 'M3', 'P5', 'm7', 'M9'],
    family: 'extended',
    tags: ['dominant', 'ninth', 'extended'],
  },
  {
    id: 'min9',
    name: 'Minor 9th',
    chordTypeId: 'm9',
    semitones: [0, 3, 7, 10, 14],
    intervals: ['R', 'm3', 'P5', 'm7', 'M9'],
    family: 'extended',
    tags: ['minor', 'ninth', 'extended'],
  },
  {
    id: 'maj11',
    name: 'Major 11th',
    chordTypeId: 'maj11',
    semitones: [0, 4, 7, 11, 14, 17],
    intervals: ['R', 'M3', 'P5', 'M7', 'M9', 'P11'],
    family: 'extended',
    tags: ['major', 'eleventh', 'extended'],
  },
  {
    id: 'dom11',
    name: 'Dominant 11th',
    chordTypeId: '11',
    semitones: [0, 4, 7, 10, 14, 17],
    intervals: ['R', 'M3', 'P5', 'm7', 'M9', 'P11'],
    family: 'extended',
    tags: ['dominant', 'eleventh', 'extended'],
  },
  {
    id: 'min11',
    name: 'Minor 11th',
    chordTypeId: 'm11',
    semitones: [0, 3, 7, 10, 14, 17],
    intervals: ['R', 'm3', 'P5', 'm7', 'M9', 'P11'],
    family: 'extended',
    tags: ['minor', 'eleventh', 'extended'],
  },
  {
    id: 'maj13',
    name: 'Major 13th',
    chordTypeId: 'maj13',
    semitones: [0, 4, 7, 11, 14, 21],
    intervals: ['R', 'M3', 'P5', 'M7', 'M9', 'M13'],
    family: 'extended',
    tags: ['major', 'thirteenth', 'extended'],
  },
  {
    id: 'dom13',
    name: 'Dominant 13th',
    chordTypeId: '13',
    semitones: [0, 4, 7, 10, 14, 21],
    intervals: ['R', 'M3', 'P5', 'm7', 'M9', 'M13'],
    family: 'extended',
    tags: ['dominant', 'thirteenth', 'extended'],
  },
  {
    id: 'min13',
    name: 'Minor 13th',
    chordTypeId: 'm13',
    semitones: [0, 3, 7, 10, 14, 17, 21],
    intervals: ['R', 'm3', 'P5', 'm7', 'M9', 'P11', 'M13'],
    family: 'extended',
    tags: ['minor', 'thirteenth', 'extended'],
  },
];

// ---------------------------------------------------------------------------
// Sixth Arpeggios (2)
// ---------------------------------------------------------------------------

const sixthArpeggios: ArpeggioDefinition[] = [
  {
    id: 'maj6',
    name: 'Major 6th',
    chordTypeId: '6',
    semitones: [0, 4, 7, 9],
    intervals: ['R', 'M3', 'P5', 'M6'],
    family: 'sixth',
    tags: ['major', 'sixth'],
  },
  {
    id: 'min6',
    name: 'Minor 6th',
    chordTypeId: 'm6',
    semitones: [0, 3, 7, 9],
    intervals: ['R', 'm3', 'P5', 'M6'],
    family: 'sixth',
    tags: ['minor', 'sixth'],
  },
];

// ---------------------------------------------------------------------------
// Altered Arpeggios (6)
// ---------------------------------------------------------------------------

const alteredArpeggios: ArpeggioDefinition[] = [
  {
    id: 'dom7b5',
    name: 'Dominant 7th ♭5',
    chordTypeId: '7b5',
    semitones: [0, 4, 6, 10],
    intervals: ['R', 'M3', 'dim5', 'm7'],
    family: 'altered',
    tags: ['dominant', 'altered', 'flat-five'],
  },
  {
    id: 'dom7sharp5',
    name: 'Dominant 7th ♯5',
    chordTypeId: '7sharp5',
    semitones: [0, 4, 8, 10],
    intervals: ['R', 'M3', 'aug5', 'm7'],
    family: 'altered',
    tags: ['dominant', 'altered', 'sharp-five', 'augmented'],
  },
  {
    id: 'dom7b9',
    name: 'Dominant 7th ♭9',
    chordTypeId: '7b9',
    semitones: [0, 4, 7, 10, 13],
    intervals: ['R', 'M3', 'P5', 'm7', 'm9'],
    family: 'altered',
    tags: ['dominant', 'altered', 'flat-nine'],
  },
  {
    id: 'dom7sharp9',
    name: 'Dominant 7th ♯9',
    chordTypeId: '7sharp9',
    semitones: [0, 4, 7, 10, 15],
    intervals: ['R', 'M3', 'P5', 'm7', 'aug9'],
    family: 'altered',
    tags: ['dominant', 'altered', 'sharp-nine', 'hendrix'],
  },
  {
    id: 'dom7sharp11',
    name: 'Dominant 7th ♯11',
    chordTypeId: '7sharp11',
    semitones: [0, 4, 7, 10, 18],
    intervals: ['R', 'M3', 'P5', 'm7', 'aug11'],
    family: 'altered',
    tags: ['dominant', 'altered', 'sharp-eleven', 'lydian-dominant'],
  },
  {
    id: 'dom7b13',
    name: 'Dominant 7th ♭13',
    chordTypeId: '7b13',
    semitones: [0, 4, 7, 10, 20],
    intervals: ['R', 'M3', 'P5', 'm7', 'm13'],
    family: 'altered',
    tags: ['dominant', 'altered', 'flat-thirteen'],
  },
];

// ---------------------------------------------------------------------------
// Combined registry
// ---------------------------------------------------------------------------

/** All arpeggio definitions (31 total) */
const ARPEGGIO_REGISTRY: readonly ArpeggioDefinition[] = [
  ...triadicArpeggios,
  ...seventhArpeggios,
  ...extendedArpeggios,
  ...sixthArpeggios,
  ...alteredArpeggios,
];

/** Lookup map by arpeggio ID */
const arpeggioById = new Map<string, ArpeggioDefinition>(
  ARPEGGIO_REGISTRY.map((a) => [a.id, a]),
);

/** Lookup map by chord type ID */
const arpeggioByChordTypeId = new Map<string, ArpeggioDefinition>(
  ARPEGGIO_REGISTRY.map((a) => [a.chordTypeId, a]),
);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Look up an arpeggio definition by its unique ID.
 * @param id - Arpeggio identifier (e.g. 'maj7', 'dom9')
 * @returns The matching definition, or undefined if not found
 */
export function getArpeggio(id: string): ArpeggioDefinition | undefined {
  return arpeggioById.get(id);
}

/**
 * Get all arpeggios belonging to a specific family.
 * @param family - The arpeggio family to filter by
 * @returns Array of matching arpeggio definitions
 */
export function getArpeggiosByFamily(family: ArpeggioFamily): ArpeggioDefinition[] {
  return ARPEGGIO_REGISTRY.filter((a) => a.family === family);
}

/**
 * Find the arpeggio that corresponds to a given chord type ID from chord-types.ts.
 * @param chordTypeId - The chord type identifier (e.g. 'maj7', '7', 'm7')
 * @returns The matching arpeggio definition, or undefined if not found
 */
export function getArpeggioForChord(chordTypeId: string): ArpeggioDefinition | undefined {
  return arpeggioByChordTypeId.get(chordTypeId);
}

export { ARPEGGIO_REGISTRY };
