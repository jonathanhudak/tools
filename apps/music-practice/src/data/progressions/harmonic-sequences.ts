/**
 * Harmonic Sequences — patterns of sequential harmonic motion,
 * including diatonic/chromatic sequences and modulation techniques.
 */

export interface HarmonicSequence {
  id: string;
  name: string;
  description: string;
  /** Describes the sequential motion pattern */
  pattern: string;
  /** Concrete example in C */
  example: string;
  type: 'diatonic' | 'chromatic' | 'modulation';
  tags: string[];
}

// ---------------------------------------------------------------------------
// Diatonic & Chromatic Sequences
// ---------------------------------------------------------------------------

const sequences: HarmonicSequence[] = [
  {
    id: 'circle-of-fifths',
    name: 'Circle of Fifths',
    description: 'Each chord resolves down a fifth (up a fourth) to the next. The most natural diatonic sequence.',
    pattern: 'Root motion descending by fifths through diatonic chords',
    example: 'Em→Am→Dm→G→C (iii→vi→ii→V→I in C)',
    type: 'diatonic',
    tags: ['fifths', 'descending', 'fundamental', 'voice-leading'],
  },
  {
    id: 'circle-of-fourths',
    name: 'Circle of Fourths',
    description: 'Ascending fourths through the diatonic scale. Covers all seven diatonic chords.',
    pattern: 'Root motion ascending by fourths through all diatonic degrees',
    example: 'C→F→Bdim→Em→Am→Dm→G→C (I→IV→vii°→iii→vi→ii→V→I in C)',
    type: 'diatonic',
    tags: ['fourths', 'ascending', 'complete-cycle'],
  },
  {
    id: 'descending-chromatic-bass',
    name: 'Descending Chromatic Bass',
    description: 'Chromatic descending bass line under a sustained chord quality. Classic inner-voice motion.',
    pattern: 'Bass descends chromatically: root→maj7→m7→6',
    example: 'Cm→Cm(maj7)→Cm7→Cm6 (bass: C→B→Bb→A)',
    type: 'chromatic',
    tags: ['chromatic', 'bass-line', 'line-cliche', 'minor'],
  },
  {
    id: 'ascending-chromatic-bass',
    name: 'Ascending Chromatic Bass',
    description: 'Chromatic ascending bass line under a static harmony. Creates tension through pedal motion.',
    pattern: 'Bass ascends chromatically while upper structure stays fixed',
    example: 'C→C/Db→C/D→C/Eb (bass: C→Db→D→Eb)',
    type: 'chromatic',
    tags: ['chromatic', 'bass-line', 'ascending', 'pedal'],
  },
  {
    id: 'diatonic-planing',
    name: 'Diatonic Planing',
    description: 'Parallel chord motion following the diatonic scale. Chord quality changes to stay in key.',
    pattern: 'Chords move stepwise, adjusting quality to fit the key',
    example: 'Dm→Em→Fm→Gm (stepwise in C minor)',
    type: 'diatonic',
    tags: ['planing', 'parallel', 'impressionist', 'stepwise'],
  },
  {
    id: 'chromatic-planing',
    name: 'Chromatic Planing',
    description: 'Parallel chord motion in chromatic half-steps. Same chord quality maintained throughout.',
    pattern: 'Identical chord quality moves chromatically by half-step',
    example: 'Dm→Ebm→Em→Fm (chromatic minor triads)',
    type: 'chromatic',
    tags: ['planing', 'parallel', 'impressionist', 'chromatic'],
  },
  {
    id: 'cycle-minor-thirds',
    name: 'Cycle of Minor Thirds (Diminished Axis)',
    description: 'Root motion by minor thirds divides the octave into 4 equal parts. Related to diminished harmony.',
    pattern: 'Roots ascend by minor thirds: 3 semitones apart',
    example: 'C→Eb→Gb→A (4 equally-spaced roots, diminished axis)',
    type: 'chromatic',
    tags: ['minor-thirds', 'diminished', 'axis', 'symmetric'],
  },
  {
    id: 'cycle-major-thirds',
    name: 'Cycle of Major Thirds (Augmented Axis)',
    description: 'Root motion by major thirds divides the octave into 3 equal parts. Coltrane\'s signature harmonic device.',
    pattern: 'Roots ascend by major thirds: 4 semitones apart',
    example: 'C→E→Ab→C (3 equally-spaced roots, augmented axis)',
    type: 'chromatic',
    tags: ['major-thirds', 'augmented', 'coltrane', 'symmetric', 'giant-steps'],
  },
];

// ---------------------------------------------------------------------------
// Modulation Techniques
// ---------------------------------------------------------------------------

const modulationTypes: HarmonicSequence[] = [
  {
    id: 'pivot-chord',
    name: 'Pivot Chord Modulation',
    description: 'A chord common to both keys serves as a pivot point. The smoothest, most traditional modulation technique.',
    pattern: 'Chord reinterpreted: old-key function → new-key function',
    example: 'C major → G major: Am (vi in C = ii in G) → D7 → G',
    type: 'modulation',
    tags: ['modulation', 'pivot', 'common-chord', 'smooth'],
  },
  {
    id: 'ii-V-to-new-key',
    name: 'ii-V to New Key',
    description: 'Approach any new key with its ii-V. The most common jazz modulation technique.',
    pattern: 'ii7→V7 of the target key inserted before the new tonic',
    example: 'C major → Eb major: Fm7→Bb7→Ebmaj7',
    type: 'modulation',
    tags: ['modulation', 'ii-V', 'jazz', 'approach'],
  },
  {
    id: 'tritone-sub-modulation',
    name: 'Tritone Substitution Modulation',
    description: 'Use a tritone substitute dominant (bII7) to approach the new key. Creates chromatic bass motion into the target.',
    pattern: 'bII7 of target key resolves down by half-step to new tonic',
    example: 'C major → Eb major: E7 (bII7/Eb) → Ebmaj7',
    type: 'modulation',
    tags: ['modulation', 'tritone-sub', 'chromatic', 'jazz'],
  },
  {
    id: 'common-tone',
    name: 'Common Tone Modulation',
    description: 'A single sustained note shared between the old and new key anchors the modulation. Elegant and subtle.',
    pattern: 'Shared pitch held while harmony shifts to the new key',
    example: 'Cmaj7 → Amaj7 (shared note: E, the 3rd of C = 5th of A)',
    type: 'modulation',
    tags: ['modulation', 'common-tone', 'sustained', 'romantic'],
  },
  {
    id: 'chromatic-mediant',
    name: 'Chromatic Mediant Modulation',
    description: 'Modulation by a major or minor third. Creates a dramatic, cinematic color shift.',
    pattern: 'Root moves by major 3rd (4 semitones) or minor 3rd (3 semitones)',
    example: 'C major → E major (up major 3rd) or C major → Ab major (down major 3rd)',
    type: 'modulation',
    tags: ['modulation', 'mediant', 'chromatic', 'cinematic', 'film-score'],
  },
  {
    id: 'direct-modulation',
    name: 'Direct (Abrupt) Modulation',
    description: 'Immediate key change with no preparation. Often used for dramatic effect, especially up a half-step or whole-step.',
    pattern: 'No transitional chords — jump directly to the new key',
    example: 'C major → Db major (truck driver modulation, up a half-step)',
    type: 'modulation',
    tags: ['modulation', 'direct', 'abrupt', 'truck-driver', 'dramatic'],
  },
];

// ---------------------------------------------------------------------------
// All Sequences
// ---------------------------------------------------------------------------

/** Complete registry of all harmonic sequences and modulation types */
export const ALL_SEQUENCES: HarmonicSequence[] = [
  ...sequences,
  ...modulationTypes,
];

// ---------------------------------------------------------------------------
// Lookup Functions
// ---------------------------------------------------------------------------

/**
 * Get a harmonic sequence by its unique ID.
 * @param id - The sequence identifier (e.g. 'circle-of-fifths', 'pivot-chord')
 * @returns The matching HarmonicSequence or undefined
 */
export function getSequence(id: string): HarmonicSequence | undefined {
  return ALL_SEQUENCES.find((s) => s.id === id);
}

/**
 * Get all sequences of a given type.
 * @param type - 'diatonic', 'chromatic', or 'modulation'
 * @returns Array of matching HarmonicSequences
 */
export function getSequencesByType(type: HarmonicSequence['type']): HarmonicSequence[] {
  return ALL_SEQUENCES.filter((s) => s.type === type);
}
