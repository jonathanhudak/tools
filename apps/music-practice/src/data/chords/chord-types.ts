/**
 * Chord Type Definitions
 *
 * Comprehensive catalogue of chord types with semitone formulas, interval names,
 * family/category classification, common symbols, and metadata tags.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type ChordFamily =
  | 'major'
  | 'minor'
  | 'dominant'
  | 'diminished'
  | 'augmented'
  | 'suspended'
  | 'altered'
  | 'quartal'
  | 'power';

export type ChordCategory =
  | 'triad'
  | 'seventh'
  | 'sixth'
  | 'ninth'
  | 'eleventh'
  | 'thirteenth'
  | 'altered'
  | 'add'
  | 'sus'
  | 'power'
  | 'quartal';

export interface ChordTypeDefinition {
  /** Unique identifier, e.g. "maj7", "m7b5" */
  id: string;
  /** Human-readable name */
  name: string;
  /** All recognized symbols for this chord (e.g. ["Δ7", "maj7", "M7"]) */
  symbols: string[];
  /** Primary display symbol */
  primarySymbol: string;
  /** Semitone offsets from root */
  semitones: number[];
  /** Interval short names corresponding to each semitone */
  intervals: string[];
  /** Chord family */
  family: ChordFamily;
  /** Chord category */
  category: ChordCategory;
  /** Chord tones that are commonly omitted in voicings (semitone values) */
  optionalOmissions?: number[];
  /** Short description */
  description: string;
  /** Searchable tags */
  tags: string[];
  /** Associated scale IDs from the scale registry */
  scales?: string[];
}

// ─── Chord Type Definitions ──────────────────────────────────────────────────

export const CHORD_TYPES: ChordTypeDefinition[] = [

  // ── Triads ───────────────────────────────────────────────────────────────

  {
    id: 'major',
    name: 'Major',
    symbols: ['', 'M', 'maj'],
    primarySymbol: '',
    semitones: [0, 4, 7],
    intervals: ['P1', 'M3', 'P5'],
    family: 'major',
    category: 'triad',
    description: 'Major triad — the most fundamental chord in Western music.',
    tags: ['basic', 'triad', 'major'],
  },
  {
    id: 'minor',
    name: 'Minor',
    symbols: ['m', 'min', '-'],
    primarySymbol: 'm',
    semitones: [0, 3, 7],
    intervals: ['P1', 'm3', 'P5'],
    family: 'minor',
    category: 'triad',
    description: 'Minor triad — darker counterpart to the major triad.',
    tags: ['basic', 'triad', 'minor'],
  },
  {
    id: 'dim',
    name: 'Diminished',
    symbols: ['dim', '°'],
    primarySymbol: 'dim',
    semitones: [0, 3, 6],
    intervals: ['P1', 'm3', 'd5'],
    family: 'diminished',
    category: 'triad',
    description: 'Diminished triad — two stacked minor thirds.',
    tags: ['basic', 'triad', 'diminished'],
  },
  {
    id: 'aug',
    name: 'Augmented',
    symbols: ['aug', '+'],
    primarySymbol: 'aug',
    semitones: [0, 4, 8],
    intervals: ['P1', 'M3', 'A5'],
    family: 'augmented',
    category: 'triad',
    description: 'Augmented triad — two stacked major thirds.',
    tags: ['basic', 'triad', 'augmented'],
  },

  // ── Suspended ────────────────────────────────────────────────────────────

  {
    id: 'sus2',
    name: 'Suspended Second',
    symbols: ['sus2'],
    primarySymbol: 'sus2',
    semitones: [0, 2, 7],
    intervals: ['P1', 'M2', 'P5'],
    family: 'suspended',
    category: 'sus',
    description: 'Suspended second — the third is replaced by a major second.',
    tags: ['sus', 'open'],
  },
  {
    id: 'sus4',
    name: 'Suspended Fourth',
    symbols: ['sus4', 'sus'],
    primarySymbol: 'sus4',
    semitones: [0, 5, 7],
    intervals: ['P1', 'P4', 'P5'],
    family: 'suspended',
    category: 'sus',
    description: 'Suspended fourth — the third is replaced by a perfect fourth.',
    tags: ['sus', 'open'],
  },

  // ── Power ────────────────────────────────────────────────────────────────

  {
    id: '5',
    name: 'Power Chord',
    symbols: ['5'],
    primarySymbol: '5',
    semitones: [0, 7],
    intervals: ['P1', 'P5'],
    family: 'power',
    category: 'power',
    description: 'Power chord — root and fifth only, no third.',
    tags: ['power', 'rock', 'open'],
  },

  // ── Seventh Chords ───────────────────────────────────────────────────────

  {
    id: 'maj7',
    name: 'Major Seventh',
    symbols: ['maj7', 'Δ7', 'M7'],
    primarySymbol: 'maj7',
    semitones: [0, 4, 7, 11],
    intervals: ['P1', 'M3', 'P5', 'M7'],
    family: 'major',
    category: 'seventh',
    description: 'Major seventh — warm, jazzy major sound.',
    tags: ['jazz', 'seventh', 'major'],
  },
  {
    id: '7',
    name: 'Dominant Seventh',
    symbols: ['7', 'dom7'],
    primarySymbol: '7',
    semitones: [0, 4, 7, 10],
    intervals: ['P1', 'M3', 'P5', 'm7'],
    family: 'dominant',
    category: 'seventh',
    description: 'Dominant seventh — the classic V7 chord; wants to resolve.',
    tags: ['dominant', 'seventh', 'blues'],
  },
  {
    id: 'm7',
    name: 'Minor Seventh',
    symbols: ['m7', 'min7', '-7'],
    primarySymbol: 'm7',
    semitones: [0, 3, 7, 10],
    intervals: ['P1', 'm3', 'P5', 'm7'],
    family: 'minor',
    category: 'seventh',
    description: 'Minor seventh — smooth, mellow minor sound.',
    tags: ['jazz', 'seventh', 'minor'],
  },
  {
    id: 'mMaj7',
    name: 'Minor-Major Seventh',
    symbols: ['m(maj7)', 'mΔ7', 'mM7', '-Δ7'],
    primarySymbol: 'm(maj7)',
    semitones: [0, 3, 7, 11],
    intervals: ['P1', 'm3', 'P5', 'M7'],
    family: 'minor',
    category: 'seventh',
    description: 'Minor-major seventh — minor triad with a major seventh; dramatic tension.',
    tags: ['jazz', 'seventh', 'minor', 'dark'],
  },
  {
    id: 'dim7',
    name: 'Diminished Seventh',
    symbols: ['dim7', '°7'],
    primarySymbol: 'dim7',
    semitones: [0, 3, 6, 9],
    intervals: ['P1', 'm3', 'd5', 'd7'],
    family: 'diminished',
    category: 'seventh',
    description: 'Diminished seventh — symmetrical chord built from minor thirds.',
    tags: ['diminished', 'seventh', 'symmetrical'],
  },
  {
    id: 'm7b5',
    name: 'Half-Diminished Seventh',
    symbols: ['m7b5', 'ø7', 'ø'],
    primarySymbol: 'm7♭5',
    semitones: [0, 3, 6, 10],
    intervals: ['P1', 'm3', 'd5', 'm7'],
    family: 'diminished',
    category: 'seventh',
    description: 'Half-diminished — diminished triad with a minor seventh; ii chord in minor.',
    tags: ['jazz', 'seventh', 'diminished', 'minor'],
  },
  {
    id: 'aug7',
    name: 'Augmented Seventh',
    symbols: ['aug7', '+7', '7#5'],
    primarySymbol: 'aug7',
    semitones: [0, 4, 8, 10],
    intervals: ['P1', 'M3', 'A5', 'm7'],
    family: 'augmented',
    category: 'seventh',
    description: 'Augmented dominant seventh — augmented triad with a minor seventh.',
    tags: ['augmented', 'seventh', 'dominant'],
  },
  {
    id: 'augMaj7',
    name: 'Augmented Major Seventh',
    symbols: ['augMaj7', '+maj7', '+Δ7', 'maj7#5'],
    primarySymbol: 'aug(maj7)',
    semitones: [0, 4, 8, 11],
    intervals: ['P1', 'M3', 'A5', 'M7'],
    family: 'augmented',
    category: 'seventh',
    description: 'Augmented major seventh — augmented triad with a major seventh.',
    tags: ['augmented', 'seventh', 'major'],
  },
  {
    id: 'dimMaj7',
    name: 'Diminished Major Seventh',
    symbols: ['dimMaj7', '°maj7', '°Δ7'],
    primarySymbol: 'dim(maj7)',
    semitones: [0, 3, 6, 11],
    intervals: ['P1', 'm3', 'd5', 'M7'],
    family: 'diminished',
    category: 'seventh',
    description: 'Diminished major seventh — diminished triad with a major seventh; rare and tense.',
    tags: ['diminished', 'seventh', 'rare'],
  },
  {
    id: '7b5',
    name: 'Dominant Seventh Flat Five',
    symbols: ['7b5', '7♭5'],
    primarySymbol: '7♭5',
    semitones: [0, 4, 6, 10],
    intervals: ['P1', 'M3', 'd5', 'm7'],
    family: 'dominant',
    category: 'seventh',
    description: 'Dominant seventh flat five — tritone-substitution staple.',
    tags: ['dominant', 'seventh', 'altered'],
  },

  // ── Sixth Chords ─────────────────────────────────────────────────────────

  {
    id: '6',
    name: 'Major Sixth',
    symbols: ['6', 'maj6', 'M6'],
    primarySymbol: '6',
    semitones: [0, 4, 7, 9],
    intervals: ['P1', 'M3', 'P5', 'M6'],
    family: 'major',
    category: 'sixth',
    description: 'Major sixth — bright, vintage jazz/pop sound.',
    tags: ['sixth', 'major', 'jazz'],
  },
  {
    id: 'm6',
    name: 'Minor Sixth',
    symbols: ['m6', 'min6', '-6'],
    primarySymbol: 'm6',
    semitones: [0, 3, 7, 9],
    intervals: ['P1', 'm3', 'P5', 'M6'],
    family: 'minor',
    category: 'sixth',
    description: 'Minor sixth — a minor triad with an added major sixth.',
    tags: ['sixth', 'minor', 'jazz'],
  },
  {
    id: '6/9',
    name: 'Six-Nine',
    symbols: ['6/9', '6add9'],
    primarySymbol: '6/9',
    semitones: [0, 4, 7, 9, 14],
    intervals: ['P1', 'M3', 'P5', 'M6', 'M9'],
    family: 'major',
    category: 'sixth',
    description: 'Six-nine — lush major chord combining 6th and 9th.',
    tags: ['sixth', 'major', 'jazz', 'soul'],
  },
  {
    id: 'm6/9',
    name: 'Minor Six-Nine',
    symbols: ['m6/9', 'min6/9', '-6/9'],
    primarySymbol: 'm6/9',
    semitones: [0, 3, 7, 9, 14],
    intervals: ['P1', 'm3', 'P5', 'M6', 'M9'],
    family: 'minor',
    category: 'sixth',
    description: 'Minor six-nine — rich minor chord with 6th and 9th.',
    tags: ['sixth', 'minor', 'jazz'],
  },

  // ── Suspended Sevenths ───────────────────────────────────────────────────

  {
    id: '7sus4',
    name: 'Dominant Seventh Suspended Fourth',
    symbols: ['7sus4', '7sus'],
    primarySymbol: '7sus4',
    semitones: [0, 5, 7, 10],
    intervals: ['P1', 'P4', 'P5', 'm7'],
    family: 'suspended',
    category: 'sus',
    description: 'Dominant seventh sus4 — open dominant sound without a third.',
    tags: ['sus', 'dominant', 'seventh'],
  },
  {
    id: '7sus2',
    name: 'Dominant Seventh Suspended Second',
    symbols: ['7sus2'],
    primarySymbol: '7sus2',
    semitones: [0, 2, 7, 10],
    intervals: ['P1', 'M2', 'P5', 'm7'],
    family: 'suspended',
    category: 'sus',
    description: 'Dominant seventh sus2 — airy dominant colour.',
    tags: ['sus', 'dominant', 'seventh'],
  },
  {
    id: 'maj7sus4',
    name: 'Major Seventh Suspended Fourth',
    symbols: ['maj7sus4', 'Δ7sus4'],
    primarySymbol: 'maj7sus4',
    semitones: [0, 5, 7, 11],
    intervals: ['P1', 'P4', 'P5', 'M7'],
    family: 'suspended',
    category: 'sus',
    description: 'Major seventh sus4 — dreamy, floating quality.',
    tags: ['sus', 'major', 'seventh'],
  },
  {
    id: 'maj7sus2',
    name: 'Major Seventh Suspended Second',
    symbols: ['maj7sus2', 'Δ7sus2'],
    primarySymbol: 'maj7sus2',
    semitones: [0, 2, 7, 11],
    intervals: ['P1', 'M2', 'P5', 'M7'],
    family: 'suspended',
    category: 'sus',
    description: 'Major seventh sus2 — ethereal, modern jazz sound.',
    tags: ['sus', 'major', 'seventh'],
  },

  // ── Ninth Chords ─────────────────────────────────────────────────────────

  {
    id: 'maj9',
    name: 'Major Ninth',
    symbols: ['maj9', 'Δ9', 'M9'],
    primarySymbol: 'maj9',
    semitones: [0, 4, 7, 11, 14],
    intervals: ['P1', 'M3', 'P5', 'M7', 'M9'],
    family: 'major',
    category: 'ninth',
    description: 'Major ninth — lush, sophisticated major sound.',
    tags: ['jazz', 'ninth', 'major'],
  },
  {
    id: '9',
    name: 'Dominant Ninth',
    symbols: ['9', 'dom9'],
    primarySymbol: '9',
    semitones: [0, 4, 7, 10, 14],
    intervals: ['P1', 'M3', 'P5', 'm7', 'M9'],
    family: 'dominant',
    category: 'ninth',
    description: 'Dominant ninth — funky, soulful dominant extension.',
    tags: ['dominant', 'ninth', 'funk', 'soul'],
  },
  {
    id: 'm9',
    name: 'Minor Ninth',
    symbols: ['m9', 'min9', '-9'],
    primarySymbol: 'm9',
    semitones: [0, 3, 7, 10, 14],
    intervals: ['P1', 'm3', 'P5', 'm7', 'M9'],
    family: 'minor',
    category: 'ninth',
    description: 'Minor ninth — smooth, expressive minor extension.',
    tags: ['jazz', 'ninth', 'minor'],
  },
  {
    id: 'mMaj9',
    name: 'Minor-Major Ninth',
    symbols: ['m(maj9)', 'mΔ9', '-Δ9'],
    primarySymbol: 'm(maj9)',
    semitones: [0, 3, 7, 11, 14],
    intervals: ['P1', 'm3', 'P5', 'M7', 'M9'],
    family: 'minor',
    category: 'ninth',
    description: 'Minor-major ninth — dramatic minor with major seventh and ninth.',
    tags: ['jazz', 'ninth', 'minor', 'dark'],
  },
  {
    id: '7b9',
    name: 'Dominant Seventh Flat Nine',
    symbols: ['7b9', '7♭9'],
    primarySymbol: '7♭9',
    semitones: [0, 4, 7, 10, 13],
    intervals: ['P1', 'M3', 'P5', 'm7', 'm9'],
    family: 'dominant',
    category: 'ninth',
    description: 'Dominant 7♭9 — classic altered dominant; strong pull to resolution.',
    tags: ['dominant', 'ninth', 'altered', 'jazz'],
  },
  {
    id: '7#9',
    name: 'Dominant Seventh Sharp Nine',
    symbols: ['7#9', '7♯9'],
    primarySymbol: '7♯9',
    semitones: [0, 4, 7, 10, 15],
    intervals: ['P1', 'M3', 'P5', 'm7', 'A9'],
    family: 'dominant',
    category: 'ninth',
    description: 'Dominant 7♯9 — the "Hendrix chord"; gritty, bluesy bite.',
    tags: ['dominant', 'ninth', 'altered', 'blues', 'hendrix'],
  },
  {
    id: '9#5',
    name: 'Ninth Sharp Five',
    symbols: ['9#5', '9♯5'],
    primarySymbol: '9♯5',
    semitones: [0, 4, 8, 10, 14],
    intervals: ['P1', 'M3', 'A5', 'm7', 'M9'],
    family: 'dominant',
    category: 'ninth',
    description: 'Dominant ninth with augmented fifth.',
    tags: ['dominant', 'ninth', 'augmented'],
  },
  {
    id: '9b5',
    name: 'Ninth Flat Five',
    symbols: ['9b5', '9♭5'],
    primarySymbol: '9♭5',
    semitones: [0, 4, 6, 10, 14],
    intervals: ['P1', 'M3', 'd5', 'm7', 'M9'],
    family: 'dominant',
    category: 'ninth',
    description: 'Dominant ninth with diminished fifth.',
    tags: ['dominant', 'ninth', 'altered'],
  },
  {
    id: '9sus4',
    name: 'Ninth Suspended Fourth',
    symbols: ['9sus4', '9sus'],
    primarySymbol: '9sus4',
    semitones: [0, 5, 7, 10, 14],
    intervals: ['P1', 'P4', 'P5', 'm7', 'M9'],
    family: 'suspended',
    category: 'ninth',
    description: 'Dominant ninth sus4 — open, modern gospel/R&B voicing.',
    tags: ['sus', 'ninth', 'dominant'],
  },

  // ── Eleventh Chords ──────────────────────────────────────────────────────

  {
    id: 'maj7#11',
    name: 'Major Seventh Sharp Eleven',
    symbols: ['maj7#11', 'Δ7♯11', 'maj7♯11'],
    primarySymbol: 'maj7♯11',
    semitones: [0, 4, 7, 11, 14, 18],
    intervals: ['P1', 'M3', 'P5', 'M7', 'M9', 'A11'],
    family: 'major',
    category: 'eleventh',
    description: 'Lydian chord — major seventh with ♯11 for a bright, floating quality.',
    tags: ['jazz', 'eleventh', 'major', 'lydian'],
  },
  {
    id: '11',
    name: 'Dominant Eleventh',
    symbols: ['11', 'dom11'],
    primarySymbol: '11',
    semitones: [0, 4, 7, 10, 14, 17],
    intervals: ['P1', 'M3', 'P5', 'm7', 'M9', 'P11'],
    family: 'dominant',
    category: 'eleventh',
    description: 'Dominant eleventh — full stack dominant with natural 11.',
    tags: ['dominant', 'eleventh'],
  },
  {
    id: 'm11',
    name: 'Minor Eleventh',
    symbols: ['m11', 'min11', '-11'],
    primarySymbol: 'm11',
    semitones: [0, 3, 7, 10, 14, 17],
    intervals: ['P1', 'm3', 'P5', 'm7', 'M9', 'P11'],
    family: 'minor',
    category: 'eleventh',
    description: 'Minor eleventh — rich minor extension heard in modal jazz.',
    tags: ['jazz', 'eleventh', 'minor'],
  },
  {
    id: 'mMaj11',
    name: 'Minor-Major Eleventh',
    symbols: ['m(maj11)', 'mΔ11', '-Δ11'],
    primarySymbol: 'm(maj11)',
    semitones: [0, 3, 7, 11, 14, 17],
    intervals: ['P1', 'm3', 'P5', 'M7', 'M9', 'P11'],
    family: 'minor',
    category: 'eleventh',
    description: 'Minor-major eleventh — rare, highly colourful minor chord.',
    tags: ['jazz', 'eleventh', 'minor', 'dark'],
  },
  {
    id: '7#11',
    name: 'Dominant Seventh Sharp Eleven',
    symbols: ['7#11', '7♯11'],
    primarySymbol: '7♯11',
    semitones: [0, 4, 7, 10, 14, 18],
    intervals: ['P1', 'M3', 'P5', 'm7', 'M9', 'A11'],
    family: 'dominant',
    category: 'eleventh',
    description: 'Dominant 7♯11 — Lydian dominant colour.',
    tags: ['dominant', 'eleventh', 'altered', 'lydian'],
  },

  // ── Thirteenth Chords ────────────────────────────────────────────────────

  {
    id: 'maj13',
    name: 'Major Thirteenth',
    symbols: ['maj13', 'Δ13', 'M13'],
    primarySymbol: 'maj13',
    semitones: [0, 4, 7, 11, 14, 21],
    intervals: ['P1', 'M3', 'P5', 'M7', 'M9', 'M13'],
    family: 'major',
    category: 'thirteenth',
    optionalOmissions: [17],
    description: 'Major thirteenth — full major extension (11th typically omitted).',
    tags: ['jazz', 'thirteenth', 'major'],
  },
  {
    id: '13',
    name: 'Dominant Thirteenth',
    symbols: ['13', 'dom13'],
    primarySymbol: '13',
    semitones: [0, 4, 7, 10, 14, 21],
    intervals: ['P1', 'M3', 'P5', 'm7', 'M9', 'M13'],
    family: 'dominant',
    category: 'thirteenth',
    optionalOmissions: [17],
    description: 'Dominant thirteenth — full dominant stack (11th typically omitted).',
    tags: ['dominant', 'thirteenth', 'jazz', 'funk'],
  },
  {
    id: 'm13',
    name: 'Minor Thirteenth',
    symbols: ['m13', 'min13', '-13'],
    primarySymbol: 'm13',
    semitones: [0, 3, 7, 10, 14, 17, 21],
    intervals: ['P1', 'm3', 'P5', 'm7', 'M9', 'P11', 'M13'],
    family: 'minor',
    category: 'thirteenth',
    description: 'Minor thirteenth — lush, full minor stack with natural 11.',
    tags: ['jazz', 'thirteenth', 'minor'],
  },
  {
    id: '13b9',
    name: 'Dominant Thirteenth Flat Nine',
    symbols: ['13b9', '13♭9'],
    primarySymbol: '13♭9',
    semitones: [0, 4, 7, 10, 13, 21],
    intervals: ['P1', 'M3', 'P5', 'm7', 'm9', 'M13'],
    family: 'dominant',
    category: 'thirteenth',
    description: 'Dominant 13♭9 — altered dominant with natural 13.',
    tags: ['dominant', 'thirteenth', 'altered'],
  },
  {
    id: '13#11',
    name: 'Dominant Thirteenth Sharp Eleven',
    symbols: ['13#11', '13♯11'],
    primarySymbol: '13♯11',
    semitones: [0, 4, 7, 10, 14, 18, 21],
    intervals: ['P1', 'M3', 'P5', 'm7', 'M9', 'A11', 'M13'],
    family: 'dominant',
    category: 'thirteenth',
    description: 'Dominant 13♯11 — Lydian dominant with 13th.',
    tags: ['dominant', 'thirteenth', 'lydian'],
  },
  {
    id: '7b13',
    name: 'Dominant Seventh Flat Thirteen',
    symbols: ['7b13', '7♭13'],
    primarySymbol: '7♭13',
    semitones: [0, 4, 7, 10, 20],
    intervals: ['P1', 'M3', 'P5', 'm7', 'm13'],
    family: 'dominant',
    category: 'thirteenth',
    description: 'Dominant 7♭13 — dark dominant with a lowered thirteenth.',
    tags: ['dominant', 'thirteenth', 'altered'],
  },
  {
    id: '13sus4',
    name: 'Thirteenth Suspended Fourth',
    symbols: ['C13sus4'],
    primarySymbol: 'C13sus4',
    semitones: [0, 5, 7, 10, 14, 21],
    intervals: ['P1', 'P4', 'P5', 'm7', 'M9', 'M13'],
    family: 'suspended',
    category: 'thirteenth',
    description: 'Dominant sus4 with 13th extension',
    tags: ['jazz', 'sus', 'thirteenth'],
  },

  // ── Altered Dominants ────────────────────────────────────────────────────

  {
    id: '7alt',
    name: 'Altered Dominant',
    symbols: ['7alt', 'alt'],
    primarySymbol: '7alt',
    semitones: [0, 4, 10, 13, 15, 18, 20],
    intervals: ['P1', 'M3', 'm7', 'm9', 'A9', 'A11', 'm13'],
    family: 'altered',
    category: 'altered',
    description: 'Fully altered dominant — every extension is altered (♭9 ♯9 ♯11 ♭13). Fifth omitted.',
    tags: ['altered', 'dominant', 'jazz'],
  },
  {
    id: '7b9b5',
    name: 'Dominant Seven Flat Nine Flat Five',
    symbols: ['7b9b5', '7♭9♭5'],
    primarySymbol: '7♭9♭5',
    semitones: [0, 4, 6, 10, 13],
    intervals: ['P1', 'M3', 'd5', 'm7', 'm9'],
    family: 'altered',
    category: 'altered',
    description: 'Dominant 7♭9♭5 — double-altered dominant.',
    tags: ['altered', 'dominant'],
  },
  {
    id: '7#9#5',
    name: 'Dominant Seven Sharp Nine Sharp Five',
    symbols: ['7#9#5', '7♯9♯5'],
    primarySymbol: '7♯9♯5',
    semitones: [0, 4, 8, 10, 15],
    intervals: ['P1', 'M3', 'A5', 'm7', 'A9'],
    family: 'altered',
    category: 'altered',
    description: 'Dominant 7♯9♯5 — intense altered dominant.',
    tags: ['altered', 'dominant'],
  },
  {
    id: '7b9#5',
    name: 'Dominant Seven Flat Nine Sharp Five',
    symbols: ['7b9#5', '7♭9♯5'],
    primarySymbol: '7♭9♯5',
    semitones: [0, 4, 8, 10, 13],
    intervals: ['P1', 'M3', 'A5', 'm7', 'm9'],
    family: 'altered',
    category: 'altered',
    description: 'Dominant 7♭9♯5 — mixed altered dominant.',
    tags: ['altered', 'dominant'],
  },
  {
    id: '7#9b5',
    name: 'Dominant Seven Sharp Nine Flat Five',
    symbols: ['7#9b5', '7♯9♭5'],
    primarySymbol: '7♯9♭5',
    semitones: [0, 4, 6, 10, 15],
    intervals: ['P1', 'M3', 'd5', 'm7', 'A9'],
    family: 'altered',
    category: 'altered',
    description: 'Dominant 7♯9♭5 — mixed altered dominant.',
    tags: ['altered', 'dominant'],
  },
  {
    id: '7b9#11',
    name: 'Dominant Seven Flat Nine Sharp Eleven',
    symbols: ['7b9#11', '7♭9♯11'],
    primarySymbol: '7♭9♯11',
    semitones: [0, 4, 7, 10, 13, 18],
    intervals: ['P1', 'M3', 'P5', 'm7', 'm9', 'A11'],
    family: 'altered',
    category: 'altered',
    description: 'Dominant 7♭9♯11 — altered with natural fifth.',
    tags: ['altered', 'dominant'],
  },
  {
    id: '7#9#11',
    name: 'Dominant Seven Sharp Nine Sharp Eleven',
    symbols: ['7#9#11', '7♯9♯11'],
    primarySymbol: '7♯9♯11',
    semitones: [0, 4, 7, 10, 15, 18],
    intervals: ['P1', 'M3', 'P5', 'm7', 'A9', 'A11'],
    family: 'altered',
    category: 'altered',
    description: 'Dominant 7♯9♯11 — intense altered colour.',
    tags: ['altered', 'dominant'],
  },
  {
    id: '7b9b13',
    name: 'Dominant Seven Flat Nine Flat Thirteen',
    symbols: ['7b9b13', '7♭9♭13'],
    primarySymbol: '7♭9♭13',
    semitones: [0, 4, 7, 10, 13, 20],
    intervals: ['P1', 'M3', 'P5', 'm7', 'm9', 'm13'],
    family: 'altered',
    category: 'altered',
    description: 'Dominant 7♭9♭13 — dark altered dominant.',
    tags: ['altered', 'dominant'],
  },
  {
    id: '7#9b13',
    name: 'Dominant Seven Sharp Nine Flat Thirteen',
    symbols: ['7#9b13', '7♯9♭13'],
    primarySymbol: '7♯9♭13',
    semitones: [0, 4, 7, 10, 15, 20],
    intervals: ['P1', 'M3', 'P5', 'm7', 'A9', 'm13'],
    family: 'altered',
    category: 'altered',
    description: 'Dominant 7♯9♭13 — raw, aggressive altered dominant.',
    tags: ['altered', 'dominant'],
  },

  // ── Add Chords ───────────────────────────────────────────────────────────

  {
    id: 'add9',
    name: 'Add Nine',
    symbols: ['add9', 'add2'],
    primarySymbol: 'add9',
    semitones: [0, 4, 7, 14],
    intervals: ['P1', 'M3', 'P5', 'M9'],
    family: 'major',
    category: 'add',
    description: 'Add9 — major triad with an added ninth (no seventh).',
    tags: ['add', 'major', 'pop'],
  },
  {
    id: 'mAdd9',
    name: 'Minor Add Nine',
    symbols: ['m(add9)', 'madd9', '-add9'],
    primarySymbol: 'm(add9)',
    semitones: [0, 3, 7, 14],
    intervals: ['P1', 'm3', 'P5', 'M9'],
    family: 'minor',
    category: 'add',
    description: 'Minor add9 — minor triad with an added ninth.',
    tags: ['add', 'minor'],
  },
  {
    id: 'add11',
    name: 'Add Eleven',
    symbols: ['add11', 'add4'],
    primarySymbol: 'add11',
    semitones: [0, 4, 5, 7],
    intervals: ['P1', 'M3', 'P4', 'P5'],
    family: 'major',
    category: 'add',
    description: 'Add11 — major triad with an added fourth/eleventh (no seventh or ninth).',
    tags: ['add', 'major'],
  },
  {
    id: 'add#11',
    name: 'Add Sharp Eleven',
    symbols: ['add#11', 'add♯11'],
    primarySymbol: 'add♯11',
    semitones: [0, 4, 7, 18],
    intervals: ['P1', 'M3', 'P5', 'A11'],
    family: 'major',
    category: 'add',
    description: 'Add♯11 — major triad with an added augmented eleventh.',
    tags: ['add', 'major', 'lydian'],
  },

  // ── Quartal / Quintal ────────────────────────────────────────────────────

  {
    id: 'quartal3',
    name: 'Three-Note Quartal',
    symbols: ['quartal3'],
    primarySymbol: 'quartal',
    semitones: [0, 5, 10],
    intervals: ['P1', 'P4', 'm7'],
    family: 'quartal',
    category: 'quartal',
    description: 'Three-note quartal voicing — two stacked perfect fourths.',
    tags: ['quartal', 'modern', 'jazz'],
  },
  {
    id: 'quartal4',
    name: 'Four-Note Quartal',
    symbols: ['quartal4'],
    primarySymbol: 'quartal4',
    semitones: [0, 5, 10, 15],
    intervals: ['P1', 'P4', 'm7', 'm10'],
    family: 'quartal',
    category: 'quartal',
    description: 'Four-note quartal voicing — three stacked perfect fourths.',
    tags: ['quartal', 'modern', 'jazz'],
  },
  {
    id: 'soWhat',
    name: 'So What Chord',
    symbols: ['soWhat'],
    primarySymbol: 'soWhat',
    semitones: [0, 5, 10, 15, 19],
    intervals: ['P1', 'P4', 'm7', 'm10', 'P12'],
    family: 'quartal',
    category: 'quartal',
    description: 'So What chord — three fourths then a major third (Miles Davis).',
    tags: ['quartal', 'modal', 'jazz', 'miles'],
  },
  {
    id: 'quintal3',
    name: 'Three-Note Quintal',
    symbols: ['quintal3'],
    primarySymbol: 'quintal',
    semitones: [0, 7, 14],
    intervals: ['P1', 'P5', 'M9'],
    family: 'quartal',
    category: 'quartal',
    description: 'Three-note quintal voicing — two stacked perfect fifths.',
    tags: ['quintal', 'modern', 'open'],
  },
];

// ─── Lookup Map (built once for O(1) access) ────────────────────────────────

const chordById = new Map<string, ChordTypeDefinition>();

for (const chord of CHORD_TYPES) {
  chordById.set(chord.id, chord);
}

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Look up a chord type by its unique id (O(1) via Map).
 */
export function getChordType(id: string): ChordTypeDefinition | undefined {
  return chordById.get(id);
}

/**
 * Get all chord types belonging to a given family.
 */
export function getChordsByFamily(family: ChordFamily): ChordTypeDefinition[] {
  return CHORD_TYPES.filter((c) => c.family === family);
}

/**
 * Get all chord types belonging to a given category.
 */
export function getChordsByCategory(category: ChordCategory): ChordTypeDefinition[] {
  return CHORD_TYPES.filter((c) => c.category === category);
}

/**
 * Search chords by name, symbol, id, or tag (case-insensitive substring match).
 * @param query - Search string
 * @returns Array of matching chord type definitions
 */
export function searchChords(query: string): ChordTypeDefinition[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return CHORD_TYPES.filter((chord) => {
    if (chord.name.toLowerCase().includes(q)) return true;
    if (chord.id.toLowerCase().includes(q)) return true;
    if (chord.symbols.some((s) => s.toLowerCase().includes(q))) return true;
    if (chord.tags.some((t) => t.toLowerCase().includes(q))) return true;
    if (chord.description.toLowerCase().includes(q)) return true;
    return false;
  });
}
