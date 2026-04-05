/**
 * Scale Registry — Central type system and registry for ALL scales
 * in the music practice application.
 *
 * Contains 62 scales across 9 families: diatonic, melodic-minor,
 * harmonic-minor, harmonic-major, symmetric, pentatonic, blues, bebop, world.
 *
 * @module scale-registry
 */

// ─── Types ───────────────────────────────────────────────────────────────────

/** Scale family classification */
export type ScaleFamily =
  | 'diatonic'
  | 'melodic-minor'
  | 'harmonic-minor'
  | 'harmonic-major'
  | 'symmetric'
  | 'pentatonic'
  | 'blues'
  | 'bebop'
  | 'world';

/** Complete definition of a musical scale */
export interface ScaleDefinition {
  /** Unique kebab-case identifier */
  id: string;
  /** Display name */
  name: string;
  /** Alternative names for this scale */
  aliases: string[];
  /** Scale family classification */
  family: ScaleFamily;
  /** Parent scale ID (for modes) */
  parentScale?: string;
  /** Degree of parent scale (1-indexed) */
  degree?: number;
  /** Semitone offsets from root */
  semitones: number[];
  /** Step pattern notation (W=whole, H=half, etc.) */
  stepPattern: string;
  /** Number of distinct pitch classes */
  noteCount: number;
  /** Number of unique transpositions (symmetric scales only) */
  transpositions?: number;
  /** Notable interval that defines the scale's character */
  characteristicNote?: string;
  /** Brief description */
  description: string;
  /** Searchable tags */
  tags: string[];
  /** Chord qualities naturally produced by this scale's harmonization */
  chordQualities?: string[];
  /** Notes to avoid in certain harmonic contexts */
  avoidNotes?: { degree: number; reason: string }[];
}

// ─── Diatonic Modes ──────────────────────────────────────────────────────────

const diatonicScales: ScaleDefinition[] = [
  {
    id: 'ionian',
    name: 'Ionian',
    aliases: ['Major Scale'],
    family: 'diatonic',
    parentScale: 'ionian',
    degree: 1,
    semitones: [0, 2, 4, 5, 7, 9, 11],
    stepPattern: 'W-W-H-W-W-W-H',
    noteCount: 7,
    characteristicNote: 'natural 4',
    description: 'The major scale. The most common scale in Western music.',
    tags: ['major', 'bright', 'happy', 'common', 'beginner'],
  },
  {
    id: 'dorian',
    name: 'Dorian',
    aliases: [],
    family: 'diatonic',
    parentScale: 'ionian',
    degree: 2,
    semitones: [0, 2, 3, 5, 7, 9, 10],
    stepPattern: 'W-H-W-W-W-H-W',
    noteCount: 7,
    characteristicNote: 'natural 6',
    description: 'Minor scale with a raised 6th. Common in jazz, funk, and folk.',
    tags: ['minor', 'jazz', 'funk', 'folk', 'modal'],
  },
  {
    id: 'phrygian',
    name: 'Phrygian',
    aliases: [],
    family: 'diatonic',
    parentScale: 'ionian',
    degree: 3,
    semitones: [0, 1, 3, 5, 7, 8, 10],
    stepPattern: 'H-W-W-W-H-W-W',
    noteCount: 7,
    characteristicNote: 'b2',
    description: 'Minor scale with a flat 2nd. Dark, Spanish-flavored sound.',
    tags: ['minor', 'dark', 'spanish', 'flamenco', 'modal'],
  },
  {
    id: 'lydian',
    name: 'Lydian',
    aliases: [],
    family: 'diatonic',
    parentScale: 'ionian',
    degree: 4,
    semitones: [0, 2, 4, 6, 7, 9, 11],
    stepPattern: 'W-W-W-H-W-W-H',
    noteCount: 7,
    characteristicNote: '#4',
    description: 'Major scale with a raised 4th. Bright, dreamy quality.',
    tags: ['major', 'bright', 'dreamy', 'film', 'modal'],
  },
  {
    id: 'mixolydian',
    name: 'Mixolydian',
    aliases: [],
    family: 'diatonic',
    parentScale: 'ionian',
    degree: 5,
    semitones: [0, 2, 4, 5, 7, 9, 10],
    stepPattern: 'W-W-H-W-W-H-W',
    noteCount: 7,
    characteristicNote: 'b7',
    description: 'Major scale with a flat 7th. Essential for dominant chords and blues-rock.',
    tags: ['major', 'dominant', 'blues', 'rock', 'modal'],
  },
  {
    id: 'aeolian',
    name: 'Aeolian',
    aliases: ['Natural Minor'],
    family: 'diatonic',
    parentScale: 'ionian',
    degree: 6,
    semitones: [0, 2, 3, 5, 7, 8, 10],
    stepPattern: 'W-H-W-W-H-W-W',
    noteCount: 7,
    characteristicNote: 'b6',
    description: 'The natural minor scale. Sad, dark, introspective.',
    tags: ['minor', 'sad', 'dark', 'common', 'beginner'],
  },
  {
    id: 'locrian',
    name: 'Locrian',
    aliases: [],
    family: 'diatonic',
    parentScale: 'ionian',
    degree: 7,
    semitones: [0, 1, 3, 5, 6, 8, 10],
    stepPattern: 'H-W-W-H-W-W-W',
    noteCount: 7,
    characteristicNote: 'b5',
    description: 'Diminished scale with b2 and b5. Unstable, used over half-diminished chords.',
    tags: ['diminished', 'dark', 'unstable', 'jazz', 'modal'],
  },
];

// ─── Melodic Minor Modes ─────────────────────────────────────────────────────

const melodicMinorScales: ScaleDefinition[] = [
  {
    id: 'melodic-minor',
    name: 'Melodic Minor',
    aliases: ['Jazz Minor'],
    family: 'melodic-minor',
    parentScale: 'melodic-minor',
    degree: 1,
    semitones: [0, 2, 3, 5, 7, 9, 11],
    stepPattern: 'W-H-W-W-W-W-H',
    noteCount: 7,
    characteristicNote: 'natural 7',
    description: 'Minor scale with raised 6th and 7th. Foundation of jazz minor harmony.',
    tags: ['minor', 'jazz', 'smooth', 'advanced'],
  },
  {
    id: 'dorian-b2',
    name: 'Dorian b2',
    aliases: ['Phrygian #6', 'Javanese'],
    family: 'melodic-minor',
    parentScale: 'melodic-minor',
    degree: 2,
    semitones: [0, 1, 3, 5, 7, 9, 10],
    stepPattern: 'H-W-W-W-W-H-W',
    noteCount: 7,
    characteristicNote: 'b2',
    description: 'Dorian mode with a flat 2nd. Used in Javanese gamelan music.',
    tags: ['minor', 'exotic', 'gamelan', 'jazz', 'modal'],
  },
  {
    id: 'lydian-augmented',
    name: 'Lydian Augmented',
    aliases: ['Lydian #5'],
    family: 'melodic-minor',
    parentScale: 'melodic-minor',
    degree: 3,
    semitones: [0, 2, 4, 6, 8, 9, 11],
    stepPattern: 'W-W-W-W-H-W-H',
    noteCount: 7,
    characteristicNote: '#5',
    description: 'Lydian with a raised 5th. Bright, augmented quality.',
    tags: ['major', 'augmented', 'bright', 'jazz', 'advanced'],
  },
  {
    id: 'lydian-dominant',
    name: 'Lydian Dominant',
    aliases: ['Overtone', 'Acoustic', 'Lydian b7'],
    family: 'melodic-minor',
    parentScale: 'melodic-minor',
    degree: 4,
    semitones: [0, 2, 4, 6, 7, 9, 10],
    stepPattern: 'W-W-W-H-W-H-W',
    noteCount: 7,
    characteristicNote: '#4',
    description: 'Lydian with a flat 7th. Matches the natural overtone series. Used over #11 chords.',
    tags: ['dominant', 'overtone', 'jazz', 'bartok', 'advanced'],
  },
  {
    id: 'mixolydian-b6',
    name: 'Mixolydian b6',
    aliases: ['Hindu', 'Aeolian Dominant'],
    family: 'melodic-minor',
    parentScale: 'melodic-minor',
    degree: 5,
    semitones: [0, 2, 4, 5, 7, 8, 10],
    stepPattern: 'W-W-H-W-H-W-W',
    noteCount: 7,
    characteristicNote: 'b6',
    description: 'Mixolydian with a flat 6th. Dominant scale with a dark twist.',
    tags: ['dominant', 'dark', 'jazz', 'indian', 'modal'],
  },
  {
    id: 'locrian-sharp2',
    name: 'Locrian #2',
    aliases: ['Half-Diminished Scale', 'Aeolian b5'],
    family: 'melodic-minor',
    parentScale: 'melodic-minor',
    degree: 6,
    semitones: [0, 2, 3, 5, 6, 8, 10],
    stepPattern: 'W-H-W-H-W-W-W',
    noteCount: 7,
    characteristicNote: 'natural 2',
    description: 'Locrian with a natural 2nd. Primary choice for half-diminished (m7b5) chords.',
    tags: ['diminished', 'jazz', 'half-diminished', 'advanced'],
  },
  {
    id: 'altered',
    name: 'Altered',
    aliases: ['Super Locrian', 'Diminished Whole Tone'],
    family: 'melodic-minor',
    parentScale: 'melodic-minor',
    degree: 7,
    semitones: [0, 1, 3, 4, 6, 8, 10],
    stepPattern: 'H-W-H-W-W-W-W',
    noteCount: 7,
    characteristicNote: 'all altered tensions',
    description: 'All tensions altered (b9, #9, b5, #5). The go-to scale for altered dominant chords.',
    tags: ['dominant', 'altered', 'jazz', 'tension', 'advanced'],
  },
];

// ─── Harmonic Minor Modes ────────────────────────────────────────────────────

const harmonicMinorScales: ScaleDefinition[] = [
  {
    id: 'harmonic-minor',
    name: 'Harmonic Minor',
    aliases: [],
    family: 'harmonic-minor',
    parentScale: 'harmonic-minor',
    degree: 1,
    semitones: [0, 2, 3, 5, 7, 8, 11],
    stepPattern: 'W-H-W-W-H-3H-H',
    noteCount: 7,
    characteristicNote: 'natural 7 with b6',
    description: 'Natural minor with raised 7th. Creates the augmented 2nd interval. Classical and Middle Eastern.',
    tags: ['minor', 'classical', 'middle-eastern', 'dramatic', 'common'],
  },
  {
    id: 'locrian-sharp6',
    name: 'Locrian #6',
    aliases: [],
    family: 'harmonic-minor',
    parentScale: 'harmonic-minor',
    degree: 2,
    semitones: [0, 1, 3, 5, 6, 9, 10],
    stepPattern: 'H-W-W-H-3H-H-W',
    noteCount: 7,
    characteristicNote: '#6',
    description: 'Locrian mode with a raised 6th. Second mode of harmonic minor.',
    tags: ['diminished', 'dark', 'advanced', 'modal'],
  },
  {
    id: 'ionian-sharp5',
    name: 'Ionian #5',
    aliases: ['Ionian Augmented'],
    family: 'harmonic-minor',
    parentScale: 'harmonic-minor',
    degree: 3,
    semitones: [0, 2, 4, 5, 8, 9, 11],
    stepPattern: 'W-W-H-3H-H-W-H',
    noteCount: 7,
    characteristicNote: '#5',
    description: 'Major scale with a raised 5th. Augmented major quality.',
    tags: ['major', 'augmented', 'classical', 'advanced'],
  },
  {
    id: 'dorian-sharp4',
    name: 'Dorian #4',
    aliases: ['Romanian Minor', 'Ukrainian Dorian'],
    family: 'harmonic-minor',
    parentScale: 'harmonic-minor',
    degree: 4,
    semitones: [0, 2, 3, 6, 7, 9, 10],
    stepPattern: 'W-H-3H-H-W-H-W',
    noteCount: 7,
    characteristicNote: '#4',
    description: 'Dorian with a raised 4th. Common in Romanian and Ukrainian folk music.',
    tags: ['minor', 'folk', 'romanian', 'ukrainian', 'exotic'],
  },
  {
    id: 'phrygian-dominant',
    name: 'Phrygian Dominant',
    aliases: ['Spanish Phrygian', 'Freygish', 'Hijaz'],
    family: 'harmonic-minor',
    parentScale: 'harmonic-minor',
    degree: 5,
    semitones: [0, 1, 4, 5, 7, 8, 10],
    stepPattern: 'H-3H-H-W-H-W-W',
    noteCount: 7,
    characteristicNote: 'major 3 with b2',
    description: 'Phrygian with a major 3rd. Essential in flamenco, klezmer, and Middle Eastern music.',
    tags: ['dominant', 'flamenco', 'klezmer', 'middle-eastern', 'spanish'],
  },
  {
    id: 'lydian-sharp2',
    name: 'Lydian #2',
    aliases: ['Lydian #9'],
    family: 'harmonic-minor',
    parentScale: 'harmonic-minor',
    degree: 6,
    semitones: [0, 3, 4, 6, 7, 9, 11],
    stepPattern: '3H-H-W-H-W-W-H',
    noteCount: 7,
    characteristicNote: '#2',
    description: 'Lydian with a raised 2nd. Exotic, augmented second from root.',
    tags: ['major', 'exotic', 'advanced', 'modal'],
  },
  {
    id: 'super-locrian-bb7',
    name: 'Super Locrian bb7',
    aliases: ['Ultra Locrian', 'Altered Diminished'],
    family: 'harmonic-minor',
    parentScale: 'harmonic-minor',
    degree: 7,
    semitones: [0, 1, 3, 4, 6, 8, 9],
    stepPattern: 'H-W-H-W-W-H-3H',
    noteCount: 7,
    characteristicNote: 'bb7',
    description: 'The most diminished of all modes. Seventh mode of harmonic minor.',
    tags: ['diminished', 'dark', 'extreme', 'advanced'],
  },
];

// ─── Harmonic Major Modes ────────────────────────────────────────────────────

const harmonicMajorScales: ScaleDefinition[] = [
  {
    id: 'harmonic-major',
    name: 'Harmonic Major',
    aliases: ['Ionian b6'],
    family: 'harmonic-major',
    parentScale: 'harmonic-major',
    degree: 1,
    semitones: [0, 2, 4, 5, 7, 8, 11],
    stepPattern: 'W-W-H-W-H-3H-H',
    noteCount: 7,
    characteristicNote: 'b6',
    description: 'Major scale with a flat 6th. Creates an augmented 2nd between b6 and 7.',
    tags: ['major', 'classical', 'dramatic', 'advanced'],
  },
  {
    id: 'dorian-b5',
    name: 'Dorian b5',
    aliases: ['Locrian #2#6'],
    family: 'harmonic-major',
    parentScale: 'harmonic-major',
    degree: 2,
    semitones: [0, 2, 3, 5, 6, 9, 10],
    stepPattern: 'W-H-W-H-3H-H-W',
    noteCount: 7,
    characteristicNote: 'b5',
    description: 'Dorian with a flat 5th. Second mode of harmonic major.',
    tags: ['minor', 'diminished', 'advanced', 'modal'],
  },
  {
    id: 'phrygian-b4',
    name: 'Phrygian b4',
    aliases: ['Altered #5'],
    family: 'harmonic-major',
    parentScale: 'harmonic-major',
    degree: 3,
    semitones: [0, 1, 3, 4, 7, 8, 10],
    stepPattern: 'H-W-H-3H-H-W-W',
    noteCount: 7,
    characteristicNote: 'b4',
    description: 'Phrygian with a flat 4th (enharmonic major 3rd). Third mode of harmonic major.',
    tags: ['dark', 'exotic', 'advanced', 'modal'],
  },
  {
    id: 'lydian-b3',
    name: 'Lydian b3',
    aliases: ['Melodic Minor #4'],
    family: 'harmonic-major',
    parentScale: 'harmonic-major',
    degree: 4,
    semitones: [0, 2, 3, 6, 7, 9, 11],
    stepPattern: 'W-H-3H-H-W-W-H',
    noteCount: 7,
    characteristicNote: 'b3 with #4',
    description: 'Lydian with a flat 3rd. Minor quality with raised 4th. Fourth mode of harmonic major.',
    tags: ['minor', 'exotic', 'advanced', 'modal'],
  },
  {
    id: 'mixolydian-b2',
    name: 'Mixolydian b2',
    aliases: ['Mixolydian b9'],
    family: 'harmonic-major',
    parentScale: 'harmonic-major',
    degree: 5,
    semitones: [0, 1, 4, 5, 7, 9, 10],
    stepPattern: 'H-3H-H-W-W-H-W',
    noteCount: 7,
    characteristicNote: 'b2',
    description: 'Mixolydian with a flat 2nd. Dominant quality with b9. Fifth mode of harmonic major.',
    tags: ['dominant', 'exotic', 'advanced', 'modal'],
  },
  {
    id: 'lydian-augmented-sharp2',
    name: 'Lydian Augmented #2',
    aliases: [],
    family: 'harmonic-major',
    parentScale: 'harmonic-major',
    degree: 6,
    semitones: [0, 3, 4, 6, 8, 9, 11],
    stepPattern: '3H-H-W-W-H-W-H',
    noteCount: 7,
    characteristicNote: '#2 with #5',
    description: 'Lydian augmented with a raised 2nd. Sixth mode of harmonic major.',
    tags: ['augmented', 'exotic', 'advanced', 'modal'],
  },
  {
    id: 'locrian-bb7',
    name: 'Locrian bb7',
    aliases: [],
    family: 'harmonic-major',
    parentScale: 'harmonic-major',
    degree: 7,
    semitones: [0, 1, 3, 5, 6, 8, 9],
    stepPattern: 'H-W-W-H-W-H-3H',
    noteCount: 7,
    characteristicNote: 'bb7',
    description: 'Locrian with a double-flat 7th. Seventh mode of harmonic major.',
    tags: ['diminished', 'dark', 'advanced', 'modal'],
  },
];

// ─── Symmetric Scales ────────────────────────────────────────────────────────

const symmetricScales: ScaleDefinition[] = [
  {
    id: 'chromatic',
    name: 'Chromatic',
    aliases: [],
    family: 'symmetric',
    semitones: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    stepPattern: 'H-H-H-H-H-H-H-H-H-H-H-H',
    noteCount: 12,
    transpositions: 1,
    description: 'All 12 semitones. Only one transposition exists.',
    tags: ['symmetric', 'chromatic', 'technique', 'exercise'],
  },
  {
    id: 'whole-tone',
    name: 'Whole Tone',
    aliases: [],
    family: 'symmetric',
    semitones: [0, 2, 4, 6, 8, 10],
    stepPattern: 'W-W-W-W-W-W',
    noteCount: 6,
    transpositions: 2,
    description: 'All whole steps. Dreamy, ambiguous quality. Only 2 unique transpositions.',
    tags: ['symmetric', 'augmented', 'dreamy', 'impressionist', 'debussy'],
  },
  {
    id: 'diminished-wh',
    name: 'Diminished WH',
    aliases: ['Whole-Half Diminished', 'Octatonic WH'],
    family: 'symmetric',
    semitones: [0, 2, 3, 5, 6, 8, 9, 11],
    stepPattern: 'W-H-W-H-W-H-W-H',
    noteCount: 8,
    transpositions: 3,
    description: 'Alternating whole and half steps. Used over diminished 7th chords. 3 unique transpositions.',
    tags: ['symmetric', 'diminished', 'jazz', 'classical', 'octatonic'],
  },
  {
    id: 'diminished-hw',
    name: 'Diminished HW',
    aliases: ['Half-Whole Diminished', 'Octatonic HW'],
    family: 'symmetric',
    semitones: [0, 1, 3, 4, 6, 7, 9, 10],
    stepPattern: 'H-W-H-W-H-W-H-W',
    noteCount: 8,
    transpositions: 3,
    description: 'Alternating half and whole steps. Used over dominant 7th chords with b9/#9. 3 unique transpositions.',
    tags: ['symmetric', 'dominant', 'jazz', 'tension', 'octatonic'],
  },
  {
    id: 'augmented',
    name: 'Augmented',
    aliases: ['Augmented Scale', 'Hexatonic'],
    family: 'symmetric',
    semitones: [0, 3, 4, 7, 8, 11],
    stepPattern: 'm3-H-m3-H-m3-H',
    noteCount: 6,
    transpositions: 4,
    description: 'Alternating minor 3rds and half steps. 4 unique transpositions.',
    tags: ['symmetric', 'augmented', 'hexatonic', 'coltrane'],
  },
  {
    id: 'tritone',
    name: 'Tritone',
    aliases: ['Tritone Scale'],
    family: 'symmetric',
    semitones: [0, 1, 4, 6, 7, 10],
    stepPattern: 'H-M3-W-H-M3-W',
    noteCount: 6,
    transpositions: 6,
    description: 'Two augmented triads a tritone apart. 6 unique transpositions.',
    tags: ['symmetric', 'tritone', 'advanced', 'hexatonic'],
  },
];

// ─── Pentatonic Scales ───────────────────────────────────────────────────────

const pentatonicScales: ScaleDefinition[] = [
  {
    id: 'major-pentatonic',
    name: 'Major Pentatonic',
    aliases: [],
    family: 'pentatonic',
    semitones: [0, 2, 4, 7, 9],
    stepPattern: 'W-W-m3-W-m3',
    noteCount: 5,
    description: 'The most common pentatonic scale. Bright, open sound. Universal across cultures.',
    tags: ['pentatonic', 'major', 'bright', 'common', 'beginner', 'folk', 'rock'],
  },
  {
    id: 'minor-pentatonic',
    name: 'Minor Pentatonic',
    aliases: [],
    family: 'pentatonic',
    semitones: [0, 3, 5, 7, 10],
    stepPattern: 'm3-W-W-m3-W',
    noteCount: 5,
    description: 'The minor pentatonic. Backbone of blues, rock, and pop guitar.',
    tags: ['pentatonic', 'minor', 'blues', 'rock', 'common', 'beginner'],
  },
  {
    id: 'egyptian',
    name: 'Egyptian',
    aliases: ['Suspended Pentatonic'],
    family: 'pentatonic',
    semitones: [0, 2, 5, 7, 10],
    stepPattern: 'W-m3-W-m3-W',
    noteCount: 5,
    description: 'Neither major nor minor. Open, suspended quality.',
    tags: ['pentatonic', 'suspended', 'ambiguous', 'folk'],
  },
  {
    id: 'blues-minor-pentatonic',
    name: 'Blues Minor',
    aliases: ['Man Gong'],
    family: 'pentatonic',
    semitones: [0, 3, 5, 8, 10],
    stepPattern: 'm3-W-m3-W-W',
    noteCount: 5,
    description: 'Minor pentatonic variant with a flat 6th. Dark, bluesy quality.',
    tags: ['pentatonic', 'minor', 'blues', 'dark'],
  },
  {
    id: 'blues-major-pentatonic',
    name: 'Blues Major',
    aliases: ['Ritusen'],
    family: 'pentatonic',
    semitones: [0, 2, 5, 7, 9],
    stepPattern: 'W-m3-W-W-m3',
    noteCount: 5,
    description: 'Major pentatonic variant common in Scottish and Chinese music.',
    tags: ['pentatonic', 'major', 'folk', 'scottish', 'chinese'],
  },
  {
    id: 'dominant-pentatonic',
    name: 'Dominant Pentatonic',
    aliases: [],
    family: 'pentatonic',
    semitones: [0, 2, 4, 7, 10],
    stepPattern: 'W-W-m3-m3-W',
    noteCount: 5,
    description: 'Pentatonic scale with a dominant (b7) flavor.',
    tags: ['pentatonic', 'dominant', 'blues'],
  },
  {
    id: 'minor-6-pentatonic',
    name: 'Minor 6 Pentatonic',
    aliases: [],
    family: 'pentatonic',
    semitones: [0, 3, 5, 7, 9],
    stepPattern: 'm3-W-W-W-m3',
    noteCount: 5,
    description: 'Minor pentatonic with a natural 6th. Dorian pentatonic quality.',
    tags: ['pentatonic', 'minor', 'dorian', 'jazz'],
  },
  {
    id: 'kumoi',
    name: 'Kumoi',
    aliases: [],
    family: 'pentatonic',
    semitones: [0, 2, 3, 7, 9],
    stepPattern: 'W-H-4-W-m3',
    noteCount: 5,
    description: 'Japanese pentatonic scale. Minor quality with a wide gap.',
    tags: ['pentatonic', 'japanese', 'minor', 'exotic'],
  },
  {
    id: 'hirajoshi',
    name: 'Hirajoshi',
    aliases: [],
    family: 'pentatonic',
    semitones: [0, 2, 3, 7, 8],
    stepPattern: 'W-H-4-H-4',
    noteCount: 5,
    description: 'Japanese pentatonic scale. Haunting, mysterious quality.',
    tags: ['pentatonic', 'japanese', 'minor', 'haunting', 'exotic'],
  },
  {
    id: 'iwato',
    name: 'Iwato',
    aliases: [],
    family: 'pentatonic',
    semitones: [0, 1, 5, 6, 10],
    stepPattern: 'H-4-H-4-W',
    noteCount: 5,
    description: 'Japanese pentatonic with two tritones. Very dark and dissonant.',
    tags: ['pentatonic', 'japanese', 'dark', 'dissonant', 'exotic'],
  },
  {
    id: 'in-sen',
    name: 'In Sen',
    aliases: [],
    family: 'pentatonic',
    semitones: [0, 1, 5, 7, 10],
    stepPattern: 'H-4-W-m3-W',
    noteCount: 5,
    description: 'Japanese pentatonic with a b2. Used in shakuhachi music.',
    tags: ['pentatonic', 'japanese', 'dark', 'shakuhachi', 'exotic'],
  },
];

// ─── Blues Scales ─────────────────────────────────────────────────────────────

const bluesScales: ScaleDefinition[] = [
  {
    id: 'minor-blues',
    name: 'Minor Blues',
    aliases: ['Blues Scale'],
    family: 'blues',
    semitones: [0, 3, 5, 6, 7, 10],
    stepPattern: 'm3-W-H-H-m3-W',
    noteCount: 6,
    description: 'Minor pentatonic with added b5 "blue note." The quintessential blues scale.',
    tags: ['blues', 'minor', 'blue-note', 'common', 'guitar'],
  },
  {
    id: 'major-blues',
    name: 'Major Blues',
    aliases: [],
    family: 'blues',
    semitones: [0, 2, 3, 4, 7, 9],
    stepPattern: 'W-H-H-m3-W-m3',
    noteCount: 6,
    description: 'Major pentatonic with added b3 "blue note." Bright blues sound.',
    tags: ['blues', 'major', 'blue-note', 'common', 'country'],
  },
];

// ─── Bebop Scales ─────────────────────────────────────────────────────────────

const bebopScales: ScaleDefinition[] = [
  {
    id: 'bebop-dominant',
    name: 'Bebop Dominant',
    aliases: ['Bebop Mixolydian'],
    family: 'bebop',
    semitones: [0, 2, 4, 5, 7, 9, 10, 11],
    stepPattern: 'W-W-H-W-W-H-H-H',
    noteCount: 8,
    description: 'Mixolydian with added natural 7. Chord tones land on downbeats in 8th-note lines.',
    tags: ['bebop', 'dominant', 'jazz', '8-note', 'passing-tone'],
  },
  {
    id: 'bebop-major',
    name: 'Bebop Major',
    aliases: [],
    family: 'bebop',
    semitones: [0, 2, 4, 5, 7, 8, 9, 11],
    stepPattern: 'W-W-H-W-H-H-W-H',
    noteCount: 8,
    description: 'Major scale with added #5/b6. Smooth chromatic passing tone between 5 and 6.',
    tags: ['bebop', 'major', 'jazz', '8-note', 'passing-tone'],
  },
  {
    id: 'bebop-dorian',
    name: 'Bebop Dorian',
    aliases: ['Bebop Minor'],
    family: 'bebop',
    semitones: [0, 2, 3, 4, 5, 7, 9, 10],
    stepPattern: 'W-H-H-H-W-W-H-W',
    noteCount: 8,
    description: 'Dorian with added natural 3. Chromatic passing tone between b3 and 4.',
    tags: ['bebop', 'minor', 'jazz', '8-note', 'passing-tone'],
  },
  {
    id: 'bebop-melodic-minor',
    name: 'Bebop Melodic Minor',
    aliases: [],
    family: 'bebop',
    semitones: [0, 2, 3, 5, 7, 8, 9, 11],
    stepPattern: 'W-H-W-W-H-H-W-H',
    noteCount: 8,
    description: 'Melodic minor with added natural 6 (b6). Chromatic between 5 and 6.',
    tags: ['bebop', 'minor', 'jazz', '8-note', 'passing-tone'],
  },
  {
    id: 'bebop-harmonic-minor',
    name: 'Bebop Harmonic Minor',
    aliases: [],
    family: 'bebop',
    semitones: [0, 2, 3, 5, 7, 8, 10, 11],
    stepPattern: 'W-H-W-W-H-W-H-H',
    noteCount: 8,
    description: 'Harmonic minor with added b7. Chromatic approach to the natural 7.',
    tags: ['bebop', 'minor', 'jazz', '8-note', 'passing-tone'],
  },
];

// ─── World Scales ─────────────────────────────────────────────────────────────

const worldScales: ScaleDefinition[] = [
  {
    id: 'double-harmonic-major',
    name: 'Double Harmonic Major',
    aliases: ['Byzantine', 'Arabic', 'Hijaz Kar', 'Bhairav'],
    family: 'world',
    semitones: [0, 1, 4, 5, 7, 8, 11],
    stepPattern: 'H-3H-H-W-H-3H-H',
    noteCount: 7,
    description: 'Two augmented seconds create an intensely exotic sound. Used across Middle Eastern, Byzantine, and Indian traditions.',
    tags: ['exotic', 'middle-eastern', 'byzantine', 'arabic', 'indian', 'dramatic'],
  },
  {
    id: 'double-harmonic-minor',
    name: 'Double Harmonic Minor',
    aliases: ['Hungarian Minor', 'Gypsy Minor'],
    family: 'world',
    semitones: [0, 2, 3, 6, 7, 8, 11],
    stepPattern: 'W-H-3H-H-H-3H-H',
    noteCount: 7,
    description: 'Minor scale with two augmented seconds. Fiery, passionate quality. Central to Hungarian and Roma music.',
    tags: ['exotic', 'hungarian', 'gypsy', 'roma', 'dramatic', 'minor'],
  },
  {
    id: 'hungarian-major',
    name: 'Hungarian Major',
    aliases: [],
    family: 'world',
    semitones: [0, 3, 4, 6, 7, 9, 10],
    stepPattern: '3H-H-W-H-W-H-W',
    noteCount: 7,
    description: 'Major scale with #2 and #4. Unique Hungarian folk character.',
    tags: ['exotic', 'hungarian', 'folk', 'major'],
  },
  {
    id: 'neapolitan-major',
    name: 'Neapolitan Major',
    aliases: [],
    family: 'world',
    semitones: [0, 1, 3, 5, 7, 9, 11],
    stepPattern: 'H-W-W-W-W-W-H',
    noteCount: 7,
    description: 'Major scale with b2 and b3. Dramatic Neapolitan flavor. Used in classical and film.',
    tags: ['classical', 'neapolitan', 'dramatic', 'film'],
  },
  {
    id: 'neapolitan-minor',
    name: 'Neapolitan Minor',
    aliases: [],
    family: 'world',
    semitones: [0, 1, 3, 5, 7, 8, 11],
    stepPattern: 'H-W-W-W-H-3H-H',
    noteCount: 7,
    description: 'Harmonic minor with a b2. Dark, dramatic, classical.',
    tags: ['classical', 'neapolitan', 'dark', 'dramatic', 'minor'],
  },
  {
    id: 'persian',
    name: 'Persian',
    aliases: [],
    family: 'world',
    semitones: [0, 1, 4, 5, 6, 8, 11],
    stepPattern: 'H-3H-H-H-W-3H-H',
    noteCount: 7,
    description: 'Exotic scale with two augmented seconds and a b5. Intensely Middle Eastern.',
    tags: ['exotic', 'persian', 'middle-eastern', 'dark', 'dramatic'],
  },
  {
    id: 'enigmatic',
    name: 'Enigmatic',
    aliases: [],
    family: 'world',
    semitones: [0, 1, 4, 6, 8, 10, 11],
    stepPattern: 'H-3H-W-W-W-H-H',
    noteCount: 7,
    description: 'Invented by Verdi. Mysterious, unresolved quality. Rarely used but distinctive.',
    tags: ['exotic', 'verdi', 'mysterious', 'rare', 'classical'],
  },
  {
    id: 'prometheus',
    name: 'Prometheus',
    aliases: ['Scriabin'],
    family: 'world',
    semitones: [0, 2, 4, 6, 9, 10],
    stepPattern: 'W-W-W-m3-H-W',
    noteCount: 6,
    description: 'Scriabin\'s mystic scale. Whole-tone feel with a natural 6th twist.',
    tags: ['exotic', 'scriabin', 'mystic', 'russian', 'impressionist'],
  },
  {
    id: 'spanish-8-tone',
    name: 'Spanish 8-Tone',
    aliases: ['Spanish Octatonic'],
    family: 'world',
    semitones: [0, 1, 3, 4, 5, 6, 8, 10],
    stepPattern: 'H-W-H-H-H-W-W-W',
    noteCount: 8,
    description: 'Eight-note scale with dense chromatic cluster. Rich, flamenco-jazz fusion.',
    tags: ['exotic', 'spanish', 'flamenco', 'octatonic', 'dense'],
  },
  {
    id: 'algerian',
    name: 'Algerian',
    aliases: [],
    family: 'world',
    semitones: [0, 2, 3, 6, 7, 8, 11],
    stepPattern: 'W-H-3H-H-H-3H-H',
    noteCount: 7,
    description: 'North African scale similar to Hungarian/Double Harmonic minor. Passionate and dramatic.',
    tags: ['exotic', 'north-african', 'algerian', 'dramatic', 'minor'],
  },
];

// ─── Registry ─────────────────────────────────────────────────────────────────

/** Complete registry of all scales */
export const SCALE_REGISTRY: ScaleDefinition[] = [
  ...diatonicScales,
  ...melodicMinorScales,
  ...harmonicMinorScales,
  ...harmonicMajorScales,
  ...symmetricScales,
  ...pentatonicScales,
  ...bluesScales,
  ...bebopScales,
  ...worldScales,
];

// ─── Lookup Maps (built once for performance) ─────────────────────────────────

const scaleById = new Map<string, ScaleDefinition>();
const scaleByAlias = new Map<string, ScaleDefinition>();

for (const scale of SCALE_REGISTRY) {
  scaleById.set(scale.id, scale);
  // Index aliases (case-insensitive)
  for (const alias of scale.aliases) {
    scaleByAlias.set(alias.toLowerCase(), scale);
  }
  // Also index by name
  scaleByAlias.set(scale.name.toLowerCase(), scale);
}

// ─── Query Functions ──────────────────────────────────────────────────────────

/**
 * Get a scale by its unique ID.
 * @param id - The scale's kebab-case identifier
 * @returns The scale definition, or undefined if not found
 */
export function getScale(id: string): ScaleDefinition | undefined {
  return scaleById.get(id);
}

/**
 * Get all scales belonging to a given family.
 * @param family - The scale family to filter by
 * @returns Array of matching scale definitions
 */
export function getScalesByFamily(family: ScaleFamily): ScaleDefinition[] {
  return SCALE_REGISTRY.filter((s) => s.family === family);
}

/**
 * Find a scale by one of its aliases (case-insensitive).
 * Also matches by primary name.
 * @param alias - The alias or name to search for
 * @returns The matching scale definition, or undefined
 */
export function getScaleByAlias(alias: string): ScaleDefinition | undefined {
  return scaleByAlias.get(alias.toLowerCase());
}

/**
 * Get all available scale family names.
 * @returns Array of all ScaleFamily values
 */
export function getAllScaleFamilies(): ScaleFamily[] {
  return [
    'diatonic',
    'melodic-minor',
    'harmonic-minor',
    'harmonic-major',
    'symmetric',
    'pentatonic',
    'blues',
    'bebop',
    'world',
  ];
}

/**
 * Search scales by name, alias, or tag (case-insensitive substring match).
 * @param query - Search string
 * @returns Array of matching scale definitions
 */
export function searchScales(query: string): ScaleDefinition[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return SCALE_REGISTRY.filter((scale) => {
    // Match name
    if (scale.name.toLowerCase().includes(q)) return true;
    // Match aliases
    if (scale.aliases.some((a) => a.toLowerCase().includes(q))) return true;
    // Match tags
    if (scale.tags.some((t) => t.toLowerCase().includes(q))) return true;
    // Match description
    if (scale.description.toLowerCase().includes(q)) return true;
    // Match ID
    if (scale.id.includes(q)) return true;
    return false;
  });
}
