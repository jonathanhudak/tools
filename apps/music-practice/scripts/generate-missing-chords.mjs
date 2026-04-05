/**
 * Generate missing chord library entries for Circle of Fifths coverage.
 * Uses tonal.js for music theory accuracy.
 * Outputs TypeScript chord entries to stdout.
 */

import { Chord, Note, Interval, Scale } from 'tonal';

// ─── Existing chords (already in library) ────────────────────────────────────
const EXISTING = new Set([
  'C', 'G', 'D', 'A', 'E', 'B', 'Am', 'Em', 'Dm', 'Bm', 'Gm'
]);

// ─── All chords needed by Circle of Fifths ───────────────────────────────────
const NEEDED = [
  // Major triads
  'F', 'Bb', 'Eb', 'Ab', 'Db', 'F#', 'Gb', 'Cb', 'C#', 'Fb', 'G#', 'B#',
  // Minor triads
  'Cm', 'Fm', 'Bbm', 'Ebm', 'Abm', 'Dbm', 'F#m', 'C#m', 'G#m',
  'A#m', 'D#m', 'E#m',
  // Diminished triads
  'Bdim', 'Edim', 'Adim', 'Ddim', 'Gdim', 'Cdim', 'Fdim',
  'F#dim', 'C#dim', 'G#dim', 'D#dim', 'A#dim', 'E#dim', 'B#dim', 'Bbdim',
  // Dominant 7ths
  'C7', 'G7', 'D7', 'A7', 'E7', 'B7', 'F7',
  'Bb7', 'Eb7', 'Ab7', 'Db7', 'F#7', 'Gb7', 'C#7', 'G#7',
  // Major 7ths
  'Cmaj7', 'Gmaj7', 'Dmaj7', 'Amaj7', 'Emaj7', 'Bmaj7', 'Fmaj7',
  'Bbmaj7', 'Ebmaj7', 'Abmaj7', 'Dbmaj7', 'F#maj7', 'Gbmaj7', 'Cbmaj7', 'Fbmaj7',
  // Minor 7ths
  'Am7', 'Em7', 'Bm7', 'Dm7', 'Gm7', 'Cm7', 'Fm7',
  'Bbm7', 'Ebm7', 'Abm7', 'Dbm7', 'F#m7', 'C#m7', 'G#m7',
  'A#m7', 'D#m7', 'E#m7',
  // Half-diminished (m7b5)
  'Am7b5', 'Em7b5', 'Bm7b5', 'Dm7b5', 'Gm7b5', 'Cm7b5', 'Fm7b5',
  'Bbm7b5', 'Ebm7b5', 'F#m7b5', 'C#m7b5', 'G#m7b5',
  'A#m7b5', 'D#m7b5', 'E#m7b5', 'B#m7b5',
];

// ─── Guitar voicing data ─────────────────────────────────────────────────────
// Standard tuning MIDI: E2=40, A2=45, D3=50, G3=55, B3=59, E4=64
const STANDARD_TUNING = [40, 45, 50, 55, 59, 64];

/**
 * Map a shortName like "Dm7b5" to a tonal.js chord symbol
 */
function toTonalSymbol(shortName) {
  // Handle special mappings
  return shortName
    .replace(/^([A-G][b#]?)maj7$/, '$1maj7')
    .replace(/^([A-G][b#]?)m7b5$/, '$1m7b5')
    .replace(/^([A-G][b#]?)m7$/, '$1m7')
    .replace(/^([A-G][b#]?)m$/, '$1m')
    .replace(/^([A-G][b#]?)dim$/, '$1dim')
    .replace(/^([A-G][b#]?)7$/, '$17');
}

/**
 * Get the root note from shortName
 */
function getRoot(shortName) {
  const m = shortName.match(/^([A-G][b#]?)/);
  return m ? m[1] : 'C';
}

/**
 * Determine chord type category
 */
function getType(shortName) {
  if (shortName.includes('dim')) return 'diminished';
  if (shortName.includes('m7b5')) return 'diminished'; // half-dim
  if (shortName.includes('maj7')) return 'major';
  if (shortName.includes('m7')) return 'minor';
  if (shortName.includes('m')) return 'minor';
  if (shortName.includes('7')) return 'dominant';
  return 'major';
}

/**
 * Determine difficulty tier
 */
function getDifficulty(shortName) {
  const root = getRoot(shortName);
  const simpleRoots = ['C', 'G', 'D', 'A', 'E', 'F'];
  const isSimpleRoot = simpleRoots.includes(root);
  
  if (shortName.includes('m7b5') || shortName.includes('dim')) return 'jazz';
  if (shortName.includes('maj7') || shortName.includes('m7') || shortName.includes('7')) {
    return isSimpleRoot ? 'intermediate' : 'advanced';
  }
  if (shortName.includes('m')) {
    return isSimpleRoot ? 'beginner' : 'intermediate';
  }
  return isSimpleRoot ? 'beginner' : 'intermediate';
}

/**
 * Get friendly chord name
 */
function getFullName(shortName) {
  const root = getRoot(shortName);
  const suffix = shortName.slice(root.length);
  
  const nameMap = {
    '': 'Major',
    'm': 'Minor',
    '7': 'Dominant 7th',
    'maj7': 'Major 7th',
    'm7': 'Minor 7th',
    'dim': 'Diminished',
    'm7b5': 'Half-Diminished 7th',
  };
  
  return `${root} ${nameMap[suffix] || suffix}`;
}

/**
 * Get theory info for a chord
 */
function getTheory(shortName) {
  const suffix = shortName.slice(getRoot(shortName).length);
  
  const theoryMap = {
    '': {
      intervals: ['R', 'M3', 'P5'],
      construction: 'Root + Major 3rd + Perfect 5th',
      progressions: ['I-IV-V', 'I-vi-IV-V'],
    },
    'm': {
      intervals: ['R', 'm3', 'P5'],
      construction: 'Root + Minor 3rd + Perfect 5th',
      progressions: ['i-iv-v', 'i-VII-VI'],
    },
    '7': {
      intervals: ['R', 'M3', 'P5', 'm7'],
      construction: 'Major triad + Minor 7th',
      progressions: ['V7-I', 'I7-IV', 'ii-V7-I'],
    },
    'maj7': {
      intervals: ['R', 'M3', 'P5', 'M7'],
      construction: 'Major triad + Major 7th',
      progressions: ['Imaj7-vi7', 'Imaj7-IVmaj7'],
    },
    'm7': {
      intervals: ['R', 'm3', 'P5', 'm7'],
      construction: 'Minor triad + Minor 7th',
      progressions: ['ii7-V7-I', 'i7-iv7'],
    },
    'dim': {
      intervals: ['R', 'm3', 'dim5'],
      construction: 'Root + Minor 3rd + Diminished 5th',
      progressions: ['vii°-I', 'ii°-V'],
    },
    'm7b5': {
      intervals: ['R', 'm3', 'dim5', 'm7'],
      construction: 'Diminished triad + Minor 7th',
      progressions: ['viiø7-III', 'iiø7-V7-i'],
    },
  };
  
  const t = theoryMap[suffix] || theoryMap[''];
  return {
    intervals: t.intervals,
    construction: t.construction,
    commonProgressions: t.progressions,
  };
}

/**
 * Get piano notes for a chord (root position, octave 4)
 */
function getPianoNotes(shortName) {
  const symbol = toTonalSymbol(shortName);
  const info = Chord.get(symbol);
  
  if (!info.notes || info.notes.length === 0) {
    // Fallback: build from root + intervals
    const root = getRoot(shortName);
    const suffix = shortName.slice(root.length);
    
    const intervalMap = {
      '': ['1P', '3M', '5P'],
      'm': ['1P', '3m', '5P'],
      '7': ['1P', '3M', '5P', '7m'],
      'maj7': ['1P', '3M', '5P', '7M'],
      'm7': ['1P', '3m', '5P', '7m'],
      'dim': ['1P', '3m', '5d'],
      'm7b5': ['1P', '3m', '5d', '7m'],
    };
    
    const intervals = intervalMap[suffix] || intervalMap[''];
    return intervals.map(iv => {
      const note = Note.transpose(`${root}4`, Interval.fromSemitones(Interval.semitones(iv)));
      return note || `${root}4`;
    });
  }
  
  // Map to octave 4, ensuring ascending
  const notes = [];
  let lastMidi = 0;
  for (const pc of info.notes) {
    let oct = 4;
    let midi = Note.midi(`${pc}${oct}`);
    while (midi <= lastMidi) {
      oct++;
      midi = Note.midi(`${pc}${oct}`);
    }
    notes.push(`${pc}${oct}`);
    lastMidi = midi;
  }
  
  return notes;
}

/**
 * Compute guitar frets for a chord using common voicing patterns.
 * Returns frets array [E2, A2, D3, G3, B3, E4] where -1 = muted.
 */
function getGuitarFrets(shortName) {
  // Common guitar chord voicings - curated for playability
  const voicingDb = {
    // === MAJOR ===
    'F':   [1, 3, 3, 2, 1, 1],
    'Bb':  [-1, 1, 3, 3, 3, 1],
    'Eb':  [-1, -1, 1, 3, 4, 3],
    'Ab':  [4, 6, 6, 5, 4, 4],
    'Db':  [-1, 4, 6, 6, 6, 4],
    'Gb':  [2, 4, 4, 3, 2, 2],
    'F#':  [2, 4, 4, 3, 2, 2],
    'Cb':  [-1, -1, 1, 1, 1, 4], // enharmonic B
    'C#':  [-1, 4, 6, 6, 6, 4],
    'Fb':  [0, 2, 2, 1, 0, 0], // enharmonic E
    'G#':  [4, 6, 6, 5, 4, 4],
    'B#':  [-1, 3, 2, 0, 1, 0], // enharmonic C

    // === MINOR ===
    'Cm':  [-1, 3, 5, 5, 4, 3],
    'Fm':  [1, 3, 3, 1, 1, 1],
    'Bbm': [-1, 1, 3, 3, 2, 1],
    'Ebm': [-1, -1, 1, 3, 4, 2],
    'Abm': [4, 6, 6, 4, 4, 4],
    'Dbm': [-1, 4, 6, 6, 5, 4],
    'F#m': [2, 4, 4, 2, 2, 2],
    'C#m': [-1, 4, 6, 6, 5, 4],
    'G#m': [4, 6, 6, 4, 4, 4],
    'A#m': [-1, 1, 3, 3, 2, 1], // enharmonic Bbm
    'D#m': [-1, -1, 1, 3, 4, 2], // enharmonic Ebm
    'E#m': [1, 3, 3, 1, 1, 1], // enharmonic Fm

    // === DIMINISHED ===
    'Bdim':  [-1, 2, 3, 4, 3, -1],
    'Edim':  [0, 1, 2, 0, -1, -1],
    'Adim':  [-1, 0, 1, 2, 1, -1],
    'Ddim':  [-1, -1, 0, 1, 3, 1],
    'Gdim':  [3, -1, 5, 3, -1, -1],
    'Cdim':  [-1, 3, 4, 5, 4, -1],
    'Fdim':  [1, -1, 3, 1, 0, -1],
    'F#dim': [2, -1, 4, 2, 1, -1],
    'C#dim': [-1, 4, 5, 6, 5, -1],
    'G#dim': [4, -1, 6, 4, 3, -1],
    'D#dim': [-1, -1, 1, 2, 4, 2],
    'A#dim': [-1, 1, 2, 3, 2, -1],
    'E#dim': [1, -1, 3, 1, 0, -1], // enharmonic Fdim
    'B#dim': [-1, 3, 4, 5, 4, -1], // enharmonic Cdim
    'Bbdim': [-1, 1, 2, 3, 2, -1],

    // === DOMINANT 7TH ===
    'C7':  [-1, 3, 2, 3, 1, 0],
    'G7':  [3, 2, 0, 0, 0, 1],
    'D7':  [-1, -1, 0, 2, 1, 2],
    'A7':  [-1, 0, 2, 0, 2, 0],
    'E7':  [0, 2, 0, 1, 0, 0],
    'B7':  [-1, 2, 1, 2, 0, 2],
    'F7':  [1, 3, 1, 2, 1, 1],
    'Bb7': [-1, 1, 3, 1, 3, 1],
    'Eb7': [-1, -1, 1, 3, 2, 3],
    'Ab7': [4, 6, 4, 5, 4, 4],
    'Db7': [-1, 4, 6, 4, 6, 4],
    'F#7': [2, 4, 2, 3, 2, 2],
    'Gb7': [2, 4, 2, 3, 2, 2],
    'C#7': [-1, 4, 6, 4, 6, 4],
    'G#7': [4, 6, 4, 5, 4, 4],

    // === MAJOR 7TH ===
    'Cmaj7': [-1, 3, 2, 0, 0, 0],
    'Gmaj7': [3, 2, 0, 0, 0, 2],
    'Dmaj7': [-1, -1, 0, 2, 2, 2],
    'Amaj7': [-1, 0, 2, 1, 2, 0],
    'Emaj7': [0, 2, 1, 1, 0, 0],
    'Bmaj7': [-1, 2, 4, 3, 4, 2],
    'Fmaj7': [1, -1, 2, 2, 1, 0],
    'Bbmaj7':[-1, 1, 3, 2, 3, 1],
    'Ebmaj7':[-1, -1, 1, 3, 3, 3],
    'Abmaj7':[4, 6, 5, 5, 4, 4],
    'Dbmaj7':[-1, 4, 6, 5, 6, 4],
    'F#maj7':[2, 4, 3, 3, 2, 2],
    'Gbmaj7':[2, 4, 3, 3, 2, 2],
    'Cbmaj7':[-1, 2, 4, 3, 4, 2], // enharmonic Bmaj7
    'Fbmaj7':[0, 2, 1, 1, 0, 0], // enharmonic Emaj7

    // === MINOR 7TH ===
    'Am7':  [-1, 0, 2, 0, 1, 0],
    'Em7':  [0, 2, 0, 0, 0, 0],
    'Bm7':  [-1, 2, 0, 2, 0, 2],
    'Dm7':  [-1, -1, 0, 2, 1, 1],
    'Gm7':  [3, 5, 3, 3, 3, 3],
    'Cm7':  [-1, 3, 5, 3, 4, 3],
    'Fm7':  [1, 3, 1, 1, 1, 1],
    'Bbm7': [-1, 1, 3, 1, 2, 1],
    'Ebm7': [-1, -1, 1, 3, 2, 2],
    'Abm7': [4, 6, 4, 4, 4, 4],
    'Dbm7': [-1, 4, 6, 4, 5, 4],
    'F#m7': [2, 4, 2, 2, 2, 2],
    'C#m7': [-1, 4, 6, 4, 5, 4],
    'G#m7': [4, 6, 4, 4, 4, 4],
    'A#m7': [-1, 1, 3, 1, 2, 1], // enharmonic Bbm7
    'D#m7': [-1, -1, 1, 3, 2, 2], // enharmonic Ebm7
    'E#m7': [1, 3, 1, 1, 1, 1], // enharmonic Fm7

    // === HALF-DIMINISHED (m7b5) ===
    'Am7b5':  [-1, 0, 1, 0, 1, 0],
    'Em7b5':  [0, 1, 0, 0, 3, 0],
    'Bm7b5':  [-1, 2, 3, 2, 3, -1],
    'Dm7b5':  [-1, -1, 0, 1, 1, 1],
    'Gm7b5':  [3, -1, 3, 3, 2, -1],
    'Cm7b5':  [-1, 3, 4, 3, 4, -1],
    'Fm7b5':  [1, -1, 1, 1, 0, -1],
    'Bbm7b5': [-1, 1, 2, 1, 2, -1],
    'Ebm7b5': [-1, -1, 1, 2, 2, 2],
    'F#m7b5': [2, -1, 2, 2, 1, -1],
    'C#m7b5': [-1, 4, 5, 4, 5, -1],
    'G#m7b5': [4, -1, 4, 4, 3, -1],
    'A#m7b5': [-1, 1, 2, 1, 2, -1], // enharmonic Bbm7b5
    'D#m7b5': [-1, -1, 1, 2, 2, 2], // enharmonic Ebm7b5
    'E#m7b5': [1, -1, 1, 1, 0, -1], // enharmonic Fm7b5
    'B#m7b5': [-1, 3, 4, 3, 4, -1], // enharmonic Cm7b5
  };

  return voicingDb[shortName] || null;
}

/**
 * Get finger assignments based on fret pattern
 */
function getFingers(frets) {
  return frets.map(f => {
    if (f === -1) return 'muted';
    if (f === 0) return 'open';
    return String(f); // simplified
  });
}

/**
 * Get muted strings (1-indexed)
 */
function getMuted(frets) {
  return frets
    .map((f, i) => f === -1 ? i + 1 : null)
    .filter(n => n !== null);
}

/**
 * Check if chord has barre
 */
function isBarred(frets) {
  const played = frets.filter(f => f > 0);
  if (played.length < 4) return false;
  const min = Math.min(...played);
  return played.filter(f => f === min).length >= 2;
}

/**
 * Get description for guitar voicing
 */
function getGuitarDescription(shortName, frets) {
  const root = getRoot(shortName);
  const minFret = Math.min(...frets.filter(f => f > 0));
  const hasOpen = frets.some(f => f === 0);
  
  if (hasOpen && minFret <= 3) {
    return `Open position ${getFullName(shortName)} chord.`;
  }
  if (isBarred(frets)) {
    return `Barre chord at fret ${minFret}. ${getFullName(shortName)}.`;
  }
  return `${getFullName(shortName)} voicing at position ${minFret}.`;
}

/**
 * Get tags for a chord
 */
function getTags(shortName) {
  const tags = [];
  const root = getRoot(shortName);
  const suffix = shortName.slice(root.length);
  
  tags.push(root);
  
  if (suffix === '') tags.push('major', 'triad');
  else if (suffix === 'm') tags.push('minor', 'triad');
  else if (suffix === 'dim') tags.push('diminished', 'triad');
  else if (suffix === '7') tags.push('dominant', 'seventh');
  else if (suffix === 'maj7') tags.push('major', 'seventh');
  else if (suffix === 'm7') tags.push('minor', 'seventh');
  else if (suffix === 'm7b5') tags.push('half-diminished', 'seventh');
  
  if (root.includes('b') || root.includes('#')) tags.push('accidental');
  
  return tags;
}

// ─── Generate ────────────────────────────────────────────────────────────────

const missing = NEEDED.filter(n => !EXISTING.has(n));
// Deduplicate
const seen = new Set();
const unique = missing.filter(n => {
  if (seen.has(n)) return false;
  seen.add(n);
  return true;
});

const entries = [];
for (const shortName of unique) {
  const root = getRoot(shortName);
  const frets = getGuitarFrets(shortName);
  const pianoNotes = getPianoNotes(shortName);
  const theory = getTheory(shortName);
  const type = getType(shortName);
  const difficulty = getDifficulty(shortName);
  const fullName = getFullName(shortName);
  const tags = getTags(shortName);
  
  const id = fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  
  const voicing = {
    voicingName: 'Standard Position',
    position: 1,
  };
  
  if (frets) {
    voicing.guitar = {
      frets,
      fingers: getFingers(frets),
      muted: getMuted(frets),
      barred: isBarred(frets),
      description: getGuitarDescription(shortName, frets),
    };
  }
  
  const minOctave = Math.min(...pianoNotes.map(n => parseInt(n.match(/\d+/)?.[0] || '4')));
  const maxOctave = Math.max(...pianoNotes.map(n => parseInt(n.match(/\d+/)?.[0] || '4')));
  
  voicing.piano = {
    notes: pianoNotes,
    octaveRange: [minOctave, maxOctave],
    description: `Root position ${fullName}.`,
  };
  
  entries.push({
    id,
    name: fullName,
    shortName,
    root,
    type,
    difficulty,
    theory,
    voicings: [voicing],
    description: `${fullName} chord. ${theory.construction}.`,
    tags,
  });
}

// Output as TypeScript
for (const entry of entries) {
  const guitarStr = entry.voicings[0].guitar
    ? `      guitar: {
          frets: [${entry.voicings[0].guitar.frets.join(', ')}],
          fingers: [${entry.voicings[0].guitar.fingers.map(f => `'${f}'`).join(', ')}],
          muted: [${entry.voicings[0].guitar.muted.join(', ')}],
          barred: ${entry.voicings[0].guitar.barred},
          description: '${entry.voicings[0].guitar.description.replace(/'/g, "\\'")}',
        },`
    : '';
  
  console.log(`  {
    id: '${entry.id}',
    name: '${entry.name}',
    shortName: '${entry.shortName}',
    root: '${entry.root}',
    type: '${entry.type}',
    difficulty: '${entry.difficulty}',
    theory: {
      intervals: [${entry.theory.intervals.map(i => `'${i}'`).join(', ')}],
      construction: '${entry.theory.construction}',
      commonProgressions: [${entry.theory.commonProgressions.map(p => `'${p}'`).join(', ')}],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
${guitarStr}
        piano: {
          notes: [${entry.voicings[0].piano.notes.map(n => `'${n}'`).join(', ')}],
          octaveRange: [${entry.voicings[0].piano.octaveRange.join(', ')}],
          description: '${entry.voicings[0].piano.description.replace(/'/g, "\\'")}',
        },
      },
    ],
    description: '${entry.description.replace(/'/g, "\\'")}',
    tags: [${entry.tags.map(t => `'${t}'`).join(', ')}],
  },`);
}

console.error(`Generated ${entries.length} chord entries`);
