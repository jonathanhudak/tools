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
          frets: [0, 3, 2, 0, 3, -1],
          fingers: ['open', '3', '2', 'open', '3', 'muted'],
          muted: [6],
          barred: false,
          description: 'Classic open C. Bright, resonant. Perfect for beginners.',
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
