import { Note } from 'tonal';
import type { Tuning, TuningNote, InstrumentCategory } from './tunings';

// =============================================================================
// MICROTONAL HELPERS
// =============================================================================

/**
 * Create a microtonal note by offsetting a 12-TET reference pitch by cents.
 *
 * @param baseNote     – Nearest 12-TET note name (e.g. "E2")
 * @param centsOffset  – Deviation in cents (positive = sharp, negative = flat)
 * @param stringNumber – String number (1 = highest pitch)
 * @param displayName  – Optional custom label; auto-generated if omitted
 */
export function createMicrotonalNote(
  baseNote: string,
  centsOffset: number,
  stringNumber: number,
  displayName?: string
): TuningNote {
  const baseFreq = Note.freq(baseNote) ?? 0;
  const frequency = baseFreq * Math.pow(2, centsOffset / 1200);

  const pitchClass = Note.pitchClass(baseNote) || baseNote.replace(/\d/g, '');
  let name: string;
  if (displayName) {
    name = displayName;
  } else if (centsOffset === 0) {
    name = pitchClass;
  } else {
    const sign = centsOffset > 0 ? '+' : '−';
    name = `${pitchClass}${sign}${Math.abs(centsOffset)}¢`;
  }

  return {
    note: baseNote,
    name,
    string: stringNumber,
    frequency,
    centsOffset,
  };
}

/**
 * Build a full Tuning object from microtonal note specs.
 * Notes are provided low-to-high; string numbers are assigned automatically.
 */
export function createMicrotonalTuning(
  id: string,
  name: string,
  notes: Array<{ base: string; cents: number; label?: string }>,
  description?: string
): Tuning {
  const totalStrings = notes.length;
  return {
    id,
    name,
    notes: notes.map((n, idx) =>
      createMicrotonalNote(n.base, n.cents, totalStrings - idx, n.label)
    ),
    description,
  };
}

// =============================================================================
// MICROTONAL GUITAR TUNINGS
// =============================================================================

export const MICROTONAL_GUITAR_TUNINGS: Tuning[] = [

  // —————————————————————————
  // JUST INTONATION TUNINGS
  // —————————————————————————

  createMicrotonalTuning(
    'guitar-just-open-d',
    'Just Intonation Open D',
    [
      { base: 'D2', cents: 0,   label: 'D' },
      { base: 'A2', cents: 2,   label: 'A↑' },
      { base: 'D3', cents: 0,   label: 'D' },
      { base: 'F#3', cents: -14, label: 'F♯↓' },
      { base: 'A3', cents: 2,   label: 'A↑' },
      { base: 'D4', cents: 0,   label: 'D' },
    ],
    'Open D with pure intervals — sweet, beatless major chord'
  ),

  createMicrotonalTuning(
    'guitar-just-open-g',
    'Just Intonation Open G',
    [
      { base: 'D2', cents: 2,   label: 'D↑' },
      { base: 'G2', cents: 0,   label: 'G' },
      { base: 'D3', cents: 2,   label: 'D↑' },
      { base: 'G3', cents: 0,   label: 'G' },
      { base: 'B3', cents: -14, label: 'B↓' },
      { base: 'D4', cents: 2,   label: 'D↑' },
    ],
    'Open G with pure intervals — try with a slide'
  ),

  createMicrotonalTuning(
    'guitar-just-open-e',
    'Just Intonation Open E',
    [
      { base: 'E2', cents: 0,   label: 'E' },
      { base: 'B2', cents: 2,   label: 'B↑' },
      { base: 'E3', cents: 0,   label: 'E' },
      { base: 'G#3', cents: -14, label: 'G♯↓' },
      { base: 'B3', cents: 2,   label: 'B↑' },
      { base: 'E4', cents: 0,   label: 'E' },
    ],
    'Open E with pure intervals — ideal for slide in just intonation'
  ),

  createMicrotonalTuning(
    'guitar-just-open-am',
    'Just Intonation Open Am',
    [
      { base: 'E2', cents: 2,  label: 'E↑' },
      { base: 'A2', cents: 0,  label: 'A' },
      { base: 'E3', cents: 2,  label: 'E↑' },
      { base: 'A3', cents: 0,  label: 'A' },
      { base: 'C4', cents: 16, label: 'C↑' },
      { base: 'E4', cents: 2,  label: 'E↑' },
    ],
    'Open Am with pure minor third (6:5) and pure fifth (3:2)'
  ),

  // —————————————————————————
  // QUARTER-TONE TUNINGS (24-TET)
  // —————————————————————————

  createMicrotonalTuning(
    'guitar-quarter-explorer',
    'Quarter-Tone Explorer',
    [
      { base: 'E2', cents: 0,  label: 'E' },
      { base: 'A2', cents: 0,  label: 'A' },
      { base: 'D3', cents: 0,  label: 'D' },
      { base: 'G3', cents: 50, label: 'G↑¼' },
      { base: 'B3', cents: 0,  label: 'B' },
      { base: 'E4', cents: 0,  label: 'E' },
    ],
    'Standard with G string raised a quarter-tone — explore 24-TET intervals'
  ),

  createMicrotonalTuning(
    'guitar-maqam-rast',
    'Maqam Rast Explorer',
    [
      { base: 'D2', cents: 0,   label: 'D' },
      { base: 'A2', cents: 0,   label: 'A' },
      { base: 'D3', cents: 0,   label: 'D' },
      { base: 'G3', cents: 0,   label: 'G' },
      { base: 'B3', cents: -50, label: 'B↓¼' },
      { base: 'E4', cents: 0,   label: 'E' },
    ],
    'Open strings approximating Maqam Rast intervals — D Rast scale'
  ),

  createMicrotonalTuning(
    'guitar-quarter-full',
    'Quarter-Tone Alternating',
    [
      { base: 'E2', cents: 0,  label: 'E' },
      { base: 'A2', cents: 50, label: 'A↑¼' },
      { base: 'D3', cents: 0,  label: 'D' },
      { base: 'G3', cents: 50, label: 'G↑¼' },
      { base: 'B3', cents: 0,  label: 'B' },
      { base: 'E4', cents: 50, label: 'E↑¼' },
    ],
    'Alternating strings offset by quarter-tones — full 24-TET access across strings'
  ),

  // —————————————————————————
  // HARMONIC SERIES / SPECTRAL TUNINGS
  // —————————————————————————

  createMicrotonalTuning(
    'guitar-harmonic-series-d',
    'Harmonic Series (D)',
    [
      { base: 'D2',  cents: 0,   label: 'D (H2)' },
      { base: 'A2',  cents: 2,   label: 'A↑ (H3)' },
      { base: 'D3',  cents: 0,   label: 'D (H4)' },
      { base: 'F#3', cents: -14, label: 'F♯↓ (H5)' },
      { base: 'A3',  cents: 2,   label: 'A↑ (H6)' },
      { base: 'C4',  cents: -31, label: 'C♮↓ (H7)' },
    ],
    'Strings follow the natural harmonic series of D — deeply resonant, alien intervals'
  ),

  createMicrotonalTuning(
    'guitar-harmonic-series-e',
    'Harmonic Series (E)',
    [
      { base: 'E2',  cents: 0,   label: 'E (H2)' },
      { base: 'B2',  cents: 2,   label: 'B↑ (H3)' },
      { base: 'E3',  cents: 0,   label: 'E (H4)' },
      { base: 'G#3', cents: -14, label: 'G♯↓ (H5)' },
      { base: 'B3',  cents: 2,   label: 'B↑ (H6)' },
      { base: 'D4',  cents: -31, label: 'D↓ (H7)' },
    ],
    'Harmonic series of E — the 7th harmonic D is strikingly blue'
  ),

  // —————————————————————————
  // 7-LIMIT / SEPTIMAL TUNINGS
  // —————————————————————————

  createMicrotonalTuning(
    'guitar-septimal-blues',
    'Septimal Blues (Open D7)',
    [
      { base: 'D2',  cents: 0,   label: 'D' },
      { base: 'A2',  cents: 2,   label: 'A↑' },
      { base: 'D3',  cents: 0,   label: 'D' },
      { base: 'F#3', cents: -14, label: 'F♯↓' },
      { base: 'A3',  cents: 2,   label: 'A↑' },
      { base: 'C4',  cents: -31, label: 'C♮↓' },
    ],
    'Open D with a pure harmonic 7th — the "blue note" from the overtone series'
  ),

  // —————————————————————————
  // GAMELAN-INSPIRED / STRETCHED TUNINGS
  // —————————————————————————

  createMicrotonalTuning(
    'guitar-slendro',
    'Slendro-Inspired',
    [
      { base: 'E2', cents: 0,   label: '1' },
      { base: 'G2', cents: 40,  label: '2' },
      { base: 'A2', cents: -20, label: '3' },
      { base: 'C3', cents: 20,  label: '4' },
      { base: 'D3', cents: -40, label: '5' },
      { base: 'E3', cents: 0,   label: "1'" },
    ],
    'Approximation of Javanese Slendro scale (5-TET) — ethereal, gamelan-like'
  ),

  createMicrotonalTuning(
    'guitar-pelog',
    'Pelog-Inspired',
    [
      { base: 'E2', cents: 0,   label: '1' },
      { base: 'F2', cents: 25,  label: '2' },
      { base: 'G#2', cents: -15, label: '3' },
      { base: 'A2', cents: 40,  label: '4' },
      { base: 'C3', cents: -20, label: '5' },
      { base: 'E3', cents: 0,   label: "1'" },
    ],
    'Approximation of Javanese Pelog scale — haunting, asymmetric intervals'
  ),

  // —————————————————————————
  // EXPERIMENTAL / COMPOSITIONAL
  // —————————————————————————

  createMicrotonalTuning(
    'guitar-19tet-fourths',
    '19-TET Fourths',
    [
      { base: 'E2', cents: 0,   label: 'E' },
      { base: 'A2', cents: -5,  label: 'A↓' },
      { base: 'D3', cents: -11, label: 'D↓' },
      { base: 'G3', cents: -16, label: 'G↓' },
      { base: 'B3', cents: -5,  label: 'B↓' },
      { base: 'E4', cents: -11, label: 'E↓' },
    ],
    '19-TET approximation using standard string layout — sweeter thirds'
  ),

  createMicrotonalTuning(
    'guitar-shruti-d',
    'Shruti-Inspired (Sa=D)',
    [
      { base: 'D2', cents: 0,  label: 'Sa' },
      { base: 'A2', cents: 2,  label: 'Pa' },
      { base: 'D3', cents: 0,  label: 'Sa' },
      { base: 'F3', cents: 16, label: 'ga' },
      { base: 'A3', cents: 2,  label: 'Pa' },
      { base: 'D4', cents: 0,  label: 'Sa' },
    ],
    'Open strings for Raga exploration — Sa-Pa-ga with pure intervals'
  ),

  createMicrotonalTuning(
    'guitar-pure-fifths-chain',
    'Pure Fifths Chain',
    [
      { base: 'D2',  cents: 0,  label: 'D' },
      { base: 'A2',  cents: 2,  label: 'A↑' },
      { base: 'E3',  cents: 4,  label: 'E↑↑' },
      { base: 'B3',  cents: 6,  label: 'B↑↑↑' },
      { base: 'F#4', cents: 8,  label: 'F♯↑' },
      { base: 'C#5', cents: 10, label: 'C♯↑' },
    ],
    'Pythagorean chain of pure 3:2 fifths — drift from 12-TET accumulates'
  ),
];

// =============================================================================
// INSTRUMENT CATEGORY
// =============================================================================

export const MICROTONAL_CATEGORY: InstrumentCategory = {
  id: 'microtonal-guitar',
  name: 'Microtonal Guitar',
  icon: '🎸',
  tunings: MICROTONAL_GUITAR_TUNINGS,
};
