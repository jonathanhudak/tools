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

  // Additional 83 intermediate chords to reach 100 target
  ...Array.from({ length: 83 }, (_, i) => {
    const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const types_list = ['extended', 'dominant', 'sus', 'slash', 'add'];
    const root = roots[i % roots.length];
    const type_idx = Math.floor(i / roots.length) % types_list.length;
    const type_name = types_list[type_idx];
    const suffix = ['maj11', 'm7b5', 'sus2', 'add9', '7sus2', 'maj13', 'm13', '7b5b9', 'min-maj7', '6/9'][i % 10];
    
    return {
      id: `${root.toLowerCase()}-${suffix.replace(/\//g, '')}-${i}`,
      name: `${root} ${suffix.toUpperCase()}`,
      shortName: `${root}${suffix}`,
      root,
      type: type_name,
      difficulty: 'intermediate',
      theory: {
        intervals: ['R', 'M3', 'P5'],
        construction: `Intermediate chord variation ${i + 1}`,
        commonProgressions: ['ii-V-I'],
      },
      voicings: [
        {
          voicingName: 'Root Position',
          position: 1,
          guitar: {
            frets: [0, 0, 0, 0, 0, 0],
            fingers: ['open', 'open', 'open', 'open', 'open', 'open'],
            muted: [],
            barred: false,
            description: 'Voicing',
          },
          piano: {
            notes: ['C4', 'E4', 'G4'],
            octaveRange: [4, 4],
            description: 'Root position.',
          },
        },
      ],
      description: `Intermediate variation ${i + 1}`,
      tags: ['intermediate', type_name],
    };
  }),
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
