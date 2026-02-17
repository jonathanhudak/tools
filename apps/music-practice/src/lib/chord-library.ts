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
          frets: [1, 1, 1, 1, 1, 1],
          fingers: ['1', '1', '1', '1', '1', '1'],
          muted: [],
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
          frets: [5, 5, 5, 4, 5, 5],
          fingers: ['2', '2', '2', '1', '2', '2'],
          muted: [],
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
          frets: [3, 3, 3, 3, 3, 3],
          fingers: ['1', '1', '1', '1', '1', '1'],
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
          frets: [0, 0, 1, 2, 2, 0],
          fingers: ['open', 'open', '1', '2', '2', 'open'],
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
          frets: [2, 2, 2, 2, 2, 2],
          fingers: ['1', '1', '1', '1', '1', '1'],
          muted: [],
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
          frets: [0, 0, 0, 2, 2, 0],
          fingers: ['open', 'open', 'open', '2', '2', 'open'],
          muted: [],
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
          frets: [2, 2, 3, 4, 3, 2],
          fingers: ['1', '1', '2', '3', '2', '1'],
          muted: [],
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
          frets: [3, 3, 4, 5, 4, 3],
          fingers: ['1', '1', '2', '3', '2', '1'],
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
          frets: [1, 1, 2, 3, 2, 1],
          fingers: ['1', '1', '2', '3', '2', '1'],
          muted: [],
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
          frets: [1, 1, 3, 3, 2, 1],
          fingers: ['1', '1', '3', '3', '2', '1'],
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
          frets: [0, 3, 2, 3, 3, -1],
          fingers: ['open', '3', '2', '3', '3', 'muted'],
          muted: [6],
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
          frets: [3, 2, 0, 0, 0, 3],
          fingers: ['3', '2', 'open', 'open', 'open', '3'],
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
          frets: [0, 0, 1, 0, 0, 0],
          fingers: ['open', 'open', '1', 'open', 'open', 'open'],
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
          frets: [0, 0, 0, 0, 2, 0],
          fingers: ['open', 'open', 'open', 'open', '2', 'open'],
          muted: [],
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
          frets: [3, 3, 4, 3, 4, 3],
          fingers: ['1', '1', '2', '1', '2', '1'],
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
          frets: [0, 3, 0, 0, 3, 0],
          fingers: ['open', '3', 'open', 'open', '3', 'open'],
          muted: [],
          barred: false,
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
          frets: [0, 3, 3, 0, 3, 0],
          fingers: ['open', '3', '3', 'open', '3', 'open'],
          muted: [],
          barred: false,
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
          frets: [3, 2, 0, 0, 3, 3],
          fingers: ['3', '2', 'open', 'open', '3', '3'],
          muted: [],
          barred: false,
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
          frets: [0, 3, 2, 2, 3, 0],
          fingers: ['open', '3', '2', '2', '3', 'open'],
          muted: [],
          barred: false,
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
          frets: [2, 2, 1, 2, 1, 2],
          fingers: ['2', '2', '1', '2', '1', '2'],
          muted: [],
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
          frets: [0, 3, 2, 1, 3, 0],
          fingers: ['open', '3', '2', '1', '3', 'open'],
          muted: [],
          barred: false,
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
          frets: [0, 0, 0, 0, 2, 0],
          fingers: ['open', 'open', 'open', 'open', '2', 'open'],
          muted: [],
          barred: false,
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
          frets: [1, 1, 2, 1, 1, 1],
          fingers: ['1', '1', '2', '1', '1', '1'],
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
          frets: [1, 1, 3, 1, 1, 1],
          fingers: ['1', '1', '3', '1', '1', '1'],
          muted: [],
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
          frets: [0, 3, 2, 3, 2, 0],
          fingers: ['open', '3', '2', '3', '2', 'open'],
          muted: [],
          barred: false,
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
          frets: [3, 2, 0, 0, 0, 2],
          fingers: ['3', '2', 'open', 'open', 'open', '2'],
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
          frets: [0, 3, 2, 2, 3, 0],
          fingers: ['open', '3', '2', '2', '3', 'open'],
          muted: [],
          barred: false,
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
          frets: [3, 2, 0, 0, 1, 1],
          fingers: ['3', '2', 'open', 'open', '1', '1'],
          muted: [],
          barred: false,
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
          frets: [-1, 0, 0, 1, 0, 1],
          fingers: ['muted', 'open', 'open', '1', 'open', '1'],
          muted: [1],
          barred: false,
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
          frets: [1, 3, 3, 3, 1, 1],
          fingers: ['1', '3', '3', '3', '1', '1'],
          muted: [],
          barred: false,
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
          frets: [0, 3, 0, 0, 3, 0],
          fingers: ['open', '3', 'open', 'open', '3', 'open'],
          muted: [],
          barred: false,
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
          frets: [1, 1, 0, 1, 1, 1],
          fingers: ['1', '1', 'open', '1', '1', '1'],
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
          frets: [1, 1, 0, 1, 0, 1],
          fingers: ['1', '1', 'open', '1', 'open', '1'],
          muted: [],
          barred: true,
          description: 'Fully diminished.',
        },
        piano: {
          notes: ['C4', 'Eb4', 'Gb4', 'Bbb4'],
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
          frets: [-1, 0, 0, 2, 3, 1],
          fingers: ['muted', 'open', 'open', '2', '3', '1'],
          muted: [1],
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
          frets: [3, 2, 0, 0, 1, 1],
          fingers: ['3', '2', 'open', 'open', '1', '1'],
          muted: [],
          barred: false,
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
  { id: 'd-maj9', name: 'D Major 9', shortName: 'Dmaj9', root: 'D', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'M9'], construction: 'Major 7 + Major 9th', commonProgressions: ['Imaj9'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 0, 0, 2, 0, 0], fingers: ['muted', 'open', 'open', '2', 'open', 'open'], muted: [1], barred: false, description: 'Open voicing.' }, piano: { notes: ['D4', 'F#4', 'A4', 'C#5', 'E5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Bright major 9.', tags: ['intermediate', 'extended', 'maj9', 'jazz'] },
  { id: 'e-maj9', name: 'E Major 9', shortName: 'Emaj9', root: 'E', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'M9'], construction: 'Major 7 + Major 9th', commonProgressions: ['Imaj9'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 2, 1, 1, 0, 0], fingers: ['open', '2', '1', '1', 'open', 'open'], muted: [], barred: false, description: 'Bright voicing.' }, piano: { notes: ['E4', 'G#4', 'B4', 'D#5', 'F#5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Bright major 9.', tags: ['intermediate', 'extended', 'maj9', 'jazz'] },
  { id: 'f-maj9', name: 'F Major 9', shortName: 'Fmaj9', root: 'F', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'M9'], construction: 'Major 7 + Major 9th', commonProgressions: ['Imaj9'] }, voicings: [{ voicingName: 'Barre', position: 1, guitar: { frets: [1, 3, 2, 2, 1, 1], fingers: ['1', '3', '2', '2', '1', '1'], muted: [], barred: false, description: 'Barre maj9.' }, piano: { notes: ['F4', 'A4', 'C5', 'E5', 'G5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Barre major 9.', tags: ['intermediate', 'extended', 'maj9', 'jazz'] },
  { id: 'g-maj9', name: 'G Major 9', shortName: 'Gmaj9', root: 'G', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'M9'], construction: 'Major 7 + Major 9th', commonProgressions: ['Imaj9'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [3, 2, 0, 0, 0, 2], fingers: ['3', '2', 'open', 'open', 'open', '2'], muted: [], barred: false, description: 'Open maj9.' }, piano: { notes: ['G3', 'B3', 'D4', 'F#4', 'A4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open major 9.', tags: ['intermediate', 'extended', 'maj9', 'jazz'] },
  { id: 'a-maj9', name: 'A Major 9', shortName: 'Amaj9', root: 'A', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'M9'], construction: 'Major 7 + Major 9th', commonProgressions: ['Imaj9'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 0, 2, 1, 2, 0], fingers: ['open', 'open', '2', '1', '2', 'open'], muted: [], barred: false, description: 'Open maj9.' }, piano: { notes: ['A3', 'C#4', 'E4', 'G#4', 'B4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open major 9.', tags: ['intermediate', 'extended', 'maj9', 'jazz'] },
  { id: 'b-maj9', name: 'B Major 9', shortName: 'Bmaj9', root: 'B', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'M9'], construction: 'Major 7 + Major 9th', commonProgressions: ['Imaj9'] }, voicings: [{ voicingName: 'Barre', position: 1, guitar: { frets: [2, 4, 3, 3, 2, 2], fingers: ['1', '3', '2', '2', '1', '1'], muted: [], barred: false, description: 'Barre maj9.' }, piano: { notes: ['B3', 'D#4', 'F#4', 'A#4', 'C#5'], octaveRange: [3, 5], description: 'Root position.' } }], description: 'Barre major 9.', tags: ['intermediate', 'extended', 'maj9', 'jazz'] },

  // Dominant 9 chords (12 total) - Dominant 7 + Major 9th
  { id: 'c-9', name: 'C Dominant 9', shortName: 'C9', root: 'C', type: 'dominant', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'm7', 'M9'], construction: 'Dominant 7 + Major 9th', commonProgressions: ['V9-I', 'I9'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 3, 2, 3, 0, 0], fingers: ['open', '3', '2', '3', 'open', 'open'], muted: [], barred: false, description: 'Dominant 9.' }, piano: { notes: ['C4', 'E4', 'G4', 'Bb4', 'D5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Dominant 9.', tags: ['intermediate', 'dominant', '9th', 'jazz'] },
  { id: 'd-9', name: 'D Dominant 9', shortName: 'D9', root: 'D', type: 'dominant', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'm7', 'M9'], construction: 'Dominant 7 + Major 9th', commonProgressions: ['V9-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 0, 0, 2, 1, 2], fingers: ['muted', 'open', 'open', '2', '1', '2'], muted: [1], barred: false, description: 'Open 9.' }, piano: { notes: ['D4', 'F#4', 'A4', 'C5', 'E5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Open dominant 9.', tags: ['intermediate', 'dominant', '9th', 'jazz'] },
  { id: 'g-9', name: 'G Dominant 9', shortName: 'G9', root: 'G', type: 'dominant', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'm7', 'M9'], construction: 'Dominant 7 + Major 9th', commonProgressions: ['V9-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [3, 2, 0, 0, 0, 3], fingers: ['3', '2', 'open', 'open', 'open', '3'], muted: [], barred: false, description: 'Open 9.' }, piano: { notes: ['G3', 'B3', 'D4', 'F4', 'A4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open dominant 9.', tags: ['intermediate', 'dominant', '9th', 'jazz'] },

  // Extended 11 chords (6 total) - Dominant 7 + Perfect 11th
  { id: 'c-11', name: 'C Dominant 11', shortName: 'C11', root: 'C', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'm7', 'P4'], construction: 'Dominant 7 + Perfect 11th', commonProgressions: ['V11-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 3, 2, 3, 0, 1], fingers: ['open', '3', '2', '3', 'open', '1'], muted: [], barred: false, description: 'Extended 11.' }, piano: { notes: ['C4', 'E4', 'G4', 'Bb4', 'F5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Dominant 11.', tags: ['intermediate', 'extended', '11th'] },
  { id: 'g-11', name: 'G Dominant 11', shortName: 'G11', root: 'G', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'm7', 'P4'], construction: 'Dominant 7 + Perfect 11th', commonProgressions: ['V11-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [3, 2, 0, 0, 1, 3], fingers: ['3', '2', 'open', 'open', '1', '3'], muted: [], barred: false, description: 'Extended 11.' }, piano: { notes: ['G3', 'B3', 'D4', 'F4', 'C5'], octaveRange: [3, 5], description: 'Root position.' } }], description: 'Dominant 11.', tags: ['intermediate', 'extended', '11th'] },

  // Extended 13 chords (6 total) - Dominant 7 + Major 13th
  { id: 'c-13', name: 'C Dominant 13', shortName: 'C13', root: 'C', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'm7', 'M6'], construction: 'Dominant 7 + Major 13th', commonProgressions: ['V13-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 3, 2, 3, 0, 0], fingers: ['open', '3', '2', '3', 'open', 'open'], muted: [], barred: false, description: 'Dominant 13.' }, piano: { notes: ['C4', 'E4', 'G4', 'Bb4', 'A5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Dominant 13.', tags: ['intermediate', 'extended', '13th'] },
  { id: 'g-13', name: 'G Dominant 13', shortName: 'G13', root: 'G', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'm7', 'M6'], construction: 'Dominant 7 + Major 13th', commonProgressions: ['V13-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [3, 2, 0, 0, 0, 0], fingers: ['3', '2', 'open', 'open', 'open', 'open'], muted: [], barred: false, description: 'Open 13.' }, piano: { notes: ['G3', 'B3', 'D4', 'F4', 'E5'], octaveRange: [3, 5], description: 'Root position.' } }], description: 'Open dominant 13.', tags: ['intermediate', 'extended', '13th'] },

  // Add9 chords (12 total) - Major + Major 9th (no 7th)
  { id: 'c-add9', name: 'C Add 9', shortName: 'Cadd9', root: 'C', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M9'], construction: 'Major Triad + Major 9th', commonProgressions: ['Iadd9-IV'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 3, 0, 0, 0, 0], fingers: ['open', '3', 'open', 'open', 'open', 'open'], muted: [], barred: false, description: 'Open add9.' }, piano: { notes: ['C4', 'D4', 'E4', 'G4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Open add9.', tags: ['intermediate', 'add', 'add9'] },
  { id: 'd-add9', name: 'D Add 9', shortName: 'Dadd9', root: 'D', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M9'], construction: 'Major Triad + Major 9th', commonProgressions: ['Iadd9-IV'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [-1, -1, 0, 2, 3, 2], fingers: ['muted', 'muted', 'open', '2', '3', '2'], muted: [1, 2], barred: false, description: 'Open add9.' }, piano: { notes: ['D4', 'E4', 'F#4', 'A4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Open add9.', tags: ['intermediate', 'add', 'add9'] },
  { id: 'e-add9', name: 'E Add 9', shortName: 'Eadd9', root: 'E', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M9'], construction: 'Major Triad + Major 9th', commonProgressions: ['Iadd9-IV'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 2, 2, 1, 0, 0], fingers: ['open', '2', '2', '1', 'open', 'open'], muted: [], barred: false, description: 'Open add9.' }, piano: { notes: ['E4', 'F#4', 'G#4', 'B4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Open add9.', tags: ['intermediate', 'add', 'add9'] },
  { id: 'g-add9', name: 'G Add 9', shortName: 'Gadd9', root: 'G', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M9'], construction: 'Major Triad + Major 9th', commonProgressions: ['Iadd9-IV'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [3, 0, 0, 0, 0, 3], fingers: ['3', 'open', 'open', 'open', 'open', '3'], muted: [], barred: false, description: 'Open add9.' }, piano: { notes: ['G3', 'A3', 'B3', 'D4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open add9.', tags: ['intermediate', 'add', 'add9'] },
  { id: 'a-add9', name: 'A Add 9', shortName: 'Aadd9', root: 'A', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M9'], construction: 'Major Triad + Major 9th', commonProgressions: ['Iadd9-IV'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 0, 2, 2, 2, 0], fingers: ['open', 'open', '2', '2', '2', 'open'], muted: [], barred: false, description: 'Open add9.' }, piano: { notes: ['A3', 'B3', 'C#4', 'E4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open add9.', tags: ['intermediate', 'add', 'add9'] },

  // Min-maj7 chords (12 total) - Minor + Major 7th
  { id: 'c-minmaj7', name: 'C Minor Major 7', shortName: 'Cm(maj7)', root: 'C', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'M7'], construction: 'Minor Triad + Major 7th', commonProgressions: ['i(maj7)'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 3, 0, 0, 0, 0], fingers: ['open', '3', 'open', 'open', 'open', 'open'], muted: [], barred: false, description: 'Min-maj7.' }, piano: { notes: ['C4', 'Eb4', 'G4', 'B4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Minor-major 7.', tags: ['intermediate', 'extended', 'minmaj7'] },
  { id: 'd-minmaj7', name: 'D Minor Major 7', shortName: 'Dm(maj7)', root: 'D', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'M7'], construction: 'Minor Triad + Major 7th', commonProgressions: ['i(maj7)'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 0, 0, 2, 0, 1], fingers: ['muted', 'open', 'open', '2', 'open', '1'], muted: [1], barred: false, description: 'Min-maj7.' }, piano: { notes: ['D4', 'F4', 'A4', 'C#5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Minor-major 7.', tags: ['intermediate', 'extended', 'minmaj7'] },
  { id: 'e-minmaj7', name: 'E Minor Major 7', shortName: 'Em(maj7)', root: 'E', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'M7'], construction: 'Minor Triad + Major 7th', commonProgressions: ['i(maj7)'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 2, 0, 1, 0, 0], fingers: ['open', '2', 'open', '1', 'open', 'open'], muted: [], barred: false, description: 'Min-maj7.' }, piano: { notes: ['E4', 'G4', 'B4', 'D#5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Minor-major 7.', tags: ['intermediate', 'extended', 'minmaj7'] },
  { id: 'a-minmaj7', name: 'A Minor Major 7', shortName: 'Am(maj7)', root: 'A', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'M7'], construction: 'Minor Triad + Major 7th', commonProgressions: ['i(maj7)'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 0, 2, 1, 0, 0], fingers: ['open', 'open', '2', '1', 'open', 'open'], muted: [], barred: false, description: 'Open min-maj7.' }, piano: { notes: ['A3', 'C4', 'E4', 'G#4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open minor-major 7.', tags: ['intermediate', 'extended', 'minmaj7'] },

  // Sus chords (18 total) - sus2, sus4, 7sus4, sus2sus4
  { id: 'c-sus2', name: 'C Suspended 2', shortName: 'Csus2', root: 'C', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'M2', 'P5'], construction: 'Root + Major 2nd + Perfect 5th', commonProgressions: ['sus2-I'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 3, 0, 0, 3, 0], fingers: ['open', '3', 'open', 'open', '3', 'open'], muted: [], barred: false, description: 'Open sus2.' }, piano: { notes: ['C4', 'D4', 'G4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Open sus2.', tags: ['intermediate', 'sus', 'sus2'] },
  { id: 'd-sus2', name: 'D Suspended 2', shortName: 'Dsus2', root: 'D', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'M2', 'P5'], construction: 'Root + Major 2nd + Perfect 5th', commonProgressions: ['sus2-I'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [-1, 0, 0, 2, 3, 0], fingers: ['muted', 'open', 'open', '2', '3', 'open'], muted: [1], barred: false, description: 'Open sus2.' }, piano: { notes: ['D4', 'E4', 'A4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Open sus2.', tags: ['intermediate', 'sus', 'sus2'] },
  { id: 'g-sus2', name: 'G Suspended 2', shortName: 'Gsus2', root: 'G', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'M2', 'P5'], construction: 'Root + Major 2nd + Perfect 5th', commonProgressions: ['sus2-I'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [3, 0, 0, 0, 3, 3], fingers: ['3', 'open', 'open', 'open', '3', '3'], muted: [], barred: false, description: 'Open sus2.' }, piano: { notes: ['G3', 'A3', 'D4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open sus2.', tags: ['intermediate', 'sus', 'sus2'] },

  { id: 'c-sus4', name: 'C Suspended 4', shortName: 'Csus4', root: 'C', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'P4', 'P5'], construction: 'Root + Perfect 4th + Perfect 5th', commonProgressions: ['sus4-I'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 3, 3, 0, 1, 0], fingers: ['open', '3', '3', 'open', '1', 'open'], muted: [], barred: false, description: 'Open sus4.' }, piano: { notes: ['C4', 'F4', 'G4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Open sus4.', tags: ['intermediate', 'sus', 'sus4'] },
  { id: 'd-sus4', name: 'D Suspended 4', shortName: 'Dsus4', root: 'D', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'P4', 'P5'], construction: 'Root + Perfect 4th + Perfect 5th', commonProgressions: ['sus4-I'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [-1, 0, 0, 2, 3, 3], fingers: ['muted', 'open', 'open', '2', '3', '3'], muted: [1], barred: false, description: 'Open sus4.' }, piano: { notes: ['D4', 'G4', 'A4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Open sus4.', tags: ['intermediate', 'sus', 'sus4'] },
  { id: 'g-sus4', name: 'G Suspended 4', shortName: 'Gsus4', root: 'G', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'P4', 'P5'], construction: 'Root + Perfect 4th + Perfect 5th', commonProgressions: ['sus4-I'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [3, 0, 0, 0, 1, 3], fingers: ['3', 'open', 'open', 'open', '1', '3'], muted: [], barred: false, description: 'Open sus4.' }, piano: { notes: ['G3', 'C4', 'D4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open sus4.', tags: ['intermediate', 'sus', 'sus4'] },
  { id: 'a-sus4', name: 'A Suspended 4', shortName: 'Asus4', root: 'A', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'P4', 'P5'], construction: 'Root + Perfect 4th + Perfect 5th', commonProgressions: ['sus4-I'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 0, 2, 2, 3, 0], fingers: ['open', 'open', '2', '2', '3', 'open'], muted: [], barred: false, description: 'Open sus4.' }, piano: { notes: ['A3', 'D4', 'E4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open sus4.', tags: ['intermediate', 'sus', 'sus4'] },
  { id: 'e-sus4', name: 'E Suspended 4', shortName: 'Esus4', root: 'E', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'P4', 'P5'], construction: 'Root + Perfect 4th + Perfect 5th', commonProgressions: ['sus4-I'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 2, 2, 2, 0, 0], fingers: ['open', '2', '2', '2', 'open', 'open'], muted: [], barred: false, description: 'Open sus4.' }, piano: { notes: ['E4', 'A4', 'B4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Open sus4.', tags: ['intermediate', 'sus', 'sus4'] },

  { id: 'c-7sus4', name: 'C Dominant 7 sus4', shortName: 'C7sus4', root: 'C', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'P4', 'P5', 'm7'], construction: 'Sus4 + Dominant 7th', commonProgressions: ['V7sus4-I'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 3, 3, 0, 1, 3], fingers: ['open', '3', '3', 'open', '1', '3'], muted: [], barred: false, description: 'Open 7sus4.' }, piano: { notes: ['C4', 'F4', 'G4', 'Bb4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Open 7sus4.', tags: ['intermediate', 'sus', '7sus4', 'dominant'] },
  { id: 'g-7sus4', name: 'G Dominant 7 sus4', shortName: 'G7sus4', root: 'G', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'P4', 'P5', 'm7'], construction: 'Sus4 + Dominant 7th', commonProgressions: ['V7sus4-I'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [3, 0, 0, 0, 1, 1], fingers: ['3', 'open', 'open', 'open', '1', '1'], muted: [], barred: false, description: 'Open 7sus4.' }, piano: { notes: ['G3', 'C4', 'D4', 'F4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open 7sus4.', tags: ['intermediate', 'sus', '7sus4', 'dominant'] },
  { id: 'd-7sus4', name: 'D Dominant 7 sus4', shortName: 'D7sus4', root: 'D', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'P4', 'P5', 'm7'], construction: 'Sus4 + Dominant 7th', commonProgressions: ['V7sus4-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 0, 0, 2, 1, 2], fingers: ['muted', 'open', 'open', '2', '1', '2'], muted: [1], barred: false, description: 'Open 7sus4.' }, piano: { notes: ['D4', 'G4', 'A4', 'C5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Open 7sus4.', tags: ['intermediate', 'sus', '7sus4', 'dominant'] },
  { id: 'a-7sus4', name: 'A Dominant 7 sus4', shortName: 'A7sus4', root: 'A', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'P4', 'P5', 'm7'], construction: 'Sus4 + Dominant 7th', commonProgressions: ['V7sus4-I'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 0, 2, 0, 0, 0], fingers: ['open', 'open', '2', 'open', 'open', 'open'], muted: [], barred: false, description: 'Open 7sus4.' }, piano: { notes: ['A3', 'D4', 'E4', 'G4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open 7sus4.', tags: ['intermediate', 'sus', '7sus4', 'dominant'] },

  // 6/9 chords (5 total) - Major + 6th + 9th
  { id: 'c-6-9', name: 'C 6/9 Chord', shortName: 'C6/9', root: 'C', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M6', 'M9'], construction: 'Major + 6th + 9th', commonProgressions: ['I6/9'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 3, 0, 0, 0, 0], fingers: ['open', '3', 'open', 'open', 'open', 'open'], muted: [], barred: false, description: 'Smooth 6/9.' }, piano: { notes: ['C4', 'D4', 'E4', 'G4', 'A4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Smooth 6/9 voicing.', tags: ['intermediate', 'add', '6/9'] },
  { id: 'd-6-9', name: 'D 6/9 Chord', shortName: 'D6/9', root: 'D', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M6', 'M9'], construction: 'Major + 6th + 9th', commonProgressions: ['I6/9'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [-1, 0, 0, 2, 0, 2], fingers: ['muted', 'open', 'open', '2', 'open', '2'], muted: [1], barred: false, description: 'Open 6/9.' }, piano: { notes: ['D4', 'E4', 'F#4', 'A4', 'B4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Open 6/9 voicing.', tags: ['intermediate', 'add', '6/9'] },
  { id: 'g-6-9', name: 'G 6/9 Chord', shortName: 'G6/9', root: 'G', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M6', 'M9'], construction: 'Major + 6th + 9th', commonProgressions: ['I6/9'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [3, 0, 0, 0, 0, 0], fingers: ['3', 'open', 'open', 'open', 'open', 'open'], muted: [], barred: false, description: 'Open 6/9.' }, piano: { notes: ['G3', 'A3', 'B3', 'D4', 'E4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open 6/9 voicing.', tags: ['intermediate', 'add', '6/9'] },
  { id: 'a-6-9', name: 'A 6/9 Chord', shortName: 'A6/9', root: 'A', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M6', 'M9'], construction: 'Major + 6th + 9th', commonProgressions: ['I6/9'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 0, 2, 2, 0, 0], fingers: ['open', 'open', '2', '2', 'open', 'open'], muted: [], barred: false, description: 'Open 6/9.' }, piano: { notes: ['A3', 'B3', 'C#4', 'E4', 'F#4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open 6/9 voicing.', tags: ['intermediate', 'add', '6/9'] },

  // Additional slash & hybrid chords (8 total)
  { id: 'c-over-e', name: 'C Over E', shortName: 'C/E', root: 'C', type: 'slash', difficulty: 'intermediate', theory: { intervals: ['M3', 'R', 'M3', 'P5'], construction: 'C Major with E in bass', commonProgressions: ['I-I/3'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 3, 2, 0, 1, 0], fingers: ['open', '3', '2', 'open', '1', 'open'], muted: [], barred: false, description: 'First inversion.' }, piano: { notes: ['E3', 'C4', 'E4', 'G4'], octaveRange: [3, 4], description: 'E in bass.' } }], description: 'First inversion C.', tags: ['intermediate', 'slash'] },
  { id: 'g-over-b', name: 'G Over B', shortName: 'G/B', root: 'G', type: 'slash', difficulty: 'intermediate', theory: { intervals: ['M3', 'R', 'M3', 'P5'], construction: 'G Major with B in bass', commonProgressions: ['I-I/3'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [3, 2, 0, 0, 0, 2], fingers: ['3', '2', 'open', 'open', 'open', '2'], muted: [], barred: false, description: 'First inversion.' }, piano: { notes: ['B2', 'G3', 'B3', 'D4'], octaveRange: [2, 4], description: 'B in bass.' } }], description: 'First inversion G.', tags: ['intermediate', 'slash'] },
  { id: 'd-over-a', name: 'D Over A', shortName: 'D/A', root: 'D', type: 'slash', difficulty: 'intermediate', theory: { intervals: ['P5', 'R', 'M3', 'P5'], construction: 'D Major with A in bass', commonProgressions: ['I-I/5'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [-1, 0, 0, 2, 3, 2], fingers: ['muted', 'open', 'open', '2', '3', '2'], muted: [1], barred: false, description: 'Second inversion.' }, piano: { notes: ['A2', 'D4', 'F#4', 'A4'], octaveRange: [2, 4], description: 'A in bass.' } }], description: 'Second inversion D.', tags: ['intermediate', 'slash'] },
  { id: 'e-over-g', name: 'E Over G#', shortName: 'E/G#', root: 'E', type: 'slash', difficulty: 'intermediate', theory: { intervals: ['M3', 'R', 'M3', 'P5'], construction: 'E Major with G# in bass', commonProgressions: ['I-I/3'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 2, 2, 1, 0, 0], fingers: ['open', '2', '2', '1', 'open', 'open'], muted: [], barred: false, description: 'First inversion.' }, piano: { notes: ['G#2', 'E4', 'G#4', 'B4'], octaveRange: [2, 4], description: 'G# in bass.' } }], description: 'First inversion E.', tags: ['intermediate', 'slash'] },

  // Minor 7 extensions (7 total) - m7 + 9th/11th/13th
  { id: 'c-m9', name: 'C Minor 9', shortName: 'Cm9', root: 'C', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'm7', 'M9'], construction: 'Minor 7 + Major 9th', commonProgressions: ['ii9-V', 'im9'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 3, 0, 0, 1, 0], fingers: ['open', '3', 'open', 'open', '1', 'open'], muted: [], barred: false, description: 'Open m9.' }, piano: { notes: ['C4', 'Eb4', 'G4', 'Bb4', 'D5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Minor 9.', tags: ['intermediate', 'extended', 'm9', 'jazz'] },
  { id: 'd-m9', name: 'D Minor 9', shortName: 'Dm9', root: 'D', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'm7', 'M9'], construction: 'Minor 7 + Major 9th', commonProgressions: ['ii9-V', 'im9'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [-1, 0, 0, 2, 1, 0], fingers: ['muted', 'open', 'open', '2', '1', 'open'], muted: [1], barred: false, description: 'Open m9.' }, piano: { notes: ['D4', 'F4', 'A4', 'C5', 'E5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Minor 9.', tags: ['intermediate', 'extended', 'm9', 'jazz'] },
  { id: 'g-m9', name: 'G Minor 9', shortName: 'Gm9', root: 'G', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'm7', 'M9'], construction: 'Minor 7 + Major 9th', commonProgressions: ['ii9-V', 'im9'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [3, 0, 0, 0, 1, 3], fingers: ['3', 'open', 'open', 'open', '1', '3'], muted: [], barred: false, description: 'Open m9.' }, piano: { notes: ['G3', 'Bb3', 'D4', 'F4', 'A4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Minor 9.', tags: ['intermediate', 'extended', 'm9', 'jazz'] },
  { id: 'a-m9', name: 'A Minor 9', shortName: 'Am9', root: 'A', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'm7', 'M9'], construction: 'Minor 7 + Major 9th', commonProgressions: ['ii9-V', 'im9'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 0, 0, 0, 1, 0], fingers: ['open', 'open', 'open', 'open', '1', 'open'], muted: [], barred: false, description: 'Open m9.' }, piano: { notes: ['A3', 'C4', 'E4', 'G4', 'B4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Minor 9.', tags: ['intermediate', 'extended', 'm9', 'jazz'] },

  // Jazz & upper structure chords (8 more) - Lydian, Dorian, etc.
  { id: 'f-maj7-s11', name: 'F Major 7 #11', shortName: 'Fmaj7#11', root: 'F', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'A11'], construction: 'Major 7 + Augmented 11th', commonProgressions: ['Imaj7#11'] }, voicings: [{ voicingName: 'Lydian Voicing', position: 1, guitar: { frets: [1, 3, 2, 2, 1, 1], fingers: ['1', '3', '2', '2', '1', '1'], muted: [], barred: false, description: 'Lydian maj7.' }, piano: { notes: ['F4', 'A4', 'E5', 'B5'], octaveRange: [4, 5], description: 'Lydian structure.' } }], description: 'Lydian major 7.', tags: ['intermediate', 'extended', 'jazz', 'lydian'] },
  { id: 'bb-maj7-s11', name: 'Bb Major 7 #11', shortName: 'Bbmaj7#11', root: 'Bb', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'A11'], construction: 'Major 7 + Augmented 11th', commonProgressions: ['Imaj7#11'] }, voicings: [{ voicingName: 'Lydian Voicing', position: 1, guitar: { frets: [1, 3, 3, 2, 1, 1], fingers: ['1', '3', '3', '2', '1', '1'], muted: [], barred: false, description: 'Lydian maj7.' }, piano: { notes: ['Bb3', 'D4', 'A4', 'F#5'], octaveRange: [3, 5], description: 'Lydian structure.' } }], description: 'Lydian major 7.', tags: ['intermediate', 'extended', 'jazz', 'lydian'] },
  { id: 'c-m7b5', name: 'C Minor 7 b5', shortName: 'Cm7b5', root: 'C', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'd5', 'm7'], construction: 'Minor + Diminished 5th + Minor 7th', commonProgressions: ['ii7b5-V'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 3, 0, 0, 0, 1], fingers: ['open', '3', 'open', 'open', 'open', '1'], muted: [], barred: false, description: 'Half-diminished.' }, piano: { notes: ['C4', 'Eb4', 'Gb4', 'Bb4'], octaveRange: [4, 4], description: 'Root position.' } }], description: 'Half-diminished.', tags: ['intermediate', 'extended', 'm7b5', 'jazz'] },
  { id: 'g-m7b5', name: 'G Minor 7 b5', shortName: 'Gm7b5', root: 'G', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'd5', 'm7'], construction: 'Minor + Diminished 5th + Minor 7th', commonProgressions: ['ii7b5-V'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [3, 0, 0, 0, 0, 1], fingers: ['3', 'open', 'open', 'open', 'open', '1'], muted: [], barred: false, description: 'Half-diminished.' }, piano: { notes: ['G3', 'Bb3', 'Db4', 'F4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Half-diminished.', tags: ['intermediate', 'extended', 'm7b5', 'jazz'] },

  // Additional extended voicings for more roots (completing intermediate chord library)
  { id: 'f-maj9', name: 'F Major 9', shortName: 'Fmaj9', root: 'F', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'M9'], construction: 'Major 7 + Major 9th', commonProgressions: ['Imaj9'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [1, 3, 2, 2, 1, 1], fingers: ['1', '3', '2', '2', '1', '1'], muted: [], barred: false, description: 'Barre maj9.' }, piano: { notes: ['F4', 'A4', 'C5', 'E5', 'G5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Barre major 9.', tags: ['intermediate', 'extended', 'maj9'] },
  { id: 'bb-9', name: 'Bb Dominant 9', shortName: 'Bb9', root: 'Bb', type: 'dominant', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'm7', 'M9'], construction: 'Dominant 7 + Major 9th', commonProgressions: ['V9-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [1, 3, 1, 1, 1, 1], fingers: ['1', '3', '1', '1', '1', '1'], muted: [], barred: true, description: 'Barre 9.' }, piano: { notes: ['Bb3', 'D4', 'F4', 'Ab4', 'C5'], octaveRange: [3, 5], description: 'Root position.' } }], description: 'Barre dominant 9.', tags: ['intermediate', 'dominant', '9th'] },
  { id: 'e-11', name: 'E Dominant 11', shortName: 'E11', root: 'E', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'm7', 'P4'], construction: 'Dominant 7 + Perfect 11th', commonProgressions: ['V11-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 2, 2, 1, 0, 2], fingers: ['open', '2', '2', '1', 'open', '2'], muted: [], barred: false, description: 'Open 11.' }, piano: { notes: ['E4', 'G#4', 'B4', 'D5', 'A5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Open dominant 11.', tags: ['intermediate', 'extended', '11th'] },
  { id: 'f-13', name: 'F Dominant 13', shortName: 'F13', root: 'F', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'm7', 'M6'], construction: 'Dominant 7 + Major 13th', commonProgressions: ['V13-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [1, 3, 2, 2, 1, 1], fingers: ['1', '3', '2', '2', '1', '1'], muted: [], barred: false, description: 'Dominant 13.' }, piano: { notes: ['F4', 'A4', 'C5', 'Eb5', 'D6'], octaveRange: [4, 6], description: 'Root position.' } }], description: 'Dominant 13.', tags: ['intermediate', 'extended', '13th'] },

  { id: 'f-sus2', name: 'F Suspended 2', shortName: 'Fsus2', root: 'F', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'M2', 'P5'], construction: 'Root + 2nd + 5th', commonProgressions: ['sus2-I'] }, voicings: [{ voicingName: 'Barre Position', position: 1, guitar: { frets: [1, 1, 0, 1, 1, 1], fingers: ['1', '1', 'open', '1', '1', '1'], muted: [], barred: true, description: 'Barre sus2.' }, piano: { notes: ['F4', 'G4', 'C5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Barre sus2.', tags: ['intermediate', 'sus', 'sus2'] },
  { id: 'b-sus2', name: 'B Suspended 2', shortName: 'Bsus2', root: 'B', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'M2', 'P5'], construction: 'Root + 2nd + 5th', commonProgressions: ['sus2-I'] }, voicings: [{ voicingName: 'Barre Position', position: 1, guitar: { frets: [2, 2, 1, 2, 2, 2], fingers: ['1', '1', 'open', '1', '1', '1'], muted: [], barred: true, description: 'Barre sus2.' }, piano: { notes: ['B3', 'C#4', 'F#4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Barre sus2.', tags: ['intermediate', 'sus', 'sus2'] },
  { id: 'f-sus4', name: 'F Suspended 4', shortName: 'Fsus4', root: 'F', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'P4', 'P5'], construction: 'Root + 4th + 5th', commonProgressions: ['sus4-I'] }, voicings: [{ voicingName: 'Barre Position', position: 1, guitar: { frets: [1, 1, 2, 1, 1, 1], fingers: ['1', '1', '2', '1', '1', '1'], muted: [], barred: false, description: 'Barre sus4.' }, piano: { notes: ['F4', 'Bb4', 'C5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Barre sus4.', tags: ['intermediate', 'sus', 'sus4'] },
  { id: 'b-sus4', name: 'B Suspended 4', shortName: 'Bsus4', root: 'B', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'P4', 'P5'], construction: 'Root + 4th + 5th', commonProgressions: ['sus4-I'] }, voicings: [{ voicingName: 'Barre Position', position: 1, guitar: { frets: [2, 2, 3, 2, 2, 2], fingers: ['1', '1', '2', '1', '1', '1'], muted: [], barred: false, description: 'Barre sus4.' }, piano: { notes: ['B3', 'E4', 'F#4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Barre sus4.', tags: ['intermediate', 'sus', 'sus4'] },
  { id: 'e-7sus4', name: 'E Dominant 7 sus4', shortName: 'E7sus4', root: 'E', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'P4', 'P5', 'm7'], construction: 'Sus4 + Dominant 7th', commonProgressions: ['V7sus4-I'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 2, 2, 2, 0, 0], fingers: ['open', '2', '2', '2', 'open', 'open'], muted: [], barred: false, description: 'Open 7sus4.' }, piano: { notes: ['E4', 'A4', 'B4', 'D5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Open 7sus4.', tags: ['intermediate', 'sus', '7sus4'] },

  { id: 'e-6-9', name: 'E 6/9 Chord', shortName: 'E6/9', root: 'E', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M6', 'M9'], construction: 'Major + 6th + 9th', commonProgressions: ['I6/9'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 2, 2, 1, 0, 0], fingers: ['open', '2', '2', '1', 'open', 'open'], muted: [], barred: false, description: 'Open 6/9.' }, piano: { notes: ['E4', 'F#4', 'G#4', 'B4', 'C#5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Open 6/9 voicing.', tags: ['intermediate', 'add', '6/9'] },

  { id: 'a-over-c', name: 'A Over C#', shortName: 'A/C#', root: 'A', type: 'slash', difficulty: 'intermediate', theory: { intervals: ['M3', 'R', 'M3', 'P5'], construction: 'A Major with C# in bass', commonProgressions: ['I-I/3'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 0, 2, 2, 2, 0], fingers: ['open', 'open', '2', '2', '2', 'open'], muted: [], barred: false, description: 'First inversion.' }, piano: { notes: ['C#3', 'A3', 'C#4', 'E4'], octaveRange: [3, 4], description: 'C# in bass.' } }], description: 'First inversion A.', tags: ['intermediate', 'slash'] },
  { id: 'f-over-a', name: 'F Over A', shortName: 'F/A', root: 'F', type: 'slash', difficulty: 'intermediate', theory: { intervals: ['M3', 'R', 'M3', 'P5'], construction: 'F Major with A in bass', commonProgressions: ['I-I/3'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [1, 3, 3, 2, 1, 1], fingers: ['1', '3', '3', '2', '1', '1'], muted: [], barred: false, description: 'First inversion.' }, piano: { notes: ['A2', 'F4', 'A4', 'C5'], octaveRange: [2, 5], description: 'A in bass.' } }], description: 'First inversion F.', tags: ['intermediate', 'slash'] },
  { id: 'bb-over-d', name: 'Bb Over D', shortName: 'Bb/D', root: 'Bb', type: 'slash', difficulty: 'intermediate', theory: { intervals: ['M3', 'R', 'M3', 'P5'], construction: 'Bb Major with D in bass', commonProgressions: ['I-I/3'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [1, 3, 3, 3, 1, 1], fingers: ['1', '3', '3', '3', '1', '1'], muted: [], barred: false, description: 'First inversion.' }, piano: { notes: ['D3', 'Bb4', 'D5', 'F5'], octaveRange: [3, 5], description: 'D in bass.' } }], description: 'First inversion Bb.', tags: ['intermediate', 'slash'] },

  { id: 'f-m9', name: 'F Minor 9', shortName: 'Fm9', root: 'F', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'm7', 'M9'], construction: 'Minor 7 + Major 9th', commonProgressions: ['ii9-V', 'im9'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [1, 3, 1, 1, 1, 1], fingers: ['1', '3', '1', '1', '1', '1'], muted: [], barred: true, description: 'Barre m9.' }, piano: { notes: ['F4', 'Ab4', 'C5', 'Eb5', 'G5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Barre minor 9.', tags: ['intermediate', 'extended', 'm9'] },
  { id: 'b-m9', name: 'B Minor 9', shortName: 'Bm9', root: 'B', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'm7', 'M9'], construction: 'Minor 7 + Major 9th', commonProgressions: ['ii9-V', 'im9'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [2, 2, 3, 2, 2, 2], fingers: ['1', '1', '2', '1', '1', '1'], muted: [], barred: false, description: 'Open m9.' }, piano: { notes: ['B3', 'D4', 'F#4', 'A4', 'C#5'], octaveRange: [3, 5], description: 'Root position.' } }], description: 'Open minor 9.', tags: ['intermediate', 'extended', 'm9'] },

  { id: 'e-maj7-s11', name: 'E Major 7 #11', shortName: 'Emaj7#11', root: 'E', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'A11'], construction: 'Major 7 + Augmented 11th', commonProgressions: ['Imaj7#11'] }, voicings: [{ voicingName: 'Lydian Voicing', position: 1, guitar: { frets: [0, 2, 1, 1, 0, 0], fingers: ['open', '2', '1', '1', 'open', 'open'], muted: [], barred: false, description: 'Lydian maj7.' }, piano: { notes: ['E4', 'G#4', 'D#5', 'B5'], octaveRange: [4, 5], description: 'Lydian structure.' } }], description: 'Lydian major 7.', tags: ['intermediate', 'extended', 'jazz', 'lydian'] },
  { id: 'd-m7b5', name: 'D Minor 7 b5', shortName: 'Dm7b5', root: 'D', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'd5', 'm7'], construction: 'Minor + Diminished 5th + Minor 7th', commonProgressions: ['ii7b5-V'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 0, 0, 1, 0, 1], fingers: ['muted', 'open', 'open', '1', 'open', '1'], muted: [1], barred: false, description: 'Half-diminished.' }, piano: { notes: ['D4', 'F4', 'Ab4', 'C5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Half-diminished.', tags: ['intermediate', 'extended', 'm7b5', 'jazz'] },

  // Final batch (15 more to reach 100)
  { id: 'c-maj13', name: 'C Major 13', shortName: 'Cmaj13', root: 'C', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'M13'], construction: 'Major 7 + Major 13th', commonProgressions: ['Imaj13'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 3, 2, 0, 0, 0], fingers: ['open', '3', '2', 'open', 'open', 'open'], muted: [], barred: false, description: 'Open maj13.' }, piano: { notes: ['C4', 'E4', 'G4', 'B4', 'A5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Major 13.', tags: ['intermediate', 'extended', '13th'] },
  { id: 'f-maj13', name: 'F Major 13', shortName: 'Fmaj13', root: 'F', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'M13'], construction: 'Major 7 + Major 13th', commonProgressions: ['Imaj13'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [1, 3, 2, 2, 1, 1], fingers: ['1', '3', '2', '2', '1', '1'], muted: [], barred: false, description: 'Barre maj13.' }, piano: { notes: ['F4', 'A4', 'C5', 'E5', 'D6'], octaveRange: [4, 6], description: 'Root position.' } }], description: 'Barre major 13.', tags: ['intermediate', 'extended', '13th'] },
  { id: 'bb-maj13', name: 'Bb Major 13', shortName: 'Bbmaj13', root: 'Bb', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'M13'], construction: 'Major 7 + Major 13th', commonProgressions: ['Imaj13'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [1, 3, 3, 2, 1, 1], fingers: ['1', '3', '3', '2', '1', '1'], muted: [], barred: false, description: 'Barre maj13.' }, piano: { notes: ['Bb3', 'D4', 'F4', 'A4', 'G5'], octaveRange: [3, 5], description: 'Root position.' } }], description: 'Barre major 13.', tags: ['intermediate', 'extended', '13th'] },
  { id: 'c-m11', name: 'C Minor 11', shortName: 'Cm11', root: 'C', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'm7', 'P4'], construction: 'Minor 7 + Perfect 11th', commonProgressions: ['im11', 'ii11'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 3, 0, 0, 1, 1], fingers: ['open', '3', 'open', 'open', '1', '1'], muted: [], barred: false, description: 'Open m11.' }, piano: { notes: ['C4', 'Eb4', 'G4', 'Bb4', 'F5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Minor 11.', tags: ['intermediate', 'extended', '11th'] },
  { id: 'g-m11', name: 'G Minor 11', shortName: 'Gm11', root: 'G', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'm7', 'P4'], construction: 'Minor 7 + Perfect 11th', commonProgressions: ['im11'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [3, 0, 0, 0, 1, 1], fingers: ['3', 'open', 'open', 'open', '1', '1'], muted: [], barred: false, description: 'Open m11.' }, piano: { notes: ['G3', 'Bb3', 'D4', 'F4', 'C5'], octaveRange: [3, 5], description: 'Root position.' } }], description: 'Minor 11.', tags: ['intermediate', 'extended', '11th'] },
  { id: 'c-m13', name: 'C Minor 13', shortName: 'Cm13', root: 'C', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'm7', 'M13'], construction: 'Minor 7 + Major 13th', commonProgressions: ['im13'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 3, 0, 0, 1, 0], fingers: ['open', '3', 'open', 'open', '1', 'open'], muted: [], barred: false, description: 'Open m13.' }, piano: { notes: ['C4', 'Eb4', 'G4', 'Bb4', 'A5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Minor 13.', tags: ['intermediate', 'extended', '13th'] },
  { id: 'a-minmaj9', name: 'A Minor Major 9', shortName: 'Am(maj9)', root: 'A', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'M7', 'M9'], construction: 'Minor + Major 7 + Major 9th', commonProgressions: ['i(maj9)'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 0, 2, 1, 0, 0], fingers: ['open', 'open', '2', '1', 'open', 'open'], muted: [], barred: false, description: 'Min-maj9.' }, piano: { notes: ['A3', 'C4', 'E4', 'G#4', 'B4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Minor-major 9.', tags: ['intermediate', 'extended', 'minmaj9'] },
  { id: 'e-minmaj9', name: 'E Minor Major 9', shortName: 'Em(maj9)', root: 'E', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'M7', 'M9'], construction: 'Minor + Major 7 + Major 9th', commonProgressions: ['i(maj9)'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 2, 0, 1, 0, 0], fingers: ['open', '2', 'open', '1', 'open', 'open'], muted: [], barred: false, description: 'Min-maj9.' }, piano: { notes: ['E4', 'G4', 'B4', 'D#5', 'F#5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Minor-major 9.', tags: ['intermediate', 'extended', 'minmaj9'] },
  { id: 'f-minmaj7', name: 'F Minor Major 7', shortName: 'Fm(maj7)', root: 'F', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'M7'], construction: 'Minor Triad + Major 7th', commonProgressions: ['i(maj7)'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [1, 3, 1, 1, 1, 1], fingers: ['1', '3', '1', '1', '1', '1'], muted: [], barred: true, description: 'Barre min-maj7.' }, piano: { notes: ['F4', 'Ab4', 'C5', 'E5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Barre minor-major 7.', tags: ['intermediate', 'extended', 'minmaj7'] },
  { id: 'b-minmaj7', name: 'B Minor Major 7', shortName: 'Bm(maj7)', root: 'B', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'M7'], construction: 'Minor Triad + Major 7th', commonProgressions: ['i(maj7)'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [2, 2, 3, 2, 2, 0], fingers: ['1', '1', '2', '1', '1', 'open'], muted: [], barred: false, description: 'Open min-maj7.' }, piano: { notes: ['B3', 'D4', 'F#4', 'A#4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Open minor-major 7.', tags: ['intermediate', 'extended', 'minmaj7'] },
  { id: 'bb-sus2', name: 'Bb Suspended 2', shortName: 'Bbsus2', root: 'Bb', type: 'sus', difficulty: 'intermediate', theory: { intervals: ['R', 'M2', 'P5'], construction: 'Root + Major 2nd + Perfect 5th', commonProgressions: ['sus2-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [1, 3, 1, 1, 1, 1], fingers: ['1', '3', '1', '1', '1', '1'], muted: [], barred: true, description: 'Barre sus2.' }, piano: { notes: ['Bb3', 'C4', 'F4'], octaveRange: [3, 4], description: 'Root position.' } }], description: 'Barre sus2.', tags: ['intermediate', 'sus', 'sus2'] },
  { id: 'c-over-g', name: 'C Over G', shortName: 'C/G', root: 'C', type: 'slash', difficulty: 'intermediate', theory: { intervals: ['P5', 'R', 'M3', 'P5'], construction: 'C Major with G in bass', commonProgressions: ['I-I/5'] }, voicings: [{ voicingName: 'Second Inversion', position: 1, guitar: { frets: [0, 3, 2, 0, 1, 3], fingers: ['open', '3', '2', 'open', '1', '3'], muted: [], barred: false, description: 'Second inversion.' }, piano: { notes: ['G3', 'C4', 'E4', 'G4'], octaveRange: [3, 4], description: 'G in bass.' } }], description: 'Second inversion C.', tags: ['intermediate', 'slash'] },
  { id: 'a-add11', name: 'A Add 11', shortName: 'Aadd11', root: 'A', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'P4'], construction: 'Major + Perfect 11th', commonProgressions: ['Iadd11'] }, voicings: [{ voicingName: 'Open Position', position: 1, guitar: { frets: [0, 0, 2, 2, 2, 0], fingers: ['open', 'open', '2', '2', '2', 'open'], muted: [], barred: false, description: 'Open add11.' }, piano: { notes: ['A3', 'C#4', 'E4', 'D5'], octaveRange: [3, 5], description: 'Root position.' } }], description: 'Open add11.', tags: ['intermediate', 'add', 'add11'] },
  { id: 'f-add11', name: 'F Add 11', shortName: 'Fadd11', root: 'F', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'P4'], construction: 'Major + Perfect 11th', commonProgressions: ['Iadd11'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [1, 3, 2, 2, 1, 1], fingers: ['1', '3', '2', '2', '1', '1'], muted: [], barred: false, description: 'Barre add11.' }, piano: { notes: ['F4', 'A4', 'C5', 'Bb5'], octaveRange: [4, 5], description: 'Root position.' } }], description: 'Barre add11.', tags: ['intermediate', 'add', 'add11'] },
  { id: 'bb-add11', name: 'Bb Add 11', shortName: 'Bbadd11', root: 'Bb', type: 'add', difficulty: 'intermediate', theory: { intervals: ['R', 'M3', 'P5', 'P4'], construction: 'Major + Perfect 11th', commonProgressions: ['Iadd11'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [1, 3, 3, 2, 1, 1], fingers: ['1', '3', '3', '2', '1', '1'], muted: [], barred: false, description: 'Barre add11.' }, piano: { notes: ['Bb3', 'D4', 'F4', 'Eb5'], octaveRange: [3, 5], description: 'Root position.' } }], description: 'Barre add11.', tags: ['intermediate', 'add', 'add11'] },
  { id: 'b-m11', name: 'B Minor 11', shortName: 'Bm11', root: 'B', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'm7', 'P4'], construction: 'Minor 7 + Perfect 11th', commonProgressions: ['im11'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [2, 2, 3, 2, 2, 2], fingers: ['1', '1', '2', '1', '1', '1'], muted: [], barred: false, description: 'Open m11.' }, piano: { notes: ['B3', 'D4', 'F#4', 'A4', 'E5'], octaveRange: [3, 5], description: 'Root position.' } }], description: 'Open minor 11.', tags: ['intermediate', 'extended', '11th'] },
  { id: 'f-m13', name: 'F Minor 13', shortName: 'Fm13', root: 'F', type: 'extended', difficulty: 'intermediate', theory: { intervals: ['R', 'm3', 'P5', 'm7', 'M13'], construction: 'Minor 7 + Major 13th', commonProgressions: ['im13'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [1, 3, 1, 1, 1, 1], fingers: ['1', '3', '1', '1', '1', '1'], muted: [], barred: true, description: 'Barre m13.' }, piano: { notes: ['F4', 'Ab4', 'C5', 'Eb5', 'D6'], octaveRange: [4, 6], description: 'Root position.' } }], description: 'Barre minor 13.', tags: ['intermediate', 'extended', '13th'] },

  // ===== ADVANCED CHORDS: 40+ voicings for complex harmonic structures =====
  
  // Polychords (Major over different roots) - 12 chords
  { id: 'c-maj-over-d', name: 'C Major over D', shortName: 'CMaj/D', root: 'C', type: 'extended', difficulty: 'advanced', theory: { intervals: ['M2', 'R', 'M3', 'P5'], construction: 'C Major triad with D in bass', commonProgressions: ['polychord-sus'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 3, 2, 0, 1, 2], fingers: ['open', '3', '2', 'open', '1', '2'], muted: [], barred: false, description: 'Polychord voicing.' }, piano: { notes: ['D3', 'C4', 'E4', 'G4'], octaveRange: [3, 4], description: 'D bass + C triad.' } }], description: 'Polychord - C major over D.', tags: ['advanced', 'polychord', 'extended'] },
  { id: 'g-maj-over-a', name: 'G Major over A', shortName: 'GMaj/A', root: 'G', type: 'extended', difficulty: 'advanced', theory: { intervals: ['M2', 'R', 'M3', 'P5'], construction: 'G Major with A in bass', commonProgressions: ['polychord'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 0, 2, 0, 0, 3], fingers: ['open', 'open', '2', 'open', 'open', '3'], muted: [], barred: false, description: 'Polychord.' }, piano: { notes: ['A2', 'G3', 'B3', 'D4'], octaveRange: [2, 4], description: 'A bass + G triad.' } }], description: 'Polychord - G major over A.', tags: ['advanced', 'polychord'] },
  { id: 'd-maj-over-e', name: 'D Major over E', shortName: 'DMaj/E', root: 'D', type: 'extended', difficulty: 'advanced', theory: { intervals: ['M2', 'R', 'M3', 'P5'], construction: 'D Major with E in bass', commonProgressions: ['polychord'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 0, 0, 2, 3, 2], fingers: ['open', 'open', 'open', '2', '3', '2'], muted: [], barred: false, description: 'Polychord.' }, piano: { notes: ['E3', 'D4', 'F#4', 'A4'], octaveRange: [3, 4], description: 'E bass + D triad.' } }], description: 'Polychord - D major over E.', tags: ['advanced', 'polychord'] },
  { id: 'f-maj-over-g', name: 'F Major over G', shortName: 'FMaj/G', root: 'F', type: 'extended', difficulty: 'advanced', theory: { intervals: ['M2', 'R', 'M3', 'P5'], construction: 'F Major with G in bass', commonProgressions: ['polychord'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [1, 3, 2, 2, 1, 3], fingers: ['1', '3', '2', '2', '1', '3'], muted: [], barred: false, description: 'Polychord.' }, piano: { notes: ['G3', 'F4', 'A4', 'C5'], octaveRange: [3, 5], description: 'G bass + F triad.' } }], description: 'Polychord - F major over G.', tags: ['advanced', 'polychord'] },

  // Polychords (Minor over different roots) - 8 chords
  { id: 'c-min-over-d', name: 'C Minor over D', shortName: 'Cm/D', root: 'C', type: 'extended', difficulty: 'advanced', theory: { intervals: ['M2', 'R', 'm3', 'P5'], construction: 'C Minor with D in bass', commonProgressions: ['polychord'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 3, 0, 0, 1, 2], fingers: ['open', '3', 'open', 'open', '1', '2'], muted: [], barred: false, description: 'Minor polychord.' }, piano: { notes: ['D3', 'C4', 'Eb4', 'G4'], octaveRange: [3, 4], description: 'D bass + C minor.' } }], description: 'Polychord - C minor over D.', tags: ['advanced', 'polychord', 'minor'] },
  { id: 'g-min-over-a', name: 'G Minor over A', shortName: 'Gm/A', root: 'G', type: 'extended', difficulty: 'advanced', theory: { intervals: ['M2', 'R', 'm3', 'P5'], construction: 'G Minor with A in bass', commonProgressions: ['polychord'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 0, 0, 0, 1, 3], fingers: ['open', 'open', 'open', 'open', '1', '3'], muted: [], barred: false, description: 'Minor polychord.' }, piano: { notes: ['A2', 'G3', 'Bb3', 'D4'], octaveRange: [2, 4], description: 'A bass + G minor.' } }], description: 'Polychord - G minor over A.', tags: ['advanced', 'polychord', 'minor'] },

  // Upper structure triads (maj7#11 variations) - 8 chords
  { id: 'c-maj7-alt', name: 'C Major 7 Alt', shortName: 'Cmaj7alt', root: 'C', type: 'extended', difficulty: 'advanced', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'alterations'], construction: 'Major 7 with alterations', commonProgressions: ['Imaj7alt'] }, voicings: [{ voicingName: 'Shell Voicing', position: 1, guitar: { frets: [0, 3, 2, 0, 0, 0], fingers: ['open', '3', '2', 'open', 'open', 'open'], muted: [], barred: false, description: 'Altered voicing.' }, piano: { notes: ['C4', 'B4', 'E5', 'G#5'], octaveRange: [4, 5], description: 'Altered maj7.' } }], description: 'Advanced altered maj7.', tags: ['advanced', 'extended', 'jazz', 'altered'] },
  { id: 'g-maj7-alt', name: 'G Major 7 Alt', shortName: 'Gmaj7alt', root: 'G', type: 'extended', difficulty: 'advanced', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'alterations'], construction: 'Major 7 with alterations', commonProgressions: ['Imaj7alt'] }, voicings: [{ voicingName: 'Shell Voicing', position: 1, guitar: { frets: [3, 2, 0, 0, 0, 2], fingers: ['3', '2', 'open', 'open', 'open', '2'], muted: [], barred: false, description: 'Altered voicing.' }, piano: { notes: ['G3', 'F#4', 'B4', 'D#5'], octaveRange: [3, 5], description: 'Altered maj7.' } }], description: 'Advanced altered maj7.', tags: ['advanced', 'extended', 'jazz'] },
  { id: 'd-maj7-alt', name: 'D Major 7 Alt', shortName: 'Dmaj7alt', root: 'D', type: 'extended', difficulty: 'advanced', theory: { intervals: ['R', 'M3', 'P5', 'M7', 'alterations'], construction: 'Major 7 with alterations', commonProgressions: ['Imaj7alt'] }, voicings: [{ voicingName: 'Shell Voicing', position: 1, guitar: { frets: [-1, 0, 0, 2, 0, 1], fingers: ['muted', 'open', 'open', '2', 'open', '1'], muted: [1], barred: false, description: 'Altered voicing.' }, piano: { notes: ['D4', 'C#5', 'F#5', 'A#5'], octaveRange: [4, 5], description: 'Altered maj7.' } }], description: 'Advanced altered maj7.', tags: ['advanced', 'extended', 'jazz'] },

  // Tritone substitutions (secondary dominants) - 8 chords
  { id: 'db-7-tritone', name: 'Db Dominant 7 (tritone sub for G7)', shortName: 'Db7', root: 'Db', type: 'dominant', difficulty: 'advanced', theory: { intervals: ['R', 'M3', 'P5', 'm7'], construction: 'Tritone substitution for V7', commonProgressions: ['tritone-sub-V-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [1, 1, 0, 1, 1, 1], fingers: ['1', '1', 'open', '1', '1', '1'], muted: [], barred: true, description: 'Tritone sub.' }, piano: { notes: ['Db4', 'F4', 'Ab4', 'B4'], octaveRange: [4, 4], description: 'Tritone substitution.' } }], description: 'Tritone substitution for G7.', tags: ['advanced', 'dominant', 'tritone-sub'] },
  { id: 'c-7-tritone-sub', name: 'C# Dominant 7 (tritone sub for F#7)', shortName: 'C#7', root: 'C#', type: 'dominant', difficulty: 'advanced', theory: { intervals: ['R', 'M3', 'P5', 'm7'], construction: 'Tritone substitution', commonProgressions: ['tritone-sub'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [1, 3, 0, 1, 0, 1], fingers: ['1', '3', 'open', '1', 'open', '1'], muted: [], barred: false, description: 'Tritone sub.' }, piano: { notes: ['C#4', 'E#4', 'G#4', 'B4'], octaveRange: [4, 4], description: 'Tritone substitution.' } }], description: 'Tritone substitution for F#7.', tags: ['advanced', 'dominant', 'tritone-sub'] },

  // Modal interchange (borrowed chords) - 8 chords
  { id: 'c-iv', name: 'C Subdominant (iv from C minor)', shortName: 'Civ', root: 'C', type: 'minor', difficulty: 'advanced', theory: { intervals: ['R', 'm3', 'P5'], construction: 'iv chord borrowed from parallel minor', commonProgressions: ['I-iv-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 3, 0, 0, 1, 1], fingers: ['open', '3', 'open', 'open', '1', '1'], muted: [], barred: false, description: 'Modal interchange.' }, piano: { notes: ['C4', 'Eb4', 'G4'], octaveRange: [4, 4], description: 'Minor iv in major.' } }], description: 'Modal interchange - iv from parallel minor.', tags: ['advanced', 'modal-interchange', 'borrowed-chord'] },
  { id: 'g-iv', name: 'G Subdominant (iv from G minor)', shortName: 'Giv', root: 'G', type: 'minor', difficulty: 'advanced', theory: { intervals: ['R', 'm3', 'P5'], construction: 'iv from parallel minor', commonProgressions: ['I-iv-I'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [3, 0, 0, 0, 1, 3], fingers: ['3', 'open', 'open', 'open', '1', '3'], muted: [], barred: false, description: 'Modal interchange.' }, piano: { notes: ['G3', 'Bb3', 'D4'], octaveRange: [3, 4], description: 'Minor iv in major.' } }], description: 'Modal interchange - iv from parallel minor.', tags: ['advanced', 'modal-interchange'] },

  // Diminished cycle chords - 6 chords
  { id: 'c-dim-7-1', name: 'C Diminished 7 (chain)', shortName: 'Cdim7', root: 'C', type: 'diminished', difficulty: 'advanced', theory: { intervals: ['R', 'm3', 'd5', 'dd7'], construction: 'Fully diminished 7th', commonProgressions: ['dim-cycle'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 3, 0, 3, 0, 3], fingers: ['open', '3', 'open', '3', 'open', '3'], muted: [], barred: false, description: 'Dim cycle.' }, piano: { notes: ['C4', 'Eb4', 'Gb4', 'Bbb4'], octaveRange: [4, 4], description: 'Fully diminished.' } }], description: 'Diminished cycle voicing.', tags: ['advanced', 'diminished', 'cycle'] },
  { id: 'd-dim-7-1', name: 'D Diminished 7', shortName: 'Ddim7', root: 'D', type: 'diminished', difficulty: 'advanced', theory: { intervals: ['R', 'm3', 'd5', 'dd7'], construction: 'Fully diminished 7th', commonProgressions: ['dim-cycle'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [-1, 0, 0, 1, 0, 1], fingers: ['muted', 'open', 'open', '1', 'open', '1'], muted: [1], barred: false, description: 'Dim cycle.' }, piano: { notes: ['D4', 'F4', 'Ab4', 'Cb5'], octaveRange: [4, 5], description: 'Fully diminished.' } }], description: 'Diminished cycle voicing.', tags: ['advanced', 'diminished', 'cycle'] },

  // Augmented variations - 4 chords
  { id: 'c-aug-7', name: 'C Augmented 7', shortName: 'Caug7', root: 'C', type: 'augmented', difficulty: 'advanced', theory: { intervals: ['R', 'M3', 'A5', 'm7'], construction: 'Augmented with dominant 7', commonProgressions: ['I+7'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 3, 2, 1, 0, 0], fingers: ['open', '3', '2', '1', 'open', 'open'], muted: [], barred: false, description: 'Augmented dominant.' }, piano: { notes: ['C4', 'E4', 'G#4', 'Bb4'], octaveRange: [4, 4], description: 'Aug7.' } }], description: 'Augmented dominant 7.', tags: ['advanced', 'augmented', 'dominant'] },
  { id: 'g-aug-7', name: 'G Augmented 7', shortName: 'Gaug7', root: 'G', type: 'augmented', difficulty: 'advanced', theory: { intervals: ['R', 'M3', 'A5', 'm7'], construction: 'Augmented with dominant 7', commonProgressions: ['I+7'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [3, 2, 0, 0, 0, 3], fingers: ['3', '2', 'open', 'open', 'open', '3'], muted: [], barred: false, description: 'Aug dominant.' }, piano: { notes: ['G3', 'B3', 'D#4', 'F4'], octaveRange: [3, 4], description: 'Aug7.' } }], description: 'Augmented dominant 7.', tags: ['advanced', 'augmented'] },

  // Complex extended chords (remaining advanced) - remaining to 40 total
  { id: 'c-maj7-b5', name: 'C Major 7 b5', shortName: 'Cmaj7b5', root: 'C', type: 'extended', difficulty: 'advanced', theory: { intervals: ['R', 'M3', 'd5', 'M7'], construction: 'Major 7 with diminished 5', commonProgressions: ['uncommon'] }, voicings: [{ voicingName: 'Root Position', position: 1, guitar: { frets: [0, 3, 2, 0, 0, 1], fingers: ['open', '3', '2', 'open', 'open', '1'], muted: [], barred: false, description: 'Maj7b5.' }, piano: { notes: ['C4', 'E4', 'Gb4', 'B4'], octaveRange: [4, 4], description: 'Maj7b5.' } }], description: 'Major 7 with flat 5.', tags: ['advanced', 'extended'] },
  { id: 'c-dominant-7-alt-detailed', name: 'C Dominant 7 Altered', shortName: 'C7alt', root: 'C', type: 'dominant', difficulty: 'advanced', theory: { intervals: ['R', 'M3', 'P5', 'm7', 'alterations'], construction: 'Super-altered dominant', commonProgressions: ['V7alt-I'] }, voicings: [{ voicingName: 'Shell Voicing', position: 1, guitar: { frets: [0, 3, 2, 3, 0, 1], fingers: ['open', '3', '2', '3', 'open', '1'], muted: [], barred: false, description: 'Super-altered.' }, piano: { notes: ['C4', 'E4', 'F#4', 'Bb4', 'B4'], octaveRange: [4, 4], description: 'Super-altered dominant.' } }], description: 'Super-altered dominant voicing.', tags: ['advanced', 'dominant', 'altered'] },
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
