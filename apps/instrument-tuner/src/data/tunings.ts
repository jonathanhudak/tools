import { Note } from 'tonal';

// Types for tunings
export interface TuningNote {
  note: string; // e.g., "E2", "A4"
  name: string; // Display name, e.g., "E", "A"
  string: number; // String number (1 = highest pitch)
  frequency: number;
}

export interface Tuning {
  id: string;
  name: string;
  notes: TuningNote[];
  description?: string;
}

export interface InstrumentCategory {
  id: string;
  name: string;
  icon: string; // emoji or icon name
  tunings: Tuning[];
}

// Helper to create a tuning note from a note string
function createNote(noteStr: string, stringNumber: number): TuningNote {
  const freq = Note.freq(noteStr);
  const noteName = Note.pitchClass(noteStr) || noteStr.replace(/\d/g, '');
  return {
    note: noteStr,
    name: noteName,
    string: stringNumber,
    frequency: freq || 0,
  };
}

// Helper to create tuning from note strings (ordered low to high pitch)
function createTuning(
  id: string,
  name: string,
  notes: string[],
  description?: string
): Tuning {
  // Notes are provided low to high, but string numbers go high to low
  // String 6 is lowest (on 6-string), String 1 is highest
  const totalStrings = notes.length;
  return {
    id,
    name,
    notes: notes.map((note, idx) =>
      createNote(note, totalStrings - idx)
    ),
    description,
  };
}

// ============================================================================
// GUITAR TUNINGS
// ============================================================================

export const GUITAR_TUNINGS: Tuning[] = [
  // Standard and Common
  createTuning('guitar-standard', 'Standard', ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'], 'EADGBE - Most common guitar tuning'),
  createTuning('guitar-drop-d', 'Drop D', ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'], 'DADGBE - Popular for rock and metal'),
  createTuning('guitar-drop-c', 'Drop C', ['C2', 'G2', 'C3', 'F3', 'A3', 'D4'], 'CGCFAD - Heavy metal tuning'),
  createTuning('guitar-drop-b', 'Drop B', ['B1', 'F#2', 'B2', 'E3', 'G#3', 'C#4'], 'BF#BEG#C# - Extra heavy tuning'),
  createTuning('guitar-drop-a', 'Drop A', ['A1', 'E2', 'A2', 'D3', 'F#3', 'B3'], 'AEADF#B - Very low tuning'),

  // Half/Full Step Down
  createTuning('guitar-half-step-down', 'Half Step Down (Eb Standard)', ['Eb2', 'Ab2', 'Db3', 'Gb3', 'Bb3', 'Eb4'], 'Eb Ab Db Gb Bb Eb - Hendrix, SRV, easier on strings'),
  createTuning('guitar-full-step-down', 'Full Step Down (D Standard)', ['D2', 'G2', 'C3', 'F3', 'A3', 'D4'], 'DGCFAD - One whole step down'),

  // Open Tunings
  createTuning('guitar-open-d', 'Open D', ['D2', 'A2', 'D3', 'F#3', 'A3', 'D4'], 'DADF#AD - Blues and slide guitar'),
  createTuning('guitar-open-e', 'Open E', ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'], 'EBEG#BE - Slide guitar'),
  createTuning('guitar-open-g', 'Open G', ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'], 'DGDGBD - Rolling Stones, Keith Richards'),
  createTuning('guitar-open-a', 'Open A', ['E2', 'A2', 'E3', 'A3', 'C#4', 'E4'], 'EAEAC#E - Slide guitar'),
  createTuning('guitar-open-c', 'Open C', ['C2', 'G2', 'C3', 'G3', 'C4', 'E4'], 'CGCGCE - John Fahey, Led Zeppelin'),
  createTuning('guitar-open-c6', 'Open C6', ['C2', 'G2', 'C3', 'G3', 'A3', 'E4'], 'CGCGAE - C6 tuning'),

  // DADGAD and Variants
  createTuning('guitar-dadgad', 'DADGAD', ['D2', 'A2', 'D3', 'G3', 'A3', 'D4'], 'DADGAD - Celtic, folk music'),
  createTuning('guitar-double-drop-d', 'Double Drop D (DADGBD)', ['D2', 'A2', 'D3', 'G3', 'B3', 'D4'], 'DADGBD - Both E strings dropped to D'),

  // Nick Drake Tunings
  createTuning('guitar-nick-drake-1', 'Nick Drake Tuning 1', ['C2', 'G2', 'C3', 'F3', 'C4', 'E4'], 'CGCFCE - River Man'),
  createTuning('guitar-nick-drake-2', 'Nick Drake Tuning 2', ['D2', 'A2', 'D3', 'G3', 'A3', 'D4'], 'DADGAD - Pink Moon'),
  createTuning('guitar-nick-drake-3', 'Nick Drake Tuning 3', ['C2', 'G2', 'C3', 'F3', 'C4', 'D4'], 'CGCFCD - Place to Be'),
  createTuning('guitar-bebebe', 'BEBEBE', ['B1', 'E2', 'B2', 'E3', 'B3', 'E4'], 'BEBEBE - Michael Hedges'),

  // Nashville Tuning (high strung)
  createTuning('guitar-nashville', 'Nashville', ['E3', 'A3', 'D4', 'G4', 'B3', 'E4'], 'E A D G B E (high) - Chimey, doubled sound'),

  // Baritone
  createTuning('guitar-baritone-standard', 'Baritone Standard', ['B1', 'E2', 'A2', 'D3', 'F#3', 'B3'], 'BEADF#B - Baritone guitar'),
  createTuning('guitar-baritone-a', 'Baritone A Standard', ['A1', 'D2', 'G2', 'C3', 'E3', 'A3'], 'ADGCEA - Lower baritone'),
];

// ============================================================================
// 7-STRING GUITAR TUNINGS
// ============================================================================

export const GUITAR_7_STRING_TUNINGS: Tuning[] = [
  createTuning('guitar7-standard', '7-String Standard', ['B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'], 'BEADGBE - Standard 7-string'),
  createTuning('guitar7-drop-a', '7-String Drop A', ['A1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'], 'AEADGBE - Drop tuning'),
  createTuning('guitar7-drop-g', '7-String Drop G', ['G1', 'D2', 'G2', 'C3', 'F3', 'A3', 'D4'], 'GDGCFAD - Very heavy'),
];

// ============================================================================
// 8-STRING GUITAR TUNINGS
// ============================================================================

export const GUITAR_8_STRING_TUNINGS: Tuning[] = [
  createTuning('guitar8-standard', '8-String Standard', ['F#1', 'B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'], 'F#BEADGBE - Standard 8-string'),
  createTuning('guitar8-drop-e', '8-String Drop E', ['E1', 'B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'], 'EBEADGBE - Drop tuning'),
];

// ============================================================================
// BASS TUNINGS
// ============================================================================

export const BASS_4_TUNINGS: Tuning[] = [
  createTuning('bass4-standard', 'Standard', ['E1', 'A1', 'D2', 'G2'], 'EADG - Standard 4-string bass'),
  createTuning('bass4-drop-d', 'Drop D', ['D1', 'A1', 'D2', 'G2'], 'DADG - Drop D bass'),
  createTuning('bass4-drop-c', 'Drop C', ['C1', 'G1', 'C2', 'F2'], 'CGCF - Heavy bass'),
  createTuning('bass4-half-step-down', 'Half Step Down', ['Eb1', 'Ab1', 'Db2', 'Gb2'], 'Eb Ab Db Gb'),
  createTuning('bass4-full-step-down', 'Full Step Down', ['D1', 'G1', 'C2', 'F2'], 'DGCF - D Standard bass'),
  createTuning('bass4-drop-b', 'Drop B', ['B0', 'F#1', 'B1', 'E2'], 'BF#BE - Very low'),
  createTuning('bass4-hipshot-d', 'Hipshot D', ['D1', 'A1', 'D2', 'G2'], 'DADG - Same as Drop D'),
  createTuning('bass4-piccolo', 'Piccolo', ['E2', 'A2', 'D3', 'G3'], 'EADG (octave up) - Piccolo bass'),
];

export const BASS_5_TUNINGS: Tuning[] = [
  createTuning('bass5-standard', '5-String Standard', ['B0', 'E1', 'A1', 'D2', 'G2'], 'BEADG - Standard 5-string'),
  createTuning('bass5-standard-high', '5-String High C', ['E1', 'A1', 'D2', 'G2', 'C3'], 'EADGC - High C string'),
  createTuning('bass5-drop-a', '5-String Drop A', ['A0', 'E1', 'A1', 'D2', 'G2'], 'AEADG - Drop A'),
  createTuning('bass5-half-step-down', '5-String Half Step Down', ['Bb0', 'Eb1', 'Ab1', 'Db2', 'Gb2'], 'Bb Eb Ab Db Gb'),
];

export const BASS_6_TUNINGS: Tuning[] = [
  createTuning('bass6-standard', '6-String Standard', ['B0', 'E1', 'A1', 'D2', 'G2', 'C3'], 'BEADGC - Standard 6-string bass'),
  createTuning('bass6-drop-a', '6-String Drop A', ['A0', 'E1', 'A1', 'D2', 'G2', 'C3'], 'AEADGC - Drop A 6-string'),
];

// ============================================================================
// UKULELE TUNINGS
// ============================================================================

export const UKULELE_TUNINGS: Tuning[] = [
  // Soprano, Concert, Tenor (standard size)
  createTuning('uke-standard', 'Standard (gCEA)', ['G4', 'C4', 'E4', 'A4'], 'GCEA - Re-entrant tuning'),
  createTuning('uke-low-g', 'Low G', ['G3', 'C4', 'E4', 'A4'], 'GCEA - Low G, linear tuning'),
  createTuning('uke-slack-key', 'Slack-Key', ['G4', 'C4', 'E4', 'G4'], 'GCEG - Hawaiian'),
  createTuning('uke-d-tuning', 'D Tuning', ['A4', 'D4', 'F#4', 'B4'], 'ADF#B - Higher pitch'),
  createTuning('uke-english', 'English/Canadian', ['A4', 'D4', 'F#4', 'B4'], 'ADF#B - Same as D Tuning'),
  createTuning('uke-open-g', 'Open G', ['G4', 'D4', 'G4', 'B4'], 'GDGB - Open G chord'),
  createTuning('uke-open-c', 'Open C', ['G4', 'C4', 'E4', 'G4'], 'GCEG - Open C chord'),

  // Baritone
  createTuning('uke-baritone', 'Baritone', ['D3', 'G3', 'B3', 'E4'], 'DGBE - Same as guitar strings 4-1'),
  createTuning('uke-baritone-low-d', 'Baritone Low D', ['D2', 'G3', 'B3', 'E4'], 'DGBE - Very low D'),

  // 6-string Ukulele
  createTuning('uke-guitalele', 'Guitalele', ['A2', 'D3', 'G3', 'C4', 'E4', 'A4'], 'ADGCEA - 6-string ukulele'),
];

// ============================================================================
// VIOLIN FAMILY
// ============================================================================

export const VIOLIN_TUNINGS: Tuning[] = [
  createTuning('violin-standard', 'Standard', ['G3', 'D4', 'A4', 'E5'], 'GDAE - Standard violin'),
  createTuning('violin-cajun', 'Cajun', ['F3', 'C4', 'G4', 'D5'], 'FCGD - One step down'),
  createTuning('violin-cross', 'Cross Tuning (AEAE)', ['A3', 'E4', 'A4', 'E5'], 'AEAE - Old-time fiddle'),
  createTuning('violin-calico', 'Calico (GDGD)', ['G3', 'D4', 'G4', 'D5'], 'GDGD - Drone tuning'),
  createTuning('violin-open-g', 'Open G (GDGB)', ['G3', 'D4', 'G4', 'B4'], 'GDGB - Open G'),
  createTuning('violin-high-bass', 'High Bass (ADAE)', ['A3', 'D4', 'A4', 'E5'], 'ADAE - Appalachian'),
];

export const VIOLA_TUNINGS: Tuning[] = [
  createTuning('viola-standard', 'Standard', ['C3', 'G3', 'D4', 'A4'], 'CGDA - Standard viola'),
];

export const CELLO_TUNINGS: Tuning[] = [
  createTuning('cello-standard', 'Standard', ['C2', 'G2', 'D3', 'A3'], 'CGDA - Standard cello'),
  createTuning('cello-fifth-down', 'Fifth String Down', ['B1', 'C2', 'G2', 'D3', 'A3'], 'BCGDA - 5-string cello'),
];

export const DOUBLE_BASS_TUNINGS: Tuning[] = [
  createTuning('doublebass-standard', 'Standard', ['E1', 'A1', 'D2', 'G2'], 'EADG - Standard double bass'),
  createTuning('doublebass-5string', '5-String Low B', ['B0', 'E1', 'A1', 'D2', 'G2'], 'BEADG - Extended range'),
  createTuning('doublebass-5string-c', '5-String High C', ['E1', 'A1', 'D2', 'G2', 'C3'], 'EADGC - High C'),
  createTuning('doublebass-solo', 'Solo Tuning', ['F#1', 'B1', 'E2', 'A2'], 'F#BEA - Raised a step'),
  createTuning('doublebass-orchestra', 'Orchestra Drop D', ['D1', 'A1', 'D2', 'G2'], 'DADG - Drop D'),
];

// ============================================================================
// MANDOLIN FAMILY
// ============================================================================

export const MANDOLIN_TUNINGS: Tuning[] = [
  createTuning('mandolin-standard', 'Standard', ['G3', 'D4', 'A4', 'E5'], 'GDAE - Standard mandolin (doubled)'),
  createTuning('mandolin-octave', 'Octave Mandolin', ['G2', 'D3', 'A3', 'E4'], 'GDAE - One octave lower'),
  createTuning('mandolin-irish', 'Irish Bouzouki', ['G2', 'D3', 'A3', 'D4'], 'GDAD - Irish tuning'),
  createTuning('mandolin-open-g', 'Open G', ['G3', 'D4', 'G4', 'B4'], 'GDGB - Open G chord'),
  createTuning('mandolin-saw-mill', 'Saw Mill', ['G3', 'D4', 'G4', 'D5'], 'GDGD - Old-time'),
  createTuning('mandolin-calico', 'Calico', ['G3', 'D4', 'A4', 'D5'], 'GDAD - Cross tuning'),
];

export const MANDOLA_TUNINGS: Tuning[] = [
  createTuning('mandola-standard', 'Standard', ['C3', 'G3', 'D4', 'A4'], 'CGDA - Standard mandola'),
];

export const MANDOCELLO_TUNINGS: Tuning[] = [
  createTuning('mandocello-standard', 'Standard', ['C2', 'G2', 'D3', 'A3'], 'CGDA - Standard mandocello'),
];

// ============================================================================
// BANJO TUNINGS
// ============================================================================

export const BANJO_5_TUNINGS: Tuning[] = [
  createTuning('banjo5-open-g', 'Open G', ['G4', 'D3', 'G3', 'B3', 'D4'], 'gDGBD - Standard 5-string'),
  createTuning('banjo5-open-d', 'Open D', ['F#4', 'D3', 'F#3', 'A3', 'D4'], 'aDF#AD - Bluegrass'),
  createTuning('banjo5-double-c', 'Double C', ['G4', 'C3', 'G3', 'C4', 'D4'], 'gCGCD - Old-time'),
  createTuning('banjo5-saw-mill', 'Saw Mill', ['G4', 'D3', 'G3', 'C4', 'D4'], 'gDGCD - Old-time'),
  createTuning('banjo5-standard-c', 'Standard C', ['G4', 'C3', 'G3', 'B3', 'D4'], 'gCGBD - C tuning'),
  createTuning('banjo5-old-time-d', 'Old-Time D', ['F#4', 'D3', 'F#3', 'A3', 'D4'], 'f#DF#AD'),
  createTuning('banjo5-open-a', 'Open A', ['A4', 'E3', 'A3', 'C#4', 'E4'], 'aEAC#E'),
];

export const BANJO_4_TUNINGS: Tuning[] = [
  createTuning('banjo4-standard', 'Standard (Chicago)', ['C3', 'G3', 'B3', 'D4'], 'CGBD - Plectrum banjo'),
  createTuning('banjo4-irish', 'Irish Tenor', ['G2', 'D3', 'A3', 'E4'], 'GDAE - Like mandolin'),
  createTuning('banjo4-jazz', 'Jazz Tenor', ['C3', 'G3', 'D4', 'A4'], 'CGDA - Like viola'),
];

export const BANJO_6_TUNINGS: Tuning[] = [
  createTuning('banjo6-standard', 'Standard (Banjitar)', ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'], 'EADGBE - Guitar tuning on banjo'),
];

// ============================================================================
// OTHER STRINGED INSTRUMENTS
// ============================================================================

export const CHARANGO_TUNINGS: Tuning[] = [
  createTuning('charango-standard', 'Standard', ['G4', 'C4', 'E4', 'A4', 'E5'], 'GCEAE - Andean tuning'),
];

export const CAVAQUINHO_TUNINGS: Tuning[] = [
  createTuning('cavaquinho-brazil', 'Brazilian', ['D4', 'G4', 'B4', 'D5'], 'DGBD - Samba'),
  createTuning('cavaquinho-portugal', 'Portuguese', ['D4', 'A4', 'B4', 'E5'], 'DABE - Fado'),
];

export const BOUZOUKI_TUNINGS: Tuning[] = [
  createTuning('bouzouki-greek', 'Greek', ['D3', 'A3', 'D4'], 'DAD - Traditional 3-course'),
  createTuning('bouzouki-greek-4', 'Greek 4-Course', ['C3', 'F3', 'A3', 'D4'], 'CFAD - Modern Greek'),
  createTuning('bouzouki-irish', 'Irish', ['G2', 'D3', 'A3', 'D4'], 'GDAD - Irish bouzouki'),
  createTuning('bouzouki-irish-octave', 'Irish Octave', ['G2', 'D3', 'A3', 'E4'], 'GDAE - Octave mandolin'),
];

export const LAP_STEEL_TUNINGS: Tuning[] = [
  createTuning('lapsteel-c6', 'C6', ['C3', 'E3', 'G3', 'A3', 'C4', 'E4'], 'CEGACE - C6 tuning'),
  createTuning('lapsteel-open-d', 'Open D', ['D2', 'A2', 'D3', 'F#3', 'A3', 'D4'], 'DADF#AD'),
  createTuning('lapsteel-open-e', 'Open E', ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'], 'EBEG#BE'),
  createTuning('lapsteel-open-g', 'Open G', ['G2', 'B2', 'D3', 'G3', 'B3', 'D4'], 'GBDGBD'),
  createTuning('lapsteel-a6', 'A6', ['E3', 'C#3', 'A2', 'F#3', 'E3', 'C#4'], 'EC#AF#EC# - A6 tuning'),
];

export const PEDAL_STEEL_TUNINGS: Tuning[] = [
  createTuning('pedalsteel-e9', 'E9', ['B2', 'D3', 'E3', 'F#3', 'G#3', 'B3', 'E4', 'G#4', 'D#4', 'F#4'], 'E9 Nashville'),
  createTuning('pedalsteel-c6', 'C6', ['C2', 'F2', 'A2', 'C3', 'E3', 'G3', 'A3', 'C4', 'E4', 'G4'], 'C6 Universal'),
];

export const CIGAR_BOX_TUNINGS: Tuning[] = [
  createTuning('cigarbox-open-g', 'Open G (3-string)', ['G3', 'B3', 'D4'], 'GBD - Open G chord'),
  createTuning('cigarbox-open-d', 'Open D (3-string)', ['D3', 'F#3', 'A3'], 'DF#A - Open D chord'),
  createTuning('cigarbox-gdg', 'GDG (3-string)', ['G3', 'D4', 'G4'], 'GDG - Fifths tuning'),
  createTuning('cigarbox-4-open-g', 'Open G (4-string)', ['D3', 'G3', 'B3', 'D4'], 'DGBD'),
];

export const DULCIMER_TUNINGS: Tuning[] = [
  createTuning('dulcimer-dad', 'DAD (Ionian)', ['D3', 'A3', 'D4'], 'DAD - Standard Appalachian'),
  createTuning('dulcimer-daa', 'DAA (Mixolydian)', ['D3', 'A3', 'A3'], 'DAA - Older style'),
  createTuning('dulcimer-dag', 'DAG (Dorian)', ['D3', 'A3', 'G3'], 'DAG - Dorian mode'),
  createTuning('dulcimer-dgd', 'DGD (Bagpipe)', ['D3', 'G3', 'D4'], 'DGD - Drone tuning'),
  createTuning('dulcimer-dac', 'DAC (Aeolian)', ['D3', 'A3', 'C4'], 'DAC - Minor key'),
];

export const SITAR_TUNINGS: Tuning[] = [
  createTuning('sitar-kharaj', 'Kharaj Pancham', ['C2', 'G2', 'C3', 'C3', 'G3', 'C4', 'F4'], 'Standard North Indian'),
  createTuning('sitar-gandhar', 'Gandhar Pancham', ['C2', 'G2', 'C3', 'E3', 'G3', 'C4', 'F4'], 'Gandhar variant'),
];

export const OUD_TUNINGS: Tuning[] = [
  createTuning('oud-arabic', 'Arabic Standard', ['C2', 'F2', 'A2', 'D3', 'G3', 'C4'], 'CFADGC - 6 courses'),
  createTuning('oud-turkish', 'Turkish', ['D2', 'A2', 'B2', 'E3', 'A3', 'D4'], 'DABEAE - Turkish style'),
  createTuning('oud-iraqi', 'Iraqi', ['C2', 'F2', 'A2', 'D3', 'G3', 'C4'], 'CFADGC - Same as Arabic'),
];

export const PIPA_TUNINGS: Tuning[] = [
  createTuning('pipa-standard', 'Standard', ['A2', 'D3', 'E3', 'A3'], 'ADEA - Chinese pipa'),
];

export const SHAMISEN_TUNINGS: Tuning[] = [
  createTuning('shamisen-honchoshi', 'Honchoshi', ['C3', 'G3', 'C4'], 'CGC - Basic tuning'),
  createTuning('shamisen-niagari', 'Niagari', ['C3', 'G3', 'D4'], 'CGD - Raised third'),
  createTuning('shamisen-sansagari', 'Sansagari', ['C3', 'F3', 'C4'], 'CFC - Lowered second'),
];

export const AUTOHARP_TUNINGS: Tuning[] = [
  createTuning('autoharp-diatonic', 'Diatonic', ['F2', 'G2', 'A2', 'Bb2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'Bb3', 'C4', 'D4', 'E4', 'F4'], 'Diatonic scale'),
];

// ============================================================================
// INSTRUMENT CATEGORIES
// ============================================================================

export const INSTRUMENT_CATEGORIES: InstrumentCategory[] = [
  {
    id: 'guitar',
    name: 'Guitar (6-string)',
    icon: '🎸',
    tunings: GUITAR_TUNINGS,
  },
  {
    id: 'guitar-7',
    name: 'Guitar (7-string)',
    icon: '🎸',
    tunings: GUITAR_7_STRING_TUNINGS,
  },
  {
    id: 'guitar-8',
    name: 'Guitar (8-string)',
    icon: '🎸',
    tunings: GUITAR_8_STRING_TUNINGS,
  },
  {
    id: 'bass-4',
    name: 'Bass (4-string)',
    icon: '🎸',
    tunings: BASS_4_TUNINGS,
  },
  {
    id: 'bass-5',
    name: 'Bass (5-string)',
    icon: '🎸',
    tunings: BASS_5_TUNINGS,
  },
  {
    id: 'bass-6',
    name: 'Bass (6-string)',
    icon: '🎸',
    tunings: BASS_6_TUNINGS,
  },
  {
    id: 'ukulele',
    name: 'Ukulele',
    icon: '🪕',
    tunings: UKULELE_TUNINGS,
  },
  {
    id: 'violin',
    name: 'Violin/Fiddle',
    icon: '🎻',
    tunings: VIOLIN_TUNINGS,
  },
  {
    id: 'viola',
    name: 'Viola',
    icon: '🎻',
    tunings: VIOLA_TUNINGS,
  },
  {
    id: 'cello',
    name: 'Cello',
    icon: '🎻',
    tunings: CELLO_TUNINGS,
  },
  {
    id: 'double-bass',
    name: 'Double Bass',
    icon: '🎻',
    tunings: DOUBLE_BASS_TUNINGS,
  },
  {
    id: 'mandolin',
    name: 'Mandolin',
    icon: '🪕',
    tunings: MANDOLIN_TUNINGS,
  },
  {
    id: 'mandola',
    name: 'Mandola',
    icon: '🪕',
    tunings: MANDOLA_TUNINGS,
  },
  {
    id: 'mandocello',
    name: 'Mandocello',
    icon: '🪕',
    tunings: MANDOCELLO_TUNINGS,
  },
  {
    id: 'banjo-5',
    name: 'Banjo (5-string)',
    icon: '🪕',
    tunings: BANJO_5_TUNINGS,
  },
  {
    id: 'banjo-4',
    name: 'Banjo (4-string)',
    icon: '🪕',
    tunings: BANJO_4_TUNINGS,
  },
  {
    id: 'banjo-6',
    name: 'Banjo (6-string)',
    icon: '🪕',
    tunings: BANJO_6_TUNINGS,
  },
  {
    id: 'charango',
    name: 'Charango',
    icon: '🎸',
    tunings: CHARANGO_TUNINGS,
  },
  {
    id: 'cavaquinho',
    name: 'Cavaquinho',
    icon: '🎸',
    tunings: CAVAQUINHO_TUNINGS,
  },
  {
    id: 'bouzouki',
    name: 'Bouzouki',
    icon: '🎸',
    tunings: BOUZOUKI_TUNINGS,
  },
  {
    id: 'lap-steel',
    name: 'Lap Steel',
    icon: '🎸',
    tunings: LAP_STEEL_TUNINGS,
  },
  {
    id: 'cigar-box',
    name: 'Cigar Box Guitar',
    icon: '🎸',
    tunings: CIGAR_BOX_TUNINGS,
  },
  {
    id: 'dulcimer',
    name: 'Appalachian Dulcimer',
    icon: '🎸',
    tunings: DULCIMER_TUNINGS,
  },
  {
    id: 'shamisen',
    name: 'Shamisen',
    icon: '🎸',
    tunings: SHAMISEN_TUNINGS,
  },
  {
    id: 'oud',
    name: 'Oud',
    icon: '🎸',
    tunings: OUD_TUNINGS,
  },
  {
    id: 'pipa',
    name: 'Pipa',
    icon: '🎸',
    tunings: PIPA_TUNINGS,
  },
];

// ============================================================================
// TUNING SERIALIZATION/DESERIALIZATION
// ============================================================================

/**
 * Serialize a tuning to a URL-safe string
 * Format: note1-note2-note3 (e.g., "E2-A2-D3-G3-B3-E4")
 */
export function serializeTuning(tuning: Tuning): string {
  // Sort notes by string number (high to low) then reverse for low to high
  const sortedNotes = [...tuning.notes].sort((a, b) => b.string - a.string);
  return sortedNotes.map((n) => n.note).join('-');
}

/**
 * Parse a tuning from a URL string
 * Returns an array of note strings (e.g., ["E2", "A2", "D3", "G3", "B3", "E4"])
 */
export function parseTuningString(tuningStr: string): string[] {
  return tuningStr.split('-').filter((s) => s.length > 0);
}

/**
 * Create a tuning from note strings (for custom tunings)
 */
export function createCustomTuning(notes: string[], name?: string): Tuning | null {
  // Validate all notes
  const validNotes = notes.filter((n) => Note.freq(n) !== null);
  if (validNotes.length !== notes.length || notes.length === 0) {
    return null;
  }

  return createTuning(
    'custom-' + Date.now(),
    name || 'Custom Tuning',
    validNotes,
    `Custom ${notes.length}-string tuning`
  );
}

/**
 * Find a preset tuning by ID
 */
export function findTuningById(id: string): Tuning | null {
  for (const category of INSTRUMENT_CATEGORIES) {
    const tuning = category.tunings.find((t) => t.id === id);
    if (tuning) return tuning;
  }
  return null;
}

/**
 * Find a preset tuning by notes
 */
export function findTuningByNotes(notes: string[]): Tuning | null {
  const normalizedInput = notes.map((n) => Note.simplify(n) || n).join('-');

  for (const category of INSTRUMENT_CATEGORIES) {
    for (const tuning of category.tunings) {
      const tuningNotes = [...tuning.notes]
        .sort((a, b) => b.string - a.string)
        .map((n) => Note.simplify(n.note) || n.note)
        .join('-');
      if (tuningNotes === normalizedInput) {
        return tuning;
      }
    }
  }
  return null;
}

/**
 * Get the default tuning for an instrument category
 */
export function getDefaultTuning(categoryId: string): Tuning | null {
  const category = INSTRUMENT_CATEGORIES.find((c) => c.id === categoryId);
  return category?.tunings[0] || null;
}

/**
 * Get all tunings as a flat array
 */
export function getAllTunings(): Tuning[] {
  return INSTRUMENT_CATEGORIES.flatMap((c) => c.tunings);
}

/**
 * Search tunings by name
 */
export function searchTunings(query: string): Array<{ tuning: Tuning; category: InstrumentCategory }> {
  const lowerQuery = query.toLowerCase();
  const results: Array<{ tuning: Tuning; category: InstrumentCategory }> = [];

  for (const category of INSTRUMENT_CATEGORIES) {
    for (const tuning of category.tunings) {
      if (
        tuning.name.toLowerCase().includes(lowerQuery) ||
        tuning.description?.toLowerCase().includes(lowerQuery) ||
        tuning.notes.some((n) => n.note.toLowerCase().includes(lowerQuery))
      ) {
        results.push({ tuning, category });
      }
    }
  }

  return results;
}
