/**
 * Progression Registry — comprehensive library of chord progressions
 * organized by family (jazz, blues, pop, classical) with roman numeral analysis.
 */

export type ProgressionFamily = 'jazz' | 'blues' | 'pop' | 'classical' | 'modal';
export type ProgressionDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type HarmonicFunction = 'tonic' | 'subdominant' | 'dominant' | 'predominant' | 'subtonic' | 'mediant';

export interface ProgressionStep {
  /** Roman numeral with quality, e.g. 'IVmaj7', 'ii7', 'V7' */
  romanNumeral: string;
  /** Harmonic function of this chord */
  function: HarmonicFunction;
  /** How many bars this chord lasts */
  bars: number;
}

export interface ProgressionDefinition {
  id: string;
  name: string;
  family: ProgressionFamily;
  difficulty: ProgressionDifficulty;
  steps: ProgressionStep[];
  description: string;
  tags: string[];
  totalBars: number;
}

// ---------------------------------------------------------------------------
// Jazz Progressions (12)
// ---------------------------------------------------------------------------

const jazzProgressions: ProgressionDefinition[] = [
  {
    id: 'ii-V-I-major',
    name: 'ii-V-I Major',
    family: 'jazz',
    difficulty: 'beginner',
    steps: [
      { romanNumeral: 'ii7', function: 'predominant', bars: 1 },
      { romanNumeral: 'V7', function: 'dominant', bars: 1 },
      { romanNumeral: 'Imaj7', function: 'tonic', bars: 2 },
    ],
    description: 'The most fundamental jazz progression. Dm7→G7→Cmaj7 in C major.',
    tags: ['essential', 'cadence', 'bebop', 'standard'],
    totalBars: 4,
  },
  {
    id: 'ii-V-i-minor',
    name: 'ii-V-i Minor',
    family: 'jazz',
    difficulty: 'intermediate',
    steps: [
      { romanNumeral: 'iiø7', function: 'predominant', bars: 1 },
      { romanNumeral: 'V7b9', function: 'dominant', bars: 1 },
      { romanNumeral: 'i(maj7)', function: 'tonic', bars: 2 },
    ],
    description: 'Minor key ii-V-i. Dm7b5→G7b9→Cm(maj7) in C minor.',
    tags: ['essential', 'minor', 'cadence', 'bebop'],
    totalBars: 4,
  },
  {
    id: 'I-vi-ii-V',
    name: 'I-vi-ii-V Turnaround',
    family: 'jazz',
    difficulty: 'beginner',
    steps: [
      { romanNumeral: 'Imaj7', function: 'tonic', bars: 1 },
      { romanNumeral: 'vi7', function: 'tonic', bars: 1 },
      { romanNumeral: 'ii7', function: 'predominant', bars: 1 },
      { romanNumeral: 'V7', function: 'dominant', bars: 1 },
    ],
    description: 'Standard turnaround. Cmaj7→Am7→Dm7→G7. Used to cycle back to the top.',
    tags: ['turnaround', 'essential', 'standard'],
    totalBars: 4,
  },
  {
    id: 'iii-vi-ii-V',
    name: 'iii-vi-ii-V Full Turnaround',
    family: 'jazz',
    difficulty: 'intermediate',
    steps: [
      { romanNumeral: 'iii7', function: 'tonic', bars: 1 },
      { romanNumeral: 'vi7', function: 'tonic', bars: 1 },
      { romanNumeral: 'ii7', function: 'predominant', bars: 1 },
      { romanNumeral: 'V7', function: 'dominant', bars: 1 },
    ],
    description: 'Extended turnaround starting from iii. Em7→Am7→Dm7→G7. Circle of fifths motion.',
    tags: ['turnaround', 'circle-of-fifths', 'standard'],
    totalBars: 4,
  },
  {
    id: 'tritone-sub-ii-V',
    name: 'Tritone Substitution ii-V',
    family: 'jazz',
    difficulty: 'advanced',
    steps: [
      { romanNumeral: 'ii7', function: 'predominant', bars: 1 },
      { romanNumeral: 'bII7', function: 'dominant', bars: 1 },
      { romanNumeral: 'Imaj7', function: 'tonic', bars: 2 },
    ],
    description: 'Tritone sub replaces V7. Dm7→Db7→Cmaj7. Creates chromatic bass motion.',
    tags: ['tritone-sub', 'chromatic', 'bebop', 'reharmonization'],
    totalBars: 4,
  },
  {
    id: 'backdoor-ii-V',
    name: 'Backdoor ii-V',
    family: 'jazz',
    difficulty: 'advanced',
    steps: [
      { romanNumeral: 'iv7', function: 'subdominant', bars: 1 },
      { romanNumeral: 'bVII7', function: 'dominant', bars: 1 },
      { romanNumeral: 'Imaj7', function: 'tonic', bars: 2 },
    ],
    description: 'Backdoor dominant approach. Fm7→Bb7→Cmaj7. Borrowed from the parallel minor.',
    tags: ['backdoor', 'modal-interchange', 'bebop'],
    totalBars: 4,
  },
  {
    id: 'tadd-dameron',
    name: 'Tadd Dameron Turnaround',
    family: 'jazz',
    difficulty: 'advanced',
    steps: [
      { romanNumeral: 'Imaj7', function: 'tonic', bars: 1 },
      { romanNumeral: 'bVImaj7', function: 'subdominant', bars: 1 },
      { romanNumeral: 'bII7', function: 'dominant', bars: 1 },
      { romanNumeral: 'Imaj7', function: 'tonic', bars: 1 },
    ],
    description: 'Chromatic turnaround by Tadd Dameron. Cmaj7→Abmaj7→Db7→Cmaj7.',
    tags: ['turnaround', 'chromatic', 'bebop', 'reharmonization'],
    totalBars: 4,
  },
  {
    id: 'ladybird',
    name: 'Lady Bird Turnaround',
    family: 'jazz',
    difficulty: 'advanced',
    steps: [
      { romanNumeral: 'Imaj7', function: 'tonic', bars: 1 },
      { romanNumeral: 'bIIImaj7', function: 'tonic', bars: 1 },
      { romanNumeral: 'bVImaj7', function: 'subdominant', bars: 1 },
      { romanNumeral: 'bII7', function: 'dominant', bars: 1 },
    ],
    description: 'Lady Bird turnaround by Tadd Dameron. Cmaj7→Ebmaj7→Abmaj7→Db7. Major third cycle.',
    tags: ['turnaround', 'chromatic', 'major-thirds', 'coltrane'],
    totalBars: 4,
  },
  {
    id: 'coltrane-changes',
    name: 'Coltrane Changes',
    family: 'jazz',
    difficulty: 'advanced',
    steps: [
      { romanNumeral: 'Imaj7', function: 'tonic', bars: 1 },
      { romanNumeral: 'V7/bVI', function: 'dominant', bars: 1 },
      { romanNumeral: 'bVImaj7', function: 'tonic', bars: 1 },
      { romanNumeral: 'V7/bIII', function: 'dominant', bars: 1 },
      { romanNumeral: 'bIIImaj7', function: 'tonic', bars: 1 },
      { romanNumeral: 'V7/I', function: 'dominant', bars: 1 },
    ],
    description: 'Partial Coltrane changes (major third cycle). Bmaj7→D7→Gmaj7→Bb7→Ebmaj7→F#7.',
    tags: ['coltrane', 'major-thirds', 'chromatic', 'giant-steps'],
    totalBars: 6,
  },
  {
    id: 'rhythm-changes-a',
    name: 'Rhythm Changes (A Section)',
    family: 'jazz',
    difficulty: 'intermediate',
    steps: [
      { romanNumeral: 'Imaj7', function: 'tonic', bars: 1 },
      { romanNumeral: 'vi7', function: 'tonic', bars: 1 },
      { romanNumeral: 'ii7', function: 'predominant', bars: 1 },
      { romanNumeral: 'V7', function: 'dominant', bars: 1 },
      { romanNumeral: 'iii7', function: 'tonic', bars: 1 },
      { romanNumeral: 'vi7', function: 'tonic', bars: 1 },
      { romanNumeral: 'ii7', function: 'predominant', bars: 1 },
      { romanNumeral: 'V7', function: 'dominant', bars: 1 },
    ],
    description: 'A section of rhythm changes (I Got Rhythm). Bbmaj7→Gm7→Cm7→F7→Dm7→Gm7→Cm7→F7.',
    tags: ['rhythm-changes', 'standard', 'bebop', 'contrafact'],
    totalBars: 8,
  },
  {
    id: 'montgomery-ward',
    name: 'Montgomery Ward (Dominant Cycle)',
    family: 'jazz',
    difficulty: 'intermediate',
    steps: [
      { romanNumeral: 'III7', function: 'dominant', bars: 1 },
      { romanNumeral: 'VI7', function: 'dominant', bars: 1 },
      { romanNumeral: 'II7', function: 'dominant', bars: 1 },
      { romanNumeral: 'V7', function: 'dominant', bars: 1 },
    ],
    description: 'Cycle of dominant 7ths (bridge pattern). E7→A7→D7→G7. Each chord is V7 of the next.',
    tags: ['dominant-cycle', 'bridge', 'secondary-dominants'],
    totalBars: 4,
  },
  {
    id: 'chromatic-line-cliche',
    name: 'Chromatic Line Cliché',
    family: 'jazz',
    difficulty: 'intermediate',
    steps: [
      { romanNumeral: 'i', function: 'tonic', bars: 1 },
      { romanNumeral: 'i(maj7)', function: 'tonic', bars: 1 },
      { romanNumeral: 'i7', function: 'tonic', bars: 1 },
      { romanNumeral: 'i6', function: 'tonic', bars: 1 },
    ],
    description: 'Descending chromatic inner voice over static minor chord. Cm→Cm(maj7)→Cm7→Cm6.',
    tags: ['chromatic', 'inner-voice', 'minor', 'line-cliche'],
    totalBars: 4,
  },
  {
    id: 'bird-changes',
    name: 'Bird Changes',
    family: 'jazz',
    difficulty: 'advanced',
    steps: [
      { romanNumeral: 'Imaj7', function: 'tonic', bars: 1 },
      { romanNumeral: '#ivø7', function: 'predominant', bars: 1 },
      { romanNumeral: 'VII7', function: 'dominant', bars: 1 },
      { romanNumeral: 'iiim7', function: 'tonic', bars: 1 },
      { romanNumeral: 'VI7', function: 'dominant', bars: 1 },
      { romanNumeral: 'iim7', function: 'predominant', bars: 1 },
      { romanNumeral: 'V7', function: 'dominant', bars: 1 },
      { romanNumeral: 'Imaj7', function: 'tonic', bars: 1 },
    ],
    description: 'Bebop turnaround with secondary dominants',
    tags: ['jazz', 'bebop', 'turnaround', 'advanced'],
    totalBars: 8,
  },
];

// ---------------------------------------------------------------------------
// Blues Progressions (4)
// ---------------------------------------------------------------------------

const bluesProgressions: ProgressionDefinition[] = [
  {
    id: '12-bar-blues',
    name: '12-Bar Blues',
    family: 'blues',
    difficulty: 'beginner',
    steps: [
      { romanNumeral: 'I7', function: 'tonic', bars: 4 },
      { romanNumeral: 'IV7', function: 'subdominant', bars: 2 },
      { romanNumeral: 'I7', function: 'tonic', bars: 2 },
      { romanNumeral: 'V7', function: 'dominant', bars: 1 },
      { romanNumeral: 'IV7', function: 'subdominant', bars: 1 },
      { romanNumeral: 'I7', function: 'tonic', bars: 1 },
      { romanNumeral: 'V7', function: 'dominant', bars: 1 },
    ],
    description: 'Standard 12-bar blues. The foundation of blues, rock, and early jazz.',
    tags: ['essential', 'blues-form', '12-bar'],
    totalBars: 12,
  },
  {
    id: 'jazz-blues',
    name: 'Jazz Blues',
    family: 'blues',
    difficulty: 'intermediate',
    steps: [
      { romanNumeral: 'I7', function: 'tonic', bars: 1 },
      { romanNumeral: 'IV7', function: 'subdominant', bars: 1 },
      { romanNumeral: 'I7', function: 'tonic', bars: 1 },
      { romanNumeral: 'I7', function: 'tonic', bars: 1 },
      { romanNumeral: 'IV7', function: 'subdominant', bars: 1 },
      { romanNumeral: '#ivdim7', function: 'predominant', bars: 1 },
      { romanNumeral: 'I7', function: 'tonic', bars: 1 },
      { romanNumeral: 'vi7', function: 'tonic', bars: 1 },
      { romanNumeral: 'ii7', function: 'predominant', bars: 1 },
      { romanNumeral: 'V7', function: 'dominant', bars: 1 },
      { romanNumeral: 'I7', function: 'tonic', bars: 1 },
      { romanNumeral: 'V7', function: 'dominant', bars: 1 },
    ],
    description: 'Jazz blues with added ii-V motion, #ivdim passing chord, and turnaround.',
    tags: ['blues-form', 'jazz', '12-bar', 'bebop'],
    totalBars: 12,
  },
  {
    id: 'minor-blues',
    name: 'Minor Blues',
    family: 'blues',
    difficulty: 'intermediate',
    steps: [
      { romanNumeral: 'i7', function: 'tonic', bars: 4 },
      { romanNumeral: 'iv7', function: 'subdominant', bars: 2 },
      { romanNumeral: 'i7', function: 'tonic', bars: 2 },
      { romanNumeral: 'bVI7', function: 'subdominant', bars: 1 },
      { romanNumeral: 'V7', function: 'dominant', bars: 1 },
      { romanNumeral: 'i7', function: 'tonic', bars: 1 },
      { romanNumeral: 'V7', function: 'dominant', bars: 1 },
    ],
    description: 'Minor blues form. Uses bVI7 as a subdominant substitute. Darker, moodier feel.',
    tags: ['blues-form', 'minor', '12-bar'],
    totalBars: 12,
  },
  {
    id: '8-bar-blues',
    name: '8-Bar Blues',
    family: 'blues',
    difficulty: 'beginner',
    steps: [
      { romanNumeral: 'I', function: 'tonic', bars: 1 },
      { romanNumeral: 'V', function: 'dominant', bars: 1 },
      { romanNumeral: 'IV', function: 'subdominant', bars: 1 },
      { romanNumeral: 'IV', function: 'subdominant', bars: 1 },
      { romanNumeral: 'I', function: 'tonic', bars: 1 },
      { romanNumeral: 'V', function: 'dominant', bars: 1 },
      { romanNumeral: 'I', function: 'tonic', bars: 1 },
      { romanNumeral: 'V', function: 'dominant', bars: 1 },
    ],
    description: 'Compact 8-bar blues form. Used in "Heartbreak Hotel", "How Long Blues", etc.',
    tags: ['blues-form', '8-bar', 'compact'],
    totalBars: 8,
  },
  {
    id: 'bird-blues',
    name: 'Bird Blues',
    family: 'blues',
    difficulty: 'advanced',
    steps: [
      { romanNumeral: 'Imaj7', function: 'tonic', bars: 1 },
      { romanNumeral: 'bII7', function: 'dominant', bars: 1 },
      { romanNumeral: 'I7', function: 'tonic', bars: 1 },
      { romanNumeral: '#ivø7', function: 'predominant', bars: 1 },
      { romanNumeral: 'VII7', function: 'dominant', bars: 1 },
      { romanNumeral: 'iiim7', function: 'tonic', bars: 1 },
      { romanNumeral: 'VI7', function: 'dominant', bars: 1 },
      { romanNumeral: 'iim7', function: 'predominant', bars: 1 },
      { romanNumeral: 'V7', function: 'dominant', bars: 1 },
      { romanNumeral: 'iiim7', function: 'tonic', bars: 1 },
      { romanNumeral: 'VI7', function: 'dominant', bars: 1 },
      { romanNumeral: 'iim7', function: 'predominant', bars: 1 },
      { romanNumeral: 'V7', function: 'dominant', bars: 1 },
    ],
    description: 'Charlie Parker\'s bebop reharmonization of the 12-bar blues with Bird Changes substitutions.',
    tags: ['blues', 'jazz', 'bebop', 'advanced'],
    totalBars: 13,
  },
];

// ---------------------------------------------------------------------------
// Pop/Rock Progressions (8)
// ---------------------------------------------------------------------------

const popProgressions: ProgressionDefinition[] = [
  {
    id: 'I-V-vi-IV',
    name: 'I-V-vi-IV',
    family: 'pop',
    difficulty: 'beginner',
    steps: [
      { romanNumeral: 'I', function: 'tonic', bars: 1 },
      { romanNumeral: 'V', function: 'dominant', bars: 1 },
      { romanNumeral: 'vi', function: 'tonic', bars: 1 },
      { romanNumeral: 'IV', function: 'subdominant', bars: 1 },
    ],
    description: 'The most common pop progression. C→G→Am→F. Used in countless hits.',
    tags: ['essential', 'pop', 'ubiquitous', 'four-chord'],
    totalBars: 4,
  },
  {
    id: 'I-IV-V-I',
    name: 'I-IV-V-I',
    family: 'pop',
    difficulty: 'beginner',
    steps: [
      { romanNumeral: 'I', function: 'tonic', bars: 1 },
      { romanNumeral: 'IV', function: 'subdominant', bars: 1 },
      { romanNumeral: 'V', function: 'dominant', bars: 1 },
      { romanNumeral: 'I', function: 'tonic', bars: 1 },
    ],
    description: 'Basic three-chord progression. C→F→G→C. The backbone of rock and folk.',
    tags: ['essential', 'rock', 'folk', 'three-chord'],
    totalBars: 4,
  },
  {
    id: 'vi-IV-I-V',
    name: 'vi-IV-I-V',
    family: 'pop',
    difficulty: 'beginner',
    steps: [
      { romanNumeral: 'vi', function: 'tonic', bars: 1 },
      { romanNumeral: 'IV', function: 'subdominant', bars: 1 },
      { romanNumeral: 'I', function: 'tonic', bars: 1 },
      { romanNumeral: 'V', function: 'dominant', bars: 1 },
    ],
    description: 'Minor-starting rotation of the four-chord progression. Am→F→C→G.',
    tags: ['pop', 'minor-start', 'four-chord'],
    totalBars: 4,
  },
  {
    id: 'I-bVII-IV',
    name: 'I-♭VII-IV (Rock)',
    family: 'pop',
    difficulty: 'intermediate',
    steps: [
      { romanNumeral: 'I', function: 'tonic', bars: 1 },
      { romanNumeral: 'bVII', function: 'subtonic', bars: 1 },
      { romanNumeral: 'IV', function: 'subdominant', bars: 1 },
      { romanNumeral: 'I', function: 'tonic', bars: 1 },
    ],
    description: 'Mixolydian rock progression. C→Bb→F→C. Borrowed bVII from the parallel minor.',
    tags: ['rock', 'mixolydian', 'modal-interchange'],
    totalBars: 4,
  },
  {
    id: '50s-doo-wop',
    name: '50s Doo-Wop',
    family: 'pop',
    difficulty: 'beginner',
    steps: [
      { romanNumeral: 'I', function: 'tonic', bars: 1 },
      { romanNumeral: 'vi', function: 'tonic', bars: 1 },
      { romanNumeral: 'IV', function: 'subdominant', bars: 1 },
      { romanNumeral: 'V', function: 'dominant', bars: 1 },
    ],
    description: 'Classic 1950s doo-wop progression. I→vi→IV→V. "Stand By Me", "Earth Angel".',
    tags: ['doo-wop', '50s', 'classic', 'four-chord'],
    totalBars: 4,
  },
  {
    id: 'andalusian-cadence',
    name: 'Andalusian Cadence',
    family: 'pop',
    difficulty: 'intermediate',
    steps: [
      { romanNumeral: 'i', function: 'tonic', bars: 1 },
      { romanNumeral: 'bVII', function: 'subtonic', bars: 1 },
      { romanNumeral: 'bVI', function: 'subdominant', bars: 1 },
      { romanNumeral: 'V', function: 'dominant', bars: 1 },
    ],
    description: 'Descending Andalusian cadence. Am→G→F→E. Flamenco and Mediterranean feel.',
    tags: ['flamenco', 'spanish', 'descending', 'minor'],
    totalBars: 4,
  },
  {
    id: 'royal-road-jpop',
    name: 'Royal Road (J-Pop)',
    family: 'pop',
    difficulty: 'intermediate',
    steps: [
      { romanNumeral: 'IV', function: 'subdominant', bars: 1 },
      { romanNumeral: 'V', function: 'dominant', bars: 1 },
      { romanNumeral: 'iii', function: 'tonic', bars: 1 },
      { romanNumeral: 'vi', function: 'tonic', bars: 1 },
    ],
    description: 'The "Royal Road" progression in J-Pop. IV→V→iii→vi (F→G→Em→Am in C).',
    tags: ['jpop', 'anime', 'japanese', 'emotional'],
    totalBars: 4,
  },
  {
    id: 'pachelbel-canon',
    name: 'Pachelbel Canon',
    family: 'pop',
    difficulty: 'intermediate',
    steps: [
      { romanNumeral: 'I', function: 'tonic', bars: 1 },
      { romanNumeral: 'V', function: 'dominant', bars: 1 },
      { romanNumeral: 'vi', function: 'tonic', bars: 1 },
      { romanNumeral: 'iii', function: 'tonic', bars: 1 },
      { romanNumeral: 'IV', function: 'subdominant', bars: 1 },
      { romanNumeral: 'I', function: 'tonic', bars: 1 },
      { romanNumeral: 'IV', function: 'subdominant', bars: 1 },
      { romanNumeral: 'V', function: 'dominant', bars: 1 },
    ],
    description: 'Pachelbel\'s Canon progression. I→V→vi→iii→IV→I→IV→V. Descending bass line.',
    tags: ['classical', 'canon', 'descending-bass', 'wedding'],
    totalBars: 8,
  },
];

// ---------------------------------------------------------------------------
// Classical Cadences (7)
// ---------------------------------------------------------------------------

const classicalProgressions: ProgressionDefinition[] = [
  {
    id: 'perfect-authentic',
    name: 'Perfect Authentic Cadence',
    family: 'classical',
    difficulty: 'beginner',
    steps: [
      { romanNumeral: 'V', function: 'dominant', bars: 1 },
      { romanNumeral: 'I', function: 'tonic', bars: 1 },
    ],
    description: 'V→I with both chords in root position and tonic in soprano. Strongest resolution.',
    tags: ['cadence', 'authentic', 'resolution', 'essential'],
    totalBars: 2,
  },
  {
    id: 'imperfect-authentic',
    name: 'Imperfect Authentic Cadence',
    family: 'classical',
    difficulty: 'intermediate',
    steps: [
      { romanNumeral: 'V', function: 'dominant', bars: 1 },
      { romanNumeral: 'I6', function: 'tonic', bars: 1 },
    ],
    description: 'V→I with I in first inversion or non-tonic soprano. Weaker resolution than PAC.',
    tags: ['cadence', 'authentic', 'inversion'],
    totalBars: 2,
  },
  {
    id: 'half-cadence',
    name: 'Half Cadence',
    family: 'classical',
    difficulty: 'beginner',
    steps: [
      { romanNumeral: 'I', function: 'tonic', bars: 1 },
      { romanNumeral: 'V', function: 'dominant', bars: 1 },
    ],
    description: 'I→V. Ends on the dominant, creating an open, unresolved feeling.',
    tags: ['cadence', 'half', 'open', 'unresolved'],
    totalBars: 2,
  },
  {
    id: 'plagal',
    name: 'Plagal Cadence',
    family: 'classical',
    difficulty: 'beginner',
    steps: [
      { romanNumeral: 'IV', function: 'subdominant', bars: 1 },
      { romanNumeral: 'I', function: 'tonic', bars: 1 },
    ],
    description: 'IV→I. The "Amen" cadence. Gentle, hymn-like resolution.',
    tags: ['cadence', 'plagal', 'amen', 'church'],
    totalBars: 2,
  },
  {
    id: 'deceptive',
    name: 'Deceptive Cadence',
    family: 'classical',
    difficulty: 'intermediate',
    steps: [
      { romanNumeral: 'V', function: 'dominant', bars: 1 },
      { romanNumeral: 'vi', function: 'tonic', bars: 1 },
    ],
    description: 'V→vi. Dominant resolves to vi instead of I. Surprises the listener.',
    tags: ['cadence', 'deceptive', 'surprise', 'evaded'],
    totalBars: 2,
  },
  {
    id: 'phrygian-half',
    name: 'Phrygian Half Cadence',
    family: 'classical',
    difficulty: 'intermediate',
    steps: [
      { romanNumeral: 'iv6', function: 'subdominant', bars: 1 },
      { romanNumeral: 'V', function: 'dominant', bars: 1 },
    ],
    description: 'iv6→V in minor. Half-step bass motion (♭6→5). Common in Baroque minor keys.',
    tags: ['cadence', 'phrygian', 'minor', 'baroque'],
    totalBars: 2,
  },
  {
    id: 'picardy-third',
    name: 'Picardy Third',
    family: 'classical',
    difficulty: 'intermediate',
    steps: [
      { romanNumeral: 'v', function: 'dominant', bars: 1 },
      { romanNumeral: 'I', function: 'tonic', bars: 1 },
    ],
    description: 'Minor piece ending on a major I chord. The raised third creates warmth and light.',
    tags: ['cadence', 'picardy', 'minor-to-major', 'baroque'],
    totalBars: 2,
  },
];

// ---------------------------------------------------------------------------
// All Progressions
// ---------------------------------------------------------------------------

/** Complete registry of all progression definitions */
export const PROGRESSION_REGISTRY: readonly ProgressionDefinition[] = [
  ...jazzProgressions,
  ...bluesProgressions,
  ...popProgressions,
  ...classicalProgressions,
];

/** O(1) lookup of progressions by ID */
export const progressionById: ReadonlyMap<string, ProgressionDefinition> = new Map(
  PROGRESSION_REGISTRY.map((p) => [p.id, p]),
);

// ---------------------------------------------------------------------------
// Lookup Functions
// ---------------------------------------------------------------------------

/**
 * Get a progression by its unique ID.
 * @param id - The progression identifier (e.g. 'ii-V-I-major')
 * @returns The matching ProgressionDefinition or undefined
 */
export function getProgression(id: string): ProgressionDefinition | undefined {
  return PROGRESSION_REGISTRY.find((p) => p.id === id);
}

/**
 * Get all progressions belonging to a family.
 * @param family - The family to filter by ('jazz', 'blues', 'pop', 'classical', 'modal')
 * @returns Array of matching ProgressionDefinitions
 */
export function getProgressionsByFamily(family: ProgressionFamily): ProgressionDefinition[] {
  return PROGRESSION_REGISTRY.filter((p) => p.family === family);
}

/**
 * Get all progressions at a given difficulty level.
 * @param difficulty - 'beginner', 'intermediate', or 'advanced'
 * @returns Array of matching ProgressionDefinitions
 */
export function getProgressionsByDifficulty(difficulty: ProgressionDifficulty): ProgressionDefinition[] {
  return PROGRESSION_REGISTRY.filter((p) => p.difficulty === difficulty);
}

/**
 * Search progressions by query string. Matches against id, name, description, and tags.
 * @param query - Case-insensitive search string
 * @returns Array of matching ProgressionDefinitions
 */
export function searchProgressions(query: string): ProgressionDefinition[] {
  const q = query.toLowerCase();
  return PROGRESSION_REGISTRY.filter((p) => {
    return (
      p.id.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });
}
