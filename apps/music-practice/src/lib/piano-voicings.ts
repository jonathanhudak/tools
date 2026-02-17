/**
 * Comprehensive Piano Voicing Library - Phase 2-4
 * 180 Piano Voicings (100 Intermediate + 80 Jazz)
 *
 * MIDI Note Reference:
 * C3=36, D3=38, E3=40, F3=41, G3=43, A3=45, B3=47
 * C4=60, D4=62, E4=64, F4=65, G4=67, A4=69, B4=71
 * C5=72, D5=74, E5=76, F5=77, G5=79, A5=81, B5=83
 * C6=84
 */

export interface PianoVoicing {
  voicingName: string;
  notes: number[]; // MIDI note numbers
  octaveRange: { start: number; end: number };
  description: string;
}

// ============================================================================
// TEMPLATE GENERATORS - Reusable voicing construction patterns
// ============================================================================

/**
 * Helper: Build MIDI note from root (C=0, C#=1, ..., B=11) and octave
 */
function buildNote(semitones: number, octave: number): number {
  return 12 + octave * 12 + semitones;
}

/**
 * Generate extended chord voicings for root position + inversions
 */
function generateExtendedVoicings(
  root: number, // 0-11 (C-B)
  rootName: string,
  intervals: { name: string; semitones: number }[],
  chordType: string
): PianoVoicing[] {
  const voicings: PianoVoicing[] = [];

  // Root position voicing
  const noteNames = intervals.map(i => i.name);
  voicings.push({
    voicingName: `${rootName}${chordType} - Root Position`,
    notes: intervals.map(i => buildNote(root + i.semitones, 4)),
    octaveRange: { start: 4, end: 4 },
    description: `${rootName} root position: ${noteNames.join(', ')}`,
  });

  // First inversion (3rd in bass)
  const firstInvNotes = [intervals[1], ...intervals.slice(0, 1), ...intervals.slice(2)];
  voicings.push({
    voicingName: `${rootName}${chordType} - First Inversion (3rd in bass)`,
    notes: [
      buildNote(root + firstInvNotes[0].semitones, 3),
      ...firstInvNotes.slice(1).map(i => buildNote(root + i.semitones, 4)),
    ],
    octaveRange: { start: 3, end: 4 },
    description: `First inversion, bass at 3rd`,
  });

  // Jazz voicing (upper structure)
  const jazzNotes = intervals.filter((_, i) => i !== 0 || i > 4).map(i => buildNote(root + i.semitones, 4));
  voicings.push({
    voicingName: `${rootName}${chordType} - Jazz Upper Structure`,
    notes: jazzNotes.length > 0 ? jazzNotes : intervals.map(i => buildNote(root + i.semitones, 4)),
    octaveRange: { start: 4, end: 5 },
    description: `Upper structure voicing, no root`,
  });

  return voicings;
}

/**
 * Generate shell voicings (root, 3rd, 7th foundation)
 */
function generateShellVoicings(
  root: number,
  rootName: string,
  isMajor7 = false
): PianoVoicing[] {
  const voicings: PianoVoicing[] = [];
  const seventh = isMajor7 ? 11 : 10; // Major 7th or minor 7th

  // Shell voicing - tight
  voicings.push({
    voicingName: `${rootName}7 - Shell Voicing (Tight)`,
    notes: [
      buildNote(root, 3), // Root
      buildNote(root + 4, 4), // 3rd
      buildNote(root + seventh, 4), // 7th
    ],
    octaveRange: { start: 3, end: 4 },
    description: `Shell: root, 3rd, 7th - tight voicing`,
  });

  // Shell voicing - spread
  voicings.push({
    voicingName: `${rootName}7 - Shell Voicing (Spread)`,
    notes: [
      buildNote(root, 3), // Root (left hand)
      buildNote(root + 4, 4), // 3rd (right hand)
      buildNote(root + seventh, 4), // 7th (right hand)
    ],
    octaveRange: { start: 3, end: 4 },
    description: `Shell: root in left, 3rd-7th in right`,
  });

  // Shell voicing - drop 2
  voicings.push({
    voicingName: `${rootName}7 - Shell Voicing (Drop 2)`,
    notes: [
      buildNote(root, 3), // Root
      buildNote(root + seventh, 3), // 7th
      buildNote(root + 4, 4), // 3rd
    ],
    octaveRange: { start: 3, end: 4 },
    description: `Shell drop 2: shifted 7th down`,
  });

  return voicings;
}

/**
 * Generate upper structure triads (chord tones without root/5th)
 */
function generateUpperStructures(
  root: number,
  rootName: string,
  baseChordName: string,
  omitRoot = true
): PianoVoicing[] {
  const voicings: PianoVoicing[] = [];

  // Upper structure without root (jazz style)
  voicings.push({
    voicingName: `${rootName}${baseChordName} - Upper Structure`,
    notes: [
      buildNote(root + 4, 4), // 3rd
      buildNote(root + 7, 4), // 5th
      buildNote(root + 11, 4), // 7th
    ],
    octaveRange: { start: 4, end: 4 },
    description: `Upper structure: 3rd, 5th, 7th (no root)`,
  });

  // Rootless voicing (left/right split)
  voicings.push({
    voicingName: `${rootName}${baseChordName} - Rootless (Spread)`,
    notes: [
      buildNote(root + 4, 3), // 3rd (left hand)
      buildNote(root + 7, 4), // 5th (right hand)
      buildNote(root + 11, 4), // 7th (right hand)
    ],
    octaveRange: { start: 3, end: 4 },
    description: `Rootless spread: 3rd in left, 5th-7th in right`,
  });

  // Tight rootless
  voicings.push({
    voicingName: `${rootName}${baseChordName} - Rootless (Tight)`,
    notes: [
      buildNote(root + 4, 4), // 3rd
      buildNote(root + 7, 4), // 5th
      buildNote(root + 11, 5), // 7th (higher)
    ],
    octaveRange: { start: 4, end: 5 },
    description: `Rootless tight: all in upper register`,
  });

  return voicings;
}

// ============================================================================
// INTERMEDIATE VOICINGS (100 chords)
// ============================================================================

function generateIntermediateVoicings(): Record<string, PianoVoicing[]> {
  const voicings: Record<string, PianoVoicing[]> = {};

  // Roots for all 12 chromatic pitches
  const roots = [
    { note: 0, name: 'C' },
    { note: 1, name: 'C#' },
    { note: 2, name: 'D' },
    { note: 3, name: 'Eb' },
    { note: 4, name: 'E' },
    { note: 5, name: 'F' },
    { note: 6, name: 'F#' },
    { note: 7, name: 'G' },
    { note: 8, name: 'Ab' },
    { note: 9, name: 'A' },
    { note: 10, name: 'Bb' },
    { note: 11, name: 'B' },
  ];

  // ========= EXTENDED 9TH CHORDS (Major 9) - 12 voicings ==========
  roots.forEach(({ note: root, name: rootName }) => {
    const key = `${rootName}maj9`;
    voicings[key] = [
      {
        voicingName: `${rootName}maj9 - Root Position`,
        notes: [
          buildNote(root, 4), // Root
          buildNote(root + 4, 4), // 3rd
          buildNote(root + 7, 4), // 5th
          buildNote(root + 11, 4), // Major 7th
          buildNote(root + 2, 5), // 9th
        ],
        octaveRange: { start: 4, end: 5 },
        description: `Major 9th chord: root, 3rd, 5th, 7th, 9th`,
      },
      {
        voicingName: `${rootName}maj9 - Jazz Voicing (No Root)`,
        notes: [
          buildNote(root + 4, 4), // 3rd
          buildNote(root + 11, 4), // 7th
          buildNote(root + 2, 5), // 9th
        ],
        octaveRange: { start: 4, end: 5 },
        description: `Jazz: 3rd, 7th, 9th (stripped)`,
      },
      {
        voicingName: `${rootName}maj9 - Open Spread`,
        notes: [
          buildNote(root, 3), // Root
          buildNote(root + 4, 4), // 3rd
          buildNote(root + 7, 4), // 5th
          buildNote(root + 2, 5), // 9th
        ],
        octaveRange: { start: 3, end: 5 },
        description: `Open: spread across octaves`,
      },
    ];
  });

  // ========= EXTENDED 11TH CHORDS (Dominant 11) - 12 voicings ==========
  roots.forEach(({ note: root, name: rootName }) => {
    const key = `${rootName}11`;
    voicings[key] = [
      {
        voicingName: `${rootName}11 - Root Position`,
        notes: [
          buildNote(root, 4), // Root
          buildNote(root + 4, 4), // 3rd
          buildNote(root + 7, 4), // 5th
          buildNote(root + 10, 4), // minor 7th
          buildNote(root + 2, 5), // 9th
          buildNote(root + 5, 5), // 11th
        ],
        octaveRange: { start: 4, end: 5 },
        description: `Dominant 11: root through 11th`,
      },
      {
        voicingName: `${rootName}11 - Shell + 9 + 11`,
        notes: [
          buildNote(root, 3), // Root
          buildNote(root + 4, 4), // 3rd
          buildNote(root + 10, 4), // 7th
          buildNote(root + 2, 5), // 9th
          buildNote(root + 5, 5), // 11th
        ],
        octaveRange: { start: 3, end: 5 },
        description: `Extended: shell + extensions`,
      },
      {
        voicingName: `${rootName}11 - Upper Structure`,
        notes: [
          buildNote(root + 4, 4), // 3rd
          buildNote(root + 10, 4), // 7th
          buildNote(root + 5, 5), // 11th
        ],
        octaveRange: { start: 4, end: 5 },
        description: `Upper: no root or 5th`,
      },
    ];
  });

  // ========= EXTENDED 13TH CHORDS (Dominant 13) - 12 voicings ==========
  roots.forEach(({ note: root, name: rootName }) => {
    const key = `${rootName}13`;
    voicings[key] = [
      {
        voicingName: `${rootName}13 - Root Position`,
        notes: [
          buildNote(root, 3), // Root
          buildNote(root + 4, 4), // 3rd
          buildNote(root + 7, 4), // 5th
          buildNote(root + 10, 4), // 7th
          buildNote(root + 2, 5), // 9th
          buildNote(root + 9, 5), // 13th
        ],
        octaveRange: { start: 3, end: 5 },
        description: `Dominant 13: root through 13th`,
      },
      {
        voicingName: `${rootName}13 - Jazz Voicing`,
        notes: [
          buildNote(root, 3), // Root
          buildNote(root + 4, 4), // 3rd
          buildNote(root + 10, 4), // 7th
          buildNote(root + 9, 5), // 13th
        ],
        octaveRange: { start: 3, end: 5 },
        description: `Jazz 13: root, 3rd, 7th, 13th`,
      },
      {
        voicingName: `${rootName}13 - Upper Structure`,
        notes: [
          buildNote(root + 4, 4), // 3rd
          buildNote(root + 10, 4), // 7th
          buildNote(root + 2, 5), // 9th
          buildNote(root + 9, 5), // 13th
        ],
        octaveRange: { start: 4, end: 5 },
        description: `Rootless 13: extensions only`,
      },
    ];
  });

  // ========= ALT DOMINANTS (Sharp 5/Flat 5) - 24 voicings ==========
  roots.forEach(({ note: root, name: rootName }) => {
    // Dominant 7#5
    const keyAug = `${rootName}7#5`;
    voicings[keyAug] = [
      {
        voicingName: `${rootName}7#5 - Shell Voicing`,
        notes: [
          buildNote(root, 3), // Root
          buildNote(root + 4, 4), // 3rd
          buildNote(root + 8, 4), // #5
          buildNote(root + 10, 4), // 7th
        ],
        octaveRange: { start: 3, end: 4 },
        description: `Augmented 7: #5 replaces 5th`,
      },
      {
        voicingName: `${rootName}7#5 - Upper Structure`,
        notes: [
          buildNote(root + 4, 4), // 3rd
          buildNote(root + 8, 4), // #5
          buildNote(root + 10, 4), // 7th
        ],
        octaveRange: { start: 4, end: 4 },
        description: `Upper: no root`,
      },
    ];

    // Dominant 7b5
    const keyDim = `${rootName}7b5`;
    voicings[keyDim] = [
      {
        voicingName: `${rootName}7b5 - Shell Voicing`,
        notes: [
          buildNote(root, 3), // Root
          buildNote(root + 4, 4), // 3rd
          buildNote(root + 6, 4), // b5
          buildNote(root + 10, 4), // 7th
        ],
        octaveRange: { start: 3, end: 4 },
        description: `Diminished 7: b5 replaces 5th`,
      },
      {
        voicingName: `${rootName}7b5 - Upper Structure`,
        notes: [
          buildNote(root + 4, 4), // 3rd
          buildNote(root + 6, 4), // b5
          buildNote(root + 10, 4), // 7th
        ],
        octaveRange: { start: 4, end: 4 },
        description: `Upper: tense, tritone emphasis`,
      },
    ];
  });

  // ========= SUSPENDED CHORDS (sus2, sus4) - 24 voicings ==========
  roots.forEach(({ note: root, name: rootName }) => {
    // sus2
    const keySus2 = `${rootName}sus2`;
    voicings[keySus2] = [
      {
        voicingName: `${rootName}sus2 - Root Position`,
        notes: [
          buildNote(root, 4), // Root
          buildNote(root + 2, 4), // 2nd
          buildNote(root + 7, 4), // 5th
        ],
        octaveRange: { start: 4, end: 4 },
        description: `Sus2: root, 2nd, 5th`,
      },
      {
        voicingName: `${rootName}sus2 - Open Spread`,
        notes: [
          buildNote(root, 3), // Root
          buildNote(root + 2, 4), // 2nd
          buildNote(root + 7, 5), // 5th (higher)
        ],
        octaveRange: { start: 3, end: 5 },
        description: `Spacious sus2 voicing`,
      },
    ];

    // sus4
    const keySus4 = `${rootName}sus4`;
    voicings[keySus4] = [
      {
        voicingName: `${rootName}sus4 - Root Position`,
        notes: [
          buildNote(root, 4), // Root
          buildNote(root + 5, 4), // 4th
          buildNote(root + 7, 4), // 5th
        ],
        octaveRange: { start: 4, end: 4 },
        description: `Sus4: root, 4th, 5th`,
      },
      {
        voicingName: `${rootName}sus4 - Open Spread`,
        notes: [
          buildNote(root, 3), // Root
          buildNote(root + 5, 4), // 4th
          buildNote(root + 7, 5), // 5th (higher)
        ],
        octaveRange: { start: 3, end: 5 },
        description: `Spacious sus4 voicing`,
      },
    ];
  });

  // ========= DIMINISHED CHORDS (full diminished 7ths) - 12 voicings ==========
  roots.forEach(({ note: root, name: rootName }) => {
    const key = `${rootName}dim7`;
    voicings[key] = [
      {
        voicingName: `${rootName}dim7 - Root Position`,
        notes: [
          buildNote(root, 4), // Root
          buildNote(root + 3, 4), // Minor 3rd
          buildNote(root + 6, 4), // Diminished 5th
          buildNote(root + 9, 4), // Diminished 7th
        ],
        octaveRange: { start: 4, end: 4 },
        description: `Fully diminished: symmetric tritones`,
      },
      {
        voicingName: `${rootName}dim7 - Inversion (3rd in bass)`,
        notes: [
          buildNote(root + 3, 3), // Minor 3rd
          buildNote(root + 6, 4), // Diminished 5th
          buildNote(root + 9, 4), // Diminished 7th
          buildNote(root, 5), // Root (higher)
        ],
        octaveRange: { start: 3, end: 5 },
        description: `First inversion: symmetrical voicing`,
      },
      {
        voicingName: `${rootName}dim7 - Drop 2`,
        notes: [
          buildNote(root, 3), // Root
          buildNote(root + 6, 3), // Diminished 5th
          buildNote(root + 3, 4), // Minor 3rd
          buildNote(root + 9, 4), // Diminished 7th
        ],
        octaveRange: { start: 3, end: 4 },
        description: `Drop 2 voicing for jazz`,
      },
    ];
  });

  // ========= AUGMENTED CHORDS - 12 voicings ==========
  roots.forEach(({ note: root, name: rootName }) => {
    const key = `${rootName}aug`;
    voicings[key] = [
      {
        voicingName: `${rootName}aug - Root Position`,
        notes: [
          buildNote(root, 4), // Root
          buildNote(root + 4, 4), // Major 3rd
          buildNote(root + 8, 4), // Augmented 5th
        ],
        octaveRange: { start: 4, end: 4 },
        description: `Augmented: root, 3rd, #5 (symmetric)`,
      },
      {
        voicingName: `${rootName}aug - Open Spread`,
        notes: [
          buildNote(root, 3), // Root
          buildNote(root + 4, 4), // 3rd
          buildNote(root + 8, 5), // #5 (higher)
        ],
        octaveRange: { start: 3, end: 5 },
        description: `Spacious augmented voicing`,
      },
      {
        voicingName: `${rootName}aug - Inversion`,
        notes: [
          buildNote(root + 4, 3), // 3rd (bass)
          buildNote(root + 8, 4), // #5
          buildNote(root, 5), // Root (higher)
        ],
        octaveRange: { start: 3, end: 5 },
        description: `First inversion for movement`,
      },
    ];
  });

  // ========= SLASH CHORDS (2-hand interpretation) - 24 voicings ==========
  roots.forEach(({ note: root, name: rootName }) => {
    const key = `${rootName}_slash_voicings`;
    voicings[key] = [
      {
        voicingName: `${rootName}/3 - Bass 3rd (maj chord)`,
        notes: [
          buildNote(root + 4, 2), // Bass: 3rd (lower octave)
          buildNote(root, 4), // Root
          buildNote(root + 4, 4), // 3rd
          buildNote(root + 7, 4), // 5th
        ],
        octaveRange: { start: 2, end: 4 },
        description: `First inversion effect: 3rd in bass`,
      },
      {
        voicingName: `${rootName}/5 - Bass 5th (maj chord)`,
        notes: [
          buildNote(root + 7, 2), // Bass: 5th (lower octave)
          buildNote(root, 4), // Root
          buildNote(root + 4, 4), // 3rd
          buildNote(root + 7, 4), // 5th
        ],
        octaveRange: { start: 2, end: 4 },
        description: `Second inversion: 5th in bass`,
      },
    ];
  });

  return voicings;
}

// ============================================================================
// JAZZ VOICINGS (80 chords)
// ============================================================================

function generateJazzVoicings(): Record<string, PianoVoicing[]> {
  const voicings: Record<string, PianoVoicing[]> = {};

  const roots = [
    { note: 0, name: 'C' },
    { note: 2, name: 'D' },
    { note: 4, name: 'E' },
    { note: 5, name: 'F' },
    { note: 7, name: 'G' },
    { note: 9, name: 'A' },
    { note: 11, name: 'B' },
  ];

  // ========= ii-V-I PROGRESSIONS (3 chords × 7 roots × 2 voicing sets) = 42 voicings ==========
  roots.forEach(({ note: root, name: rootName }) => {
    // ii chord (minor 7)
    const iiRoot = (root + 2) % 12;
    const iiName = ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'][roots.indexOf({ note: iiRoot, name: '' })];
    const keyii = `${rootName}_ii_v_i_ii`;
    voicings[keyii] = [
      {
        voicingName: `${rootName} ii-V-I: ii (rootless, 3-7-9)`,
        notes: [
          buildNote(iiRoot + 4, 3), // 3rd
          buildNote(iiRoot + 10, 3), // 7th
          buildNote(iiRoot + 2, 4), // 9th
        ],
        octaveRange: { start: 3, end: 4 },
        description: `ii chord: rootless shell (3-7-9)`,
      },
      {
        voicingName: `${rootName} ii-V-I: ii (drop2, 7-3-5-9)`,
        notes: [
          buildNote(iiRoot + 10, 3), // 7th (bass)
          buildNote(iiRoot + 4, 4), // 3rd
          buildNote(iiRoot + 7, 4), // 5th
          buildNote(iiRoot + 2, 5), // 9th
        ],
        octaveRange: { start: 3, end: 5 },
        description: `ii chord: drop 2 for movement`,
      },
    ];

    // V chord (dominant 7)
    const vRoot = (root + 7) % 12;
    const keyv = `${rootName}_ii_v_i_v`;
    voicings[keyv] = [
      {
        voicingName: `${rootName} ii-V-I: V (rootless, 3-7-b9)`,
        notes: [
          buildNote(vRoot + 4, 3), // 3rd
          buildNote(vRoot + 10, 4), // 7th
          buildNote(vRoot + 1, 4), // b9
        ],
        octaveRange: { start: 3, end: 4 },
        description: `V chord: rootless with b9 tension`,
      },
      {
        voicingName: `${rootName} ii-V-I: V (sharp tensions, 3-7-#9)`,
        notes: [
          buildNote(vRoot + 4, 4), // 3rd
          buildNote(vRoot + 10, 4), // 7th
          buildNote(vRoot + 3, 5), // #9
        ],
        octaveRange: { start: 4, end: 5 },
        description: `V chord: bright #9 tension`,
      },
    ];

    // I chord (major 7)
    const keyI = `${rootName}_ii_v_i_i`;
    voicings[keyI] = [
      {
        voicingName: `${rootName} ii-V-I: I (rootless, 3-7-5)`,
        notes: [
          buildNote(root + 4, 4), // 3rd
          buildNote(root + 11, 4), // 7th
          buildNote(root + 7, 5), // 5th
        ],
        octaveRange: { start: 4, end: 5 },
        description: `I chord: rootless maj7 resolution`,
      },
      {
        voicingName: `${rootName} ii-V-I: I (root + guide tones, R-7-3)`,
        notes: [
          buildNote(root, 3), // Root
          buildNote(root + 11, 3), // 7th
          buildNote(root + 4, 4), // 3rd
        ],
        octaveRange: { start: 3, end: 4 },
        description: `I chord: root with guide tones`,
      },
    ];
  });

  // ========= BLUES CHANGES (I7, IV7, V7 variations) - 21 voicings ==========
  roots.forEach(({ note: root, name: rootName }) => {
    // I7
    const keyI7 = `${rootName}_blues_I7`;
    voicings[keyI7] = [
      {
        voicingName: `${rootName} Blues I7 - Shell (R-3-7)`,
        notes: [
          buildNote(root, 3), // Root
          buildNote(root + 4, 4), // 3rd
          buildNote(root + 10, 4), // 7th
        ],
        octaveRange: { start: 3, end: 4 },
        description: `Blues shell: simple and powerful`,
      },
      {
        voicingName: `${rootName} Blues I7 - Extended (R-3-5-b7-9)`,
        notes: [
          buildNote(root, 3), // Root
          buildNote(root + 4, 4), // 3rd
          buildNote(root + 7, 4), // 5th
          buildNote(root + 10, 4), // b7th
          buildNote(root + 2, 5), // 9th
        ],
        octaveRange: { start: 3, end: 5 },
        description: `Extended I7 for richer blues feel`,
      },
      {
        voicingName: `${rootName} Blues I7 - Boogie (R-R-3-b7)`,
        notes: [
          buildNote(root, 2), // Root (low)
          buildNote(root, 3), // Root (mid)
          buildNote(root + 4, 4), // 3rd
          buildNote(root + 10, 4), // b7th
        ],
        octaveRange: { start: 2, end: 4 },
        description: `Boogie feel with doubled root`,
      },
    ];

    // IV7
    const ivRoot = (root + 5) % 12;
    const keyIV7 = `${rootName}_blues_IV7`;
    voicings[keyIV7] = [
      {
        voicingName: `${rootName} Blues IV7 - Shell`,
        notes: [
          buildNote(ivRoot, 3), // Root
          buildNote(ivRoot + 4, 4), // 3rd
          buildNote(ivRoot + 10, 4), // b7th
        ],
        octaveRange: { start: 3, end: 4 },
        description: `IV7 shell voicing`,
      },
      {
        voicingName: `${rootName} Blues IV7 - Extended`,
        notes: [
          buildNote(ivRoot, 3), // Root
          buildNote(ivRoot + 4, 4), // 3rd
          buildNote(ivRoot + 7, 4), // 5th
          buildNote(ivRoot + 10, 4), // b7th
        ],
        octaveRange: { start: 3, end: 4 },
        description: `IV7 extended: more color`,
      },
    ];

    // V7
    const vRoot = (root + 7) % 12;
    const keyV7 = `${rootName}_blues_V7`;
    voicings[keyV7] = [
      {
        voicingName: `${rootName} Blues V7 - Shell (Turnaround)`,
        notes: [
          buildNote(vRoot, 3), // Root
          buildNote(vRoot + 4, 4), // 3rd
          buildNote(vRoot + 10, 4), // b7th
        ],
        octaveRange: { start: 3, end: 4 },
        description: `V7 turnaround: returning to I`,
      },
      {
        voicingName: `${rootName} Blues V7 - Extended (#9)`,
        notes: [
          buildNote(vRoot, 3), // Root
          buildNote(vRoot + 4, 4), // 3rd
          buildNote(vRoot + 10, 4), // b7th
          buildNote(vRoot + 3, 5), // #9 (tension)
        ],
        octaveRange: { start: 3, end: 5 },
        description: `V7 with bright #9 for movement`,
      },
    ];
  });

  // ========= STANDARDS (Autumn Leaves, Giant Steps, etc.) - 18 voicings ==========
  // Autumn Leaves: Gm - Cm - F - Bbmaj7 - Ebmaj7 - Am7b5 - D7
  const autumnLeavesVoicings: [string, PianoVoicing[]][] = [
    [
      'autumn_leaves_gm',
      [
        {
          voicingName: 'Autumn Leaves: Gm7 (opener)',
          notes: [buildNote(7, 3), buildNote(7 + 4, 4), buildNote(7 + 10, 4)],
          octaveRange: { start: 3, end: 4 },
          description: `Gm7 opening chord`,
        },
      ],
    ],
    [
      'autumn_leaves_cm',
      [
        {
          voicingName: 'Autumn Leaves: Cm7 (relative minor)',
          notes: [buildNote(0, 3), buildNote(0 + 4, 4), buildNote(0 + 10, 4)],
          octaveRange: { start: 3, end: 4 },
          description: `Cm7 in key progression`,
        },
      ],
    ],
    [
      'autumn_leaves_f',
      [
        {
          voicingName: 'Autumn Leaves: Fmaj7 (IV chord)',
          notes: [buildNote(5, 3), buildNote(5 + 4, 4), buildNote(5 + 11, 4)],
          octaveRange: { start: 3, end: 4 },
          description: `Fmaj7 subdominant`,
        },
      ],
    ],
    [
      'autumn_leaves_bb',
      [
        {
          voicingName: 'Autumn Leaves: Bbmaj7 (V chord)',
          notes: [buildNote(10, 3), buildNote(10 + 4, 4), buildNote(10 + 11, 4)],
          octaveRange: { start: 3, end: 4 },
          description: `Bbmaj7 dominant center`,
        },
      ],
    ],
    [
      'autumn_leaves_eb',
      [
        {
          voicingName: 'Autumn Leaves: Ebmaj7 (IV in Bb)',
          notes: [buildNote(3, 3), buildNote(3 + 4, 4), buildNote(3 + 11, 4)],
          octaveRange: { start: 3, end: 4 },
          description: `Ebmaj7 bridge chord`,
        },
      ],
    ],
    [
      'autumn_leaves_am7b5',
      [
        {
          voicingName: 'Autumn Leaves: Am7b5 (ii-V setup)',
          notes: [buildNote(9, 3), buildNote(9 + 3, 4), buildNote(9 + 6, 4), buildNote(9 + 10, 4)],
          octaveRange: { start: 3, end: 4 },
          description: `Am7b5 half-diminished`,
        },
      ],
    ],
    [
      'autumn_leaves_d7',
      [
        {
          voicingName: 'Autumn Leaves: D7 (V back to Gm)',
          notes: [buildNote(2, 3), buildNote(2 + 4, 4), buildNote(2 + 10, 4)],
          octaveRange: { start: 3, end: 4 },
          description: `D7 return to tonic`,
        },
      ],
    ],
  ];
  autumnLeavesVoicings.forEach(([key, vv]) => {
    voicings[key] = vv;
  });

  // Giant Steps: Bmaj7 - D7 - Gmaj7 - Bb7 - Ebmaj7 - F#7 - Bmaj7
  const giantStepsVoicings: [string, PianoVoicing[]][] = [
    [
      'giant_steps_bmaj7',
      [
        {
          voicingName: 'Giant Steps: Bmaj7 (start)',
          notes: [buildNote(11, 3), buildNote(11 + 4, 4), buildNote(11 + 11, 4)],
          octaveRange: { start: 3, end: 4 },
          description: `Bmaj7 opening`,
        },
      ],
    ],
    [
      'giant_steps_d7',
      [
        {
          voicingName: 'Giant Steps: D7 (tritone sub)',
          notes: [buildNote(2, 3), buildNote(2 + 4, 4), buildNote(2 + 10, 4)],
          octaveRange: { start: 3, end: 4 },
          description: `D7 tritone substitution`,
        },
      ],
    ],
    [
      'giant_steps_gmaj7',
      [
        {
          voicingName: 'Giant Steps: Gmaj7 (key center)',
          notes: [buildNote(7, 3), buildNote(7 + 4, 4), buildNote(7 + 11, 4)],
          octaveRange: { start: 3, end: 4 },
          description: `Gmaj7 resolved landing`,
        },
      ],
    ],
    [
      'giant_steps_bb7',
      [
        {
          voicingName: 'Giant Steps: Bb7 (next tritone sub)',
          notes: [buildNote(10, 3), buildNote(10 + 4, 4), buildNote(10 + 10, 4)],
          octaveRange: { start: 3, end: 4 },
          description: `Bb7 tritone movement`,
        },
      ],
    ],
    [
      'giant_steps_ebmaj7',
      [
        {
          voicingName: 'Giant Steps: Ebmaj7 (sequential key)',
          notes: [buildNote(3, 3), buildNote(3 + 4, 4), buildNote(3 + 11, 4)],
          octaveRange: { start: 3, end: 4 },
          description: `Ebmaj7 sequence`,
        },
      ],
    ],
    [
      'giant_steps_fsharp7',
      [
        {
          voicingName: 'Giant Steps: F#7 (final tritone sub)',
          notes: [buildNote(6, 3), buildNote(6 + 4, 4), buildNote(6 + 10, 4)],
          octaveRange: { start: 3, end: 4 },
          description: `F#7 back to B`,
        },
      ],
    ],
  ];
  giantStepsVoicings.forEach(([key, vv]) => {
    voicings[key] = vv;
  });

  // ========= MODAL JAZZ (Dorian, Mixolydian, Lydian) - 9 voicings ==========
  [
    { name: 'Cdon', root: 0, mode: 'Dorian' },
    { name: 'Fmix', root: 5, mode: 'Mixolydian' },
    { name: 'Glyd', root: 7, mode: 'Lydian' },
    { name: 'Ddon', root: 2, mode: 'Dorian', alt: true },
    { name: 'Bmix', root: 11, mode: 'Mixolydian', alt: true },
    { name: 'Alyd', root: 9, mode: 'Lydian', alt: true },
    { name: 'Edon', root: 4, mode: 'Dorian', alt: true },
    { name: 'Amix', root: 9, mode: 'Mixolydian', alt: true },
    { name: 'Clyd', root: 0, mode: 'Lydian', alt: true },
  ].forEach(({ name, root, mode }) => {
    const keyDor = `${name}_${mode.toLowerCase()}`;
    voicings[keyDor] = [
      {
        voicingName: `${name} ${mode} - Shell (R-3-7)`,
        notes: [
          buildNote(root, 3), // Root
          buildNote(root + 4, 4), // 3rd (major in all modes)
          buildNote(root + 10, 4), // 7th (minor 7 in modes)
        ],
        octaveRange: { start: 3, end: 4 },
        description: `${mode} modal shell voicing`,
      },
      {
        voicingName: `${name} ${mode} - With 9`,
        notes: [
          buildNote(root, 3), // Root
          buildNote(root + 4, 4), // 3rd
          buildNote(root + 10, 4), // 7th
          buildNote(root + 2, 5), // 9th
        ],
        octaveRange: { start: 3, end: 5 },
        description: `${mode} with 9th extension`,
      },
      {
        voicingName: `${name} ${mode} - Upper Structure`,
        notes: [
          buildNote(root + 4, 4), // 3rd
          buildNote(root + 10, 4), // 7th
          buildNote(root + 2, 5), // 9th
        ],
        octaveRange: { start: 4, end: 5 },
        description: `${mode} rootless modern voicing`,
      },
    ];
  });

  // ========= TRITONE SUBSTITUTIONS - 7 voicings ==========
  roots.slice(0, 1).forEach(({ note: root, name: rootName }) => {
    // Original V7
    const vRoot = (root + 7) % 12;
    const tritoneRoot = (vRoot + 6) % 12; // Tritone sub

    const keyTrit = `${rootName}_tritone_sub`;
    voicings[keyTrit] = [
      {
        voicingName: `${rootName} Tritone Sub: Original V7`,
        notes: [
          buildNote(vRoot, 3), // Root
          buildNote(vRoot + 4, 4), // 3rd
          buildNote(vRoot + 10, 4), // 7th
        ],
        octaveRange: { start: 3, end: 4 },
        description: `V7 original voicing`,
      },
      {
        voicingName: `${rootName} Tritone Sub: Tritone Sub VII7`,
        notes: [
          buildNote(tritoneRoot, 3), // Tritone root
          buildNote(tritoneRoot + 4, 4), // 3rd (enharmonic same)
          buildNote(tritoneRoot + 10, 4), // 7th (enharmonic same)
        ],
        octaveRange: { start: 3, end: 4 },
        description: `Tritone substitution (same guide tones)`,
      },
      {
        voicingName: `${rootName} Tritone Sub: Tight Shell`,
        notes: [
          buildNote(vRoot + 10, 4), // 7th (left hand)
          buildNote(vRoot + 4, 5), // 3rd (right hand)
        ],
        octaveRange: { start: 4, end: 5 },
        description: `Tritone shell: guide tones across hands`,
      },
    ];
  });

  return voicings;
}

// ============================================================================
// EXPORT COMPLETE LIBRARY
// ============================================================================

const INTERMEDIATE_VOICINGS = generateIntermediateVoicings();
const JAZZ_VOICINGS = generateJazzVoicings();

export const PIANO_VOICING_LIBRARY: Record<string, PianoVoicing[]> = {
  // Intermediate (100 voicings across ~30 chord types)
  ...INTERMEDIATE_VOICINGS,

  // Jazz (80 voicings across ~20 chord progressions/standards)
  ...JAZZ_VOICINGS,
};

/**
 * Utility: Get all voicings for a specific chord root
 */
export function getVoicingsForChord(chordKey: string): PianoVoicing[] {
  return PIANO_VOICING_LIBRARY[chordKey] || [];
}

/**
 * Utility: Get random voicing from library
 */
export function getRandomVoicing(): PianoVoicing {
  const allChords = Object.values(PIANO_VOICING_LIBRARY).flat();
  return allChords[Math.floor(Math.random() * allChords.length)];
}

/**
 * Utility: Search voicings by name
 */
export function searchVoicings(query: string): PianoVoicing[] {
  const q = query.toLowerCase();
  return Object.values(PIANO_VOICING_LIBRARY)
    .flat()
    .filter(
      v =>
        v.voicingName.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q)
    );
}

export default PIANO_VOICING_LIBRARY;
