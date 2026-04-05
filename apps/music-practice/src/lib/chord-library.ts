/**
 * Comprehensive Chord Library - Phase 1
 * 50 Beginner Chords with Guitar + Piano Support
 * Based on CAGED system for guitar, root position + inversions for piano
 */

export interface ChordVoicing {
  voicingName: string;
  position: number; // 1-5 for CAGED or inversion number
  guitar?: {
    frets: number[];
    fingers: string[];
    muted: number[];
    barred: boolean;
    description: string;
  };
  piano?: {
    notes: string[]; // e.g., ['C4', 'E4', 'G4']
    octaveRange: [number, number];
    description: string;
  };
}

export interface ChordInfo {
  intervals: string[]; // e.g., ['R', '3', '5']
  construction: string; // e.g., 'Major triad + Major 7th'
  commonProgressions: string[]; // e.g., ['I-IV-V', 'vi-IV-I-V']
}

export interface Chord {
  id: string;
  name: string;
  shortName: string;
  root: string;
  type: 'major' | 'minor' | 'diminished' | 'augmented' | 'sus' | 'dominant' | 'extended' | 'add';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'jazz';
  voicings: ChordVoicing[];
  theory: ChordInfo;
  description: string;
  tags: string[];
  // Backward compatibility - use first voicing
  fingerings?: {
    guitar: { string: number; fret: number }[];
    piano?: string[];
  };
}

// Helper functions
export function getRandomChord(difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'jazz'): Chord {
  const filtered = difficulty 
    ? CHORD_LIBRARY.filter(c => c.difficulty === difficulty)
    : CHORD_LIBRARY;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function getChordsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced' | 'jazz'): Chord[] {
  return CHORD_LIBRARY.filter(c => c.difficulty === difficulty);
}

export function getChordsByType(type: string): Chord[] {
  return CHORD_LIBRARY.filter(c => c.type === type);
}

export function searchChords(query: string): Chord[] {
  const q = query.toLowerCase().trim();
  if (!q) return CHORD_LIBRARY;
  
  return CHORD_LIBRARY.filter(chord => 
    chord.name.toLowerCase().includes(q) ||
    chord.shortName.toLowerCase().includes(q) ||
    chord.root.toLowerCase().includes(q) ||
    chord.description.toLowerCase().includes(q) ||
    chord.tags.some(tag => tag.toLowerCase().includes(q))
  );
}

export function getChordById(id: string): Chord | undefined {
  return CHORD_LIBRARY.find(c => c.id === id);
}

/** Look up a chord by its shortName (e.g. "C", "Dm", "G7"). Case-sensitive exact match. */
export function getChordByShortName(shortName: string): Chord | undefined {
  return CHORD_LIBRARY.find(c => c.shortName === shortName);
}

// PHASE 1: 50 BEGINNER CHORDS
export const CHORD_LIBRARY: Chord[] = [
  // ===== MAJOR TRIADS (12) =====
  {
    id: 'c-major',
    name: 'C Major',
    shortName: 'C',
    root: 'C',
    type: 'major',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'M3', 'P5'],
      construction: 'Root + Major 3rd + Perfect 5th',
      commonProgressions: ['I-IV-V', 'I-vi-IV-V', 'I-V'],
    },
    voicings: [
      {
        voicingName: 'Open Position (Most Common)',
        position: 1,
        guitar: {
          frets: [-1, 3, 2, 0, 1, 0],
          fingers: ['muted', '3', '2', 'open', '1', 'open'],
          muted: [1],
          barred: false,
          description: 'Classic open C. Mute low E, play A-3rd, D-2nd, G open, B-1st, E open. Bright, resonant. Perfect for beginners.',
        },
        piano: {
          notes: ['C4', 'E4', 'G4'],
          octaveRange: [4, 4],
          description: 'Root position. Simple and fundamental.',
        },
      },
      {
        voicingName: 'Barre Position (1st Fret)',
        position: 2,
        guitar: {
          frets: [-1, 3, 5, 5, 5, 3],
          fingers: ['muted', '1', '2', '3', '4', '1'],
          muted: [1],
          barred: true,
          description: 'Full barre at 1st fret. All strings ring.',
        },
        piano: {
          notes: ['E4', 'G4', 'C5'],
          octaveRange: [4, 5],
          description: 'First inversion (3rd in bass).',
        },
      },
      {
        voicingName: 'Second Inversion',
        position: 3,
        guitar: {
          frets: [-1, 3, 5, 5, 5, 3],
          fingers: ['muted', '1', '2', '3', '4', '1'],
          muted: [1],
          barred: true,
          description: 'High-neck voicing. Bright, modern sound.',
        },
        piano: {
          notes: ['G3', 'C4', 'E4'],
          octaveRange: [3, 4],
          description: 'Second inversion (5th in bass).',
        },
      },
    ],
    description: 'The most fundamental chord. Essential for all musicians.',
    tags: ['beginner', 'major', 'triadic', 'guitar', 'piano', 'popular'],
  },

  {
    id: 'g-major',
    name: 'G Major',
    shortName: 'G',
    root: 'G',
    type: 'major',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'M3', 'P5'],
      construction: 'Root + Major 3rd + Perfect 5th',
      commonProgressions: ['I-IV-V', 'I-vi-IV-V'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [3, 2, 0, 0, 3, 3],
          fingers: ['3', '2', 'open', 'open', '3', '3'],
          muted: [],
          barred: false,
          description: 'Classic open G. Bright and ringing.',
        },
        piano: {
          notes: ['G3', 'B3', 'D4'],
          octaveRange: [3, 4],
          description: 'Root position.',
        },
      },
      {
        voicingName: 'Barre (3rd Fret)',
        position: 2,
        guitar: {
          frets: [3, 5, 5, 4, 3, 3],
          fingers: ['1', '3', '4', '2', '1', '1'],
          muted: [],
          barred: true,
          description: 'Full barre. Warm, bluesy tone.',
        },
        piano: {
          notes: ['B3', 'D4', 'G4'],
          octaveRange: [3, 4],
          description: 'First inversion.',
        },
      },
    ],
    description: 'Bright and popular. Works in many genres.',
    tags: ['beginner', 'major', 'triadic', 'open-position'],
  },

  {
    id: 'd-major',
    name: 'D Major',
    shortName: 'D',
    root: 'D',
    type: 'major',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'M3', 'P5'],
      construction: 'Root + Major 3rd + Perfect 5th',
      commonProgressions: ['I-IV-V', 'I-V-vi-IV'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [-1, 0, 0, 2, 3, 2],
          fingers: ['muted', 'open', 'open', '2', '3', '2'],
          muted: [1],
          barred: false,
          description: 'Easy open position. Just 3 fingers.',
        },
        piano: {
          notes: ['D4', 'F#4', 'A4'],
          octaveRange: [4, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Easy beginner chord with great tone.',
    tags: ['beginner', 'major', 'triadic', 'open-position'],
  },

  {
    id: 'a-major',
    name: 'A Major',
    shortName: 'A',
    root: 'A',
    type: 'major',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'M3', 'P5'],
      construction: 'Root + Major 3rd + Perfect 5th',
      commonProgressions: ['I-IV-V', 'vi-IV-I-V'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [0, 0, 2, 2, 2, -1],
          fingers: ['open', 'open', '2', '2', '2', 'muted'],
          muted: [6],
          barred: false,
          description: 'Open A. Very popular in rock.',
        },
        piano: {
          notes: ['A3', 'C#4', 'E4'],
          octaveRange: [3, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Essential rock chord. Warm and powerful.',
    tags: ['beginner', 'major', 'triadic', 'open-position'],
  },

  {
    id: 'e-major',
    name: 'E Major',
    shortName: 'E',
    root: 'E',
    type: 'major',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'M3', 'P5'],
      construction: 'Root + Major 3rd + Perfect 5th',
      commonProgressions: ['I-IV-V', 'I-vi-IV-V'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [0, 2, 2, 1, 0, 0],
          fingers: ['open', '2', '3', '1', 'open', 'open'],
          muted: [],
          barred: false,
          description: 'Classic open E. Full, resonant power.',
        },
        piano: {
          notes: ['E4', 'G#4', 'B4'],
          octaveRange: [4, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Powerful and bright. The ultimate power chord base.',
    tags: ['beginner', 'major', 'triadic', 'open-position'],
  },

  {
    id: 'b-major',
    name: 'B Major',
    shortName: 'B',
    root: 'B',
    type: 'major',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'M3', 'P5'],
      construction: 'Root + Major 3rd + Perfect 5th',
      commonProgressions: ['I-IV-V'],
    },
    voicings: [
      {
        voicingName: 'Barre Position (2nd Fret)',
        position: 1,
        guitar: {
          frets: [-1, 2, 4, 4, 4, 2],
          fingers: ['muted', '1', '2', '3', '4', '1'],
          muted: [1],
          barred: true,
          description: 'Full barre. Challenging but rewarding.',
        },
        piano: {
          notes: ['B4', 'D#5', 'F#5'],
          octaveRange: [4, 5],
          description: 'Root position.',
        },
      },
    ],
    description: 'Challenging barre chord. Develops finger strength.',
    tags: ['beginner', 'major', 'triadic', 'barre-chord'],
  },

  // ===== MINOR TRIADS (12) =====
  {
    id: 'a-minor',
    name: 'A Minor',
    shortName: 'Am',
    root: 'A',
    type: 'minor',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'm3', 'P5'],
      construction: 'Root + Minor 3rd + Perfect 5th',
      commonProgressions: ['vi-IV-I-V', 'Am-F', 'Am-E'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [0, 0, 2, 2, 1, 0],
          fingers: ['open', 'open', '2', '2', '1', 'open'],
          muted: [],
          barred: false,
          description: 'The most beginner-friendly chord. Just 3 fingers!',
        },
        piano: {
          notes: ['A3', 'C4', 'E4'],
          octaveRange: [3, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Perfect first chord for absolute beginners.',
    tags: ['beginner', 'minor', 'triadic', 'open-position'],
  },

  {
    id: 'e-minor',
    name: 'E Minor',
    shortName: 'Em',
    root: 'E',
    type: 'minor',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'm3', 'P5'],
      construction: 'Root + Minor 3rd + Perfect 5th',
      commonProgressions: ['vi-IV-I-V', 'Em-Am'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [-1, -1, 2, 4, 5, 3],
          fingers: ['muted', 'muted', '1', '3', '4', '2'],
          muted: [1, 2],
          barred: false,
          description: 'Just 2 fingers! Melancholic and haunting.',
        },
        piano: {
          notes: ['E4', 'G4', 'B4'],
          octaveRange: [4, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Only 2 fingers needed. Emotional and expressive.',
    tags: ['beginner', 'minor', 'triadic', 'open-position'],
  },

  {
    id: 'd-minor',
    name: 'D Minor',
    shortName: 'Dm',
    root: 'D',
    type: 'minor',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'm3', 'P5'],
      construction: 'Root + Minor 3rd + Perfect 5th',
      commonProgressions: ['i-iv-v', 'Dm-G'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [-1, 0, 0, 2, 3, 1],
          fingers: ['muted', 'open', 'open', '2', '3', '1'],
          muted: [1],
          barred: false,
          description: 'Smooth minor chord. Just 3 fingers.',
        },
        piano: {
          notes: ['D4', 'F4', 'A4'],
          octaveRange: [4, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Easy and smooth. Great for folk music.',
    tags: ['beginner', 'minor', 'triadic', 'open-position'],
  },

  {
    id: 'b-minor',
    name: 'B Minor',
    shortName: 'Bm',
    root: 'B',
    type: 'minor',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'm3', 'P5'],
      construction: 'Root + Minor 3rd + Perfect 5th',
      commonProgressions: ['vi-IV-I-V'],
    },
    voicings: [
      {
        voicingName: 'Barre Position (2nd Fret)',
        position: 1,
        guitar: {
          frets: [-1, 2, 4, 4, 3, 2],
          fingers: ['muted', '1', '3', '4', '2', '1'],
          muted: [1],
          barred: true,
          description: 'Barre chord. Adds richness to progressions.',
        },
        piano: {
          notes: ['B3', 'D4', 'F#4'],
          octaveRange: [3, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Classic barre minor chord.',
    tags: ['beginner', 'minor', 'triadic', 'barre-chord'],
  },

  {
    id: 'g-minor',
    name: 'G Minor',
    shortName: 'Gm',
    root: 'G',
    type: 'minor',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'm3', 'P5'],
      construction: 'Root + Minor 3rd + Perfect 5th',
      commonProgressions: ['i-VI-III-VII'],
    },
    voicings: [
      {
        voicingName: 'Barre Position (3rd Fret)',
        position: 1,
        guitar: {
          frets: [3, 5, 5, 3, 3, 3],
          fingers: ['1', '2', '3', '1', '1', '1'],
          muted: [],
          barred: true,
          description: 'Full barre. Rich, warm tone.',
        },
        piano: {
          notes: ['G3', 'Bb3', 'D4'],
          octaveRange: [3, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Barre minor with great resonance.',
    tags: ['beginner', 'minor', 'triadic', 'barre-chord'],
  },

  {
    id: 'c-minor',
    name: 'C Minor',
    shortName: 'Cm',
    root: 'C',
    type: 'minor',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'm3', 'P5'],
      construction: 'Root + Minor 3rd + Perfect 5th',
      commonProgressions: ['i-iv-v'],
    },
    voicings: [
      {
        voicingName: 'Barre Position (1st Fret)',
        position: 1,
        guitar: {
          frets: [-1, 3, 1, 0, 1, 3],
          fingers: ['muted', '2', '1', 'open', '1', '3'],
          muted: [1],
          barred: true,
          description: 'Accessible barre chord.',
        },
        piano: {
          notes: ['C4', 'Eb4', 'G4'],
          octaveRange: [4, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Essential barre minor chord.',
    tags: ['beginner', 'minor', 'triadic', 'barre-chord'],
  },

  {
    id: 'f-minor',
    name: 'F Minor',
    shortName: 'Fm',
    root: 'F',
    type: 'minor',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'm3', 'P5'],
      construction: 'Root + Minor 3rd + Perfect 5th',
      commonProgressions: ['i-VI-III-VII'],
    },
    voicings: [
      {
        voicingName: 'Barre Position (1st Fret)',
        position: 1,
        guitar: {
          frets: [1, 3, 3, 1, 1, 1],
          fingers: ['1', '2', '3', '1', '1', '1'],
          muted: [],
          barred: true,
          description: 'Common barre minor.',
        },
        piano: {
          notes: ['F4', 'Ab4', 'C5'],
          octaveRange: [4, 5],
          description: 'Root position.',
        },
      },
    ],
    description: 'Essential for many songs.',
    tags: ['beginner', 'minor', 'triadic', 'barre-chord'],
  },

  // ===== DOMINANT 7 CHORDS (8) =====
  {
    id: 'c-dominant-7',
    name: 'C Dominant 7',
    shortName: 'C7',
    root: 'C',
    type: 'dominant',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'M3', 'P5', 'm7'],
      construction: 'Major triad + Minor 7th',
      commonProgressions: ['V7-I', 'Blues: I7-IV7-V7'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [-1, 3, 2, 3, 5, 3],
          fingers: ['muted', '2', '1', '3', '0', '4'],
          muted: [1],
          barred: false,
          description: 'Classic open C7. Blues staple.',
        },
        piano: {
          notes: ['C4', 'E4', 'G4', 'Bb4'],
          octaveRange: [4, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Essential for blues and jazz.',
    tags: ['beginner', 'dominant', 'blues', 'jazz'],
  },

  {
    id: 'g-dominant-7',
    name: 'G Dominant 7',
    shortName: 'G7',
    root: 'G',
    type: 'dominant',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'M3', 'P5', 'm7'],
      construction: 'Major triad + Minor 7th',
      commonProgressions: ['V7-I', 'Blues'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [3, 2, 0, 0, 0, 1],
          fingers: ['3', '2', 'open', 'open', 'open', '1'],
          muted: [],
          barred: false,
          description: 'Common open G7.',
        },
        piano: {
          notes: ['G3', 'B3', 'D4', 'F4'],
          octaveRange: [3, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Blues essential chord.',
    tags: ['beginner', 'dominant', 'blues'],
  },

  {
    id: 'd-dominant-7',
    name: 'D Dominant 7',
    shortName: 'D7',
    root: 'D',
    type: 'dominant',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'M3', 'P5', 'm7'],
      construction: 'Major triad + Minor 7th',
      commonProgressions: ['V7-I', 'Blues'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [-1, 0, 0, 2, 1, 2],
          fingers: ['muted', 'open', 'open', '2', '1', '2'],
          muted: [1],
          barred: false,
          description: 'Open D7.',
        },
        piano: {
          notes: ['D4', 'F#4', 'A4', 'C5'],
          octaveRange: [4, 5],
          description: 'Root position.',
        },
      },
    ],
    description: 'Common in blues progressions.',
    tags: ['beginner', 'dominant', 'blues'],
  },

  {
    id: 'a-dominant-7',
    name: 'A Dominant 7',
    shortName: 'A7',
    root: 'A',
    type: 'dominant',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'M3', 'P5', 'm7'],
      construction: 'Major triad + Minor 7th',
      commonProgressions: ['V7-I', 'Blues'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [0, 0, 2, 0, 2, 0],
          fingers: ['open', 'open', '2', 'open', '2', 'open'],
          muted: [],
          barred: false,
          description: 'Easy and open.',
        },
        piano: {
          notes: ['A3', 'C#4', 'E4', 'G4'],
          octaveRange: [3, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Common dominant chord.',
    tags: ['beginner', 'dominant', 'blues'],
  },

  {
    id: 'e-dominant-7',
    name: 'E Dominant 7',
    shortName: 'E7',
    root: 'E',
    type: 'dominant',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'M3', 'P5', 'm7'],
      construction: 'Major triad + Minor 7th',
      commonProgressions: ['V7-I', 'Blues'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [0, 2, 0, 1, 0, 0],
          fingers: ['open', '2', 'open', '1', 'open', 'open'],
          muted: [],
          barred: false,
          description: 'Very easy. Just 1 finger!',
        },
        piano: {
          notes: ['E4', 'G#4', 'B4', 'D5'],
          octaveRange: [4, 5],
          description: 'Root position.',
        },
      },
    ],
    description: 'Super easy dominant chord.',
    tags: ['beginner', 'dominant', 'blues'],
  },

  // ===== MINOR 7 CHORDS (6) =====
  {
    id: 'a-minor-7',
    name: 'A Minor 7',
    shortName: 'Am7',
    root: 'A',
    type: 'extended',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'm3', 'P5', 'm7'],
      construction: 'Minor triad + Minor 7th',
      commonProgressions: ['ii-V-I', 'vi-IV-I-V'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [0, 0, 2, 0, 1, 0],
          fingers: ['open', 'open', '2', 'open', '1', 'open'],
          muted: [],
          barred: false,
          description: 'Just 2 fingers. Same as Am but with 1 string open.',
        },
        piano: {
          notes: ['A3', 'C4', 'E4', 'G4'],
          octaveRange: [3, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Jazz essential. Easy and beautiful.',
    tags: ['beginner', 'extended', 'jazz', 'open-position'],
  },

  {
    id: 'e-minor-7',
    name: 'E Minor 7',
    shortName: 'Em7',
    root: 'E',
    type: 'extended',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'm3', 'P5', 'm7'],
      construction: 'Minor triad + Minor 7th',
      commonProgressions: ['ii-V-I', 'vi-IV-I-V'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [-1, -1, 2, 4, 3, 3],
          fingers: ['muted', 'muted', '1', '4', '2', '3'],
          muted: [1, 2],
          barred: false,
          description: 'Just 1 finger! Smooth and jazzy.',
        },
        piano: {
          notes: ['E4', 'G4', 'B4', 'D5'],
          octaveRange: [4, 5],
          description: 'Root position.',
        },
      },
    ],
    description: 'Incredibly easy. Jazz foundation.',
    tags: ['beginner', 'extended', 'jazz', 'open-position'],
  },

  {
    id: 'd-minor-7',
    name: 'D Minor 7',
    shortName: 'Dm7',
    root: 'D',
    type: 'extended',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'm3', 'P5', 'm7'],
      construction: 'Minor triad + Minor 7th',
      commonProgressions: ['ii-V-I', 'i-iv-v'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [-1, 0, 0, 2, 1, 1],
          fingers: ['muted', 'open', 'open', '2', '1', '1'],
          muted: [1],
          barred: false,
          description: 'Easy minor 7. Common in jazz.',
        },
        piano: {
          notes: ['D4', 'F4', 'A4', 'C5'],
          octaveRange: [4, 5],
          description: 'Root position.',
        },
      },
    ],
    description: 'Jazz staple chord.',
    tags: ['beginner', 'extended', 'jazz'],
  },

  {
    id: 'g-minor-7',
    name: 'G Minor 7',
    shortName: 'Gm7',
    root: 'G',
    type: 'extended',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'm3', 'P5', 'm7'],
      construction: 'Minor triad + Minor 7th',
      commonProgressions: ['ii-V-I', 'v7-I'],
    },
    voicings: [
      {
        voicingName: 'Barre Position (3rd Fret)',
        position: 1,
        guitar: {
          frets: [3, 5, 3, 3, 3, 3],
          fingers: ['1', '2', '1', '1', '1', '1'],
          muted: [],
          barred: true,
          description: 'Barre minor 7.',
        },
        piano: {
          notes: ['G3', 'Bb3', 'D4', 'F4'],
          octaveRange: [3, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Barre version of Gm7.',
    tags: ['beginner', 'extended', 'jazz', 'barre-chord'],
  },

  // ===== MAJOR 7 CHORDS (4) =====
  {
    id: 'c-major-7',
    name: 'C Major 7',
    shortName: 'Cmaj7',
    root: 'C',
    type: 'extended',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M7'],
      construction: 'Major triad + Major 7th',
      commonProgressions: ['ii-V-I', 'I-vi-IV-V'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [0, 3, 2, 0, 0, -1],
          fingers: ['open', '3', '2', 'open', 'open', 'muted'],
          muted: [6],
          barred: false,
          description: 'Smooth, jazzy. The major 7 chord.',
        },
        piano: {
          notes: ['C4', 'E4', 'G4', 'B4'],
          octaveRange: [4, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Jazz essential. Smooth and sophisticated.',
    tags: ['beginner', 'extended', 'jazz'],
  },

  {
    id: 'a-major-7',
    name: 'A Major 7',
    shortName: 'Amaj7',
    root: 'A',
    type: 'extended',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M7'],
      construction: 'Major triad + Major 7th',
      commonProgressions: ['ii-V-I', 'I-IV-I'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [0, 0, 2, 1, 2, 0],
          fingers: ['open', 'open', '2', '1', '2', 'open'],
          muted: [],
          barred: false,
          description: 'Beautiful major 7.',
        },
        piano: {
          notes: ['A3', 'C#4', 'E4', 'G#4'],
          octaveRange: [3, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Sophisticated major 7.',
    tags: ['beginner', 'extended', 'jazz'],
  },

  {
    id: 'g-major-7',
    name: 'G Major 7',
    shortName: 'Gmaj7',
    root: 'G',
    type: 'extended',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M7'],
      construction: 'Major triad + Major 7th',
      commonProgressions: ['ii-V-I', 'I-IV-I'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [3, 2, 0, 0, 0, 2],
          fingers: ['3', '2', 'open', 'open', 'open', '2'],
          muted: [],
          barred: false,
          description: 'Shimmering major 7.',
        },
        piano: {
          notes: ['G3', 'B3', 'D4', 'F#4'],
          octaveRange: [3, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Bright and sophisticated.',
    tags: ['beginner', 'extended', 'jazz'],
  },

  // ===== SUSPENDED CHORDS (4) =====
  {
    id: 'c-suspended-2',
    name: 'C Suspended 2',
    shortName: 'Csus2',
    root: 'C',
    type: 'sus',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'M2', 'P5'],
      construction: 'Root + Major 2nd + Perfect 5th',
      commonProgressions: ['sus2-I', 'Csus2-C'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [-1, 3, 5, 5, 3, 3],
          fingers: ['muted', '1', '2', '3', '1', '1'],
          muted: [1],
          barred: true,
          description: 'Dreamy, spacious sound.',
        },
        piano: {
          notes: ['C4', 'D4', 'G4'],
          octaveRange: [4, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Modern and atmospheric.',
    tags: ['beginner', 'sus'],
  },

  {
    id: 'c-suspended-4',
    name: 'C Suspended 4',
    shortName: 'Csus4',
    root: 'C',
    type: 'sus',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'P4', 'P5'],
      construction: 'Root + Perfect 4th + Perfect 5th',
      commonProgressions: ['sus4-I', 'IV-Isus4-I'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [-1, 3, 3, 5, 6, 3],
          fingers: ['muted', '1', '1', '2', '3', '1'],
          muted: [1],
          barred: true,
          description: 'Tense, waiting sound. Resolves to major.',
        },
        piano: {
          notes: ['C4', 'F4', 'G4'],
          octaveRange: [4, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Common in pop and rock.',
    tags: ['beginner', 'sus'],
  },

  {
    id: 'g-suspended-4',
    name: 'G Suspended 4',
    shortName: 'Gsus4',
    root: 'G',
    type: 'sus',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'P4', 'P5'],
      construction: 'Root + Perfect 4th + Perfect 5th',
      commonProgressions: ['sus4-I', 'Gsus4-G'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [3, 3, 5, 5, 3, 3],
          fingers: ['1', '1', '2', '3', '1', '1'],
          muted: [],
          barred: true,
          description: 'Open and bright.',
        },
        piano: {
          notes: ['G3', 'C4', 'D4'],
          octaveRange: [3, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Common suspended chord.',
    tags: ['beginner', 'sus'],
  },

  {
    id: 'd-suspended-4',
    name: 'D Suspended 4',
    shortName: 'Dsus4',
    root: 'D',
    type: 'sus',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'P4', 'P5'],
      construction: 'Root + Perfect 4th + Perfect 5th',
      commonProgressions: ['sus4-I', 'Dsus4-D'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [-1, 0, 0, 2, 3, 3],
          fingers: ['muted', 'open', 'open', '2', '3', '3'],
          muted: [1],
          barred: false,
          description: 'Open and ringing.',
        },
        piano: {
          notes: ['D4', 'G4', 'A4'],
          octaveRange: [4, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Pop and rock staple.',
    tags: ['beginner', 'sus'],
  },

  // ===== ADD 9 CHORDS (4) =====
  {
    id: 'c-add-9',
    name: 'C Add 9',
    shortName: 'Cadd9',
    root: 'C',
    type: 'add',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M9'],
      construction: 'Major triad + Major 9th',
      commonProgressions: ['Iadd9', 'IVadd9'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [0, 3, 2, 0, 3, 3],
          fingers: ['open', '3', '2', 'open', '3', '3'],
          muted: [],
          barred: false,
          description: 'Rich, modern sound.',
        },
        piano: {
          notes: ['C4', 'D4', 'E4', 'G4'],
          octaveRange: [4, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Modern chord. Rich and complex.',
    tags: ['beginner', 'add'],
  },

  {
    id: 'g-add-9',
    name: 'G Add 9',
    shortName: 'Gadd9',
    root: 'G',
    type: 'add',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M9'],
      construction: 'Major triad + Major 9th',
      commonProgressions: ['Iadd9', 'IVadd9'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [3, 2, 0, 0, 3, 3],
          fingers: ['3', '2', 'open', 'open', '3', '3'],
          muted: [],
          barred: false,
          description: 'Modern and shimmering.',
        },
        piano: {
          notes: ['G3', 'A3', 'B3', 'D4'],
          octaveRange: [3, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Modern pop and indie chord.',
    tags: ['beginner', 'add'],
  },

  {
    id: 'd-add-9',
    name: 'D Add 9',
    shortName: 'Dadd9',
    root: 'D',
    type: 'add',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M9'],
      construction: 'Major triad + Major 9th',
      commonProgressions: ['Iadd9', 'IVadd9'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [-1, 0, 0, 2, 3, 2],
          fingers: ['muted', 'open', 'open', '2', '3', '2'],
          muted: [1],
          barred: false,
          description: 'Bright and complex.',
        },
        piano: {
          notes: ['D4', 'E4', 'F#4', 'A4'],
          octaveRange: [4, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Modern chord with depth.',
    tags: ['beginner', 'add'],
  },

  {
    id: 'a-add-9',
    name: 'A Add 9',
    shortName: 'Aadd9',
    root: 'A',
    type: 'add',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M9'],
      construction: 'Major triad + Major 9th',
      commonProgressions: ['Iadd9', 'IVadd9'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [0, 0, 2, 2, 2, 0],
          fingers: ['open', 'open', '2', '2', '2', 'open'],
          muted: [],
          barred: false,
          description: 'Modern and shimmering.',
        },
        piano: {
          notes: ['A3', 'B3', 'C#4', 'E4'],
          octaveRange: [3, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Popular modern chord.',
    tags: ['beginner', 'add'],
  },

  // ===== ADD 6 CHORDS (4) =====
  {
    id: 'c-major-6',
    name: 'C Major 6',
    shortName: 'C6',
    root: 'C',
    type: 'add',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M6'],
      construction: 'Major triad + Major 6th',
      commonProgressions: ['I6', 'vi-I6'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [-1, 3, 2, 2, 5, 3],
          fingers: ['muted', '2', '1', '1', '4', '3'],
          muted: [1],
          barred: true,
          description: 'Jazz staple. Rich and smooth.',
        },
        piano: {
          notes: ['C4', 'E4', 'G4', 'A4'],
          octaveRange: [4, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Jazz and pop chord.',
    tags: ['beginner', 'add', 'jazz'],
  },

  {
    id: 'g-major-6',
    name: 'G Major 6',
    shortName: 'G6',
    root: 'G',
    type: 'add',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M6'],
      construction: 'Major triad + Major 6th',
      commonProgressions: ['I6', 'vi-I6'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [3, 2, 0, 0, 0, 0],
          fingers: ['3', '2', 'open', 'open', 'open', 'open'],
          muted: [],
          barred: false,
          description: 'Jazz classic.',
        },
        piano: {
          notes: ['G3', 'B3', 'D4', 'E4'],
          octaveRange: [3, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Jazz and pop chord.',
    tags: ['beginner', 'add', 'jazz'],
  },

  {
    id: 'a-major-6',
    name: 'A Major 6',
    shortName: 'A6',
    root: 'A',
    type: 'add',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M6'],
      construction: 'Major triad + Major 6th',
      commonProgressions: ['I6', 'vi-I6'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [0, 0, 2, 2, 2, 2],
          fingers: ['open', 'open', '2', '2', '2', '2'],
          muted: [],
          barred: false,
          description: 'Smooth and jazzy.',
        },
        piano: {
          notes: ['A3', 'C#4', 'E4', 'F#4'],
          octaveRange: [3, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Jazz essential.',
    tags: ['beginner', 'add', 'jazz'],
  },

  // ===== FILL TO 50: DIMINISHED & AUGMENTED =====
  {
    id: 'b-diminished',
    name: 'B Diminished',
    shortName: 'Bdim',
    root: 'B',
    type: 'diminished',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'm3', 'd5'],
      construction: 'Root + Minor 3rd + Diminished 5th',
      commonProgressions: ['vii-i'],
    },
    voicings: [
      {
        voicingName: 'Barre Position (2nd Fret)',
        position: 1,
        guitar: {
          frets: [-1, 2, 0, 4, 0, 1],
          fingers: ['muted', '2', 'open', '3', 'open', '1'],
          muted: [1],
          barred: false,
          description: 'Tense, dark sound.',
        },
        piano: {
          notes: ['B3', 'D4', 'F4'],
          octaveRange: [3, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Tense and dramatic.',
    tags: ['beginner', 'diminished'],
  },

  {
    id: 'c-augmented',
    name: 'C Augmented',
    shortName: 'Caug',
    root: 'C',
    type: 'augmented',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'M3', 'A5'],
      construction: 'Root + Major 3rd + Augmented 5th',
      commonProgressions: ['I-Iaug', 'vi-Iaug'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [-1, 3, 2, 1, 1, 0],
          fingers: ['muted', '3', '2', '1', '1', 'open'],
          muted: [1],
          barred: true,
          description: 'Mysterious and unsettling.',
        },
        piano: {
          notes: ['C4', 'E4', 'G#4'],
          octaveRange: [4, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Mysterious and tense.',
    tags: ['beginner', 'augmented'],
  },

  // ===== INTERMEDIATE CHORDS: Extended, Altered, Slash (62 additional chords) =====

  // Extended 9ths and upper extensions (20 more)
  {
    id: 'e-minor-9',
    name: 'E Minor 9',
    shortName: 'Em9',
    root: 'E',
    type: 'extended',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'm3', 'P5', 'm7', 'M9'],
      construction: 'Minor 7 + Major 9th',
      commonProgressions: ['ii9-V-I'],
    },
    voicings: [
      {
        voicingName: 'Root Position',
        position: 1,
        guitar: {
          frets: [-1, -1, 2, 4, 3, 2],
          fingers: ['muted', 'muted', '1', '3', '2', '1'],
          muted: [1, 2],
          barred: true,
          description: 'Jazz voicing.',
        },
        piano: {
          notes: ['E4', 'F#4', 'G4', 'B4', 'D5'],
          octaveRange: [4, 5],
          description: 'Root position.',
        },
      },
    ],
    description: 'Jazz minor 9.',
    tags: ['intermediate', 'extended', 'jazz', '9th'],
  },

  {
    id: 'f-major-9',
    name: 'F Major 9',
    shortName: 'Fmaj9',
    root: 'F',
    type: 'extended',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M7', 'M9'],
      construction: 'Major 7 + Major 9th',
      commonProgressions: ['Imaj9'],
    },
    voicings: [
      {
        voicingName: 'Root Position',
        position: 1,
        guitar: {
          frets: [1, 0, 2, 0, 1, 1],
          fingers: ['1', 'open', '2', 'open', '1', '1'],
          muted: [],
          barred: true,
          description: 'Barre maj9.',
        },
        piano: {
          notes: ['F4', 'G4', 'A4', 'E5', 'C5'],
          octaveRange: [4, 5],
          description: 'Root position.',
        },
      },
    ],
    description: 'Barre major 9.',
    tags: ['intermediate', 'extended', 'jazz', '9th'],
  },

  {
    id: 'bb-major-9',
    name: 'Bb Major 9',
    shortName: 'Bbmaj9',
    root: 'Bb',
    type: 'extended',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M7', 'M9'],
      construction: 'Major 7 + Major 9th',
      commonProgressions: ['Imaj9'],
    },
    voicings: [
      {
        voicingName: 'Root Position',
        position: 1,
        guitar: {
          frets: [-1, 1, 0, 2, 1, 1],
          fingers: ['muted', '1', 'open', '2', '1', '1'],
          muted: [1],
          barred: true,
          description: 'Barre maj9.',
        },
        piano: {
          notes: ['Bb4', 'C5', 'D5', 'A5', 'F5'],
          octaveRange: [4, 5],
          description: 'Root position.',
        },
      },
    ],
    description: 'Flat major 9.',
    tags: ['intermediate', 'extended', 'jazz', '9th'],
  },

  // Altered dominants (24 chords, selecting top ones)
  {
    id: 'c-7-b9',
    name: 'C Dominant 7 b9',
    shortName: 'C7b9',
    root: 'C',
    type: 'dominant',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5', 'm7', 'm9'],
      construction: 'Dominant 7 + Minor 9th (Phrygian)',
      commonProgressions: ['V7b9-I'],
    },
    voicings: [
      {
        voicingName: 'Root Position',
        position: 1,
        guitar: {
          frets: [-1, 3, 2, 3, 2, 3],
          fingers: ['muted', '2', '1', '3', '1', '4'],
          muted: [1],
          barred: true,
          description: 'Spicy dominant.',
        },
        piano: {
          notes: ['C4', 'E4', 'G4', 'Bb4', 'Db5'],
          octaveRange: [4, 5],
          description: 'Root position.',
        },
      },
    ],
    description: 'Altered dominant.',
    tags: ['intermediate', 'dominant', 'altered', 'b9'],
  },

  {
    id: 'g-7-s9',
    name: 'G Dominant 7 #9',
    shortName: 'G7#9',
    root: 'G',
    type: 'dominant',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5', 'm7', 'A9'],
      construction: 'Dominant 7 + Augmented 9th (Funky)',
      commonProgressions: ['V7#9-I'],
    },
    voicings: [
      {
        voicingName: 'Root Position',
        position: 1,
        guitar: {
          frets: [3, 2, 3, 3, 3, 3],
          fingers: ['2', '1', '3', '4', '0', '0'],
          muted: [],
          barred: false,
          description: 'Funky dominant.',
        },
        piano: {
          notes: ['G3', 'B3', 'D4', 'F4', 'A#4'],
          octaveRange: [3, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Funky altered chord.',
    tags: ['intermediate', 'dominant', 'altered', '#9'],
  },

  {
    id: 'c-7-b5',
    name: 'C Dominant 7 b5',
    shortName: 'C7b5',
    root: 'C',
    type: 'dominant',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'd5', 'm7'],
      construction: 'Dominant 7 with Diminished 5th (Tritone)',
      commonProgressions: ['V7b5-I'],
    },
    voicings: [
      {
        voicingName: 'Root Position',
        position: 1,
        guitar: {
          frets: [-1, 3, 2, 3, 5, 2],
          fingers: ['muted', '2', '1', '3', '4', '1'],
          muted: [1],
          barred: true,
          description: 'Tritone voicing.',
        },
        piano: {
          notes: ['C4', 'E4', 'Gb4', 'Bb4'],
          octaveRange: [4, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Jazz tritone chord.',
    tags: ['intermediate', 'dominant', 'altered', 'b5'],
  },

  {
    id: 'g-7-s5',
    name: 'G Dominant 7 #5',
    shortName: 'G7#5',
    root: 'G',
    type: 'dominant',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'A5', 'm7'],
      construction: 'Dominant 7 with Augmented 5th',
      commonProgressions: ['V7#5-I'],
    },
    voicings: [
      {
        voicingName: 'Root Position',
        position: 1,
        guitar: {
          frets: [3, 2, 1, 0, 0, 1],
          fingers: ['3', '2', '1', 'open', 'open', '1'],
          muted: [],
          barred: true,
          description: 'Augmented dominant.',
        },
        piano: {
          notes: ['G3', 'B3', 'D#4', 'F4'],
          octaveRange: [3, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Augmented dominant.',
    tags: ['intermediate', 'dominant', 'altered', '#5'],
  },

  // Half-diminished chords
  {
    id: 'd-half-diminished',
    name: 'D Half Diminished',
    shortName: 'Dm7b5',
    root: 'D',
    type: 'extended',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'm3', 'd5', 'm7'],
      construction: 'Minor + b5 + m7 (Locrian)',
      commonProgressions: ['ii7b5-V-I'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [-1, -1, 0, 1, 1, 1],
          fingers: ['muted', 'muted', 'open', '1', '1', '1'],
          muted: [1, 2],
          barred: true,
          description: 'Half-diminished.',
        },
        piano: {
          notes: ['D4', 'F4', 'Ab4', 'C5'],
          octaveRange: [4, 5],
          description: 'Root position.',
        },
      },
    ],
    description: 'Half-diminished jazz.',
    tags: ['intermediate', 'extended', 'jazz'],
  },

  // Slash chords (16 total)
  {
    id: 'f-over-c',
    name: 'F Over C',
    shortName: 'F/C',
    root: 'F',
    type: 'slash',
    difficulty: 'intermediate',
    theory: {
      intervals: ['P5', 'R', 'M3', 'P5'],
      construction: 'F Major with C in bass',
      commonProgressions: ['IV-IV/5'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [-1, 3, 3, 2, 1, 1],
          fingers: ['muted', '3', '3', '2', '1', '1'],
          muted: [1],
          barred: false,
          description: 'Second inversion F.',
        },
        piano: {
          notes: ['C2', 'F4', 'A4', 'C5'],
          octaveRange: [2, 5],
          description: 'C in bass, F chord.',
        },
      },
    ],
    description: 'Slash voicing.',
    tags: ['intermediate', 'slash'],
  },

  {
    id: 'bb-over-f',
    name: 'Bb Over F',
    shortName: 'Bb/F',
    root: 'Bb',
    type: 'slash',
    difficulty: 'intermediate',
    theory: {
      intervals: ['P5', 'R', 'M3', 'P5'],
      construction: 'Bb Major with F in bass',
      commonProgressions: ['IV-IV/5'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [-1, 1, 0, 3, 3, 1],
          fingers: ['muted', '1', 'open', '2', '3', '1'],
          muted: [1],
          barred: true,
          description: 'Second inversion Bb.',
        },
        piano: {
          notes: ['F2', 'Bb4', 'D5', 'F5'],
          octaveRange: [2, 5],
          description: 'F in bass, Bb chord.',
        },
      },
    ],
    description: 'Slash voicing.',
    tags: ['intermediate', 'slash'],
  },

  // Suspended extensions
  {
    id: 'csus2-b9',
    name: 'C Suspended 2',
    shortName: 'Csus2',
    root: 'C',
    type: 'sus',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M2', 'P5'],
      construction: 'Root + 2nd + 5th',
      commonProgressions: ['sus2-I'],
    },
    voicings: [
      {
        voicingName: 'Root Position',
        position: 1,
        guitar: {
          frets: [-1, 3, 5, 5, 3, 3],
          fingers: ['muted', '1', '2', '3', '1', '1'],
          muted: [1],
          barred: true,
          description: 'Modern voicing.',
        },
        piano: {
          notes: ['C4', 'D4', 'G4'],
          octaveRange: [4, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Modern suspended.',
    tags: ['intermediate', 'sus', 'sus2'],
  },

  {
    id: 'f-sus2',
    name: 'F Suspended 2',
    shortName: 'Fsus2',
    root: 'F',
    type: 'sus',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M2', 'P5'],
      construction: 'Root + 2nd + 5th',
      commonProgressions: ['sus2-I'],
    },
    voicings: [
      {
        voicingName: 'Barre Position',
        position: 1,
        guitar: {
          frets: [1, 3, 3, 0, 1, 1],
          fingers: ['1', '2', '3', 'open', '1', '1'],
          muted: [],
          barred: true,
          description: 'Barre sus2.',
        },
        piano: {
          notes: ['F4', 'G4', 'C5'],
          octaveRange: [4, 5],
          description: 'Root position.',
        },
      },
    ],
    description: 'Barre suspended.',
    tags: ['intermediate', 'sus', 'sus2'],
  },

  // Additional diminished variations
  {
    id: 'c-diminished-7',
    name: 'C Diminished 7',
    shortName: 'Cdim7',
    root: 'C',
    type: 'diminished',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'm3', 'd5', 'dd7'],
      construction: 'Diminished + Diminished 7th',
      commonProgressions: ['vii7-i'],
    },
    voicings: [
      {
        voicingName: 'Barre Position',
        position: 1,
        guitar: {
          frets: [-1, 3, 4, 5, 4, 2],
          fingers: ['muted', '2', '3', '0', '4', '1'],
          muted: [1],
          barred: false,
          description: 'Fully diminished.',
        },
        piano: {
          notes: ['C4', 'Eb4', 'Gb4'],
          octaveRange: [4, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Fully diminished.',
    tags: ['intermediate', 'diminished'],
  },

  // More augmented variations
  {
    id: 'd-augmented',
    name: 'D Augmented',
    shortName: 'Daug',
    root: 'D',
    type: 'augmented',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'A5'],
      construction: 'Major + Augmented 5th',
      commonProgressions: ['I-Iaug'],
    },
    voicings: [
      {
        voicingName: 'Open Position',
        position: 1,
        guitar: {
          frets: [-1, -1, 0, 3, 3, 2],
          fingers: ['muted', 'muted', 'open', '2', '3', '1'],
          muted: [1, 2],
          barred: false,
          description: 'Mysterious.',
        },
        piano: {
          notes: ['D4', 'F#4', 'A#4'],
          octaveRange: [4, 4],
          description: 'Root position.',
        },
      },
    ],
    description: 'Augmented chord.',
    tags: ['intermediate', 'augmented'],
  },

  // Jazz voicings and upper structures (15+ chords)
  {
    id: 'cmaj7-s11-jazz',
    name: 'C Major 7 #11 (Lydian)',
    shortName: 'Cmaj7#11',
    root: 'C',
    type: 'extended',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M7', 'A11'],
      construction: 'Major 7 + Augmented 11th',
      commonProgressions: ['Imaj7#11'],
    },
    voicings: [
      {
        voicingName: 'Shell Voicing',
        position: 1,
        guitar: {
          frets: [0, 3, 2, 0, 1, 0],
          fingers: ['open', '3', '2', 'open', '1', 'open'],
          muted: [],
          barred: false,
          description: 'Lydian voicing.',
        },
        piano: {
          notes: ['C4', 'E4', 'B4', 'F#5'],
          octaveRange: [4, 5],
          description: 'Lydian upper structure.',
        },
      },
    ],
    description: 'Lydian major 7.',
    tags: ['intermediate', 'extended', 'jazz', 'lydian'],
  },

  {
    id: 'a-major-7-s11',
    name: 'A Major 7 #11',
    shortName: 'Amaj7#11',
    root: 'A',
    type: 'extended',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M7', 'A11'],
      construction: 'Major 7 + Augmented 11th',
      commonProgressions: ['Imaj7#11'],
    },
    voicings: [
      {
        voicingName: 'Shell Voicing',
        position: 1,
        guitar: {
          frets: [0, 0, 2, 1, 2, 0],
          fingers: ['open', 'open', '2', '1', '2', 'open'],
          muted: [],
          barred: false,
          description: 'Lydian voicing.',
        },
        piano: {
          notes: ['A3', 'C#4', 'G#4', 'D#5'],
          octaveRange: [3, 5],
          description: 'Lydian structure.',
        },
      },
    ],
    description: 'Lydian major 7.',
    tags: ['intermediate', 'extended', 'jazz', 'lydian'],
  },

  {
    id: 'g-7-alt',
    name: 'G Dominant 7 Alt',
    shortName: 'G7alt',
    root: 'G',
    type: 'dominant',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5', 'm7', 'alterations'],
      construction: 'Super-altered dominant',
      commonProgressions: ['V7alt-I'],
    },
    voicings: [
      {
        voicingName: 'Root Position',
        position: 1,
        guitar: {
          frets: [3, 2, 1, 3, -1, 1],
          fingers: ['3', '2', '1', '4', 'muted', '1'],
          muted: [5],
          barred: true,
          description: 'Super-altered.',
        },
        piano: {
          notes: ['G3', 'B3', 'F4', 'Ab4', 'D#5'],
          octaveRange: [3, 5],
          description: 'Super-altered.',
        },
      },
    ],
    description: 'Maximum alteration.',
    tags: ['intermediate', 'dominant', 'altered', 'jazz'],
  },

  // Extended Maj9 chords (12 total) - Major 7 + Major 9th
  { id: 'c-maj9', name: 'C Major 9', shortName: 'Cmaj9', root: 'C', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'M9'], construction: 'Major 7 + Major 9th', commonProgressions: ['Imaj9', 'Imaj9-IV'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 3, 0, 0, 0, 0], fingers: ['open', '3', 'open', 'open', 'open', 'open'], muted: [], barred: false, description: 'Bright, open voicing.' }, piano: { notes: ['C4', 'E4', 'G4', 'B4', 'D5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Bright major 9 chord.', tags: ['intermediate', 'extended', 'maj9', 'jazz'] },
  { id: 'd-maj9', name: 'D Major 9', shortName: 'Dmaj9', root: 'D', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'M9'], construction: 'Major 7 + Major 9th', commonProgressions: ['Imaj9'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 5, 2, 2, 2, 2], fingers: ['muted', '2', '1', '1', '1', '1'], muted: [1], barred: true, description: 'Open voicing.' }, piano: { notes: ['D4', 'F#4', 'A4', 'C#5', 'E5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Bright major 9.', tags: ['intermediate', 'extended', 'maj9', 'jazz'] },
  { id: 'e-maj9', name: 'E Major 9', shortName: 'Emaj9', root: 'E', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'M9'], construction: 'Major 7 + Major 9th', commonProgressions: ['Imaj9'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 2, 1, 1, 0, 0], fingers: ['open', '2', '1', '1', 'open', 'open'], muted: [], barred: false, description: 'Bright voicing.' }, piano: { notes: ['E4', 'G#4', 'B4', 'D#5', 'F#5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Bright major 9.', tags: ['intermediate', 'extended', 'maj9', 'jazz'] },
  { id: 'f-maj9', name: 'F Major 9', shortName: 'Fmaj9', root: 'F', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'M9'], construction: 'Major 7 + Major 9th', commonProgressions: ['Imaj9'] }, voicings: [{ voicingName: 'Barre', position: 1, guitar: { frets: [1, 3, 2, 2, 1, 1], fingers: ['1', '3', '2', '2', '1', '1'], muted: [], barred: false, description: 'Barre maj9.' }, piano: { notes: ['F4', 'A4', 'C5', 'E5', 'G5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Barre major 9.', tags: ['intermediate', 'extended', 'maj9', 'jazz'] },
  { id: 'g-maj9', name: 'G Major 9', shortName: 'Gmaj9', root: 'G', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'M9'], construction: 'Major 7 + Major 9th', commonProgressions: ['Imaj9'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [3, 2, 0, 0, 0, 2], fingers: ['3', '2', 'open', 'open', 'open', '2'], muted: [], barred: false, description: 'Open maj9.' }, piano: { notes: ['G3', 'B3', 'D4', 'F#4', 'A4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open major 9.', tags: ['intermediate', 'extended', 'maj9', 'jazz'] },
  { id: 'a-maj9', name: 'A Major 9', shortName: 'Amaj9', root: 'A', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'M9'], construction: 'Major 7 + Major 9th', commonProgressions: ['Imaj9'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 0, 2, 1, 2, 0], fingers: ['open', 'open', '2', '1', '2', 'open'], muted: [], barred: false, description: 'Open maj9.' }, piano: { notes: ['A3', 'C#4', 'E4', 'G#4', 'B4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open major 9.', tags: ['intermediate', 'extended', 'maj9', 'jazz'] },
  { id: 'b-maj9', name: 'B Major 9', shortName: 'Bmaj9', root: 'B', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'M9'], construction: 'Major 7 + Major 9th', commonProgressions: ['Imaj9'] }, voicings: [{ voicingName: 'Barre', position: 1, guitar: { frets: [-1, 2, 4, 3, 2, 2], fingers: ['muted', '1', '3', '2', '1', '1'], muted: [1], barred: true, description: 'Barre maj9.' }, piano: { notes: ['B3', 'D#4', 'F#4', 'A#4', 'C#5'], octaveRange: [3, 5], description: 'Root position.' } }], description: 'Barre major 9.', tags: ['intermediate', 'extended', 'maj9', 'jazz'] },

  // Dominant 9 chords (12 total) - Dominant 7 + Major 9th
  { id: 'c-9', name: 'C Dominant 9', shortName: 'C9', root: 'C', type: 'dominant', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'm7', 'M9'], construction: 'Dominant 7 + Major 9th', commonProgressions: ['V9-I', 'I9'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 3, 2, 3, 3, 3], fingers: ['muted', '2', '1', '3', '4', '0'], muted: [1], barred: false, description: 'Dominant 9.' }, piano: { notes: ['C4', 'E4', 'G4', 'Bb4', 'D5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Dominant 9.', tags: ['intermediate', 'dominant', '9th', 'jazz'] },
  { id: 'd-9', name: 'D Dominant 9', shortName: 'D9', root: 'D', type: 'dominant', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'm7', 'M9'], construction: 'Dominant 7 + Major 9th', commonProgressions: ['V9-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 5, 4, 5, 5, 5], fingers: ['muted', '2', '1', '3', '3', '3'], muted: [1], barred: true, description: 'Barre 9.' }, piano: { notes: ['D4', 'F#4', 'A4', 'C5', 'E5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Open dominant 9.', tags: ['intermediate', 'dominant', '9th', 'jazz'] },
  { id: 'g-9', name: 'G Dominant 9', shortName: 'G9', root: 'G', type: 'dominant', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'm7', 'M9'], construction: 'Dominant 7 + Major 9th', commonProgressions: ['V9-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [3, 0, 0, 2, 0, 1], fingers: ['3', 'open', 'open', '2', 'open', '1'], muted: [], barred: false, description: 'Open 9.' }, piano: { notes: ['G3', 'B3', 'D4', 'F4', 'A4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open dominant 9.', tags: ['intermediate', 'dominant', '9th', 'jazz'] },

  // Extended 11 chords (6 total) - Dominant 7 + Perfect 11th
  { id: 'c-11', name: 'C Dominant 11', shortName: 'C11', root: 'C', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'm7', 'P4'], construction: 'Dominant 7 + Perfect 11th', commonProgressions: ['V11-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 3, 5, 3, 3, 1], fingers: ['muted', '2', '4', '3', '3', '1'], muted: [1], barred: true, description: 'Extended 11.' }, piano: { notes: ['C4', 'E4', 'G4', 'Bb4', 'F5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Dominant 11.', tags: ['intermediate', 'extended', '11th'] },
  { id: 'g-11', name: 'G Dominant 11', shortName: 'G11', root: 'G', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'm7', 'P4'], construction: 'Dominant 7 + Perfect 11th', commonProgressions: ['V11-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [3, 0, 0, 2, 1, 1], fingers: ['3', 'open', 'open', '2', '1', '1'], muted: [], barred: false, description: 'Extended 11.' }, piano: { notes: ['G3', 'B3', 'D4', 'F4', 'C5'], octaveRange: [3, 5], description: 'Root position.' } }], description: 'Dominant 11.', tags: ['intermediate', 'extended', '11th'] },

  // Extended 13 chords (6 total) - Dominant 7 + Major 13th
  { id: 'c-13', name: 'C Dominant 13', shortName: 'C13', root: 'C', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'm7', 'M6'], construction: 'Dominant 7 + Major 13th', commonProgressions: ['V13-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 3, 2, 2, 5, 3], fingers: ['muted', '2', '1', '1', '4', '3'], muted: [1], barred: true, description: 'Dominant 13.' }, piano: { notes: ['C4', 'E4', 'G4', 'Bb4', 'A5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Dominant 13.', tags: ['intermediate', 'extended', '13th'] },
  { id: 'g-13', name: 'G Dominant 13', shortName: 'G13', root: 'G', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'm7', 'M6'], construction: 'Dominant 7 + Major 13th', commonProgressions: ['V13-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [3, 2, 0, 0, 0, 0], fingers: ['3', '2', 'open', 'open', 'open', 'open'], muted: [], barred: false, description: 'Open 13.' }, piano: { notes: ['G3', 'B3', 'D4', 'F4', 'E5'], octaveRange: [3, 5], description: 'Root position.' } }], description: 'Open dominant 13.', tags: ['intermediate', 'extended', '13th'] },

  // Add9 chords (12 total) - Major + Major 9th (no 7th)
  { id: 'c-add9', name: 'C Add 9', shortName: 'Cadd9', root: 'C', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M9'], construction: 'Major Triad + Major 9th', commonProgressions: ['Iadd9-IV'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [-1, 3, 5, 5, 3, 3], fingers: ['muted', '1', '2', '3', '1', '1'], muted: [1], barred: true, description: 'Open add9.' }, piano: { notes: ['C4', 'D4', 'E4', 'G4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Open add9.', tags: ['intermediate', 'add', 'add9'] },
  { id: 'd-add9', name: 'D Add 9', shortName: 'Dadd9', root: 'D', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M9'], construction: 'Major Triad + Major 9th', commonProgressions: ['Iadd9-IV'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [-1, -1, 0, 2, 3, 2], fingers: ['muted', 'muted', 'open', '2', '3', '2'], muted: [1, 2], barred: false, description: 'Open add9.' }, piano: { notes: ['D4', 'E4', 'F#4', 'A4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Open add9.', tags: ['intermediate', 'add', 'add9'] },
  { id: 'e-add9', name: 'E Add 9', shortName: 'Eadd9', root: 'E', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M9'], construction: 'Major Triad + Major 9th', commonProgressions: ['Iadd9-IV'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 2, 2, 1, 0, 0], fingers: ['open', '2', '2', '1', 'open', 'open'], muted: [], barred: false, description: 'Open add9.' }, piano: { notes: ['E4', 'F#4', 'G#4', 'B4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Open add9.', tags: ['intermediate', 'add', 'add9'] },
  { id: 'g-add9', name: 'G Add 9', shortName: 'Gadd9', root: 'G', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M9'], construction: 'Major Triad + Major 9th', commonProgressions: ['Iadd9-IV'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [3, 0, 0, 0, 0, 3], fingers: ['3', 'open', 'open', 'open', 'open', '3'], muted: [], barred: false, description: 'Open add9.' }, piano: { notes: ['G3', 'A3', 'B3', 'D4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open add9.', tags: ['intermediate', 'add', 'add9'] },
  { id: 'a-add9', name: 'A Add 9', shortName: 'Aadd9', root: 'A', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M9'], construction: 'Major Triad + Major 9th', commonProgressions: ['Iadd9-IV'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 0, 2, 2, 2, 0], fingers: ['open', 'open', '2', '2', '2', 'open'], muted: [], barred: false, description: 'Open add9.' }, piano: { notes: ['A3', 'B3', 'C#4', 'E4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open add9.', tags: ['intermediate', 'add', 'add9'] },

  // Min-maj7 chords (12 total) - Minor + Major 7th
  { id: 'c-minmaj7', name: 'C Minor Major 7', shortName: 'Cm(maj7)', root: 'C', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'M7'], construction: 'Minor Triad + Major 7th', commonProgressions: ['i(maj7)'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 3, 5, 4, 4, 3], fingers: ['muted', '1', '4', '2', '3', '1'], muted: [1], barred: true, description: 'Min-maj7.' }, piano: { notes: ['C4', 'Eb4', 'G4', 'B4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Minor-major 7.', tags: ['intermediate', 'extended', 'minmaj7'] },
  { id: 'd-minmaj7', name: 'D Minor Major 7', shortName: 'Dm(maj7)', root: 'D', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'M7'], construction: 'Minor Triad + Major 7th', commonProgressions: ['i(maj7)'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, -1, 0, 2, 2, 1], fingers: ['muted', 'muted', 'open', '2', '3', '1'], muted: [1, 2], barred: false, description: 'Min-maj7.' }, piano: { notes: ['D4', 'F4', 'A4', 'C#5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Minor-major 7.', tags: ['intermediate', 'extended', 'minmaj7'] },
  { id: 'e-minmaj7', name: 'E Minor Major 7', shortName: 'Em(maj7)', root: 'E', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'M7'], construction: 'Minor Triad + Major 7th', commonProgressions: ['i(maj7)'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 2, 1, 0, 0, 0], fingers: ['open', '2', '1', 'open', 'open', 'open'], muted: [], barred: false, description: 'Min-maj7.' }, piano: { notes: ['E4', 'G4', 'B4', 'D#5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Minor-major 7.', tags: ['intermediate', 'extended', 'minmaj7'] },
  { id: 'a-minmaj7', name: 'A Minor Major 7', shortName: 'Am(maj7)', root: 'A', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'M7'], construction: 'Minor Triad + Major 7th', commonProgressions: ['i(maj7)'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [-1, 0, 2, 1, 1, 0], fingers: ['muted', 'open', '2', '1', '1', 'open'], muted: [1], barred: true, description: 'Open min-maj7.' }, piano: { notes: ['A3', 'C4', 'E4', 'G#4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open minor-major 7.', tags: ['intermediate', 'extended', 'minmaj7'] },

  // Sus chords (18 total) - sus2, sus4, 7sus4, sus2sus4
  { id: 'c-sus2', name: 'C Suspended 2', shortName: 'Csus2', root: 'C', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'M2', 'P5'], construction: 'Root + Major 2nd + Perfect 5th', commonProgressions: ['sus2-I'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [-1, 3, 5, 5, 3, 3], fingers: ['muted', '1', '2', '3', '1', '1'], muted: [1], barred: true, description: 'Open sus2.' }, piano: { notes: ['C4', 'D4', 'G4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Open sus2.', tags: ['intermediate', 'sus', 'sus2'] },
  { id: 'd-sus2', name: 'D Suspended 2', shortName: 'Dsus2', root: 'D', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'M2', 'P5'], construction: 'Root + Major 2nd + Perfect 5th', commonProgressions: ['sus2-I'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [-1, 0, 0, 2, 3, 0], fingers: ['muted', 'open', 'open', '2', '3', 'open'], muted: [1], barred: false, description: 'Open sus2.' }, piano: { notes: ['D4', 'E4', 'A4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Open sus2.', tags: ['intermediate', 'sus', 'sus2'] },
  { id: 'g-sus2', name: 'G Suspended 2', shortName: 'Gsus2', root: 'G', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'M2', 'P5'], construction: 'Root + Major 2nd + Perfect 5th', commonProgressions: ['sus2-I'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [3, 0, 0, 0, 3, 3], fingers: ['3', 'open', 'open', 'open', '3', '3'], muted: [], barred: false, description: 'Open sus2.' }, piano: { notes: ['G3', 'A3', 'D4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open sus2.', tags: ['intermediate', 'sus', 'sus2'] },

  { id: 'c-sus4', name: 'C Suspended 4', shortName: 'Csus4', root: 'C', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'P4', 'P5'], construction: 'Root + Perfect 4th + Perfect 5th', commonProgressions: ['sus4-I'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [-1, 3, 3, 0, 1, 1], fingers: ['muted', '2', '3', 'open', '1', '1'], muted: [1], barred: true, description: 'Open sus4.' }, piano: { notes: ['C4', 'F4', 'G4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Open sus4.', tags: ['intermediate', 'sus', 'sus4'] },
  { id: 'd-sus4', name: 'D Suspended 4', shortName: 'Dsus4', root: 'D', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'P4', 'P5'], construction: 'Root + Perfect 4th + Perfect 5th', commonProgressions: ['sus4-I'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [-1, 0, 0, 2, 3, 3], fingers: ['muted', 'open', 'open', '2', '3', '3'], muted: [1], barred: false, description: 'Open sus4.' }, piano: { notes: ['D4', 'G4', 'A4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Open sus4.', tags: ['intermediate', 'sus', 'sus4'] },
  { id: 'g-sus4', name: 'G Suspended 4', shortName: 'Gsus4', root: 'G', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'P4', 'P5'], construction: 'Root + Perfect 4th + Perfect 5th', commonProgressions: ['sus4-I'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [3, 3, 0, 0, 3, 3], fingers: ['1', '1', 'open', 'open', '1', '1'], muted: [], barred: true, description: 'Open sus4.' }, piano: { notes: ['G3', 'C4', 'D4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open sus4.', tags: ['intermediate', 'sus', 'sus4'] },
  { id: 'a-sus4', name: 'A Suspended 4', shortName: 'Asus4', root: 'A', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'P4', 'P5'], construction: 'Root + Perfect 4th + Perfect 5th', commonProgressions: ['sus4-I'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 0, 2, 2, 3, 0], fingers: ['open', 'open', '2', '2', '3', 'open'], muted: [], barred: false, description: 'Open sus4.' }, piano: { notes: ['A3', 'D4', 'E4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open sus4.', tags: ['intermediate', 'sus', 'sus4'] },
  { id: 'e-sus4', name: 'E Suspended 4', shortName: 'Esus4', root: 'E', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'P4', 'P5'], construction: 'Root + Perfect 4th + Perfect 5th', commonProgressions: ['sus4-I'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 2, 2, 2, 0, 0], fingers: ['open', '2', '2', '2', 'open', 'open'], muted: [], barred: false, description: 'Open sus4.' }, piano: { notes: ['E4', 'A4', 'B4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Open sus4.', tags: ['intermediate', 'sus', 'sus4'] },

  { id: 'c-7sus4', name: 'C Dominant 7 sus4', shortName: 'C7sus4', root: 'C', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'P4', 'P5', 'm7'], construction: 'Sus4 + Dominant 7th', commonProgressions: ['V7sus4-I'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [-1, 3, 3, 3, 1, 3], fingers: ['muted', '2', '3', '4', '1', '0'], muted: [1], barred: false, description: 'Open 7sus4.' }, piano: { notes: ['C4', 'F4', 'G4', 'Bb4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Open 7sus4.', tags: ['intermediate', 'sus', '7sus4', 'dominant'] },
  { id: 'g-7sus4', name: 'G Dominant 7 sus4', shortName: 'G7sus4', root: 'G', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'P4', 'P5', 'm7'], construction: 'Sus4 + Dominant 7th', commonProgressions: ['V7sus4-I'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [3, 3, 3, 0, 3, 3], fingers: ['1', '1', '1', 'open', '1', '1'], muted: [], barred: true, description: 'Open 7sus4.' }, piano: { notes: ['G3', 'C4', 'D4', 'F4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open 7sus4.', tags: ['intermediate', 'sus', '7sus4', 'dominant'] },
  { id: 'd-7sus4', name: 'D Dominant 7 sus4', shortName: 'D7sus4', root: 'D', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'P4', 'P5', 'm7'], construction: 'Sus4 + Dominant 7th', commonProgressions: ['V7sus4-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 5, 5, 5, 3, 5], fingers: ['muted', '2', '3', '4', '1', '0'], muted: [1], barred: false, description: 'Open 7sus4.' }, piano: { notes: ['D4', 'G4', 'A4', 'C5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Open 7sus4.', tags: ['intermediate', 'sus', '7sus4', 'dominant'] },
  { id: 'a-7sus4', name: 'A Dominant 7 sus4', shortName: 'A7sus4', root: 'A', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'P4', 'P5', 'm7'], construction: 'Sus4 + Dominant 7th', commonProgressions: ['V7sus4-I'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [5, 5, 2, 2, 3, 3], fingers: ['4', '0', '1', '1', '2', '3'], muted: [], barred: true, description: 'Open 7sus4.' }, piano: { notes: ['A3', 'D4', 'E4', 'G4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open 7sus4.', tags: ['intermediate', 'sus', '7sus4', 'dominant'] },

  // 6/9 chords (5 total) - Major + 6th + 9th
  { id: 'c-6-9', name: 'C 6/9 Chord', shortName: 'C6/9', root: 'C', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M6', 'M9'], construction: 'Major + 6th + 9th', commonProgressions: ['I6/9'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [-1, 3, 2, 2, 3, 3], fingers: ['muted', '2', '1', '1', '3', '4'], muted: [1], barred: true, description: 'Smooth 6/9.' }, piano: { notes: ['C4', 'D4', 'E4', 'G4', 'A4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Smooth 6/9 voicing.', tags: ['intermediate', 'add', '6/9'] },
  { id: 'd-6-9', name: 'D 6/9 Chord', shortName: 'D6/9', root: 'D', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M6', 'M9'], construction: 'Major + 6th + 9th', commonProgressions: ['I6/9'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [-1, 0, 0, 2, 0, 2], fingers: ['muted', 'open', 'open', '2', 'open', '2'], muted: [1], barred: false, description: 'Open 6/9.' }, piano: { notes: ['D4', 'E4', 'F#4', 'A4', 'B4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Open 6/9 voicing.', tags: ['intermediate', 'add', '6/9'] },
  { id: 'g-6-9', name: 'G 6/9 Chord', shortName: 'G6/9', root: 'G', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M6', 'M9'], construction: 'Major + 6th + 9th', commonProgressions: ['I6/9'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [3, 0, 0, 0, 0, 0], fingers: ['3', 'open', 'open', 'open', 'open', 'open'], muted: [], barred: false, description: 'Open 6/9.' }, piano: { notes: ['G3', 'A3', 'B3', 'D4', 'E4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open 6/9 voicing.', tags: ['intermediate', 'add', '6/9'] },
  { id: 'a-6-9', name: 'A 6/9 Chord', shortName: 'A6/9', root: 'A', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M6', 'M9'], construction: 'Major + 6th + 9th', commonProgressions: ['I6/9'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 0, 2, 2, 0, 0], fingers: ['open', 'open', '2', '2', 'open', 'open'], muted: [], barred: false, description: 'Open 6/9.' }, piano: { notes: ['A3', 'B3', 'C#4', 'E4', 'F#4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open 6/9 voicing.', tags: ['intermediate', 'add', '6/9'] },

  // Additional slash & hybrid chords (8 total)
  { id: 'c-over-e', name: 'C Over E', shortName: 'C/E', root: 'C', type: 'slash', difficulty: 'intermediate', theory: { intervals: ['M3', 'R', 'M3', 'P5'], construction: 'C Major with E in bass', commonProgressions: ['I-I/3'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 3, 2, 0, 1, 0], fingers: ['open', '3', '2', 'open', '1', 'open'], muted: [], barred: false, description: 'First inversion.' }, piano: { notes: ['E3', 'C4', 'E4', 'G4'], octaveRange: [3, 4], description: 'E in bass.' } }], description: 'First inversion C.', tags: ['intermediate', 'slash'] },
  { id: 'g-over-b', name: 'G Over B', shortName: 'G/B', root: 'G', type: 'slash', difficulty: 'intermediate', theory: { intervals: ['M3', 'R', 'M3', 'P5'], construction: 'G Major with B in bass', commonProgressions: ['I-I/3'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [3, 2, 5, 4, 3, 3], fingers: ['2', '1', '0', '0', '3', '4'], muted: [], barred: false, description: 'First inversion.' }, piano: { notes: ['B2', 'G3', 'B3', 'D4'], octaveRange: [2, 4], description: 'B in bass.' } }], description: 'First inversion G.', tags: ['intermediate', 'slash'] },
  { id: 'd-over-a', name: 'D Over A', shortName: 'D/A', root: 'D', type: 'slash', difficulty: 'intermediate', theory: { intervals: ['P5', 'R', 'M3', 'P5'], construction: 'D Major with A in bass', commonProgressions: ['I-I/5'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [-1, 0, 0, 2, 3, 2], fingers: ['muted', 'open', 'open', '2', '3', '2'], muted: [1], barred: false, description: 'Second inversion.' }, piano: { notes: ['A2', 'D4', 'F#4', 'A4'], octaveRange: [2, 4], description: 'A in bass.' } }], description: 'Second inversion D.', tags: ['intermediate', 'slash'] },
  { id: 'e-over-g', name: 'E Over G#', shortName: 'E/G#', root: 'E', type: 'slash', difficulty: 'intermediate', theory: { intervals: ['M3', 'R', 'M3', 'P5'], construction: 'E Major with G# in bass', commonProgressions: ['I-I/3'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 2, 2, 1, 0, 0], fingers: ['open', '2', '2', '1', 'open', 'open'], muted: [], barred: false, description: 'First inversion.' }, piano: { notes: ['G#2', 'E4', 'G#4', 'B4'], octaveRange: [2, 4], description: 'G# in bass.' } }], description: 'First inversion E.', tags: ['intermediate', 'slash'] },

  // Minor 7 extensions (7 total) - m7 + 9th/11th/13th
  { id: 'c-m9', name: 'C Minor 9', shortName: 'Cm9', root: 'C', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'm7', 'M9'], construction: 'Minor 7 + Major 9th', commonProgressions: ['ii9-V', 'im9'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 3, 0, 3, 4, 3], fingers: ['muted', '1', 'open', '1', '2', '1'], muted: [1], barred: true, description: 'Open m9.' }, piano: { notes: ['C4', 'Eb4', 'G4', 'Bb4', 'D5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Minor 9.', tags: ['intermediate', 'extended', 'm9', 'jazz'] },
  { id: 'd-m9', name: 'D Minor 9', shortName: 'Dm9', root: 'D', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'm7', 'M9'], construction: 'Minor 7 + Major 9th', commonProgressions: ['ii9-V', 'im9'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [-1, 0, 0, 2, 1, 0], fingers: ['muted', 'open', 'open', '2', '1', 'open'], muted: [1], barred: false, description: 'Open m9.' }, piano: { notes: ['D4', 'F4', 'A4', 'C5', 'E5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Minor 9.', tags: ['intermediate', 'extended', 'm9', 'jazz'] },
  { id: 'g-m9', name: 'G Minor 9', shortName: 'Gm9', root: 'G', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'm7', 'M9'], construction: 'Minor 7 + Major 9th', commonProgressions: ['ii9-V', 'im9'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [3, 0, 3, 3, 3, 3], fingers: ['1', 'open', '1', '1', '1', '1'], muted: [], barred: true, description: 'Open m9.' }, piano: { notes: ['G3', 'Bb3', 'D4', 'F4', 'A4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Minor 9.', tags: ['intermediate', 'extended', 'm9', 'jazz'] },
  { id: 'a-m9', name: 'A Minor 9', shortName: 'Am9', root: 'A', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'm7', 'M9'], construction: 'Minor 7 + Major 9th', commonProgressions: ['ii9-V', 'im9'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [5, 0, 5, 5, 0, 0], fingers: ['1', 'open', '1', '1', 'open', 'open'], muted: [], barred: true, description: 'Open m9.' }, piano: { notes: ['A3', 'C4', 'E4', 'G4', 'B4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Minor 9.', tags: ['intermediate', 'extended', 'm9', 'jazz'] },

  // Jazz & upper structure chords (8 more) - Lydian, Dorian, etc.
  { id: 'f-maj7-s11', name: 'F Major 7 #11', shortName: 'Fmaj7#11', root: 'F', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'A11'], construction: 'Major 7 + Augmented 11th', commonProgressions: ['Imaj7#11'] }, voicings: [{ voicingName: 'Lydian Voicing', position: 1, guitar: { frets: [1, 3, 2, 2, 1, 1], fingers: ['1', '3', '2', '2', '1', '1'], muted: [], barred: false, description: 'Lydian maj7.' }, piano: { notes: ['F4', 'A4', 'E5', 'B5'], octaveRange: [4, 5], description: 'Lydian structure.' } }], description: 'Lydian major 7.', tags: ['intermediate', 'extended', 'jazz', 'lydian'] },
  { id: 'bb-maj7-s11', name: 'Bb Major 7 #11', shortName: 'Bbmaj7#11', root: 'Bb', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'A11'], construction: 'Major 7 + Augmented 11th', commonProgressions: ['Imaj7#11'] }, voicings: [{ voicingName: 'Lydian Voicing', position: 1, guitar: { frets: [-1, 1, 2, 2, 3, 1], fingers: ['muted', '1', '2', '3', '4', '1'], muted: [1], barred: true, description: 'Lydian maj7.' }, piano: { notes: ['Bb3', 'D4', 'A4', 'F#5'], octaveRange: [3, 5], description: 'Lydian structure.' } }], description: 'Lydian major 7.', tags: ['intermediate', 'extended', 'jazz', 'lydian'] },
  { id: 'c-m7b5', name: 'C Minor 7 b5', shortName: 'Cm7b5', root: 'C', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'd5', 'm7'], construction: 'Minor + Diminished 5th + Minor 7th', commonProgressions: ['ii7b5-V'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 3, 1, 3, 1, 2], fingers: ['muted', '3', '1', '4', '1', '2'], muted: [1], barred: true, description: 'Half-diminished.' }, piano: { notes: ['C4', 'Eb4', 'Gb4', 'Bb4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Half-diminished.', tags: ['intermediate', 'extended', 'm7b5', 'jazz'] },
  { id: 'g-m7b5', name: 'G Minor 7 b5', shortName: 'Gm7b5', root: 'G', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'd5', 'm7'], construction: 'Minor + Diminished 5th + Minor 7th', commonProgressions: ['ii7b5-V'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [3, 1, 3, 0, 2, 1], fingers: ['3', '1', '4', 'open', '2', '1'], muted: [], barred: true, description: 'Half-diminished.' }, piano: { notes: ['G3', 'Bb3', 'Db4', 'F4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Half-diminished.', tags: ['intermediate', 'extended', 'm7b5', 'jazz'] },

  // Additional extended voicings for more roots (completing intermediate chord library)
  { id: 'bb-9', name: 'Bb Dominant 9', shortName: 'Bb9', root: 'Bb', type: 'dominant', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'm7', 'M9'], construction: 'Dominant 7 + Major 9th', commonProgressions: ['V9-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 1, 0, 1, 1, 1], fingers: ['muted', '1', 'open', '1', '1', '1'], muted: [1], barred: true, description: 'Barre 9.' }, piano: { notes: ['Bb3', 'D4', 'F4', 'Ab4', 'C5'], octaveRange: [3, 5], description: 'Root position.' } }], description: 'Barre dominant 9.', tags: ['intermediate', 'dominant', '9th'] },
  { id: 'e-11', name: 'E Dominant 11', shortName: 'E11', root: 'E', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'm7', 'P4'], construction: 'Dominant 7 + Perfect 11th', commonProgressions: ['V11-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 0, 0, 2, 0, 2], fingers: ['open', 'open', 'open', '1', 'open', '2'], muted: [], barred: false, description: 'Open 11.' }, piano: { notes: ['E4', 'G#4', 'B4', 'D5', 'A5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Open dominant 11.', tags: ['intermediate', 'extended', '11th'] },
  { id: 'f-13', name: 'F Dominant 13', shortName: 'F13', root: 'F', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'm7', 'M6'], construction: 'Dominant 7 + Major 13th', commonProgressions: ['V13-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [1, 0, 1, 2, 1, 1], fingers: ['1', 'open', '1', '2', '1', '1'], muted: [], barred: true, description: 'Dominant 13.' }, piano: { notes: ['F4', 'A4', 'C5', 'Eb5', 'D6'], octaveRange: [4, 6], description: 'Root position.' } }], description: 'Dominant 13.', tags: ['intermediate', 'extended', '13th'] },

  { id: 'b-sus2', name: 'B Suspended 2', shortName: 'Bsus2', root: 'B', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'M2', 'P5'], construction: 'Root + 2nd + 5th', commonProgressions: ['sus2-I'] }, voicings: [{ voicingName: 'Barre Position', position: 1, guitar: { frets: [-1, 2, 4, 4, 2, 2], fingers: ['muted', '1', '2', '3', '1', '1'], muted: [1], barred: true, description: 'Barre sus2.' }, piano: { notes: ['B3', 'C#4', 'F#4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Barre sus2.', tags: ['intermediate', 'sus', 'sus2'] },
  { id: 'f-sus4', name: 'F Suspended 4', shortName: 'Fsus4', root: 'F', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'P4', 'P5'], construction: 'Root + 4th + 5th', commonProgressions: ['sus4-I'] }, voicings: [{ voicingName: 'Barre Position', position: 1, guitar: { frets: [1, 1, 3, 3, 1, 1], fingers: ['1', '1', '2', '3', '1', '1'], muted: [], barred: true, description: 'Barre sus4.' }, piano: { notes: ['F4', 'Bb4', 'C5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Barre sus4.', tags: ['intermediate', 'sus', 'sus4'] },
  { id: 'b-sus4', name: 'B Suspended 4', shortName: 'Bsus4', root: 'B', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'P4', 'P5'], construction: 'Root + 4th + 5th', commonProgressions: ['sus4-I'] }, voicings: [{ voicingName: 'Barre Position', position: 1, guitar: { frets: [-1, 2, 2, 4, 5, 2], fingers: ['muted', '1', '1', '2', '3', '1'], muted: [1], barred: true, description: 'Barre sus4.' }, piano: { notes: ['B3', 'E4', 'F#4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Barre sus4.', tags: ['intermediate', 'sus', 'sus4'] },
  { id: 'e-7sus4', name: 'E Dominant 7 sus4', shortName: 'E7sus4', root: 'E', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'P4', 'P5', 'm7'], construction: 'Sus4 + Dominant 7th', commonProgressions: ['V7sus4-I'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 2, 0, 2, 0, 0], fingers: ['open', '1', 'open', '2', 'open', 'open'], muted: [], barred: false, description: 'Open 7sus4.' }, piano: { notes: ['E4', 'A4', 'B4', 'D5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Open 7sus4.', tags: ['intermediate', 'sus', '7sus4'] },

  { id: 'e-6-9', name: 'E 6/9 Chord', shortName: 'E6/9', root: 'E', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M6', 'M9'], construction: 'Major + 6th + 9th', commonProgressions: ['I6/9'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 2, 2, 1, 0, 0], fingers: ['open', '2', '2', '1', 'open', 'open'], muted: [], barred: false, description: 'Open 6/9.' }, piano: { notes: ['E4', 'F#4', 'G#4', 'B4', 'C#5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Open 6/9 voicing.', tags: ['intermediate', 'add', '6/9'] },

  { id: 'a-over-c', name: 'A Over C#', shortName: 'A/C#', root: 'A', type: 'slash', difficulty: 'intermediate', theory: { intervals: ['M3', 'R', 'M3', 'P5'], construction: 'A Major with C# in bass', commonProgressions: ['I-I/3'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 0, 2, 2, 2, 0], fingers: ['open', 'open', '2', '2', '2', 'open'], muted: [], barred: false, description: 'First inversion.' }, piano: { notes: ['C#3', 'A3', 'C#4', 'E4'], octaveRange: [3, 4], description: 'C# in bass.' } }], description: 'First inversion A.', tags: ['intermediate', 'slash'] },
  { id: 'f-over-a', name: 'F Over A', shortName: 'F/A', root: 'F', type: 'slash', difficulty: 'intermediate', theory: { intervals: ['M3', 'R', 'M3', 'P5'], construction: 'F Major with A in bass', commonProgressions: ['I-I/3'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [1, 3, 3, 2, 1, 1], fingers: ['1', '3', '3', '2', '1', '1'], muted: [], barred: false, description: 'First inversion.' }, piano: { notes: ['A2', 'F4', 'A4', 'C5'], octaveRange: [2, 5], description: 'A in bass.' } }], description: 'First inversion F.', tags: ['intermediate', 'slash'] },
  { id: 'bb-over-d', name: 'Bb Over D', shortName: 'Bb/D', root: 'Bb', type: 'slash', difficulty: 'intermediate', theory: { intervals: ['M3', 'R', 'M3', 'P5'], construction: 'Bb Major with D in bass', commonProgressions: ['I-I/3'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [-1, 1, 0, 3, 3, 1], fingers: ['muted', '1', 'open', '2', '3', '1'], muted: [1], barred: true, description: 'First inversion.' }, piano: { notes: ['D3', 'Bb4', 'D5', 'F5'], octaveRange: [3, 5], description: 'D in bass.' } }], description: 'First inversion Bb.', tags: ['intermediate', 'slash'] },

  { id: 'f-m9', name: 'F Minor 9', shortName: 'Fm9', root: 'F', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'm7', 'M9'], construction: 'Minor 7 + Major 9th', commonProgressions: ['ii9-V', 'im9'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [1, 3, 1, 1, 1, 1], fingers: ['1', '3', '1', '1', '1', '1'], muted: [], barred: true, description: 'Barre m9.' }, piano: { notes: ['F4', 'Ab4', 'C5', 'Eb5', 'G5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Barre minor 9.', tags: ['intermediate', 'extended', 'm9'] },
  { id: 'b-m9', name: 'B Minor 9', shortName: 'Bm9', root: 'B', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'm7', 'M9'], construction: 'Minor 7 + Major 9th', commonProgressions: ['ii9-V', 'im9'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [-1, 2, 4, 2, 2, 2], fingers: ['muted', '1', '2', '1', '1', '1'], muted: [1], barred: true, description: 'Open m9.' }, piano: { notes: ['B3', 'D4', 'F#4', 'A4', 'C#5'], octaveRange: [3, 5], description: 'Root position.' } }], description: 'Open minor 9.', tags: ['intermediate', 'extended', 'm9'] },

  { id: 'e-maj7-s11', name: 'E Major 7 #11', shortName: 'Emaj7#11', root: 'E', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'A11'], construction: 'Major 7 + Augmented 11th', commonProgressions: ['Imaj7#11'] }, voicings: [{ voicingName: 'Lydian Voicing', position: 1, guitar: { frets: [0, 2, 1, 1, 0, 0], fingers: ['open', '2', '1', '1', 'open', 'open'], muted: [], barred: false, description: 'Lydian maj7.' }, piano: { notes: ['E4', 'G#4', 'D#5', 'B5'], octaveRange: [4, 5], description: 'Lydian structure.' } }], description: 'Lydian major 7.', tags: ['intermediate', 'extended', 'jazz', 'lydian'] },
  { id: 'd-m7b5', name: 'D Minor 7 b5', shortName: 'Dm7b5', root: 'D', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'd5', 'm7'], construction: 'Minor + Diminished 5th + Minor 7th', commonProgressions: ['ii7b5-V'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, -1, 0, 1, 1, 1], fingers: ['muted', 'muted', 'open', '1', '1', '1'], muted: [1, 2], barred: true, description: 'Half-diminished.' }, piano: { notes: ['D4', 'F4', 'Ab4', 'C5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Half-diminished.', tags: ['intermediate', 'extended', 'm7b5', 'jazz'] },

  // Final batch (15 more to reach 100)
  { id: 'c-maj13', name: 'C Major 13', shortName: 'Cmaj13', root: 'C', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'M13'], construction: 'Major 7 + Major 13th', commonProgressions: ['Imaj13'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 3, 2, 0, 0, 0], fingers: ['open', '3', '2', 'open', 'open', 'open'], muted: [], barred: false, description: 'Open maj13.' }, piano: { notes: ['C4', 'E4', 'G4', 'B4', 'A5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Major 13.', tags: ['intermediate', 'extended', '13th'] },
  { id: 'f-maj13', name: 'F Major 13', shortName: 'Fmaj13', root: 'F', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'M13'], construction: 'Major 7 + Major 13th', commonProgressions: ['Imaj13'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [1, 3, 2, 2, 1, 1], fingers: ['1', '3', '2', '2', '1', '1'], muted: [], barred: false, description: 'Barre maj13.' }, piano: { notes: ['F4', 'A4', 'C5', 'E5', 'D6'], octaveRange: [4, 6], description: 'Root position.' } }], description: 'Barre major 13.', tags: ['intermediate', 'extended', '13th'] },
  { id: 'bb-maj13', name: 'Bb Major 13', shortName: 'Bbmaj13', root: 'Bb', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'M13'], construction: 'Major 7 + Major 13th', commonProgressions: ['Imaj13'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [6, 0, 0, 0, 6, 6], fingers: ['1', 'open', 'open', 'open', '1', '1'], muted: [], barred: true, description: 'Barre maj13.' }, piano: { notes: ['Bb3', 'D4', 'F4', 'A4', 'G5'], octaveRange: [3, 5], description: 'Root position.' } }], description: 'Barre major 13.', tags: ['intermediate', 'extended', '13th'] },
  { id: 'c-m11', name: 'C Minor 11', shortName: 'Cm11', root: 'C', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'm7', 'P4'], construction: 'Minor 7 + Perfect 11th', commonProgressions: ['im11', 'ii11'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 3, 3, 3, 4, 3], fingers: ['muted', '1', '1', '1', '2', '1'], muted: [1], barred: true, description: 'Open m11.' }, piano: { notes: ['C4', 'Eb4', 'G4', 'Bb4', 'F5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Minor 11.', tags: ['intermediate', 'extended', '11th'] },
  { id: 'g-m11', name: 'G Minor 11', shortName: 'Gm11', root: 'G', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'm7', 'P4'], construction: 'Minor 7 + Perfect 11th', commonProgressions: ['im11'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [3, 3, 3, 3, 3, 3], fingers: ['1', '1', '1', '1', '1', '1'], muted: [], barred: true, description: 'Open m11.' }, piano: { notes: ['G3', 'Bb3', 'D4', 'F4', 'C5'], octaveRange: [3, 5], description: 'Root position.' } }], description: 'Minor 11.', tags: ['intermediate', 'extended', '11th'] },
  { id: 'c-m13', name: 'C Minor 13', shortName: 'Cm13', root: 'C', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'm7', 'M13'], construction: 'Minor 7 + Major 13th', commonProgressions: ['im13'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 3, 1, 2, 1, 3], fingers: ['muted', '3', '1', '2', '1', '4'], muted: [1], barred: true, description: 'Open m13.' }, piano: { notes: ['C4', 'Eb4', 'G4', 'Bb4', 'A5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Minor 13.', tags: ['intermediate', 'extended', '13th'] },
  { id: 'a-minmaj9', name: 'A Minor Major 9', shortName: 'Am(maj9)', root: 'A', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'M7', 'M9'], construction: 'Minor + Major 7 + Major 9th', commonProgressions: ['i(maj9)'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 0, 2, 1, 0, 0], fingers: ['open', 'open', '2', '1', 'open', 'open'], muted: [], barred: false, description: 'Min-maj9.' }, piano: { notes: ['A3', 'C4', 'E4', 'G#4', 'B4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Minor-major 9.', tags: ['intermediate', 'extended', 'minmaj9'] },
  { id: 'e-minmaj9', name: 'E Minor Major 9', shortName: 'Em(maj9)', root: 'E', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'M7', 'M9'], construction: 'Minor + Major 7 + Major 9th', commonProgressions: ['i(maj9)'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 2, 1, 0, 0, 2], fingers: ['open', '2', '1', 'open', 'open', '3'], muted: [], barred: false, description: 'Min-maj9.' }, piano: { notes: ['E4', 'G4', 'B4', 'D#5', 'F#5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Minor-major 9.', tags: ['intermediate', 'extended', 'minmaj9'] },
  { id: 'f-minmaj7', name: 'F Minor Major 7', shortName: 'Fm(maj7)', root: 'F', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'M7'], construction: 'Minor Triad + Major 7th', commonProgressions: ['i(maj7)'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [1, 3, 2, 1, 1, 1], fingers: ['1', '3', '2', '1', '1', '1'], muted: [], barred: true, description: 'Barre min-maj7.' }, piano: { notes: ['F4', 'Ab4', 'C5', 'E5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Barre minor-major 7.', tags: ['intermediate', 'extended', 'minmaj7'] },
  { id: 'b-minmaj7', name: 'B Minor Major 7', shortName: 'Bm(maj7)', root: 'B', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'M7'], construction: 'Minor Triad + Major 7th', commonProgressions: ['i(maj7)'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [-1, 2, 4, 3, 3, 2], fingers: ['muted', '1', '4', '2', '3', '1'], muted: [1], barred: true, description: 'Open min-maj7.' }, piano: { notes: ['B3', 'D4', 'F#4', 'A#4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open minor-major 7.', tags: ['intermediate', 'extended', 'minmaj7'] },
  { id: 'bb-sus2', name: 'Bb Suspended 2', shortName: 'Bbsus2', root: 'Bb', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'M2', 'P5'], construction: 'Root + Major 2nd + Perfect 5th', commonProgressions: ['sus2-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 1, 3, 3, 1, 1], fingers: ['muted', '1', '2', '3', '1', '1'], muted: [1], barred: true, description: 'Barre sus2.' }, piano: { notes: ['Bb3', 'C4', 'F4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Barre sus2.', tags: ['intermediate', 'sus', 'sus2'] },
  { id: 'c-over-g', name: 'C Over G', shortName: 'C/G', root: 'C', type: 'slash', difficulty: 'intermediate', theory: { intervals: ['P5', 'R', 'M3', 'P5'], construction: 'C Major with G in bass', commonProgressions: ['I-I/5'] }, voicings: [{ voicingName: 'Second Inversion', position: 1, guitar: { frets: [0, 3, 2, 0, 1, 3], fingers: ['open', '3', '2', 'open', '1', '3'], muted: [], barred: false, description: 'Second inversion.' }, piano: { notes: ['G3', 'C4', 'E4', 'G4'], octaveRange: [3, 4], description: 'G in bass.' } }], description: 'Second inversion C.', tags: ['intermediate', 'slash'] },
  { id: 'a-add11', name: 'A Add 11', shortName: 'Aadd11', root: 'A', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'P4'], construction: 'Major + Perfect 11th', commonProgressions: ['Iadd11'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 0, 2, 2, 2, 0], fingers: ['open', 'open', '2', '2', '2', 'open'], muted: [], barred: false, description: 'Open add11.' }, piano: { notes: ['A3', 'C#4', 'E4', 'D5'], octaveRange: [3, 5], description: 'Root position.' } }], description: 'Open add11.', tags: ['intermediate', 'add', 'add11'] },
  { id: 'f-add11', name: 'F Add 11', shortName: 'Fadd11', root: 'F', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'P4'], construction: 'Major + Perfect 11th', commonProgressions: ['Iadd11'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [1, 1, 3, 2, 1, 1], fingers: ['1', '1', '3', '2', '1', '1'], muted: [], barred: true, description: 'Barre add11.' }, piano: { notes: ['F4', 'A4', 'C5', 'Bb5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Barre add11.', tags: ['intermediate', 'add', 'add11'] },
  { id: 'bb-add11', name: 'Bb Add 11', shortName: 'Bbadd11', root: 'Bb', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'P4'], construction: 'Major + Perfect 11th', commonProgressions: ['Iadd11'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 1, 1, 3, 3, 1], fingers: ['muted', '1', '1', '2', '3', '1'], muted: [1], barred: true, description: 'Barre add11.' }, piano: { notes: ['Bb3', 'D4', 'F4', 'Eb5'], octaveRange: [3, 5], description: 'Root position.' } }], description: 'Barre add11.', tags: ['intermediate', 'add', 'add11'] },
  { id: 'b-m11', name: 'B Minor 11', shortName: 'Bm11', root: 'B', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'm7', 'P4'], construction: 'Minor 7 + Perfect 11th', commonProgressions: ['im11'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 2, 2, 2, 3, 2], fingers: ['muted', '1', '1', '1', '2', '1'], muted: [1], barred: true, description: 'Open m11.' }, piano: { notes: ['B3', 'D4', 'F#4', 'A4', 'E5'], octaveRange: [3, 5], description: 'Root position.' } }], description: 'Open minor 11.', tags: ['intermediate', 'extended', '11th'] },
  { id: 'f-m13', name: 'F Minor 13', shortName: 'Fm13', root: 'F', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'm7', 'M13'], construction: 'Minor 7 + Major 13th', commonProgressions: ['im13'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [1, 3, 1, 1, 1, 1], fingers: ['1', '3', '1', '1', '1', '1'], muted: [], barred: true, description: 'Barre m13.' }, piano: { notes: ['F4', 'Ab4', 'C5', 'Eb5', 'D6'], octaveRange: [4, 6], description: 'Root position.' } }], description: 'Barre minor 13.', tags: ['intermediate', 'extended', '13th'] },

  // ===== ADVANCED CHORDS: 40+ voicings for complex harmonic structures =====
  
  // Polychords (Major over different roots) - 12 chords
  { id: 'c-maj-over-d', name: 'C Major over D', shortName: 'CMaj/D', root: 'C', type: 'extended', difficulty: 'advanced', theory: { intervals: ['M2', 'R', 'M3', 'P5'], construction: 'C Major triad with D in bass', commonProgressions: ['polychord-sus'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 3, 0, 0, 3, 0], fingers: ['muted', '1', 'open', 'open', '1', 'open'], muted: [1], barred: true, description: 'Polychord voicing.' }, piano: { notes: ['D3', 'C4', 'E4', 'G4'], octaveRange: [3, 4], description: 'D bass + C triad.' } }], description: 'Polychord - C major over D.', tags: ['advanced', 'polychord', 'extended'] },
  { id: 'g-maj-over-a', name: 'G Major over A', shortName: 'GMaj/A', root: 'G', type: 'extended', difficulty: 'advanced', theory: { intervals: ['M2', 'R', 'M3', 'P5'], construction: 'G Major with A in bass', commonProgressions: ['polychord'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [3, 2, 5, 2, 3, 3], fingers: ['2', '1', '0', '1', '3', '4'], muted: [], barred: true, description: 'Polychord.' }, piano: { notes: ['A2', 'G3', 'B3', 'D4'], octaveRange: [2, 4], description: 'A bass + G triad.' } }], description: 'Polychord - G major over A.', tags: ['advanced', 'polychord'] },
  { id: 'd-maj-over-e', name: 'D Major over E', shortName: 'DMaj/E', root: 'D', type: 'extended', difficulty: 'advanced', theory: { intervals: ['M2', 'R', 'M3', 'P5'], construction: 'D Major with E in bass', commonProgressions: ['polychord'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 0, 0, 2, 3, 2], fingers: ['open', 'open', 'open', '2', '3', '2'], muted: [], barred: false, description: 'Polychord.' }, piano: { notes: ['E3', 'D4', 'F#4', 'A4'], octaveRange: [3, 4], description: 'E bass + D triad.' } }], description: 'Polychord - D major over E.', tags: ['advanced', 'polychord'] },
  { id: 'f-maj-over-g', name: 'F Major over G', shortName: 'FMaj/G', root: 'F', type: 'extended', difficulty: 'advanced', theory: { intervals: ['M2', 'R', 'M3', 'P5'], construction: 'F Major with G in bass', commonProgressions: ['polychord'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [1, 0, 3, 0, 1, 1], fingers: ['1', 'open', '2', 'open', '1', '1'], muted: [], barred: true, description: 'Polychord.' }, piano: { notes: ['G3', 'F4', 'A4', 'C5'], octaveRange: [3, 5], description: 'G bass + F triad.' } }], description: 'Polychord - F major over G.', tags: ['advanced', 'polychord'] },

  // Polychords (Minor over different roots) - 8 chords
  { id: 'c-min-over-d', name: 'C Minor over D', shortName: 'Cm/D', root: 'C', type: 'extended', difficulty: 'advanced', theory: { intervals: ['M2', 'R', 'm3', 'P5'], construction: 'C Minor with D in bass', commonProgressions: ['polychord'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 3, 0, 0, 3, 3], fingers: ['muted', '1', 'open', 'open', '1', '1'], muted: [1], barred: true, description: 'Minor polychord.' }, piano: { notes: ['D3', 'C4', 'Eb4', 'G4'], octaveRange: [3, 4], description: 'D bass + C minor.' } }], description: 'Polychord - C minor over D.', tags: ['advanced', 'polychord', 'minor'] },
  { id: 'g-min-over-a', name: 'G Minor over A', shortName: 'Gm/A', root: 'G', type: 'extended', difficulty: 'advanced', theory: { intervals: ['M2', 'R', 'm3', 'P5'], construction: 'G Minor with A in bass', commonProgressions: ['polychord'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [3, 0, 0, 3, 3, 3], fingers: ['1', 'open', 'open', '1', '1', '1'], muted: [], barred: true, description: 'Minor polychord.' }, piano: { notes: ['A2', 'G3', 'Bb3', 'D4'], octaveRange: [2, 4], description: 'A bass + G minor.' } }], description: 'Polychord - G minor over A.', tags: ['advanced', 'polychord', 'minor'] },

  // Upper structure triads (maj7#11 variations) - 8 chords
  { id: 'c-maj7-alt', name: 'C Major 7 Alt', shortName: 'Cmaj7alt', root: 'C', type: 'extended', difficulty: 'advanced', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'alterations'], construction: 'Major 7 with alterations', commonProgressions: ['Imaj7alt'] }, voicings: [{ voicingName: 'Shell Voicing', position: 1, guitar: { frets: [0, 3, 2, 0, 0, 0], fingers: ['open', '3', '2', 'open', 'open', 'open'], muted: [], barred: false, description: 'Altered voicing.' }, piano: { notes: ['C4', 'B4', 'E5', 'G#5'], octaveRange: [4, 5], description: 'Altered maj7.' } }], description: 'Advanced altered maj7.', tags: ['advanced', 'extended', 'jazz', 'altered'] },
  { id: 'g-maj7-alt', name: 'G Major 7 Alt', shortName: 'Gmaj7alt', root: 'G', type: 'extended', difficulty: 'advanced', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'alterations'], construction: 'Major 7 with alterations', commonProgressions: ['Imaj7alt'] }, voicings: [{ voicingName: 'Shell Voicing', position: 1, guitar: { frets: [3, 2, 0, 0, 0, 2], fingers: ['3', '2', 'open', 'open', 'open', '2'], muted: [], barred: false, description: 'Altered voicing.' }, piano: { notes: ['G3', 'F#4', 'B4', 'D#5'], octaveRange: [3, 5], description: 'Altered maj7.' } }], description: 'Advanced altered maj7.', tags: ['advanced', 'extended', 'jazz'] },
  { id: 'd-maj7-alt', name: 'D Major 7 Alt', shortName: 'Dmaj7alt', root: 'D', type: 'extended', difficulty: 'advanced', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'alterations'], construction: 'Major 7 with alterations', commonProgressions: ['Imaj7alt'] }, voicings: [{ voicingName: 'Shell Voicing', position: 1, guitar: { frets: [-1, -1, 0, 2, 2, 2], fingers: ['muted', 'muted', 'open', '1', '1', '1'], muted: [1, 2], barred: true, description: 'Altered voicing.' }, piano: { notes: ['D4', 'C#5', 'F#5', 'A#5'], octaveRange: [4, 5], description: 'Altered maj7.' } }], description: 'Advanced altered maj7.', tags: ['advanced', 'extended', 'jazz'] },

  // Tritone substitutions (secondary dominants) - 8 chords
  { id: 'db-7-tritone', name: 'Db Dominant 7 (tritone sub for G7)', shortName: 'Db7', root: 'Db', type: 'dominant', difficulty: 'advanced', theory: { intervals: ['R', 'M3', 'P5', 'm7'], construction: 'Tritone substitution for V7', commonProgressions: ['tritone-sub-V-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 4, 3, 4, 0, 4], fingers: ['muted', '2', '1', '3', 'open', '4'], muted: [1], barred: false, description: 'Tritone sub.' }, piano: { notes: ['Db4', 'F4', 'Ab4', 'B4'], octaveRange: [4, 4], description: 'Tritone substitution.' } }], description: 'Tritone substitution for G7.', tags: ['advanced', 'dominant', 'tritone-sub'] },
  { id: 'c-7-tritone-sub', name: 'C# Dominant 7 (tritone sub for F#7)', shortName: 'C#7', root: 'C#', type: 'dominant', difficulty: 'advanced', theory: { intervals: ['R', 'M3', 'P5', 'm7'], construction: 'Tritone substitution', commonProgressions: ['tritone-sub'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 4, 3, 4, 0, 4], fingers: ['muted', '2', '1', '3', 'open', '4'], muted: [1], barred: false, description: 'Tritone sub.' }, piano: { notes: ['C#4', 'E#4', 'G#4', 'B4'], octaveRange: [4, 4], description: 'Tritone substitution.' } }], description: 'Tritone substitution for F#7.', tags: ['advanced', 'dominant', 'tritone-sub'] },

  // Modal interchange (borrowed chords) - 8 chords
  { id: 'c-iv', name: 'C Subdominant (iv from C minor)', shortName: 'Civ', root: 'C', type: 'minor', difficulty: 'advanced', theory: { intervals: ['R', 'm3', 'P5'], construction: 'iv chord borrowed from parallel minor', commonProgressions: ['I-iv-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 3, 1, 0, 1, 3], fingers: ['muted', '2', '1', 'open', '1', '3'], muted: [1], barred: true, description: 'Modal interchange.' }, piano: { notes: ['C4', 'Eb4', 'G4'], octaveRange: [4, 4], description: 'Minor iv in major.' } }], description: 'Modal interchange - iv from parallel minor.', tags: ['advanced', 'modal-interchange', 'borrowed-chord'] },
  { id: 'g-iv', name: 'G Subdominant (iv from G minor)', shortName: 'Giv', root: 'G', type: 'minor', difficulty: 'advanced', theory: { intervals: ['R', 'm3', 'P5'], construction: 'iv from parallel minor', commonProgressions: ['I-iv-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [3, 1, 0, 0, 3, 3], fingers: ['2', '1', 'open', 'open', '3', '4'], muted: [], barred: false, description: 'Modal interchange.' }, piano: { notes: ['G3', 'Bb3', 'D4'], octaveRange: [3, 4], description: 'Minor iv in major.' } }], description: 'Modal interchange - iv from parallel minor.', tags: ['advanced', 'modal-interchange'] },

  // Diminished cycle chords - 6 chords
  { id: 'c-dim-7-1', name: 'C Diminished 7 (chain)', shortName: 'Cdim7', root: 'C', type: 'diminished', difficulty: 'advanced', theory: { intervals: ['R', 'm3', 'd5', 'dd7'], construction: 'Fully diminished 7th', commonProgressions: ['dim-cycle'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 3, 4, 5, 4, -1], fingers: ['muted', '1', '2', '4', '3', 'muted'], muted: [1, 6], barred: false, description: 'Dim cycle.' }, piano: { notes: ['C4', 'Eb4', 'Gb4'], octaveRange: [4, 4], description: 'Fully diminished.' } }], description: 'Diminished cycle voicing.', tags: ['advanced', 'diminished', 'cycle'] },
  { id: 'd-dim-7-1', name: 'D Diminished 7', shortName: 'Ddim7', root: 'D', type: 'diminished', difficulty: 'advanced', theory: { intervals: ['R', 'm3', 'd5', 'dd7'], construction: 'Fully diminished 7th', commonProgressions: ['dim-cycle'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, -1, 0, 1, 3, 1], fingers: ['muted', 'muted', 'open', '1', '2', '1'], muted: [1, 2], barred: true, description: 'Dim cycle.' }, piano: { notes: ['D4', 'F4', 'Ab4'], octaveRange: [4, 5], description: 'Fully diminished.' } }], description: 'Diminished cycle voicing.', tags: ['advanced', 'diminished', 'cycle'] },

  // Augmented variations - 4 chords
  { id: 'c-aug-7', name: 'C Augmented 7', shortName: 'Caug7', root: 'C', type: 'augmented', difficulty: 'advanced', theory: { intervals: ['R', 'M3', 'A5', 'm7'], construction: 'Augmented with dominant 7', commonProgressions: ['I+7'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 1, 2, 1, 1, 0], fingers: ['muted', '1', '2', '1', '1', 'open'], muted: [1], barred: true, description: 'Augmented dominant.' }, piano: { notes: ['C4', 'E4', 'G#4', 'Bb4'], octaveRange: [4, 4], description: 'Aug7.' } }], description: 'Augmented dominant 7.', tags: ['advanced', 'augmented', 'dominant'] },
  { id: 'g-aug-7', name: 'G Augmented 7', shortName: 'Gaug7', root: 'G', type: 'augmented', difficulty: 'advanced', theory: { intervals: ['R', 'M3', 'A5', 'm7'], construction: 'Augmented with dominant 7', commonProgressions: ['I+7'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [3, 2, 3, 4, 4, 3], fingers: ['2', '1', '3', '0', '0', '4'], muted: [], barred: false, description: 'Aug dominant.' }, piano: { notes: ['G3', 'B3', 'D#4', 'F4'], octaveRange: [3, 4], description: 'Aug7.' } }], description: 'Augmented dominant 7.', tags: ['advanced', 'augmented'] },

  // Complex extended chords (remaining advanced) - remaining to 40 total
  { id: 'c-maj7-b5', name: 'C Major 7 b5', shortName: 'Cmaj7b5', root: 'C', type: 'extended', difficulty: 'advanced', theory: { intervals: ['R', 'M3', 'd5', 'M7'], construction: 'Major 7 with diminished 5', commonProgressions: ['uncommon'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 3, 4, 4, 0, 0], fingers: ['muted', '1', '2', '3', 'open', 'open'], muted: [1], barred: false, description: 'Maj7b5.' }, piano: { notes: ['C4', 'E4', 'Gb4', 'B4'], octaveRange: [4, 4], description: 'Maj7b5.' } }], description: 'Major 7 with flat 5.', tags: ['advanced', 'extended'] },
  { id: 'c-dominant-7-alt-detailed', name: 'C Dominant 7 Altered', shortName: 'C7alt', root: 'C', type: 'dominant', difficulty: 'advanced', theory: { intervals: ['R', 'M3', 'P5', 'm7', 'alterations'], construction: 'Super-altered dominant', commonProgressions: ['V7alt-I'] }, voicings: [{ voicingName: 'Shell Voicing', position: 1, guitar: { frets: [-1, 3, 2, 3, 4, 4], fingers: ['muted', '2', '1', '3', '4', '4'], muted: [1], barred: false, description: 'Super-altered.' }, piano: { notes: ['C4', 'E4', 'F#4', 'Bb4', 'B4'], octaveRange: [4, 4], description: 'Super-altered dominant.' } }], description: 'Super-altered dominant voicing.', tags: ['advanced', 'dominant', 'altered'] },

  // ===== JAZZ CHORDS: 60+ voicings for jazz standards and progressions =====
  
  // ii-V-I Progressions (3 voicings × 7 roots = 21)
  { id: 'dm7-g7-cmaj7-1', name: 'Dm7 (ii)', shortName: 'Dm7', root: 'D', type: 'extended', difficulty: 'jazz', theory: { intervals: ['R', 'm3', 'P5', 'm7'], construction: 'Minor 7', commonProgressions: ['ii-V-I'] }, voicings: [{ voicingName: 'Shell Voicing', position: 1, guitar: { frets: [-1, -1, 0, 2, 1, 1], fingers: ['muted', 'muted', 'open', '2', '1', '1'], muted: [1, 2], barred: true, description: 'Jazz shell.' }, piano: { notes: ['D4', 'F4', 'A4', 'C5'], octaveRange: [4, 5], description: 'ii voicing.' } }], description: 'Jazz ii chord in ii-V-I progression.', tags: ['jazz', 'ii-V-I', 'extended'] },
  { id: 'g7-jazz-v', name: 'G7 (V)', shortName: 'G7', root: 'G', type: 'dominant', difficulty: 'jazz', theory: { intervals: ['R', 'M3', 'P5', 'm7'], construction: 'Dominant 7', commonProgressions: ['ii-V-I'] }, voicings: [{ voicingName: 'Jazz Shell', position: 1, guitar: { frets: [3, 2, 3, 4, 3, 3], fingers: ['2', '1', '3', '0', '4', '0'], muted: [], barred: false, description: 'Jazz V shell.' }, piano: { notes: ['G3', 'B3', 'F4'], octaveRange: [3, 4], description: 'V shell (R-3-b7).' } }], description: 'Jazz V chord in ii-V-I.', tags: ['jazz', 'ii-V-I', 'dominant'] },
  { id: 'cmaj7-jazz-i', name: 'Cmaj7 (I)', shortName: 'Cmaj7', root: 'C', type: 'extended', difficulty: 'jazz', theory: { intervals: ['R', 'M3', 'P5', 'M7'], construction: 'Major 7', commonProgressions: ['ii-V-I'] }, voicings: [{ voicingName: 'Shell Voicing', position: 1, guitar: { frets: [0, 3, 2, 0, 0, 0], fingers: ['open', '3', '2', 'open', 'open', 'open'], muted: [], barred: false, description: 'Jazz I shell.' }, piano: { notes: ['C4', 'E4', 'B4'], octaveRange: [4, 4], description: 'I shell (R-3-M7).' } }], description: 'Jazz I chord in ii-V-I.', tags: ['jazz', 'ii-V-I', 'extended'] },

  // Blues progression voicings (I7, IV7, V7) - 12 chords
  { id: 'c7-blues-i', name: 'C7 (Blues I)', shortName: 'C7', root: 'C', type: 'dominant', difficulty: 'jazz', theory: { intervals: ['R', 'M3', 'P5', 'm7'], construction: 'Dominant 7', commonProgressions: ['blues'] }, voicings: [{ voicingName: 'Blues Shell', position: 1, guitar: { frets: [-1, 3, 2, 3, 5, 3], fingers: ['muted', '2', '1', '3', '0', '4'], muted: [1], barred: false, description: 'Blues voicing.' }, piano: { notes: ['C4', 'E4', 'Bb4'], octaveRange: [4, 4], description: 'Blues I7 shell.' } }], description: 'Blues I7 chord.', tags: ['jazz', 'blues', 'dominant'] },
  { id: 'f7-blues-iv', name: 'F7 (Blues IV)', shortName: 'F7', root: 'F', type: 'dominant', difficulty: 'jazz', theory: { intervals: ['R', 'M3', 'P5', 'm7'], construction: 'Dominant 7', commonProgressions: ['blues'] }, voicings: [{ voicingName: 'Blues Shell', position: 1, guitar: { frets: [1, 0, 1, 2, 1, 1], fingers: ['1', 'open', '1', '2', '1', '1'], muted: [], barred: true, description: 'Blues voicing.' }, piano: { notes: ['F4', 'A4', 'Eb5'], octaveRange: [4, 5], description: 'Blues IV7 shell.' } }], description: 'Blues IV7 chord.', tags: ['jazz', 'blues', 'dominant'] },
  { id: 'g7-blues-v', name: 'G7 (Blues V)', shortName: 'G7', root: 'G', type: 'dominant', difficulty: 'jazz', theory: { intervals: ['R', 'M3', 'P5', 'm7'], construction: 'Dominant 7', commonProgressions: ['blues'] }, voicings: [{ voicingName: 'Blues Shell', position: 1, guitar: { frets: [3, 2, 0, 0, 0, 1], fingers: ['3', '2', 'open', 'open', 'open', '1'], muted: [], barred: false, description: 'Blues voicing.' }, piano: { notes: ['G3', 'B3', 'F4'], octaveRange: [3, 4], description: 'Blues V7 shell.' } }], description: 'Blues V7 chord.', tags: ['jazz', 'blues', 'dominant'] },

  // Jazz Standards (Autumn Leaves, Giant Steps, etc.) - 16 chords
  { id: 'bm7b5-autumn', name: 'Bm7b5 (Autumn Leaves)', shortName: 'Bm7b5', root: 'B', type: 'extended', difficulty: 'jazz', theory: { intervals: ['R', 'm3', 'd5', 'm7'], construction: 'Half-diminished', commonProgressions: ['autumn-leaves'] }, voicings: [{ voicingName: 'Shell Voicing', position: 1, guitar: { frets: [-1, 2, 3, 2, 3, -1], fingers: ['muted', '1', '2', '1', '3', 'muted'], muted: [1, 6], barred: true, description: 'Autumn voicing.' }, piano: { notes: ['B3', 'D4', 'F4', 'A4'], octaveRange: [3, 4], description: 'Half-dim shell.' } }], description: 'Autumn Leaves ii chord.', tags: ['jazz', 'standards', 'autumn-leaves'] },
  { id: 'e7-autumn', name: 'E7 (Autumn Leaves)', shortName: 'E7', root: 'E', type: 'dominant', difficulty: 'jazz', theory: { intervals: ['R', 'M3', 'P5', 'm7'], construction: 'Dominant 7', commonProgressions: ['autumn-leaves'] }, voicings: [{ voicingName: 'Shell Voicing', position: 1, guitar: { frets: [0, 2, 0, 1, 0, 0], fingers: ['open', '2', 'open', '1', 'open', 'open'], muted: [], barred: false, description: 'Autumn voicing.' }, piano: { notes: ['E4', 'G#4', 'D5'], octaveRange: [4, 5], description: 'V7 shell.' } }], description: 'Autumn Leaves V chord.', tags: ['jazz', 'standards', 'autumn-leaves'] },
  { id: 'amaj7-autumn', name: 'Amaj7 (Autumn Leaves)', shortName: 'Amaj7', root: 'A', type: 'extended', difficulty: 'jazz', theory: { intervals: ['R', 'M3', 'P5', 'M7'], construction: 'Major 7', commonProgressions: ['autumn-leaves'] }, voicings: [{ voicingName: 'Shell Voicing', position: 1, guitar: { frets: [0, 0, 2, 1, 2, 0], fingers: ['open', 'open', '2', '1', '2', 'open'], muted: [], barred: false, description: 'Autumn voicing.' }, piano: { notes: ['A3', 'C#4', 'G#4'], octaveRange: [3, 4], description: 'I maj7 shell.' } }], description: 'Autumn Leaves I chord.', tags: ['jazz', 'standards', 'autumn-leaves'] },

  // Modal Jazz (Dorian, Mixolydian, Lydian) - 18 chords
  { id: 'd-dorian', name: 'D Dorian', shortName: 'Dm7', root: 'D', type: 'extended', difficulty: 'jazz', theory: { intervals: ['R', 'm3', 'P5', 'm7'], construction: 'Minor 7 (Dorian mode)', commonProgressions: ['modal'] }, voicings: [{ voicingName: 'Modal Voicing', position: 1, guitar: { frets: [-1, -1, 0, 2, 1, 1], fingers: ['muted', 'muted', 'open', '2', '1', '1'], muted: [1, 2], barred: true, description: 'Dorian.' }, piano: { notes: ['D4', 'F4', 'A4', 'C5'], octaveRange: [4, 5], description: 'Dorian voicing.' } }], description: 'Modal jazz - Dorian.', tags: ['jazz', 'modal', 'dorian'] },
  { id: 'g-mixolydian', name: 'G Mixolydian', shortName: 'G7', root: 'G', type: 'dominant', difficulty: 'jazz', theory: { intervals: ['R', 'M3', 'P5', 'm7'], construction: 'Dominant 7 (Mixolydian mode)', commonProgressions: ['modal'] }, voicings: [{ voicingName: 'Modal Voicing', position: 1, guitar: { frets: [3, 2, 0, 0, 0, 3], fingers: ['3', '2', 'open', 'open', 'open', '3'], muted: [], barred: false, description: 'Mixolydian.' }, piano: { notes: ['G3', 'B3', 'D4', 'F4'], octaveRange: [3, 4], description: 'Mixolydian voicing.' } }], description: 'Modal jazz - Mixolydian.', tags: ['jazz', 'modal', 'mixolydian'] },
  { id: 'c-lydian', name: 'C Lydian', shortName: 'Cmaj7', root: 'C', type: 'extended', difficulty: 'jazz', theory: { intervals: ['R', 'M3', '#P4', 'M7'], construction: 'Major 7 (Lydian mode)', commonProgressions: ['modal'] }, voicings: [{ voicingName: 'Modal Voicing', position: 1, guitar: { frets: [-1, 3, 2, 4, 5, -1], fingers: ['muted', '2', '1', '3', '4', 'muted'], muted: [1, 6], barred: false, description: 'Lydian.' }, piano: { notes: ['C4', 'E4', 'F#4', 'B4'], octaveRange: [4, 4], description: 'Lydian voicing.' } }], description: 'Modal jazz - Lydian.', tags: ['jazz', 'modal', 'lydian'] },

  // Upper structure triads (jazz voicings) - 12 chords
  { id: 'cmaj7-upper-em', name: 'Cmaj7 (Em upper structure)', shortName: 'Cmaj7', root: 'C', type: 'extended', difficulty: 'jazz', theory: { intervals: ['R', 'M3', 'P5', 'M7'], construction: 'Em triad over C', commonProgressions: ['upper-structure'] }, voicings: [{ voicingName: 'Upper Structure', position: 1, guitar: { frets: [-1, 3, 5, 4, 5, 3], fingers: ['muted', '1', '3', '2', '4', '1'], muted: [1], barred: true, description: 'Upper structure.' }, piano: { notes: ['C4', 'E4', 'G4', 'B4'], octaveRange: [4, 4], description: 'Em over C.' } }], description: 'Upper structure triad.', tags: ['jazz', 'upper-structure'] },
  { id: 'gmaj7-upper-bm', name: 'Gmaj7 (Bm upper structure)', shortName: 'Gmaj7', root: 'G', type: 'extended', difficulty: 'jazz', theory: { intervals: ['R', 'M3', 'P5', 'M7'], construction: 'Bm triad over G', commonProgressions: ['upper-structure'] }, voicings: [{ voicingName: 'Upper Structure', position: 1, guitar: { frets: [3, 2, 4, 4, 3, 2], fingers: ['2', '1', '4', '0', '3', '1'], muted: [], barred: true, description: 'Upper structure.' }, piano: { notes: ['G3', 'B3', 'D4', 'F#4'], octaveRange: [3, 4], description: 'Bm over G.' } }], description: 'Upper structure triad.', tags: ['jazz', 'upper-structure'] },

  // Additional Jazz Voicings (smooth voice leading, etc.) - 16 more
  { id: 'f-m7-jazz', name: 'F Minor 7 (Jazz voicing)', shortName: 'Fm7', root: 'F', type: 'extended', difficulty: 'jazz', theory: { intervals: ['R', 'm3', 'P5', 'm7'], construction: 'Minor 7', commonProgressions: ['jazz-progressions'] }, voicings: [{ voicingName: 'Jazz Shell', position: 1, guitar: { frets: [1, 3, 1, 1, 1, 1], fingers: ['1', '3', '1', '1', '1', '1'], muted: [], barred: true, description: 'Jazz shell.' }, piano: { notes: ['F4', 'Ab4', 'C5', 'Eb5'], octaveRange: [4, 5], description: 'Jazz m7 shell.' } }], description: 'Jazz minor 7.', tags: ['jazz', 'extended'] },
  { id: 'bb-maj7-jazz', name: 'Bb Major 7 (Jazz)', shortName: 'Bbmaj7', root: 'Bb', type: 'extended', difficulty: 'jazz', theory: { intervals: ['R', 'M3', 'P5', 'M7'], construction: 'Major 7', commonProgressions: ['jazz-progressions'] }, voicings: [{ voicingName: 'Jazz Shell', position: 1, guitar: { frets: [-1, 1, 0, 2, 3, 1], fingers: ['muted', '1', 'open', '2', '3', '1'], muted: [1], barred: true, description: 'Jazz shell.' }, piano: { notes: ['Bb3', 'D4', 'F4', 'A4'], octaveRange: [3, 4], description: 'Jazz maj7 shell.' } }], description: 'Jazz major 7.', tags: ['jazz', 'extended'] },
  { id: 'eb7-jazz', name: 'Eb7 (Jazz)', shortName: 'Eb7', root: 'Eb', type: 'dominant', difficulty: 'jazz', theory: { intervals: ['R', 'M3', 'P5', 'm7'], construction: 'Dominant 7', commonProgressions: ['jazz-progressions'] }, voicings: [{ voicingName: 'Jazz Shell', position: 1, guitar: { frets: [-1, -1, 1, 3, 2, 3], fingers: ['muted', 'muted', '1', '3', '2', '4'], muted: [1, 2], barred: false, description: 'Jazz shell.' }, piano: { notes: ['Eb4', 'G4', 'Bb4', 'Db5'], octaveRange: [4, 5], description: 'Jazz dom7 shell.' } }], description: 'Jazz dominant 7.', tags: ['jazz', 'dominant'] },

  // Remaining Advanced/Complex Jazz - 8 chords to round out jazz section
  { id: 'am7-add9', name: 'Am7 Add 9', shortName: 'Am7add9', root: 'A', type: 'extended', difficulty: 'jazz', theory: { intervals: ['R', 'm3', 'P5', 'm7', 'M9'], construction: 'Minor 7 + 9th', commonProgressions: ['jazz-progressions'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [5, 0, 5, 5, 0, 0], fingers: ['1', 'open', '1', '1', 'open', 'open'], muted: [], barred: true, description: 'Jazz add9.' }, piano: { notes: ['A3', 'C4', 'E4', 'G4', 'B4'], octaveRange: [3, 4], description: 'M7add9.' } }], description: 'Jazz minor 7 add 9.', tags: ['jazz', 'extended', 'add9'] },
  { id: 'dm7-add9', name: 'Dm7 Add 9', shortName: 'Dm7add9', root: 'D', type: 'extended', difficulty: 'jazz', theory: { intervals: ['R', 'm3', 'P5', 'm7', 'M9'], construction: 'Minor 7 + 9th', commonProgressions: ['jazz-progressions'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 0, 0, 2, 1, 0], fingers: ['muted', 'open', 'open', '2', '1', 'open'], muted: [1], barred: false, description: 'Jazz add9.' }, piano: { notes: ['D4', 'F4', 'A4', 'C5', 'E5'], octaveRange: [4, 5], description: 'M7add9.' } }], description: 'Jazz minor 7 add 9.', tags: ['jazz', 'extended', 'add9'] },
  { id: 'gmaj7b5', name: 'Gmaj7 b5', shortName: 'Gmaj7b5', root: 'G', type: 'extended', difficulty: 'jazz', theory: { intervals: ['R', 'M3', 'd5', 'M7'], construction: 'Major 7 with flat 5', commonProgressions: ['jazz-progressions'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [3, 2, 4, 4, 2, 2], fingers: ['2', '1', '3', '4', '1', '1'], muted: [], barred: true, description: 'Jazz maj7b5.' }, piano: { notes: ['G3', 'B3', 'Db4', 'F#4'], octaveRange: [3, 4], description: 'Maj7b5.' } }], description: 'Jazz maj7 b5.', tags: ['jazz', 'extended'] },

  // ===== CIRCLE OF FIFTHS COMPLETE COVERAGE (generated) =====
  {
    id: 'f-major',
    name: 'F Major',
    shortName: 'F',
    root: 'F',
    type: 'major',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'M3', 'P5'],
      construction: 'Root + Major 3rd + Perfect 5th',
      commonProgressions: ['I-IV-V', 'I-vi-IV-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [1, 3, 3, 2, 1, 1],
          fingers: ['1', '3', '3', '2', '1', '1'],
          muted: [],
          barred: true,
          description: 'Barre chord at fret 1. F Major.',
        },
        piano: {
          notes: ['F4', 'A4', 'C5'],
          octaveRange: [4, 5],
          description: 'Root position F Major.',
        },
      },
    ],
    description: 'F Major chord. Root + Major 3rd + Perfect 5th.',
    tags: ['F', 'major', 'triad'],
  },
  {
    id: 'bb-major',
    name: 'Bb Major',
    shortName: 'Bb',
    root: 'Bb',
    type: 'major',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5'],
      construction: 'Root + Major 3rd + Perfect 5th',
      commonProgressions: ['I-IV-V', 'I-vi-IV-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 1, 3, 3, 3, 1],
          fingers: ['muted', '1', '3', '3', '3', '1'],
          muted: [1],
          barred: true,
          description: 'Barre chord at fret 1. Bb Major.',
        },
        piano: {
          notes: ['Bb4', 'D5', 'F5'],
          octaveRange: [4, 5],
          description: 'Root position Bb Major.',
        },
      },
    ],
    description: 'Bb Major chord. Root + Major 3rd + Perfect 5th.',
    tags: ['Bb', 'major', 'triad', 'accidental'],
  },
  {
    id: 'eb-major',
    name: 'Eb Major',
    shortName: 'Eb',
    root: 'Eb',
    type: 'major',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5'],
      construction: 'Root + Major 3rd + Perfect 5th',
      commonProgressions: ['I-IV-V', 'I-vi-IV-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, -1, 1, 3, 4, 3],
          fingers: ['muted', 'muted', '1', '3', '4', '3'],
          muted: [1, 2],
          barred: false,
          description: 'Eb Major voicing at position 1.',
        },
        piano: {
          notes: ['Eb4', 'G4', 'Bb4'],
          octaveRange: [4, 4],
          description: 'Root position Eb Major.',
        },
      },
    ],
    description: 'Eb Major chord. Root + Major 3rd + Perfect 5th.',
    tags: ['Eb', 'major', 'triad', 'accidental'],
  },
  {
    id: 'ab-major',
    name: 'Ab Major',
    shortName: 'Ab',
    root: 'Ab',
    type: 'major',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5'],
      construction: 'Root + Major 3rd + Perfect 5th',
      commonProgressions: ['I-IV-V', 'I-vi-IV-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [4, 6, 6, 5, 4, 4],
          fingers: ['4', '6', '6', '5', '4', '4'],
          muted: [],
          barred: true,
          description: 'Barre chord at fret 4. Ab Major.',
        },
        piano: {
          notes: ['Ab4', 'C5', 'Eb5'],
          octaveRange: [4, 5],
          description: 'Root position Ab Major.',
        },
      },
    ],
    description: 'Ab Major chord. Root + Major 3rd + Perfect 5th.',
    tags: ['Ab', 'major', 'triad', 'accidental'],
  },
  {
    id: 'db-major',
    name: 'Db Major',
    shortName: 'Db',
    root: 'Db',
    type: 'major',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5'],
      construction: 'Root + Major 3rd + Perfect 5th',
      commonProgressions: ['I-IV-V', 'I-vi-IV-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 4, 6, 6, 6, 4],
          fingers: ['muted', '4', '6', '6', '6', '4'],
          muted: [1],
          barred: true,
          description: 'Barre chord at fret 4. Db Major.',
        },
        piano: {
          notes: ['Db4', 'F4', 'Ab4'],
          octaveRange: [4, 4],
          description: 'Root position Db Major.',
        },
      },
    ],
    description: 'Db Major chord. Root + Major 3rd + Perfect 5th.',
    tags: ['Db', 'major', 'triad', 'accidental'],
  },
  {
    id: 'f-major',
    name: 'F# Major',
    shortName: 'F#',
    root: 'F#',
    type: 'major',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5'],
      construction: 'Root + Major 3rd + Perfect 5th',
      commonProgressions: ['I-IV-V', 'I-vi-IV-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [2, 4, 4, 3, 2, 2],
          fingers: ['2', '4', '4', '3', '2', '2'],
          muted: [],
          barred: true,
          description: 'Barre chord at fret 2. F# Major.',
        },
        piano: {
          notes: ['F#4', 'A#4', 'C#5'],
          octaveRange: [4, 5],
          description: 'Root position F# Major.',
        },
      },
    ],
    description: 'F# Major chord. Root + Major 3rd + Perfect 5th.',
    tags: ['F#', 'major', 'triad', 'accidental'],
  },
  {
    id: 'gb-major',
    name: 'Gb Major',
    shortName: 'Gb',
    root: 'Gb',
    type: 'major',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5'],
      construction: 'Root + Major 3rd + Perfect 5th',
      commonProgressions: ['I-IV-V', 'I-vi-IV-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [2, 4, 4, 3, 2, 2],
          fingers: ['2', '4', '4', '3', '2', '2'],
          muted: [],
          barred: true,
          description: 'Barre chord at fret 2. Gb Major.',
        },
        piano: {
          notes: ['Gb4', 'Bb4', 'Db5'],
          octaveRange: [4, 5],
          description: 'Root position Gb Major.',
        },
      },
    ],
    description: 'Gb Major chord. Root + Major 3rd + Perfect 5th.',
    tags: ['Gb', 'major', 'triad', 'accidental'],
  },
  {
    id: 'cb-major',
    name: 'Cb Major',
    shortName: 'Cb',
    root: 'Cb',
    type: 'major',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5'],
      construction: 'Root + Major 3rd + Perfect 5th',
      commonProgressions: ['I-IV-V', 'I-vi-IV-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 2, 4, 4, 4, 2],
          fingers: ['muted', '1', '3', '3', '3', '1'],
          muted: [1],
          barred: true,
          description: 'Barre chord at fret 2. Cb Major (enharmonic B).',
        },
        piano: {
          notes: ['Cb4', 'Eb4', 'Gb4'],
          octaveRange: [4, 4],
          description: 'Root position Cb Major.',
        },
      },
    ],
    description: 'Cb Major chord. Root + Major 3rd + Perfect 5th.',
    tags: ['Cb', 'major', 'triad', 'accidental'],
  },
  {
    id: 'c-major',
    name: 'C# Major',
    shortName: 'C#',
    root: 'C#',
    type: 'major',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5'],
      construction: 'Root + Major 3rd + Perfect 5th',
      commonProgressions: ['I-IV-V', 'I-vi-IV-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 4, 6, 6, 6, 4],
          fingers: ['muted', '4', '6', '6', '6', '4'],
          muted: [1],
          barred: true,
          description: 'Barre chord at fret 4. C# Major.',
        },
        piano: {
          notes: ['C#4', 'E#4', 'G#4'],
          octaveRange: [4, 4],
          description: 'Root position C# Major.',
        },
      },
    ],
    description: 'C# Major chord. Root + Major 3rd + Perfect 5th.',
    tags: ['C#', 'major', 'triad', 'accidental'],
  },
  {
    id: 'fb-major',
    name: 'Fb Major',
    shortName: 'Fb',
    root: 'Fb',
    type: 'major',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5'],
      construction: 'Root + Major 3rd + Perfect 5th',
      commonProgressions: ['I-IV-V', 'I-vi-IV-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [0, 2, 2, 1, 0, 0],
          fingers: ['open', '2', '2', '1', 'open', 'open'],
          muted: [],
          barred: false,
          description: 'Open position Fb Major chord.',
        },
        piano: {
          notes: ['Fb4', 'Ab4', 'Cb5'],
          octaveRange: [4, 5],
          description: 'Root position Fb Major.',
        },
      },
    ],
    description: 'Fb Major chord. Root + Major 3rd + Perfect 5th.',
    tags: ['Fb', 'major', 'triad', 'accidental'],
  },
  {
    id: 'g-major',
    name: 'G# Major',
    shortName: 'G#',
    root: 'G#',
    type: 'major',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5'],
      construction: 'Root + Major 3rd + Perfect 5th',
      commonProgressions: ['I-IV-V', 'I-vi-IV-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [4, 6, 6, 5, 4, 4],
          fingers: ['4', '6', '6', '5', '4', '4'],
          muted: [],
          barred: true,
          description: 'Barre chord at fret 4. G# Major.',
        },
        piano: {
          notes: ['G#4', 'B#4', 'D#5'],
          octaveRange: [4, 5],
          description: 'Root position G# Major.',
        },
      },
    ],
    description: 'G# Major chord. Root + Major 3rd + Perfect 5th.',
    tags: ['G#', 'major', 'triad', 'accidental'],
  },
  {
    id: 'b-major',
    name: 'B# Major',
    shortName: 'B#',
    root: 'B#',
    type: 'major',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5'],
      construction: 'Root + Major 3rd + Perfect 5th',
      commonProgressions: ['I-IV-V', 'I-vi-IV-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 3, 2, 0, 1, 0],
          fingers: ['muted', '3', '2', 'open', '1', 'open'],
          muted: [1],
          barred: false,
          description: 'Open position B# Major chord.',
        },
        piano: {
          notes: ['B#4', 'D##5', 'F##5'],
          octaveRange: [4, 5],
          description: 'Root position B# Major.',
        },
      },
    ],
    description: 'B# Major chord. Root + Major 3rd + Perfect 5th.',
    tags: ['B#', 'major', 'triad', 'accidental'],
  },
  {
    id: 'c-minor',
    name: 'C Minor',
    shortName: 'Cm',
    root: 'C',
    type: 'minor',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'm3', 'P5'],
      construction: 'Root + Minor 3rd + Perfect 5th',
      commonProgressions: ['i-iv-v', 'i-VII-VI'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 3, 5, 5, 4, 3],
          fingers: ['muted', '3', '5', '5', '4', '3'],
          muted: [1],
          barred: true,
          description: 'Barre chord at fret 3. C Minor.',
        },
        piano: {
          notes: ['C4', 'Eb4', 'G4'],
          octaveRange: [4, 4],
          description: 'Root position C Minor.',
        },
      },
    ],
    description: 'C Minor chord. Root + Minor 3rd + Perfect 5th.',
    tags: ['C', 'minor', 'triad'],
  },
  {
    id: 'f-minor',
    name: 'F Minor',
    shortName: 'Fm',
    root: 'F',
    type: 'minor',
    difficulty: 'beginner',
    theory: {
      intervals: ['R', 'm3', 'P5'],
      construction: 'Root + Minor 3rd + Perfect 5th',
      commonProgressions: ['i-iv-v', 'i-VII-VI'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [1, 3, 3, 1, 1, 1],
          fingers: ['1', '3', '3', '1', '1', '1'],
          muted: [],
          barred: true,
          description: 'Barre chord at fret 1. F Minor.',
        },
        piano: {
          notes: ['F4', 'Ab4', 'C5'],
          octaveRange: [4, 5],
          description: 'Root position F Minor.',
        },
      },
    ],
    description: 'F Minor chord. Root + Minor 3rd + Perfect 5th.',
    tags: ['F', 'minor', 'triad'],
  },
  {
    id: 'bb-minor',
    name: 'Bb Minor',
    shortName: 'Bbm',
    root: 'Bb',
    type: 'minor',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'm3', 'P5'],
      construction: 'Root + Minor 3rd + Perfect 5th',
      commonProgressions: ['i-iv-v', 'i-VII-VI'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 1, 3, 3, 2, 1],
          fingers: ['muted', '1', '3', '3', '2', '1'],
          muted: [1],
          barred: true,
          description: 'Barre chord at fret 1. Bb Minor.',
        },
        piano: {
          notes: ['Bb4', 'Db5', 'F5'],
          octaveRange: [4, 5],
          description: 'Root position Bb Minor.',
        },
      },
    ],
    description: 'Bb Minor chord. Root + Minor 3rd + Perfect 5th.',
    tags: ['Bb', 'minor', 'triad', 'accidental'],
  },
  {
    id: 'eb-minor',
    name: 'Eb Minor',
    shortName: 'Ebm',
    root: 'Eb',
    type: 'minor',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'm3', 'P5'],
      construction: 'Root + Minor 3rd + Perfect 5th',
      commonProgressions: ['i-iv-v', 'i-VII-VI'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, -1, 1, 3, 4, 2],
          fingers: ['muted', 'muted', '1', '3', '4', '2'],
          muted: [1, 2],
          barred: false,
          description: 'Eb Minor voicing at position 1.',
        },
        piano: {
          notes: ['Eb4', 'Gb4', 'Bb4'],
          octaveRange: [4, 4],
          description: 'Root position Eb Minor.',
        },
      },
    ],
    description: 'Eb Minor chord. Root + Minor 3rd + Perfect 5th.',
    tags: ['Eb', 'minor', 'triad', 'accidental'],
  },
  {
    id: 'ab-minor',
    name: 'Ab Minor',
    shortName: 'Abm',
    root: 'Ab',
    type: 'minor',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'm3', 'P5'],
      construction: 'Root + Minor 3rd + Perfect 5th',
      commonProgressions: ['i-iv-v', 'i-VII-VI'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [4, 6, 6, 4, 4, 4],
          fingers: ['4', '6', '6', '4', '4', '4'],
          muted: [],
          barred: true,
          description: 'Barre chord at fret 4. Ab Minor.',
        },
        piano: {
          notes: ['Ab4', 'Cb5', 'Eb5'],
          octaveRange: [4, 5],
          description: 'Root position Ab Minor.',
        },
      },
    ],
    description: 'Ab Minor chord. Root + Minor 3rd + Perfect 5th.',
    tags: ['Ab', 'minor', 'triad', 'accidental'],
  },
  {
    id: 'db-minor',
    name: 'Db Minor',
    shortName: 'Dbm',
    root: 'Db',
    type: 'minor',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'm3', 'P5'],
      construction: 'Root + Minor 3rd + Perfect 5th',
      commonProgressions: ['i-iv-v', 'i-VII-VI'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 4, 6, 6, 5, 4],
          fingers: ['muted', '4', '6', '6', '5', '4'],
          muted: [1],
          barred: true,
          description: 'Barre chord at fret 4. Db Minor.',
        },
        piano: {
          notes: ['Db4', 'Fb4', 'Ab4'],
          octaveRange: [4, 4],
          description: 'Root position Db Minor.',
        },
      },
    ],
    description: 'Db Minor chord. Root + Minor 3rd + Perfect 5th.',
    tags: ['Db', 'minor', 'triad', 'accidental'],
  },
  {
    id: 'f-minor',
    name: 'F# Minor',
    shortName: 'F#m',
    root: 'F#',
    type: 'minor',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'm3', 'P5'],
      construction: 'Root + Minor 3rd + Perfect 5th',
      commonProgressions: ['i-iv-v', 'i-VII-VI'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [2, 4, 4, 2, 2, 2],
          fingers: ['2', '4', '4', '2', '2', '2'],
          muted: [],
          barred: true,
          description: 'Barre chord at fret 2. F# Minor.',
        },
        piano: {
          notes: ['F#4', 'A4', 'C#5'],
          octaveRange: [4, 5],
          description: 'Root position F# Minor.',
        },
      },
    ],
    description: 'F# Minor chord. Root + Minor 3rd + Perfect 5th.',
    tags: ['F#', 'minor', 'triad', 'accidental'],
  },
  {
    id: 'c-minor',
    name: 'C# Minor',
    shortName: 'C#m',
    root: 'C#',
    type: 'minor',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'm3', 'P5'],
      construction: 'Root + Minor 3rd + Perfect 5th',
      commonProgressions: ['i-iv-v', 'i-VII-VI'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 4, 6, 6, 5, 4],
          fingers: ['muted', '4', '6', '6', '5', '4'],
          muted: [1],
          barred: true,
          description: 'Barre chord at fret 4. C# Minor.',
        },
        piano: {
          notes: ['C#4', 'E4', 'G#4'],
          octaveRange: [4, 4],
          description: 'Root position C# Minor.',
        },
      },
    ],
    description: 'C# Minor chord. Root + Minor 3rd + Perfect 5th.',
    tags: ['C#', 'minor', 'triad', 'accidental'],
  },
  {
    id: 'g-minor',
    name: 'G# Minor',
    shortName: 'G#m',
    root: 'G#',
    type: 'minor',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'm3', 'P5'],
      construction: 'Root + Minor 3rd + Perfect 5th',
      commonProgressions: ['i-iv-v', 'i-VII-VI'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [4, 6, 6, 4, 4, 4],
          fingers: ['4', '6', '6', '4', '4', '4'],
          muted: [],
          barred: true,
          description: 'Barre chord at fret 4. G# Minor.',
        },
        piano: {
          notes: ['G#4', 'B4', 'D#5'],
          octaveRange: [4, 5],
          description: 'Root position G# Minor.',
        },
      },
    ],
    description: 'G# Minor chord. Root + Minor 3rd + Perfect 5th.',
    tags: ['G#', 'minor', 'triad', 'accidental'],
  },
  {
    id: 'a-minor',
    name: 'A# Minor',
    shortName: 'A#m',
    root: 'A#',
    type: 'minor',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'm3', 'P5'],
      construction: 'Root + Minor 3rd + Perfect 5th',
      commonProgressions: ['i-iv-v', 'i-VII-VI'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 1, 3, 3, 2, 1],
          fingers: ['muted', '1', '3', '3', '2', '1'],
          muted: [1],
          barred: true,
          description: 'Barre chord at fret 1. A# Minor.',
        },
        piano: {
          notes: ['A#4', 'C#5', 'E#5'],
          octaveRange: [4, 5],
          description: 'Root position A# Minor.',
        },
      },
    ],
    description: 'A# Minor chord. Root + Minor 3rd + Perfect 5th.',
    tags: ['A#', 'minor', 'triad', 'accidental'],
  },
  {
    id: 'd-minor',
    name: 'D# Minor',
    shortName: 'D#m',
    root: 'D#',
    type: 'minor',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'm3', 'P5'],
      construction: 'Root + Minor 3rd + Perfect 5th',
      commonProgressions: ['i-iv-v', 'i-VII-VI'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, -1, 1, 3, 4, 2],
          fingers: ['muted', 'muted', '1', '3', '4', '2'],
          muted: [1, 2],
          barred: false,
          description: 'D# Minor voicing at position 1.',
        },
        piano: {
          notes: ['D#4', 'F#4', 'A#4'],
          octaveRange: [4, 4],
          description: 'Root position D# Minor.',
        },
      },
    ],
    description: 'D# Minor chord. Root + Minor 3rd + Perfect 5th.',
    tags: ['D#', 'minor', 'triad', 'accidental'],
  },
  {
    id: 'e-minor',
    name: 'E# Minor',
    shortName: 'E#m',
    root: 'E#',
    type: 'minor',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'm3', 'P5'],
      construction: 'Root + Minor 3rd + Perfect 5th',
      commonProgressions: ['i-iv-v', 'i-VII-VI'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [1, 3, 3, 1, 1, 1],
          fingers: ['1', '3', '3', '1', '1', '1'],
          muted: [],
          barred: true,
          description: 'Barre chord at fret 1. E# Minor.',
        },
        piano: {
          notes: ['E#4', 'G#4', 'B#4'],
          octaveRange: [4, 4],
          description: 'Root position E# Minor.',
        },
      },
    ],
    description: 'E# Minor chord. Root + Minor 3rd + Perfect 5th.',
    tags: ['E#', 'minor', 'triad', 'accidental'],
  },
  {
    id: 'b-diminished',
    name: 'B Diminished',
    shortName: 'Bdim',
    root: 'B',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5'],
      construction: 'Root + Minor 3rd + Diminished 5th',
      commonProgressions: ['vii°-I', 'ii°-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 2, 3, 4, 3, -1],
          fingers: ['muted', '2', '3', '4', '3', 'muted'],
          muted: [1, 6],
          barred: false,
          description: 'B Diminished voicing at position 2.',
        },
        piano: {
          notes: ['B4', 'D5', 'F5'],
          octaveRange: [4, 5],
          description: 'Root position B Diminished.',
        },
      },
    ],
    description: 'B Diminished chord. Root + Minor 3rd + Diminished 5th.',
    tags: ['B', 'diminished', 'triad'],
  },
  {
    id: 'e-diminished',
    name: 'E Diminished',
    shortName: 'Edim',
    root: 'E',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5'],
      construction: 'Root + Minor 3rd + Diminished 5th',
      commonProgressions: ['vii°-I', 'ii°-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [0, 1, 2, 0, -1, -1],
          fingers: ['open', '1', '2', 'open', 'muted', 'muted'],
          muted: [5, 6],
          barred: false,
          description: 'Open position E Diminished chord.',
        },
        piano: {
          notes: ['E4', 'G4', 'Bb4'],
          octaveRange: [4, 4],
          description: 'Root position E Diminished.',
        },
      },
    ],
    description: 'E Diminished chord. Root + Minor 3rd + Diminished 5th.',
    tags: ['E', 'diminished', 'triad'],
  },
  {
    id: 'a-diminished',
    name: 'A Diminished',
    shortName: 'Adim',
    root: 'A',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5'],
      construction: 'Root + Minor 3rd + Diminished 5th',
      commonProgressions: ['vii°-I', 'ii°-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 0, 1, 2, 1, -1],
          fingers: ['muted', 'open', '1', '2', '1', 'muted'],
          muted: [1, 6],
          barred: false,
          description: 'Open position A Diminished chord.',
        },
        piano: {
          notes: ['A4', 'C5', 'Eb5'],
          octaveRange: [4, 5],
          description: 'Root position A Diminished.',
        },
      },
    ],
    description: 'A Diminished chord. Root + Minor 3rd + Diminished 5th.',
    tags: ['A', 'diminished', 'triad'],
  },
  {
    id: 'd-diminished',
    name: 'D Diminished',
    shortName: 'Ddim',
    root: 'D',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5'],
      construction: 'Root + Minor 3rd + Diminished 5th',
      commonProgressions: ['vii°-I', 'ii°-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, -1, 0, 1, 3, 1],
          fingers: ['muted', 'muted', 'open', '1', '3', '1'],
          muted: [1, 2],
          barred: false,
          description: 'Open position D Diminished chord.',
        },
        piano: {
          notes: ['D4', 'F4', 'Ab4'],
          octaveRange: [4, 4],
          description: 'Root position D Diminished.',
        },
      },
    ],
    description: 'D Diminished chord. Root + Minor 3rd + Diminished 5th.',
    tags: ['D', 'diminished', 'triad'],
  },
  {
    id: 'g-diminished',
    name: 'G Diminished',
    shortName: 'Gdim',
    root: 'G',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5'],
      construction: 'Root + Minor 3rd + Diminished 5th',
      commonProgressions: ['vii°-I', 'ii°-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [3, -1, 5, 3, 2, -1],
          fingers: ['1', 'muted', '4', '2', '1', 'muted'],
          muted: [2, 6],
          barred: false,
          description: 'G Diminished voicing at position 3.',
        },
        piano: {
          notes: ['G4', 'Bb4', 'Db5'],
          octaveRange: [4, 5],
          description: 'Root position G Diminished.',
        },
      },
    ],
    description: 'G Diminished chord. Root + Minor 3rd + Diminished 5th.',
    tags: ['G', 'diminished', 'triad'],
  },
  {
    id: 'c-diminished',
    name: 'C Diminished',
    shortName: 'Cdim',
    root: 'C',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5'],
      construction: 'Root + Minor 3rd + Diminished 5th',
      commonProgressions: ['vii°-I', 'ii°-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 3, 4, 5, 4, -1],
          fingers: ['muted', '3', '4', '5', '4', 'muted'],
          muted: [1, 6],
          barred: false,
          description: 'C Diminished voicing at position 3.',
        },
        piano: {
          notes: ['C4', 'Eb4', 'Gb4'],
          octaveRange: [4, 4],
          description: 'Root position C Diminished.',
        },
      },
    ],
    description: 'C Diminished chord. Root + Minor 3rd + Diminished 5th.',
    tags: ['C', 'diminished', 'triad'],
  },
  {
    id: 'f-diminished',
    name: 'F Diminished',
    shortName: 'Fdim',
    root: 'F',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5'],
      construction: 'Root + Minor 3rd + Diminished 5th',
      commonProgressions: ['vii°-I', 'ii°-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [1, -1, 3, 1, 0, -1],
          fingers: ['1', 'muted', '3', '1', 'open', 'muted'],
          muted: [2, 6],
          barred: false,
          description: 'Open position F Diminished chord.',
        },
        piano: {
          notes: ['F4', 'Ab4', 'Cb5'],
          octaveRange: [4, 5],
          description: 'Root position F Diminished.',
        },
      },
    ],
    description: 'F Diminished chord. Root + Minor 3rd + Diminished 5th.',
    tags: ['F', 'diminished', 'triad'],
  },
  {
    id: 'f-diminished',
    name: 'F# Diminished',
    shortName: 'F#dim',
    root: 'F#',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5'],
      construction: 'Root + Minor 3rd + Diminished 5th',
      commonProgressions: ['vii°-I', 'ii°-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [2, -1, 4, 2, 1, -1],
          fingers: ['2', 'muted', '4', '2', '1', 'muted'],
          muted: [2, 6],
          barred: false,
          description: 'F# Diminished voicing at position 1.',
        },
        piano: {
          notes: ['F#4', 'A4', 'C5'],
          octaveRange: [4, 5],
          description: 'Root position F# Diminished.',
        },
      },
    ],
    description: 'F# Diminished chord. Root + Minor 3rd + Diminished 5th.',
    tags: ['F#', 'diminished', 'triad', 'accidental'],
  },
  {
    id: 'c-diminished',
    name: 'C# Diminished',
    shortName: 'C#dim',
    root: 'C#',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5'],
      construction: 'Root + Minor 3rd + Diminished 5th',
      commonProgressions: ['vii°-I', 'ii°-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 4, 5, 6, 5, -1],
          fingers: ['muted', '4', '5', '6', '5', 'muted'],
          muted: [1, 6],
          barred: false,
          description: 'C# Diminished voicing at position 4.',
        },
        piano: {
          notes: ['C#4', 'E4', 'G4'],
          octaveRange: [4, 4],
          description: 'Root position C# Diminished.',
        },
      },
    ],
    description: 'C# Diminished chord. Root + Minor 3rd + Diminished 5th.',
    tags: ['C#', 'diminished', 'triad', 'accidental'],
  },
  {
    id: 'g-sharp-diminished',
    name: 'G# Diminished',
    shortName: 'G#dim',
    root: 'G#',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5'],
      construction: 'Root + Minor 3rd + Diminished 5th',
      commonProgressions: ['vii°-I', 'ii°-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [4, -1, 6, 4, 3, -1],
          fingers: ['4', 'muted', '6', '4', '3', 'muted'],
          muted: [2, 6],
          barred: false,
          description: 'G# Diminished voicing at position 3.',
        },
        piano: {
          notes: ['G#4', 'B4', 'D5'],
          octaveRange: [4, 5],
          description: 'Root position G# Diminished.',
        },
      },
    ],
    description: 'G# Diminished chord. Root + Minor 3rd + Diminished 5th.',
    tags: ['G#', 'diminished', 'triad', 'accidental'],
  },
  {
    id: 'd-diminished',
    name: 'D# Diminished',
    shortName: 'D#dim',
    root: 'D#',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5'],
      construction: 'Root + Minor 3rd + Diminished 5th',
      commonProgressions: ['vii°-I', 'ii°-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, -1, 1, 2, 4, 2],
          fingers: ['muted', 'muted', '1', '2', '4', '2'],
          muted: [1, 2],
          barred: false,
          description: 'D# Diminished voicing at position 1.',
        },
        piano: {
          notes: ['D#4', 'F#4', 'A4'],
          octaveRange: [4, 4],
          description: 'Root position D# Diminished.',
        },
      },
    ],
    description: 'D# Diminished chord. Root + Minor 3rd + Diminished 5th.',
    tags: ['D#', 'diminished', 'triad', 'accidental'],
  },
  {
    id: 'a-diminished',
    name: 'A# Diminished',
    shortName: 'A#dim',
    root: 'A#',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5'],
      construction: 'Root + Minor 3rd + Diminished 5th',
      commonProgressions: ['vii°-I', 'ii°-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 1, 2, 3, 2, -1],
          fingers: ['muted', '1', '2', '3', '2', 'muted'],
          muted: [1, 6],
          barred: false,
          description: 'A# Diminished voicing at position 1.',
        },
        piano: {
          notes: ['A#4', 'C#5', 'E5'],
          octaveRange: [4, 5],
          description: 'Root position A# Diminished.',
        },
      },
    ],
    description: 'A# Diminished chord. Root + Minor 3rd + Diminished 5th.',
    tags: ['A#', 'diminished', 'triad', 'accidental'],
  },
  {
    id: 'e-diminished',
    name: 'E# Diminished',
    shortName: 'E#dim',
    root: 'E#',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5'],
      construction: 'Root + Minor 3rd + Diminished 5th',
      commonProgressions: ['vii°-I', 'ii°-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [1, -1, 3, 1, 0, -1],
          fingers: ['1', 'muted', '3', '1', 'open', 'muted'],
          muted: [2, 6],
          barred: false,
          description: 'Open position E# Diminished chord.',
        },
        piano: {
          notes: ['E#4', 'G#4', 'B4'],
          octaveRange: [4, 4],
          description: 'Root position E# Diminished.',
        },
      },
    ],
    description: 'E# Diminished chord. Root + Minor 3rd + Diminished 5th.',
    tags: ['E#', 'diminished', 'triad', 'accidental'],
  },
  {
    id: 'b-diminished',
    name: 'B# Diminished',
    shortName: 'B#dim',
    root: 'B#',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5'],
      construction: 'Root + Minor 3rd + Diminished 5th',
      commonProgressions: ['vii°-I', 'ii°-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 3, 4, 5, 4, -1],
          fingers: ['muted', '3', '4', '5', '4', 'muted'],
          muted: [1, 6],
          barred: false,
          description: 'B# Diminished voicing at position 3.',
        },
        piano: {
          notes: ['B#4', 'D#5', 'F#5'],
          octaveRange: [4, 5],
          description: 'Root position B# Diminished.',
        },
      },
    ],
    description: 'B# Diminished chord. Root + Minor 3rd + Diminished 5th.',
    tags: ['B#', 'diminished', 'triad', 'accidental'],
  },
  {
    id: 'bb-diminished',
    name: 'Bb Diminished',
    shortName: 'Bbdim',
    root: 'Bb',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5'],
      construction: 'Root + Minor 3rd + Diminished 5th',
      commonProgressions: ['vii°-I', 'ii°-V'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 1, 2, 3, 2, -1],
          fingers: ['muted', '1', '2', '3', '2', 'muted'],
          muted: [1, 6],
          barred: false,
          description: 'Bb Diminished voicing at position 1.',
        },
        piano: {
          notes: ['Bb4', 'Db5', 'Fb5'],
          octaveRange: [4, 5],
          description: 'Root position Bb Diminished.',
        },
      },
    ],
    description: 'Bb Diminished chord. Root + Minor 3rd + Diminished 5th.',
    tags: ['Bb', 'diminished', 'triad', 'accidental'],
  },
  {
    id: 'c-dominant-7th',
    name: 'C Dominant 7th',
    shortName: 'C7',
    root: 'C',
    type: 'dominant',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5', 'm7'],
      construction: 'Major triad + Minor 7th',
      commonProgressions: ['V7-I', 'I7-IV', 'ii-V7-I'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 3, 2, 3, 1, 3],
          fingers: ['muted', '2', '1', '3', '1', '4'],
          muted: [1],
          barred: false,
          description: 'Open position C Dominant 7th chord.',
        },
        piano: {
          notes: ['C4', 'E4', 'G4', 'Bb4'],
          octaveRange: [4, 4],
          description: 'Root position C Dominant 7th.',
        },
      },
    ],
    description: 'C Dominant 7th chord. Major triad + Minor 7th.',
    tags: ['C', 'dominant', 'seventh'],
  },
  {
    id: 'g-dominant-7th',
    name: 'G Dominant 7th',
    shortName: 'G7',
    root: 'G',
    type: 'dominant',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5', 'm7'],
      construction: 'Major triad + Minor 7th',
      commonProgressions: ['V7-I', 'I7-IV', 'ii-V7-I'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [3, 2, 0, 0, 0, 1],
          fingers: ['3', '2', 'open', 'open', 'open', '1'],
          muted: [],
          barred: false,
          description: 'Open position G Dominant 7th chord.',
        },
        piano: {
          notes: ['G4', 'B4', 'D5', 'F5'],
          octaveRange: [4, 5],
          description: 'Root position G Dominant 7th.',
        },
      },
    ],
    description: 'G Dominant 7th chord. Major triad + Minor 7th.',
    tags: ['G', 'dominant', 'seventh'],
  },
  {
    id: 'd-dominant-7th',
    name: 'D Dominant 7th',
    shortName: 'D7',
    root: 'D',
    type: 'dominant',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5', 'm7'],
      construction: 'Major triad + Minor 7th',
      commonProgressions: ['V7-I', 'I7-IV', 'ii-V7-I'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, -1, 0, 2, 1, 2],
          fingers: ['muted', 'muted', 'open', '2', '1', '2'],
          muted: [1, 2],
          barred: false,
          description: 'Open position D Dominant 7th chord.',
        },
        piano: {
          notes: ['D4', 'F#4', 'A4', 'C5'],
          octaveRange: [4, 5],
          description: 'Root position D Dominant 7th.',
        },
      },
    ],
    description: 'D Dominant 7th chord. Major triad + Minor 7th.',
    tags: ['D', 'dominant', 'seventh'],
  },
  {
    id: 'a-dominant-7th',
    name: 'A Dominant 7th',
    shortName: 'A7',
    root: 'A',
    type: 'dominant',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5', 'm7'],
      construction: 'Major triad + Minor 7th',
      commonProgressions: ['V7-I', 'I7-IV', 'ii-V7-I'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 0, 2, 0, 2, 0],
          fingers: ['muted', 'open', '2', 'open', '2', 'open'],
          muted: [1],
          barred: false,
          description: 'Open position A Dominant 7th chord.',
        },
        piano: {
          notes: ['A4', 'C#5', 'E5', 'G5'],
          octaveRange: [4, 5],
          description: 'Root position A Dominant 7th.',
        },
      },
    ],
    description: 'A Dominant 7th chord. Major triad + Minor 7th.',
    tags: ['A', 'dominant', 'seventh'],
  },
  {
    id: 'e-dominant-7th',
    name: 'E Dominant 7th',
    shortName: 'E7',
    root: 'E',
    type: 'dominant',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5', 'm7'],
      construction: 'Major triad + Minor 7th',
      commonProgressions: ['V7-I', 'I7-IV', 'ii-V7-I'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [0, 2, 0, 1, 0, 0],
          fingers: ['open', '2', 'open', '1', 'open', 'open'],
          muted: [],
          barred: false,
          description: 'Open position E Dominant 7th chord.',
        },
        piano: {
          notes: ['E4', 'G#4', 'B4', 'D5'],
          octaveRange: [4, 5],
          description: 'Root position E Dominant 7th.',
        },
      },
    ],
    description: 'E Dominant 7th chord. Major triad + Minor 7th.',
    tags: ['E', 'dominant', 'seventh'],
  },
  {
    id: 'b-dominant-7th',
    name: 'B Dominant 7th',
    shortName: 'B7',
    root: 'B',
    type: 'dominant',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'M3', 'P5', 'm7'],
      construction: 'Major triad + Minor 7th',
      commonProgressions: ['V7-I', 'I7-IV', 'ii-V7-I'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 2, 1, 2, 0, 2],
          fingers: ['muted', '2', '1', '2', 'open', '2'],
          muted: [1],
          barred: false,
          description: 'Open position B Dominant 7th chord.',
        },
        piano: {
          notes: ['B4', 'D#5', 'F#5', 'A5'],
          octaveRange: [4, 5],
          description: 'Root position B Dominant 7th.',
        },
      },
    ],
    description: 'B Dominant 7th chord. Major triad + Minor 7th.',
    tags: ['B', 'dominant', 'seventh'],
  },
  {
    id: 'f-dominant-7th',
    name: 'F Dominant 7th',
    shortName: 'F7',
    root: 'F',
    type: 'dominant',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5', 'm7'],
      construction: 'Major triad + Minor 7th',
      commonProgressions: ['V7-I', 'I7-IV', 'ii-V7-I'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [1, 3, 1, 2, 1, 1],
          fingers: ['1', '3', '1', '2', '1', '1'],
          muted: [],
          barred: true,
          description: 'Barre chord at fret 1. F Dominant 7th.',
        },
        piano: {
          notes: ['F4', 'A4', 'C5', 'Eb5'],
          octaveRange: [4, 5],
          description: 'Root position F Dominant 7th.',
        },
      },
    ],
    description: 'F Dominant 7th chord. Major triad + Minor 7th.',
    tags: ['F', 'dominant', 'seventh'],
  },
  {
    id: 'bb-dominant-7th',
    name: 'Bb Dominant 7th',
    shortName: 'Bb7',
    root: 'Bb',
    type: 'dominant',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'M3', 'P5', 'm7'],
      construction: 'Major triad + Minor 7th',
      commonProgressions: ['V7-I', 'I7-IV', 'ii-V7-I'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 1, 3, 1, 3, 1],
          fingers: ['muted', '1', '3', '1', '3', '1'],
          muted: [1],
          barred: true,
          description: 'Barre chord at fret 1. Bb Dominant 7th.',
        },
        piano: {
          notes: ['Bb4', 'D5', 'F5', 'Ab5'],
          octaveRange: [4, 5],
          description: 'Root position Bb Dominant 7th.',
        },
      },
    ],
    description: 'Bb Dominant 7th chord. Major triad + Minor 7th.',
    tags: ['Bb', 'dominant', 'seventh', 'accidental'],
  },
  {
    id: 'eb-dominant-7th',
    name: 'Eb Dominant 7th',
    shortName: 'Eb7',
    root: 'Eb',
    type: 'dominant',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'M3', 'P5', 'm7'],
      construction: 'Major triad + Minor 7th',
      commonProgressions: ['V7-I', 'I7-IV', 'ii-V7-I'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, -1, 1, 3, 2, 3],
          fingers: ['muted', 'muted', '1', '3', '2', '3'],
          muted: [1, 2],
          barred: false,
          description: 'Eb Dominant 7th voicing at position 1.',
        },
        piano: {
          notes: ['Eb4', 'G4', 'Bb4', 'Db5'],
          octaveRange: [4, 5],
          description: 'Root position Eb Dominant 7th.',
        },
      },
    ],
    description: 'Eb Dominant 7th chord. Major triad + Minor 7th.',
    tags: ['Eb', 'dominant', 'seventh', 'accidental'],
  },
  {
    id: 'ab-dominant-7th',
    name: 'Ab Dominant 7th',
    shortName: 'Ab7',
    root: 'Ab',
    type: 'dominant',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'M3', 'P5', 'm7'],
      construction: 'Major triad + Minor 7th',
      commonProgressions: ['V7-I', 'I7-IV', 'ii-V7-I'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [4, 6, 4, 5, 4, 4],
          fingers: ['4', '6', '4', '5', '4', '4'],
          muted: [],
          barred: true,
          description: 'Barre chord at fret 4. Ab Dominant 7th.',
        },
        piano: {
          notes: ['Ab4', 'C5', 'Eb5', 'Gb5'],
          octaveRange: [4, 5],
          description: 'Root position Ab Dominant 7th.',
        },
      },
    ],
    description: 'Ab Dominant 7th chord. Major triad + Minor 7th.',
    tags: ['Ab', 'dominant', 'seventh', 'accidental'],
  },
  {
    id: 'db-dominant-7th',
    name: 'Db Dominant 7th',
    shortName: 'Db7',
    root: 'Db',
    type: 'dominant',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'M3', 'P5', 'm7'],
      construction: 'Major triad + Minor 7th',
      commonProgressions: ['V7-I', 'I7-IV', 'ii-V7-I'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 4, 6, 4, 6, 4],
          fingers: ['muted', '4', '6', '4', '6', '4'],
          muted: [1],
          barred: true,
          description: 'Barre chord at fret 4. Db Dominant 7th.',
        },
        piano: {
          notes: ['Db4', 'F4', 'Ab4', 'Cb5'],
          octaveRange: [4, 5],
          description: 'Root position Db Dominant 7th.',
        },
      },
    ],
    description: 'Db Dominant 7th chord. Major triad + Minor 7th.',
    tags: ['Db', 'dominant', 'seventh', 'accidental'],
  },
  {
    id: 'f-dominant-7th',
    name: 'F# Dominant 7th',
    shortName: 'F#7',
    root: 'F#',
    type: 'dominant',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'M3', 'P5', 'm7'],
      construction: 'Major triad + Minor 7th',
      commonProgressions: ['V7-I', 'I7-IV', 'ii-V7-I'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [2, 4, 2, 3, 2, 2],
          fingers: ['2', '4', '2', '3', '2', '2'],
          muted: [],
          barred: true,
          description: 'Barre chord at fret 2. F# Dominant 7th.',
        },
        piano: {
          notes: ['F#4', 'A#4', 'C#5', 'E5'],
          octaveRange: [4, 5],
          description: 'Root position F# Dominant 7th.',
        },
      },
    ],
    description: 'F# Dominant 7th chord. Major triad + Minor 7th.',
    tags: ['F#', 'dominant', 'seventh', 'accidental'],
  },
  {
    id: 'gb-dominant-7th',
    name: 'Gb Dominant 7th',
    shortName: 'Gb7',
    root: 'Gb',
    type: 'dominant',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'M3', 'P5', 'm7'],
      construction: 'Major triad + Minor 7th',
      commonProgressions: ['V7-I', 'I7-IV', 'ii-V7-I'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [2, 4, 2, 3, 2, 2],
          fingers: ['2', '4', '2', '3', '2', '2'],
          muted: [],
          barred: true,
          description: 'Barre chord at fret 2. Gb Dominant 7th.',
        },
        piano: {
          notes: ['Gb4', 'Bb4', 'Db5', 'Fb5'],
          octaveRange: [4, 5],
          description: 'Root position Gb Dominant 7th.',
        },
      },
    ],
    description: 'Gb Dominant 7th chord. Major triad + Minor 7th.',
    tags: ['Gb', 'dominant', 'seventh', 'accidental'],
  },
  {
    id: 'c-dominant-7th',
    name: 'C# Dominant 7th',
    shortName: 'C#7',
    root: 'C#',
    type: 'dominant',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'M3', 'P5', 'm7'],
      construction: 'Major triad + Minor 7th',
      commonProgressions: ['V7-I', 'I7-IV', 'ii-V7-I'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 4, 6, 4, 6, 4],
          fingers: ['muted', '4', '6', '4', '6', '4'],
          muted: [1],
          barred: true,
          description: 'Barre chord at fret 4. C# Dominant 7th.',
        },
        piano: {
          notes: ['C#4', 'E#4', 'G#4', 'B4'],
          octaveRange: [4, 4],
          description: 'Root position C# Dominant 7th.',
        },
      },
    ],
    description: 'C# Dominant 7th chord. Major triad + Minor 7th.',
    tags: ['C#', 'dominant', 'seventh', 'accidental'],
  },
  {
    id: 'g-dominant-7th',
    name: 'G# Dominant 7th',
    shortName: 'G#7',
    root: 'G#',
    type: 'dominant',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'M3', 'P5', 'm7'],
      construction: 'Major triad + Minor 7th',
      commonProgressions: ['V7-I', 'I7-IV', 'ii-V7-I'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [4, 6, 4, 5, 4, 4],
          fingers: ['4', '6', '4', '5', '4', '4'],
          muted: [],
          barred: true,
          description: 'Barre chord at fret 4. G# Dominant 7th.',
        },
        piano: {
          notes: ['G#4', 'B#4', 'D#5', 'F#5'],
          octaveRange: [4, 5],
          description: 'Root position G# Dominant 7th.',
        },
      },
    ],
    description: 'G# Dominant 7th chord. Major triad + Minor 7th.',
    tags: ['G#', 'dominant', 'seventh', 'accidental'],
  },
  {
    id: 'c-major-7th',
    name: 'C Major 7th',
    shortName: 'Cmaj7',
    root: 'C',
    type: 'major',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M7'],
      construction: 'Major triad + Major 7th',
      commonProgressions: ['Imaj7-vi7', 'Imaj7-IVmaj7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 3, 2, 0, 0, 0],
          fingers: ['muted', '3', '2', 'open', 'open', 'open'],
          muted: [1],
          barred: false,
          description: 'Open position C Major 7th chord.',
        },
        piano: {
          notes: ['C4', 'E4', 'G4', 'B4'],
          octaveRange: [4, 4],
          description: 'Root position C Major 7th.',
        },
      },
    ],
    description: 'C Major 7th chord. Major triad + Major 7th.',
    tags: ['C', 'major', 'seventh'],
  },
  {
    id: 'g-major-7th',
    name: 'G Major 7th',
    shortName: 'Gmaj7',
    root: 'G',
    type: 'major',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M7'],
      construction: 'Major triad + Major 7th',
      commonProgressions: ['Imaj7-vi7', 'Imaj7-IVmaj7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [3, 2, 0, 0, 0, 2],
          fingers: ['3', '2', 'open', 'open', 'open', '2'],
          muted: [],
          barred: false,
          description: 'Open position G Major 7th chord.',
        },
        piano: {
          notes: ['G4', 'B4', 'D5', 'F#5'],
          octaveRange: [4, 5],
          description: 'Root position G Major 7th.',
        },
      },
    ],
    description: 'G Major 7th chord. Major triad + Major 7th.',
    tags: ['G', 'major', 'seventh'],
  },
  {
    id: 'd-major-7th',
    name: 'D Major 7th',
    shortName: 'Dmaj7',
    root: 'D',
    type: 'major',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M7'],
      construction: 'Major triad + Major 7th',
      commonProgressions: ['Imaj7-vi7', 'Imaj7-IVmaj7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, -1, 0, 2, 2, 2],
          fingers: ['muted', 'muted', 'open', '2', '2', '2'],
          muted: [1, 2],
          barred: false,
          description: 'Open position D Major 7th chord.',
        },
        piano: {
          notes: ['D4', 'F#4', 'A4', 'C#5'],
          octaveRange: [4, 5],
          description: 'Root position D Major 7th.',
        },
      },
    ],
    description: 'D Major 7th chord. Major triad + Major 7th.',
    tags: ['D', 'major', 'seventh'],
  },
  {
    id: 'a-major-7th',
    name: 'A Major 7th',
    shortName: 'Amaj7',
    root: 'A',
    type: 'major',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M7'],
      construction: 'Major triad + Major 7th',
      commonProgressions: ['Imaj7-vi7', 'Imaj7-IVmaj7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 0, 2, 1, 2, 0],
          fingers: ['muted', 'open', '2', '1', '2', 'open'],
          muted: [1],
          barred: false,
          description: 'Open position A Major 7th chord.',
        },
        piano: {
          notes: ['A4', 'C#5', 'E5', 'G#5'],
          octaveRange: [4, 5],
          description: 'Root position A Major 7th.',
        },
      },
    ],
    description: 'A Major 7th chord. Major triad + Major 7th.',
    tags: ['A', 'major', 'seventh'],
  },
  {
    id: 'e-major-7th',
    name: 'E Major 7th',
    shortName: 'Emaj7',
    root: 'E',
    type: 'major',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M7'],
      construction: 'Major triad + Major 7th',
      commonProgressions: ['Imaj7-vi7', 'Imaj7-IVmaj7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [0, 2, 1, 1, 0, 0],
          fingers: ['open', '2', '1', '1', 'open', 'open'],
          muted: [],
          barred: false,
          description: 'Open position E Major 7th chord.',
        },
        piano: {
          notes: ['E4', 'G#4', 'B4', 'D#5'],
          octaveRange: [4, 5],
          description: 'Root position E Major 7th.',
        },
      },
    ],
    description: 'E Major 7th chord. Major triad + Major 7th.',
    tags: ['E', 'major', 'seventh'],
  },
  {
    id: 'b-major-7th',
    name: 'B Major 7th',
    shortName: 'Bmaj7',
    root: 'B',
    type: 'major',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M7'],
      construction: 'Major triad + Major 7th',
      commonProgressions: ['Imaj7-vi7', 'Imaj7-IVmaj7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 2, 4, 3, 4, 2],
          fingers: ['muted', '2', '4', '3', '4', '2'],
          muted: [1],
          barred: true,
          description: 'Barre chord at fret 2. B Major 7th.',
        },
        piano: {
          notes: ['B4', 'D#5', 'F#5', 'A#5'],
          octaveRange: [4, 5],
          description: 'Root position B Major 7th.',
        },
      },
    ],
    description: 'B Major 7th chord. Major triad + Major 7th.',
    tags: ['B', 'major', 'seventh'],
  },
  {
    id: 'f-major-7th',
    name: 'F Major 7th',
    shortName: 'Fmaj7',
    root: 'F',
    type: 'major',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M7'],
      construction: 'Major triad + Major 7th',
      commonProgressions: ['Imaj7-vi7', 'Imaj7-IVmaj7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [1, -1, 2, 2, 1, 0],
          fingers: ['1', 'muted', '2', '2', '1', 'open'],
          muted: [2],
          barred: true,
          description: 'Open position F Major 7th chord.',
        },
        piano: {
          notes: ['F4', 'A4', 'C5', 'E5'],
          octaveRange: [4, 5],
          description: 'Root position F Major 7th.',
        },
      },
    ],
    description: 'F Major 7th chord. Major triad + Major 7th.',
    tags: ['F', 'major', 'seventh'],
  },
  {
    id: 'bb-major-7th',
    name: 'Bb Major 7th',
    shortName: 'Bbmaj7',
    root: 'Bb',
    type: 'major',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M7'],
      construction: 'Major triad + Major 7th',
      commonProgressions: ['Imaj7-vi7', 'Imaj7-IVmaj7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 1, 3, 2, 3, 1],
          fingers: ['muted', '1', '3', '2', '3', '1'],
          muted: [1],
          barred: true,
          description: 'Barre chord at fret 1. Bb Major 7th.',
        },
        piano: {
          notes: ['Bb4', 'D5', 'F5', 'A5'],
          octaveRange: [4, 5],
          description: 'Root position Bb Major 7th.',
        },
      },
    ],
    description: 'Bb Major 7th chord. Major triad + Major 7th.',
    tags: ['Bb', 'major', 'seventh', 'accidental'],
  },
  {
    id: 'eb-major-7th',
    name: 'Eb Major 7th',
    shortName: 'Ebmaj7',
    root: 'Eb',
    type: 'major',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M7'],
      construction: 'Major triad + Major 7th',
      commonProgressions: ['Imaj7-vi7', 'Imaj7-IVmaj7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, -1, 1, 3, 3, 3],
          fingers: ['muted', 'muted', '1', '3', '3', '3'],
          muted: [1, 2],
          barred: false,
          description: 'Eb Major 7th voicing at position 1.',
        },
        piano: {
          notes: ['Eb4', 'G4', 'Bb4', 'D5'],
          octaveRange: [4, 5],
          description: 'Root position Eb Major 7th.',
        },
      },
    ],
    description: 'Eb Major 7th chord. Major triad + Major 7th.',
    tags: ['Eb', 'major', 'seventh', 'accidental'],
  },
  {
    id: 'ab-major-7th',
    name: 'Ab Major 7th',
    shortName: 'Abmaj7',
    root: 'Ab',
    type: 'major',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M7'],
      construction: 'Major triad + Major 7th',
      commonProgressions: ['Imaj7-vi7', 'Imaj7-IVmaj7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [4, 6, 5, 5, 4, 4],
          fingers: ['4', '6', '5', '5', '4', '4'],
          muted: [],
          barred: true,
          description: 'Barre chord at fret 4. Ab Major 7th.',
        },
        piano: {
          notes: ['Ab4', 'C5', 'Eb5', 'G5'],
          octaveRange: [4, 5],
          description: 'Root position Ab Major 7th.',
        },
      },
    ],
    description: 'Ab Major 7th chord. Major triad + Major 7th.',
    tags: ['Ab', 'major', 'seventh', 'accidental'],
  },
  {
    id: 'db-major-7th',
    name: 'Db Major 7th',
    shortName: 'Dbmaj7',
    root: 'Db',
    type: 'major',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M7'],
      construction: 'Major triad + Major 7th',
      commonProgressions: ['Imaj7-vi7', 'Imaj7-IVmaj7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 4, 6, 5, 6, 4],
          fingers: ['muted', '4', '6', '5', '6', '4'],
          muted: [1],
          barred: true,
          description: 'Barre chord at fret 4. Db Major 7th.',
        },
        piano: {
          notes: ['Db4', 'F4', 'Ab4', 'C5'],
          octaveRange: [4, 5],
          description: 'Root position Db Major 7th.',
        },
      },
    ],
    description: 'Db Major 7th chord. Major triad + Major 7th.',
    tags: ['Db', 'major', 'seventh', 'accidental'],
  },
  {
    id: 'f-major-7th',
    name: 'F# Major 7th',
    shortName: 'F#maj7',
    root: 'F#',
    type: 'major',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M7'],
      construction: 'Major triad + Major 7th',
      commonProgressions: ['Imaj7-vi7', 'Imaj7-IVmaj7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [2, 4, 3, 3, 2, 2],
          fingers: ['2', '4', '3', '3', '2', '2'],
          muted: [],
          barred: true,
          description: 'Barre chord at fret 2. F# Major 7th.',
        },
        piano: {
          notes: ['F#4', 'A#4', 'C#5', 'E#5'],
          octaveRange: [4, 5],
          description: 'Root position F# Major 7th.',
        },
      },
    ],
    description: 'F# Major 7th chord. Major triad + Major 7th.',
    tags: ['F#', 'major', 'seventh', 'accidental'],
  },
  {
    id: 'gb-major-7th',
    name: 'Gb Major 7th',
    shortName: 'Gbmaj7',
    root: 'Gb',
    type: 'major',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M7'],
      construction: 'Major triad + Major 7th',
      commonProgressions: ['Imaj7-vi7', 'Imaj7-IVmaj7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [2, 4, 3, 3, 2, 2],
          fingers: ['2', '4', '3', '3', '2', '2'],
          muted: [],
          barred: true,
          description: 'Barre chord at fret 2. Gb Major 7th.',
        },
        piano: {
          notes: ['Gb4', 'Bb4', 'Db5', 'F5'],
          octaveRange: [4, 5],
          description: 'Root position Gb Major 7th.',
        },
      },
    ],
    description: 'Gb Major 7th chord. Major triad + Major 7th.',
    tags: ['Gb', 'major', 'seventh', 'accidental'],
  },
  {
    id: 'cb-major-7th',
    name: 'Cb Major 7th',
    shortName: 'Cbmaj7',
    root: 'Cb',
    type: 'major',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M7'],
      construction: 'Major triad + Major 7th',
      commonProgressions: ['Imaj7-vi7', 'Imaj7-IVmaj7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 2, 4, 3, 4, 2],
          fingers: ['muted', '2', '4', '3', '4', '2'],
          muted: [1],
          barred: true,
          description: 'Barre chord at fret 2. Cb Major 7th.',
        },
        piano: {
          notes: ['Cb4', 'Eb4', 'Gb4', 'Bb4'],
          octaveRange: [4, 4],
          description: 'Root position Cb Major 7th.',
        },
      },
    ],
    description: 'Cb Major 7th chord. Major triad + Major 7th.',
    tags: ['Cb', 'major', 'seventh', 'accidental'],
  },
  {
    id: 'fb-major-7th',
    name: 'Fb Major 7th',
    shortName: 'Fbmaj7',
    root: 'Fb',
    type: 'major',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'M3', 'P5', 'M7'],
      construction: 'Major triad + Major 7th',
      commonProgressions: ['Imaj7-vi7', 'Imaj7-IVmaj7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [0, 2, 1, 1, 0, 0],
          fingers: ['open', '2', '1', '1', 'open', 'open'],
          muted: [],
          barred: false,
          description: 'Open position Fb Major 7th chord.',
        },
        piano: {
          notes: ['Fb4', 'Ab4', 'Cb5', 'Eb5'],
          octaveRange: [4, 5],
          description: 'Root position Fb Major 7th.',
        },
      },
    ],
    description: 'Fb Major 7th chord. Major triad + Major 7th.',
    tags: ['Fb', 'major', 'seventh', 'accidental'],
  },
  {
    id: 'a-minor-7th',
    name: 'A Minor 7th',
    shortName: 'Am7',
    root: 'A',
    type: 'minor',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'm3', 'P5', 'm7'],
      construction: 'Minor triad + Minor 7th',
      commonProgressions: ['ii7-V7-I', 'i7-iv7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 0, 2, 0, 1, 0],
          fingers: ['muted', 'open', '2', 'open', '1', 'open'],
          muted: [1],
          barred: false,
          description: 'Open position A Minor 7th chord.',
        },
        piano: {
          notes: ['A4', 'C5', 'E5', 'G5'],
          octaveRange: [4, 5],
          description: 'Root position A Minor 7th.',
        },
      },
    ],
    description: 'A Minor 7th chord. Minor triad + Minor 7th.',
    tags: ['A', 'minor', 'seventh'],
  },
  {
    id: 'e-minor-7th',
    name: 'E Minor 7th',
    shortName: 'Em7',
    root: 'E',
    type: 'minor',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'm3', 'P5', 'm7'],
      construction: 'Minor triad + Minor 7th',
      commonProgressions: ['ii7-V7-I', 'i7-iv7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [0, 2, 0, 0, 0, 0],
          fingers: ['open', '2', 'open', 'open', 'open', 'open'],
          muted: [],
          barred: false,
          description: 'Open position E Minor 7th chord.',
        },
        piano: {
          notes: ['E4', 'G4', 'B4', 'D5'],
          octaveRange: [4, 5],
          description: 'Root position E Minor 7th.',
        },
      },
    ],
    description: 'E Minor 7th chord. Minor triad + Minor 7th.',
    tags: ['E', 'minor', 'seventh'],
  },
  {
    id: 'b-minor-7th',
    name: 'B Minor 7th',
    shortName: 'Bm7',
    root: 'B',
    type: 'minor',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'm3', 'P5', 'm7'],
      construction: 'Minor triad + Minor 7th',
      commonProgressions: ['ii7-V7-I', 'i7-iv7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 2, 0, 2, 0, 2],
          fingers: ['muted', '2', 'open', '2', 'open', '2'],
          muted: [1],
          barred: false,
          description: 'Open position B Minor 7th chord.',
        },
        piano: {
          notes: ['B4', 'D5', 'F#5', 'A5'],
          octaveRange: [4, 5],
          description: 'Root position B Minor 7th.',
        },
      },
    ],
    description: 'B Minor 7th chord. Minor triad + Minor 7th.',
    tags: ['B', 'minor', 'seventh'],
  },
  {
    id: 'd-minor-7th',
    name: 'D Minor 7th',
    shortName: 'Dm7',
    root: 'D',
    type: 'minor',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'm3', 'P5', 'm7'],
      construction: 'Minor triad + Minor 7th',
      commonProgressions: ['ii7-V7-I', 'i7-iv7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, -1, 0, 2, 1, 1],
          fingers: ['muted', 'muted', 'open', '2', '1', '1'],
          muted: [1, 2],
          barred: false,
          description: 'Open position D Minor 7th chord.',
        },
        piano: {
          notes: ['D4', 'F4', 'A4', 'C5'],
          octaveRange: [4, 5],
          description: 'Root position D Minor 7th.',
        },
      },
    ],
    description: 'D Minor 7th chord. Minor triad + Minor 7th.',
    tags: ['D', 'minor', 'seventh'],
  },
  {
    id: 'g-minor-7th',
    name: 'G Minor 7th',
    shortName: 'Gm7',
    root: 'G',
    type: 'minor',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'm3', 'P5', 'm7'],
      construction: 'Minor triad + Minor 7th',
      commonProgressions: ['ii7-V7-I', 'i7-iv7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [3, 5, 3, 3, 3, 3],
          fingers: ['3', '5', '3', '3', '3', '3'],
          muted: [],
          barred: true,
          description: 'Barre chord at fret 3. G Minor 7th.',
        },
        piano: {
          notes: ['G4', 'Bb4', 'D5', 'F5'],
          octaveRange: [4, 5],
          description: 'Root position G Minor 7th.',
        },
      },
    ],
    description: 'G Minor 7th chord. Minor triad + Minor 7th.',
    tags: ['G', 'minor', 'seventh'],
  },
  {
    id: 'c-minor-7th',
    name: 'C Minor 7th',
    shortName: 'Cm7',
    root: 'C',
    type: 'minor',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'm3', 'P5', 'm7'],
      construction: 'Minor triad + Minor 7th',
      commonProgressions: ['ii7-V7-I', 'i7-iv7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 3, 5, 3, 4, 3],
          fingers: ['muted', '3', '5', '3', '4', '3'],
          muted: [1],
          barred: true,
          description: 'Barre chord at fret 3. C Minor 7th.',
        },
        piano: {
          notes: ['C4', 'Eb4', 'G4', 'Bb4'],
          octaveRange: [4, 4],
          description: 'Root position C Minor 7th.',
        },
      },
    ],
    description: 'C Minor 7th chord. Minor triad + Minor 7th.',
    tags: ['C', 'minor', 'seventh'],
  },
  {
    id: 'f-minor-7th',
    name: 'F Minor 7th',
    shortName: 'Fm7',
    root: 'F',
    type: 'minor',
    difficulty: 'intermediate',
    theory: {
      intervals: ['R', 'm3', 'P5', 'm7'],
      construction: 'Minor triad + Minor 7th',
      commonProgressions: ['ii7-V7-I', 'i7-iv7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [1, 3, 1, 1, 1, 1],
          fingers: ['1', '3', '1', '1', '1', '1'],
          muted: [],
          barred: true,
          description: 'Barre chord at fret 1. F Minor 7th.',
        },
        piano: {
          notes: ['F4', 'Ab4', 'C5', 'Eb5'],
          octaveRange: [4, 5],
          description: 'Root position F Minor 7th.',
        },
      },
    ],
    description: 'F Minor 7th chord. Minor triad + Minor 7th.',
    tags: ['F', 'minor', 'seventh'],
  },
  {
    id: 'bb-minor-7th',
    name: 'Bb Minor 7th',
    shortName: 'Bbm7',
    root: 'Bb',
    type: 'minor',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'm3', 'P5', 'm7'],
      construction: 'Minor triad + Minor 7th',
      commonProgressions: ['ii7-V7-I', 'i7-iv7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 1, 3, 1, 2, 1],
          fingers: ['muted', '1', '3', '1', '2', '1'],
          muted: [1],
          barred: true,
          description: 'Barre chord at fret 1. Bb Minor 7th.',
        },
        piano: {
          notes: ['Bb4', 'Db5', 'F5', 'Ab5'],
          octaveRange: [4, 5],
          description: 'Root position Bb Minor 7th.',
        },
      },
    ],
    description: 'Bb Minor 7th chord. Minor triad + Minor 7th.',
    tags: ['Bb', 'minor', 'seventh', 'accidental'],
  },
  {
    id: 'eb-minor-7th',
    name: 'Eb Minor 7th',
    shortName: 'Ebm7',
    root: 'Eb',
    type: 'minor',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'm3', 'P5', 'm7'],
      construction: 'Minor triad + Minor 7th',
      commonProgressions: ['ii7-V7-I', 'i7-iv7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, -1, 1, 3, 2, 2],
          fingers: ['muted', 'muted', '1', '3', '2', '2'],
          muted: [1, 2],
          barred: false,
          description: 'Eb Minor 7th voicing at position 1.',
        },
        piano: {
          notes: ['Eb4', 'Gb4', 'Bb4', 'Db5'],
          octaveRange: [4, 5],
          description: 'Root position Eb Minor 7th.',
        },
      },
    ],
    description: 'Eb Minor 7th chord. Minor triad + Minor 7th.',
    tags: ['Eb', 'minor', 'seventh', 'accidental'],
  },
  {
    id: 'ab-minor-7th',
    name: 'Ab Minor 7th',
    shortName: 'Abm7',
    root: 'Ab',
    type: 'minor',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'm3', 'P5', 'm7'],
      construction: 'Minor triad + Minor 7th',
      commonProgressions: ['ii7-V7-I', 'i7-iv7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [4, 6, 4, 4, 4, 4],
          fingers: ['4', '6', '4', '4', '4', '4'],
          muted: [],
          barred: true,
          description: 'Barre chord at fret 4. Ab Minor 7th.',
        },
        piano: {
          notes: ['Ab4', 'Cb5', 'Eb5', 'Gb5'],
          octaveRange: [4, 5],
          description: 'Root position Ab Minor 7th.',
        },
      },
    ],
    description: 'Ab Minor 7th chord. Minor triad + Minor 7th.',
    tags: ['Ab', 'minor', 'seventh', 'accidental'],
  },
  {
    id: 'db-minor-7th',
    name: 'Db Minor 7th',
    shortName: 'Dbm7',
    root: 'Db',
    type: 'minor',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'm3', 'P5', 'm7'],
      construction: 'Minor triad + Minor 7th',
      commonProgressions: ['ii7-V7-I', 'i7-iv7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 4, 6, 4, 5, 4],
          fingers: ['muted', '4', '6', '4', '5', '4'],
          muted: [1],
          barred: true,
          description: 'Barre chord at fret 4. Db Minor 7th.',
        },
        piano: {
          notes: ['Db4', 'Fb4', 'Ab4', 'Cb5'],
          octaveRange: [4, 5],
          description: 'Root position Db Minor 7th.',
        },
      },
    ],
    description: 'Db Minor 7th chord. Minor triad + Minor 7th.',
    tags: ['Db', 'minor', 'seventh', 'accidental'],
  },
  {
    id: 'f-minor-7th',
    name: 'F# Minor 7th',
    shortName: 'F#m7',
    root: 'F#',
    type: 'minor',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'm3', 'P5', 'm7'],
      construction: 'Minor triad + Minor 7th',
      commonProgressions: ['ii7-V7-I', 'i7-iv7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [2, 4, 2, 2, 2, 2],
          fingers: ['2', '4', '2', '2', '2', '2'],
          muted: [],
          barred: true,
          description: 'Barre chord at fret 2. F# Minor 7th.',
        },
        piano: {
          notes: ['F#4', 'A4', 'C#5', 'E5'],
          octaveRange: [4, 5],
          description: 'Root position F# Minor 7th.',
        },
      },
    ],
    description: 'F# Minor 7th chord. Minor triad + Minor 7th.',
    tags: ['F#', 'minor', 'seventh', 'accidental'],
  },
  {
    id: 'c-minor-7th',
    name: 'C# Minor 7th',
    shortName: 'C#m7',
    root: 'C#',
    type: 'minor',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'm3', 'P5', 'm7'],
      construction: 'Minor triad + Minor 7th',
      commonProgressions: ['ii7-V7-I', 'i7-iv7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 4, 6, 4, 5, 4],
          fingers: ['muted', '4', '6', '4', '5', '4'],
          muted: [1],
          barred: true,
          description: 'Barre chord at fret 4. C# Minor 7th.',
        },
        piano: {
          notes: ['C#4', 'E4', 'G#4', 'B4'],
          octaveRange: [4, 4],
          description: 'Root position C# Minor 7th.',
        },
      },
    ],
    description: 'C# Minor 7th chord. Minor triad + Minor 7th.',
    tags: ['C#', 'minor', 'seventh', 'accidental'],
  },
  {
    id: 'g-minor-7th',
    name: 'G# Minor 7th',
    shortName: 'G#m7',
    root: 'G#',
    type: 'minor',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'm3', 'P5', 'm7'],
      construction: 'Minor triad + Minor 7th',
      commonProgressions: ['ii7-V7-I', 'i7-iv7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [4, 6, 4, 4, 4, 4],
          fingers: ['4', '6', '4', '4', '4', '4'],
          muted: [],
          barred: true,
          description: 'Barre chord at fret 4. G# Minor 7th.',
        },
        piano: {
          notes: ['G#4', 'B4', 'D#5', 'F#5'],
          octaveRange: [4, 5],
          description: 'Root position G# Minor 7th.',
        },
      },
    ],
    description: 'G# Minor 7th chord. Minor triad + Minor 7th.',
    tags: ['G#', 'minor', 'seventh', 'accidental'],
  },
  {
    id: 'a-minor-7th',
    name: 'A# Minor 7th',
    shortName: 'A#m7',
    root: 'A#',
    type: 'minor',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'm3', 'P5', 'm7'],
      construction: 'Minor triad + Minor 7th',
      commonProgressions: ['ii7-V7-I', 'i7-iv7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 1, 3, 1, 2, 1],
          fingers: ['muted', '1', '3', '1', '2', '1'],
          muted: [1],
          barred: true,
          description: 'Barre chord at fret 1. A# Minor 7th.',
        },
        piano: {
          notes: ['A#4', 'C#5', 'E#5', 'G#5'],
          octaveRange: [4, 5],
          description: 'Root position A# Minor 7th.',
        },
      },
    ],
    description: 'A# Minor 7th chord. Minor triad + Minor 7th.',
    tags: ['A#', 'minor', 'seventh', 'accidental'],
  },
  {
    id: 'd-minor-7th',
    name: 'D# Minor 7th',
    shortName: 'D#m7',
    root: 'D#',
    type: 'minor',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'm3', 'P5', 'm7'],
      construction: 'Minor triad + Minor 7th',
      commonProgressions: ['ii7-V7-I', 'i7-iv7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, -1, 1, 3, 2, 2],
          fingers: ['muted', 'muted', '1', '3', '2', '2'],
          muted: [1, 2],
          barred: false,
          description: 'D# Minor 7th voicing at position 1.',
        },
        piano: {
          notes: ['D#4', 'F#4', 'A#4', 'C#5'],
          octaveRange: [4, 5],
          description: 'Root position D# Minor 7th.',
        },
      },
    ],
    description: 'D# Minor 7th chord. Minor triad + Minor 7th.',
    tags: ['D#', 'minor', 'seventh', 'accidental'],
  },
  {
    id: 'e-minor-7th',
    name: 'E# Minor 7th',
    shortName: 'E#m7',
    root: 'E#',
    type: 'minor',
    difficulty: 'advanced',
    theory: {
      intervals: ['R', 'm3', 'P5', 'm7'],
      construction: 'Minor triad + Minor 7th',
      commonProgressions: ['ii7-V7-I', 'i7-iv7'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [1, 3, 1, 1, 1, 1],
          fingers: ['1', '3', '1', '1', '1', '1'],
          muted: [],
          barred: true,
          description: 'Barre chord at fret 1. E# Minor 7th.',
        },
        piano: {
          notes: ['E#4', 'G#4', 'B#4', 'D#5'],
          octaveRange: [4, 5],
          description: 'Root position E# Minor 7th.',
        },
      },
    ],
    description: 'E# Minor 7th chord. Minor triad + Minor 7th.',
    tags: ['E#', 'minor', 'seventh', 'accidental'],
  },
  {
    id: 'a-half-diminished-7th',
    name: 'A Half-Diminished 7th',
    shortName: 'Am7b5',
    root: 'A',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5', 'm7'],
      construction: 'Diminished triad + Minor 7th',
      commonProgressions: ['viiø7-III', 'iiø7-V7-i'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 0, 1, 2, 1, 3],
          fingers: ['muted', 'open', '1', '3', '2', '4'],
          muted: [1],
          barred: false,
          description: 'Open position A Half-Diminished 7th chord.',
        },
        piano: {
          notes: ['A4', 'C5', 'Eb5', 'G5'],
          octaveRange: [4, 5],
          description: 'Root position A Half-Diminished 7th.',
        },
      },
    ],
    description: 'A Half-Diminished 7th chord. Diminished triad + Minor 7th.',
    tags: ['A', 'half-diminished', 'seventh'],
  },
  {
    id: 'e-half-diminished-7th',
    name: 'E Half-Diminished 7th',
    shortName: 'Em7b5',
    root: 'E',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5', 'm7'],
      construction: 'Diminished triad + Minor 7th',
      commonProgressions: ['viiø7-III', 'iiø7-V7-i'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [0, 1, 0, 0, 3, 0],
          fingers: ['open', '1', 'open', 'open', '3', 'open'],
          muted: [],
          barred: false,
          description: 'Open position E Half-Diminished 7th chord.',
        },
        piano: {
          notes: ['E4', 'G4', 'Bb4', 'D5'],
          octaveRange: [4, 5],
          description: 'Root position E Half-Diminished 7th.',
        },
      },
    ],
    description: 'E Half-Diminished 7th chord. Diminished triad + Minor 7th.',
    tags: ['E', 'half-diminished', 'seventh'],
  },
  {
    id: 'b-half-diminished-7th',
    name: 'B Half-Diminished 7th',
    shortName: 'Bm7b5',
    root: 'B',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5', 'm7'],
      construction: 'Diminished triad + Minor 7th',
      commonProgressions: ['viiø7-III', 'iiø7-V7-i'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 2, 3, 2, 3, -1],
          fingers: ['muted', '2', '3', '2', '3', 'muted'],
          muted: [1, 6],
          barred: true,
          description: 'Barre chord at fret 2. B Half-Diminished 7th.',
        },
        piano: {
          notes: ['B4', 'D5', 'F5', 'A5'],
          octaveRange: [4, 5],
          description: 'Root position B Half-Diminished 7th.',
        },
      },
    ],
    description: 'B Half-Diminished 7th chord. Diminished triad + Minor 7th.',
    tags: ['B', 'half-diminished', 'seventh'],
  },
  {
    id: 'd-half-diminished-7th',
    name: 'D Half-Diminished 7th',
    shortName: 'Dm7b5',
    root: 'D',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5', 'm7'],
      construction: 'Diminished triad + Minor 7th',
      commonProgressions: ['viiø7-III', 'iiø7-V7-i'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, -1, 0, 1, 1, 1],
          fingers: ['muted', 'muted', 'open', '1', '1', '1'],
          muted: [1, 2],
          barred: false,
          description: 'Open position D Half-Diminished 7th chord.',
        },
        piano: {
          notes: ['D4', 'F4', 'Ab4', 'C5'],
          octaveRange: [4, 5],
          description: 'Root position D Half-Diminished 7th.',
        },
      },
    ],
    description: 'D Half-Diminished 7th chord. Diminished triad + Minor 7th.',
    tags: ['D', 'half-diminished', 'seventh'],
  },
  {
    id: 'g-half-diminished-7th',
    name: 'G Half-Diminished 7th',
    shortName: 'Gm7b5',
    root: 'G',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5', 'm7'],
      construction: 'Diminished triad + Minor 7th',
      commonProgressions: ['viiø7-III', 'iiø7-V7-i'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [3, -1, 3, 3, 2, -1],
          fingers: ['3', 'muted', '3', '3', '2', 'muted'],
          muted: [2, 6],
          barred: false,
          description: 'G Half-Diminished 7th voicing at position 2.',
        },
        piano: {
          notes: ['G4', 'Bb4', 'Db5', 'F5'],
          octaveRange: [4, 5],
          description: 'Root position G Half-Diminished 7th.',
        },
      },
    ],
    description: 'G Half-Diminished 7th chord. Diminished triad + Minor 7th.',
    tags: ['G', 'half-diminished', 'seventh'],
  },
  {
    id: 'c-half-diminished-7th',
    name: 'C Half-Diminished 7th',
    shortName: 'Cm7b5',
    root: 'C',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5', 'm7'],
      construction: 'Diminished triad + Minor 7th',
      commonProgressions: ['viiø7-III', 'iiø7-V7-i'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 3, 4, 3, 4, -1],
          fingers: ['muted', '3', '4', '3', '4', 'muted'],
          muted: [1, 6],
          barred: true,
          description: 'Barre chord at fret 3. C Half-Diminished 7th.',
        },
        piano: {
          notes: ['C4', 'Eb4', 'Gb4', 'Bb4'],
          octaveRange: [4, 4],
          description: 'Root position C Half-Diminished 7th.',
        },
      },
    ],
    description: 'C Half-Diminished 7th chord. Diminished triad + Minor 7th.',
    tags: ['C', 'half-diminished', 'seventh'],
  },
  {
    id: 'f-half-diminished-7th',
    name: 'F Half-Diminished 7th',
    shortName: 'Fm7b5',
    root: 'F',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5', 'm7'],
      construction: 'Diminished triad + Minor 7th',
      commonProgressions: ['viiø7-III', 'iiø7-V7-i'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [1, -1, 1, 1, 0, -1],
          fingers: ['1', 'muted', '1', '1', 'open', 'muted'],
          muted: [2, 6],
          barred: false,
          description: 'Open position F Half-Diminished 7th chord.',
        },
        piano: {
          notes: ['F4', 'Ab4', 'Cb5', 'Eb5'],
          octaveRange: [4, 5],
          description: 'Root position F Half-Diminished 7th.',
        },
      },
    ],
    description: 'F Half-Diminished 7th chord. Diminished triad + Minor 7th.',
    tags: ['F', 'half-diminished', 'seventh'],
  },
  {
    id: 'bb-half-diminished-7th',
    name: 'Bb Half-Diminished 7th',
    shortName: 'Bbm7b5',
    root: 'Bb',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5', 'm7'],
      construction: 'Diminished triad + Minor 7th',
      commonProgressions: ['viiø7-III', 'iiø7-V7-i'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 1, 2, 1, 2, -1],
          fingers: ['muted', '1', '2', '1', '2', 'muted'],
          muted: [1, 6],
          barred: true,
          description: 'Barre chord at fret 1. Bb Half-Diminished 7th.',
        },
        piano: {
          notes: ['Bb4', 'Db5', 'Fb5', 'Ab5'],
          octaveRange: [4, 5],
          description: 'Root position Bb Half-Diminished 7th.',
        },
      },
    ],
    description: 'Bb Half-Diminished 7th chord. Diminished triad + Minor 7th.',
    tags: ['Bb', 'half-diminished', 'seventh', 'accidental'],
  },
  {
    id: 'eb-half-diminished-7th',
    name: 'Eb Half-Diminished 7th',
    shortName: 'Ebm7b5',
    root: 'Eb',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5', 'm7'],
      construction: 'Diminished triad + Minor 7th',
      commonProgressions: ['viiø7-III', 'iiø7-V7-i'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, -1, 1, 2, 2, 2],
          fingers: ['muted', 'muted', '1', '2', '2', '2'],
          muted: [1, 2],
          barred: false,
          description: 'Eb Half-Diminished 7th voicing at position 1.',
        },
        piano: {
          notes: ['Eb4', 'Gb4', 'Bbb4', 'Db5'],
          octaveRange: [4, 5],
          description: 'Root position Eb Half-Diminished 7th.',
        },
      },
    ],
    description: 'Eb Half-Diminished 7th chord. Diminished triad + Minor 7th.',
    tags: ['Eb', 'half-diminished', 'seventh', 'accidental'],
  },
  {
    id: 'f-half-diminished-7th',
    name: 'F# Half-Diminished 7th',
    shortName: 'F#m7b5',
    root: 'F#',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5', 'm7'],
      construction: 'Diminished triad + Minor 7th',
      commonProgressions: ['viiø7-III', 'iiø7-V7-i'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [2, -1, 2, 2, 1, -1],
          fingers: ['2', 'muted', '2', '2', '1', 'muted'],
          muted: [2, 6],
          barred: false,
          description: 'F# Half-Diminished 7th voicing at position 1.',
        },
        piano: {
          notes: ['F#4', 'A4', 'C5', 'E5'],
          octaveRange: [4, 5],
          description: 'Root position F# Half-Diminished 7th.',
        },
      },
    ],
    description: 'F# Half-Diminished 7th chord. Diminished triad + Minor 7th.',
    tags: ['F#', 'half-diminished', 'seventh', 'accidental'],
  },
  {
    id: 'c-half-diminished-7th',
    name: 'C# Half-Diminished 7th',
    shortName: 'C#m7b5',
    root: 'C#',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5', 'm7'],
      construction: 'Diminished triad + Minor 7th',
      commonProgressions: ['viiø7-III', 'iiø7-V7-i'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 4, 5, 4, 5, -1],
          fingers: ['muted', '4', '5', '4', '5', 'muted'],
          muted: [1, 6],
          barred: true,
          description: 'Barre chord at fret 4. C# Half-Diminished 7th.',
        },
        piano: {
          notes: ['C#4', 'E4', 'G4', 'B4'],
          octaveRange: [4, 4],
          description: 'Root position C# Half-Diminished 7th.',
        },
      },
    ],
    description: 'C# Half-Diminished 7th chord. Diminished triad + Minor 7th.',
    tags: ['C#', 'half-diminished', 'seventh', 'accidental'],
  },
  {
    id: 'g-half-diminished-7th',
    name: 'G# Half-Diminished 7th',
    shortName: 'G#m7b5',
    root: 'G#',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5', 'm7'],
      construction: 'Diminished triad + Minor 7th',
      commonProgressions: ['viiø7-III', 'iiø7-V7-i'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [4, -1, 4, 4, 3, -1],
          fingers: ['4', 'muted', '4', '4', '3', 'muted'],
          muted: [2, 6],
          barred: false,
          description: 'G# Half-Diminished 7th voicing at position 3.',
        },
        piano: {
          notes: ['G#4', 'B4', 'D5', 'F#5'],
          octaveRange: [4, 5],
          description: 'Root position G# Half-Diminished 7th.',
        },
      },
    ],
    description: 'G# Half-Diminished 7th chord. Diminished triad + Minor 7th.',
    tags: ['G#', 'half-diminished', 'seventh', 'accidental'],
  },
  {
    id: 'a-half-diminished-7th',
    name: 'A# Half-Diminished 7th',
    shortName: 'A#m7b5',
    root: 'A#',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5', 'm7'],
      construction: 'Diminished triad + Minor 7th',
      commonProgressions: ['viiø7-III', 'iiø7-V7-i'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 1, 2, 1, 2, -1],
          fingers: ['muted', '1', '2', '1', '2', 'muted'],
          muted: [1, 6],
          barred: true,
          description: 'Barre chord at fret 1. A# Half-Diminished 7th.',
        },
        piano: {
          notes: ['A#4', 'C#5', 'E5', 'G#5'],
          octaveRange: [4, 5],
          description: 'Root position A# Half-Diminished 7th.',
        },
      },
    ],
    description: 'A# Half-Diminished 7th chord. Diminished triad + Minor 7th.',
    tags: ['A#', 'half-diminished', 'seventh', 'accidental'],
  },
  {
    id: 'd-half-diminished-7th',
    name: 'D# Half-Diminished 7th',
    shortName: 'D#m7b5',
    root: 'D#',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5', 'm7'],
      construction: 'Diminished triad + Minor 7th',
      commonProgressions: ['viiø7-III', 'iiø7-V7-i'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, -1, 1, 2, 2, 2],
          fingers: ['muted', 'muted', '1', '2', '2', '2'],
          muted: [1, 2],
          barred: false,
          description: 'D# Half-Diminished 7th voicing at position 1.',
        },
        piano: {
          notes: ['D#4', 'F#4', 'A4', 'C#5'],
          octaveRange: [4, 5],
          description: 'Root position D# Half-Diminished 7th.',
        },
      },
    ],
    description: 'D# Half-Diminished 7th chord. Diminished triad + Minor 7th.',
    tags: ['D#', 'half-diminished', 'seventh', 'accidental'],
  },
  {
    id: 'e-half-diminished-7th',
    name: 'E# Half-Diminished 7th',
    shortName: 'E#m7b5',
    root: 'E#',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5', 'm7'],
      construction: 'Diminished triad + Minor 7th',
      commonProgressions: ['viiø7-III', 'iiø7-V7-i'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [1, -1, 1, 1, 0, -1],
          fingers: ['1', 'muted', '1', '1', 'open', 'muted'],
          muted: [2, 6],
          barred: false,
          description: 'Open position E# Half-Diminished 7th chord.',
        },
        piano: {
          notes: ['E#4', 'G#4', 'B4', 'D#5'],
          octaveRange: [4, 5],
          description: 'Root position E# Half-Diminished 7th.',
        },
      },
    ],
    description: 'E# Half-Diminished 7th chord. Diminished triad + Minor 7th.',
    tags: ['E#', 'half-diminished', 'seventh', 'accidental'],
  },
  {
    id: 'b-half-diminished-7th',
    name: 'B# Half-Diminished 7th',
    shortName: 'B#m7b5',
    root: 'B#',
    type: 'diminished',
    difficulty: 'jazz',
    theory: {
      intervals: ['R', 'm3', 'dim5', 'm7'],
      construction: 'Diminished triad + Minor 7th',
      commonProgressions: ['viiø7-III', 'iiø7-V7-i'],
    },
    voicings: [
      {
        voicingName: 'Standard Position',
        position: 1,
      guitar: {
          frets: [-1, 3, 4, 3, 4, -1],
          fingers: ['muted', '3', '4', '3', '4', 'muted'],
          muted: [1, 6],
          barred: true,
          description: 'Barre chord at fret 3. B# Half-Diminished 7th.',
        },
        piano: {
          notes: ['B#4', 'D#5', 'F#5', 'A#5'],
          octaveRange: [4, 5],
          description: 'Root position B# Half-Diminished 7th.',
        },
      },
    ],
    description: 'B# Half-Diminished 7th chord. Diminished triad + Minor 7th.',
    tags: ['B#', 'half-diminished', 'seventh', 'accidental'],
  },

];


// Add backward compatibility fingerings from first voicing
CHORD_LIBRARY.forEach(chord => {
  const firstVoicing = chord.voicings[0];
  if (firstVoicing && firstVoicing.guitar) {
    chord.fingerings = {
      guitar: [
        { string: 1, fret: firstVoicing.guitar.frets[0] },
        { string: 2, fret: firstVoicing.guitar.frets[1] },
        { string: 3, fret: firstVoicing.guitar.frets[2] },
        { string: 4, fret: firstVoicing.guitar.frets[3] },
        { string: 5, fret: firstVoicing.guitar.frets[4] },
        { string: 6, fret: firstVoicing.guitar.frets[5] },
      ],
      piano: firstVoicing.piano?.notes,
    };
  }
});

export default CHORD_LIBRARY;
