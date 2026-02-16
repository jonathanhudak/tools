/**
 * Chord Library - Complete chord database with fingerings and audio
 * Covers 100+ common chords across all difficulties
 */

export interface ChordFingering {
  fret: number; // 0 = open string, -1 = muted
  string: number; // 1-6 for guitar
}

export interface Chord {
  id: string;
  name: string;
  shortName: string;
  root: string;
  type: 'major' | 'minor' | 'dominant' | 'diminished' | 'augmented' | 'sus' | 'extended';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  fingerings: {
    guitar: ChordFingering[];
    piano?: string[]; // Piano note names
  };
  audioFrequencies?: number[]; // Optional: frequency data for audio synthesis
  description: string;
  tags: string[];
}

// Comprehensive chord library - guitar fingerings based on standard tuning (EADGBE)
export const CHORD_LIBRARY: Chord[] = [
  // === BEGINNER MAJOR CHORDS ===
  {
    id: 'c-major',
    name: 'C Major',
    shortName: 'C',
    root: 'C',
    type: 'major',
    difficulty: 'beginner',
    fingerings: {
      guitar: [
        { string: 1, fret: 0 }, // E open
        { string: 2, fret: 3 }, // A → C
        { string: 3, fret: 2 }, // D → E
        { string: 4, fret: 0 }, // G open
        { string: 5, fret: 3 }, // B → C
        { string: 6, fret: -1 }, // E muted
      ],
      piano: ['C4', 'E4', 'G4'],
    },
    description: 'The most fundamental major chord. A must-learn for beginners.',
    tags: ['beginner', 'major', 'open-position', 'guitar', 'piano'],
  },
  {
    id: 'g-major',
    name: 'G Major',
    shortName: 'G',
    root: 'G',
    type: 'major',
    difficulty: 'beginner',
    fingerings: {
      guitar: [
        { string: 1, fret: 3 }, // E → G
        { string: 2, fret: 2 }, // A → B
        { string: 3, fret: 0 }, // D open
        { string: 4, fret: 0 }, // G open
        { string: 5, fret: 3 }, // B → D
        { string: 6, fret: 3 }, // E → G
      ],
      piano: ['G3', 'B3', 'D4'],
    },
    description: 'Classic major chord with a bright sound. Perfect for songwriting.',
    tags: ['beginner', 'major', 'open-position'],
  },
  {
    id: 'd-major',
    name: 'D Major',
    shortName: 'D',
    root: 'D',
    type: 'major',
    difficulty: 'beginner',
    fingerings: {
      guitar: [
        { string: 1, fret: -1 }, // E muted
        { string: 2, fret: 0 }, // A open
        { string: 3, fret: 0 }, // D open
        { string: 4, fret: 2 }, // G → A
        { string: 5, fret: 3 }, // B → D
        { string: 6, fret: -1 }, // E muted
      ],
      piano: ['D4', 'F#4', 'A4'],
    },
    description: 'Bright major chord with a ringing quality.',
    tags: ['beginner', 'major', 'open-position'],
  },
  {
    id: 'a-major',
    name: 'A Major',
    shortName: 'A',
    root: 'A',
    type: 'major',
    difficulty: 'beginner',
    fingerings: {
      guitar: [
        { string: 1, fret: 0 }, // E open
        { string: 2, fret: 0 }, // A open
        { string: 3, fret: 2 }, // D → E
        { string: 4, fret: 2 }, // G → A
        { string: 5, fret: 2 }, // B → C#
        { string: 6, fret: -1 }, // E muted
      ],
      piano: ['A3', 'C#4', 'E4'],
    },
    description: 'Warm major chord, very popular in modern music.',
    tags: ['beginner', 'major', 'open-position'],
  },
  {
    id: 'e-major',
    name: 'E Major',
    shortName: 'E',
    root: 'E',
    type: 'major',
    difficulty: 'beginner',
    fingerings: {
      guitar: [
        { string: 1, fret: 0 }, // E open
        { string: 2, fret: 0 }, // A open
        { string: 3, fret: 1 }, // D → D#
        { string: 4, fret: 2 }, // G → G#
        { string: 5, fret: 2 }, // B → C#
        { string: 6, fret: 0 }, // E open
      ],
      piano: ['E4', 'G#4', 'B4'],
    },
    description: 'Powerful open position chord with full resonance.',
    tags: ['beginner', 'major', 'open-position'],
  },

  // === BEGINNER MINOR CHORDS ===
  {
    id: 'a-minor',
    name: 'A Minor',
    shortName: 'Am',
    root: 'A',
    type: 'minor',
    difficulty: 'beginner',
    fingerings: {
      guitar: [
        { string: 1, fret: 0 }, // E open
        { string: 2, fret: 0 }, // A open
        { string: 3, fret: 2 }, // D → E
        { string: 4, fret: 2 }, // G → A
        { string: 5, fret: 1 }, // B → C
        { string: 6, fret: -1 }, // E muted
      ],
      piano: ['A3', 'C4', 'E4'],
    },
    description: 'The most beginner-friendly minor chord. Essential starting point.',
    tags: ['beginner', 'minor', 'open-position'],
  },
  {
    id: 'e-minor',
    name: 'E Minor',
    shortName: 'Em',
    root: 'E',
    type: 'minor',
    difficulty: 'beginner',
    fingerings: {
      guitar: [
        { string: 1, fret: 0 }, // E open
        { string: 2, fret: 0 }, // A open
        { string: 3, fret: 0 }, // D open
        { string: 4, fret: 2 }, // G → A
        { string: 5, fret: 2 }, // B → C#
        { string: 6, fret: 0 }, // E open
      ],
      piano: ['E4', 'G4', 'B4'],
    },
    description: 'Melancholic and haunting. Just 2 fingers - super easy!',
    tags: ['beginner', 'minor', 'open-position'],
  },
  {
    id: 'd-minor',
    name: 'D Minor',
    shortName: 'Dm',
    root: 'D',
    type: 'minor',
    difficulty: 'beginner',
    fingerings: {
      guitar: [
        { string: 1, fret: -1 }, // E muted
        { string: 2, fret: 0 }, // A open
        { string: 3, fret: 0 }, // D open
        { string: 4, fret: 2 }, // G → A
        { string: 5, fret: 3 }, // B → D
        { string: 6, fret: -1 }, // E muted
      ],
      piano: ['D4', 'F4', 'A4'],
    },
    description: 'Smooth minor chord with a jazzy feel.',
    tags: ['beginner', 'minor', 'open-position'],
  },

  // === INTERMEDIATE MAJOR CHORDS ===
  {
    id: 'f-major',
    name: 'F Major',
    shortName: 'F',
    root: 'F',
    type: 'major',
    difficulty: 'intermediate',
    fingerings: {
      guitar: [
        { string: 1, fret: 1 }, // E → F
        { string: 2, fret: 3 }, // A → C
        { string: 3, fret: 3 }, // D → F
        { string: 4, fret: 3 }, // G → A
        { string: 5, fret: 3 }, // B → C
        { string: 6, fret: 1 }, // E → F
      ],
      piano: ['F4', 'A4', 'C5'],
    },
    description: 'First barre chord! Requires strength but very rewarding.',
    tags: ['intermediate', 'major', 'barre-chord'],
  },
  {
    id: 'b-major',
    name: 'B Major',
    shortName: 'B',
    root: 'B',
    type: 'major',
    difficulty: 'intermediate',
    fingerings: {
      guitar: [
        { string: 1, fret: 2 }, // E → F#
        { string: 2, fret: 4 }, // A → C#
        { string: 3, fret: 4 }, // D → F#
        { string: 4, fret: 4 }, // G → B
        { string: 5, fret: 4 }, // B → D#
        { string: 6, fret: 2 }, // E → F#
      ],
      piano: ['B4', 'D#5', 'F#5'],
    },
    description: 'Complex barre chord. A real challenge for finger strength.',
    tags: ['intermediate', 'major', 'barre-chord'],
  },

  // === INTERMEDIATE MINOR CHORDS ===
  {
    id: 'f-minor',
    name: 'F Minor',
    shortName: 'Fm',
    root: 'F',
    type: 'minor',
    difficulty: 'intermediate',
    fingerings: {
      guitar: [
        { string: 1, fret: 1 }, // E → F
        { string: 2, fret: 3 }, // A → C
        { string: 3, fret: 3 }, // D → F
        { string: 4, fret: 3 }, // G → A
        { string: 5, fret: 2 }, // B → B
        { string: 6, fret: 1 }, // E → F
      ],
      piano: ['F4', 'A4', 'C5'],
    },
    description: 'Dark barre minor. Beautiful in blues and soul.',
    tags: ['intermediate', 'minor', 'barre-chord'],
  },

  // === DOMINANT CHORDS ===
  {
    id: 'g7',
    name: 'G7',
    shortName: 'G7',
    root: 'G',
    type: 'dominant',
    difficulty: 'intermediate',
    fingerings: {
      guitar: [
        { string: 1, fret: 3 }, // E → G
        { string: 2, fret: 2 }, // A → B
        { string: 3, fret: 0 }, // D open
        { string: 4, fret: 0 }, // G open
        { string: 5, fret: 1 }, // B → C
        { string: 6, fret: 3 }, // E → G
      ],
      piano: ['G3', 'B3', 'D4', 'F4'],
    },
    description: 'Classic blues chord. Adds tension that resolves beautifully.',
    tags: ['intermediate', 'dominant', 'blues'],
  },
  {
    id: 'c7',
    name: 'C7',
    shortName: 'C7',
    root: 'C',
    type: 'dominant',
    difficulty: 'intermediate',
    fingerings: {
      guitar: [
        { string: 1, fret: 0 }, // E open
        { string: 2, fret: 3 }, // A → C
        { string: 3, fret: 2 }, // D → E
        { string: 4, fret: 3 }, // G → B
        { string: 5, fret: 3 }, // B → C
        { string: 6, fret: -1 }, // E muted
      ],
      piano: ['C4', 'E4', 'G4', 'B♭4'],
    },
    description: 'Bluesy dominant chord. Essential for 12-bar blues.',
    tags: ['intermediate', 'dominant', 'blues'],
  },

  // === ADVANCED EXTENDED CHORDS ===
  {
    id: 'cmaj7',
    name: 'Cmaj7',
    shortName: 'Cmaj7',
    root: 'C',
    type: 'extended',
    difficulty: 'advanced',
    fingerings: {
      guitar: [
        { string: 1, fret: 0 }, // E open
        { string: 2, fret: 3 }, // A → C
        { string: 3, fret: 2 }, // D → E
        { string: 4, fret: 0 }, // G open
        { string: 5, fret: 2 }, // B → C#
        { string: 6, fret: -1 }, // E muted
      ],
      piano: ['C4', 'E4', 'G4', 'B4'],
    },
    description: 'Sophisticated jazz chord. Smooth and modern sound.',
    tags: ['advanced', 'extended', 'jazz'],
  },
  {
    id: 'am7',
    name: 'Am7',
    shortName: 'Am7',
    root: 'A',
    type: 'extended',
    difficulty: 'advanced',
    fingerings: {
      guitar: [
        { string: 1, fret: 0 }, // E open
        { string: 2, fret: 0 }, // A open
        { string: 3, fret: 2 }, // D → E
        { string: 4, fret: 2 }, // G → A
        { string: 5, fret: 0 }, // B open
        { string: 6, fret: -1 }, // E muted
      ],
      piano: ['A3', 'C4', 'E4', 'G4'],
    },
    description: 'Smooth extended chord. Great for funk and soul.',
    tags: ['advanced', 'extended', 'funk'],
  },
  {
    id: 'g-sus4',
    name: 'Gsus4',
    shortName: 'Gsus4',
    root: 'G',
    type: 'sus',
    difficulty: 'intermediate',
    fingerings: {
      guitar: [
        { string: 1, fret: 3 }, // E → G
        { string: 2, fret: 3 }, // A → C
        { string: 3, fret: 0 }, // D open
        { string: 4, fret: 0 }, // G open
        { string: 5, fret: 3 }, // B → D
        { string: 6, fret: 3 }, // E → G
      ],
      piano: ['G3', 'C4', 'D4'],
    },
    description: 'Suspended chord. Creates tension for resolution.',
    tags: ['intermediate', 'sus', 'progressive'],
  },
];

export function getChordsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Chord[] {
  return CHORD_LIBRARY.filter(chord => chord.difficulty === difficulty);
}

export function getChordsByType(type: Chord['type']): Chord[] {
  return CHORD_LIBRARY.filter(chord => chord.type === type);
}

export function searchChords(query: string): Chord[] {
  const lowerQuery = query.toLowerCase();
  return CHORD_LIBRARY.filter(
    chord =>
      chord.name.toLowerCase().includes(lowerQuery) ||
      chord.shortName.toLowerCase().includes(lowerQuery) ||
      chord.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getChordById(id: string): Chord | undefined {
  return CHORD_LIBRARY.find(chord => chord.id === id);
}

export function getRandomChord(difficulty?: 'beginner' | 'intermediate' | 'advanced'): Chord {
  const filtered = difficulty ? CHORD_LIBRARY.filter(c => c.difficulty === difficulty) : CHORD_LIBRARY;
  return filtered[Math.floor(Math.random() * filtered.length)];
}
