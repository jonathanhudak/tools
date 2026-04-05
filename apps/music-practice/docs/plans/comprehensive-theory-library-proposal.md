# Comprehensive Music Theory Library — Audit & Proposal

**Date:** April 4, 2026
**Status:** Proposal
**Scope:** Accuracy audit, gap analysis, and implementation plan for a complete music theory reference

---

## Part 1: Current State Audit

### What Exists

| Category | Count | Coverage |
|----------|-------|----------|
| Chord library entries | ~150+ | Good foundation, but gaps in altered/quartal/power |
| Chord type categories | 9 | Missing: quartal, quintal, power, cluster |
| Scale families | 4 (Major, Natural Minor, Melodic Minor, Harmonic Minor) | **Missing Harmonic Major and all non-diatonic scales** |
| Total modes | 28 (7 × 4 families) | Missing 7 Harmonic Major modes |
| Chord-scale matrix entries | 28 | Missing Harmonic Major family (7 entries) |
| Chord qualities in matrix | 7 | Missing: dim triad, aug triad, 7♯5, 7♭5, 6, m6 |
| Preset progressions | 9 | Light — missing jazz standards, minor key, cadences |
| Explicit arpeggio module | 0 | **No dedicated arpeggio system** |
| Enharmonic handling | Minimal | Sharps-only noteNames; no proper enharmonic resolution |
| Symmetric scales | 0 | **None** (whole tone, diminished, augmented all missing) |
| Pentatonic variants | 0 | **Only via Tonal.js, not in app data** |
| Blues scales | 0 | **Not in app data** |
| Bebop scales | 0 | **Not in app data** |
| World/ethnic scales | 0 | **None** |

### Accuracy Issues Found

#### 🔴 Critical (Incorrect or Misleading)

1. **Melodic Minor degree 7 chord quality is wrong**
   - Current: `m7b5` for Super Locrian (Altered)
   - Correct: The 7th mode of melodic minor typically generates a **diminished triad** or **m7♭5**, but in jazz practice the Altered scale is paired with **dominant 7th altered chords** (7alt), not m7♭5. The matrix should note this discrepancy or add a `jazzChordQuality` field.

2. **Harmonic Minor degree 4 chord quality `m7` is debatable**
   - Dorian ♯4 generates `m7` in strict tertian harmony, which is correct for the basic chord — but the characteristic ♯4 (♯11) is lost. Should note the characteristic tension.

3. **`noteNames` array is sharps-only** (`['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']`)
   - This means D♭ major scale would display as `C#, D#, F, F#, G#, A#, C` instead of `Db, Eb, F, Gb, Ab, Bb, C`
   - **Every flat key is misspelled** in contexts using this array
   - Tonal.js handles this correctly internally, but the app's own `noteNames` array is used in tab-renderer.ts and chord progression builder

4. **`midiToVexflow()` skips all sharps/flats** — returns `null` for chromatic notes, making the notation module unable to render accidentals

5. **Piano voicing roots mix conventions inconsistently**: C#, Eb, F#, Ab, Bb — some sharp, some flat, with no clear rule

#### 🟡 Moderate (Gaps/Incomplete)

6. **No Harmonic Major scale family** — this is the 4th essential parent scale (after Major, Melodic Minor, Harmonic Minor). Missing 7 modes and their chord-scale relationships.

7. **No symmetric scales** — Whole Tone, Diminished (both W-H and H-W), Augmented hexatonic, Tritone. These are fundamental to jazz harmony.

8. **No pentatonic system** — Major/minor pentatonic, modes of pentatonic, Japanese scales (Hirajoshi, Kumoi, Iwato, In Sen)

9. **No blues scales** — Neither minor blues (hexatonic) nor major blues

10. **No bebop scales** — Bebop dominant, major, Dorian, melodic minor, harmonic minor

11. **No dedicated arpeggio module** — Chord tones exist via Tonal.js `Chord.get()` but no structured arpeggio practice system with patterns, inversions, or sequences

12. **Chord-scale matrix only maps 7 chord qualities** — Real jazz harmony needs: 6, m6, 7♯5, 7♭5, 7♯11, 7♭9, 7alt, dim triad, aug triad, sus chords, all with scale recommendations

13. **No avoid notes documented** — Critical for chord-scale theory (e.g., avoid F over Cmaj7/Ionian, avoid ♭2 over Locrian)

#### 🟢 Minor (Enhancement Opportunities)

14. **Progressions are pop-centric** — Missing: ii-V-i (minor), Bird changes, Coltrane changes, backdoor ii-V, rhythm changes bridge, Andalusian cadence, line cliché, all classical cadence types

15. **No modulation support** — No pivot chord identification, no common-tone modulation, no sequential modulation patterns

16. **No interval reference system** — No interval identification, compound intervals, interval inversions

17. **No Upper Structure Triad data** — Important for advanced jazz voicings

18. **No circle of fifths visualization data** — Key relationships, relative majors/minors

---

## Part 2: Comprehensive Gap Analysis

### Scales Missing (By Family)

#### Harmonic Major Modes (7 modes) — **HIGH PRIORITY**
| Mode | Degree | Semitones | Common Name |
|------|--------|-----------|-------------|
| Harmonic Major | I | [0,2,4,5,7,8,11] | Ionian ♭6 |
| Dorian ♭5 | II | [0,2,3,5,6,9,10] | — |
| Phrygian ♭4 | III | [0,1,3,4,7,8,10] | Altered ♮5 |
| Lydian ♭3 | IV | [0,2,3,6,7,9,11] | Melodic Minor ♯4 |
| Mixolydian ♭2 | V | [0,1,4,5,7,9,10] | — |
| Lydian Augmented ♯2 | VI | [0,3,4,6,8,9,11] | — |
| Locrian ♭♭7 | VII | [0,1,3,5,6,8,9] | — |

#### Symmetric Scales — **HIGH PRIORITY**
| Scale | Semitones | Step Pattern | Notes |
|-------|-----------|-------------|-------|
| Whole Tone | [0,2,4,6,8,10] | W-W-W-W-W-W | 6 notes, 2 transpositions |
| Diminished (W-H) | [0,2,3,5,6,8,9,11] | W-H-W-H-W-H-W-H | 8 notes, 3 transpositions |
| Diminished (H-W) | [0,1,3,4,6,7,9,10] | H-W-H-W-H-W-H-W | 8 notes, 3 transpositions |
| Augmented (Hexatonic) | [0,3,4,7,8,11] | m3-H-m3-H-m3-H | 6 notes, 4 transpositions |
| Chromatic | [0,1,2,3,4,5,6,7,8,9,10,11] | all H | 12 notes |
| Tritone | [0,1,4,6,7,10] | H-M3-W-H-M3-W | 6 notes |

#### Pentatonic Scales — **HIGH PRIORITY**
| Scale | Semitones |
|-------|-----------|
| Major Pentatonic | [0,2,4,7,9] |
| Minor Pentatonic | [0,3,5,7,10] |
| Egyptian/Suspended | [0,2,5,7,10] |
| Blues Minor/Man Gong | [0,3,5,8,10] |
| Blues Major/Ritusen | [0,2,5,7,9] |
| Dominant Pentatonic | [0,2,4,7,10] |
| Minor 6 Pentatonic | [0,3,5,7,9] |
| Kumoi | [0,2,3,7,9] |
| Hirajoshi | [0,2,3,7,8] |
| Iwato | [0,1,5,6,10] |
| In Sen | [0,1,5,7,10] |

#### Blues Scales — **HIGH PRIORITY**
| Scale | Semitones | Description |
|-------|-----------|-------------|
| Minor Blues (Hexatonic) | [0,3,5,6,7,10] | Minor pent + ♭5 |
| Major Blues | [0,2,3,4,7,9] | Major pent + ♭3/♯2 |

#### Bebop Scales — **MEDIUM PRIORITY**
| Scale | Semitones | Description |
|-------|-----------|-------------|
| Bebop Dominant | [0,2,4,5,7,9,10,11] | Mixolydian + ♮7 |
| Bebop Major | [0,2,4,5,7,8,9,11] | Major + ♯5/♭6 |
| Bebop Dorian | [0,2,3,4,5,7,9,10] | Dorian + ♮3 |
| Bebop Melodic Minor | [0,2,3,5,7,8,9,11] | Mel minor + ♮6 |
| Bebop Harmonic Minor | [0,2,3,5,7,8,10,11] | Harm minor + ♭7 |

#### World/Ethnic Scales — **MEDIUM PRIORITY** (select most important)
| Scale | Semitones | Origin | Also Known As |
|-------|-----------|--------|---------------|
| Double Harmonic Major | [0,1,4,5,7,8,11] | Byzantine/Arabic | Hijaz Kar, Bhairav |
| Double Harmonic Minor | [0,2,3,6,7,8,11] | Hungarian Minor | Gypsy Minor |
| Hungarian Major | [0,3,4,6,7,9,10] | — | — |
| Neapolitan Major | [0,1,3,5,7,9,11] | — | — |
| Neapolitan Minor | [0,1,3,5,7,8,11] | — | — |
| Persian | [0,1,4,5,6,8,11] | — | — |
| Enigmatic | [0,1,4,6,8,10,11] | — | — |
| Prometheus | [0,2,4,6,9,10] | Scriabin | — |
| Spanish 8-Tone | [0,1,3,4,5,6,8,10] | Flamenco | — |
| Algerian | [0,2,3,6,7,8,11] | North Africa | ≈ Hungarian Minor |

### Chord Types Missing

#### Essential Missing Chords — **HIGH PRIORITY**
| Type | Intervals (semitones) | Symbol |
|------|-----------------------|--------|
| Power chord | [0,7] | C5 |
| Minor 6th | [0,3,7,9] | Cm6 |
| Minor 6/9 | [0,3,7,9,14] | Cm6/9 |
| Minor add 9 | [0,3,7,14] | Cm(add9) |
| 7sus2 | [0,2,7,10] | C7sus2 |
| 9sus4 | [0,5,7,10,14] | C9sus4 |
| 13sus4 | [0,5,7,10,14,21] | C13sus4 |
| Augmented Major 7 | [0,4,8,11] | Cmaj7♯5 |
| Diminished Major 7 | [0,3,6,11] | C°(maj7) |
| 9♭5 | [0,4,6,10,14] | C9♭5 |
| 9♯5 | [0,4,8,10,14] | C9♯5 |
| Minor-Major 11 | [0,3,7,11,14,17] | Cm(maj11) |
| 13♭9 | [0,4,7,10,13,21] | C13♭9 |
| 13♯11 | [0,4,7,10,14,18,21] | C13♯11 |
| 7♭9♭13 | [0,4,7,10,13,20] | C7♭9♭13 |
| 7♯9♯5 | [0,4,8,10,15] | C7♯9♯5 |
| 7♯9♭5 | [0,4,6,10,15] | C7♯9♭5 |
| 7♭9♯11 | [0,4,7,10,13,18] | C7♭9♯11 |

#### Quartal/Quintal Voicings — **MEDIUM PRIORITY**
| Type | Semitones | Description |
|------|-----------|-------------|
| 3-note quartal | [0,5,10] | Stacked 4ths |
| 4-note quartal | [0,5,10,15] | "So What" open |
| So What chord | [0,5,10,15,19] | "Kind of Blue" |
| 3-note quintal | [0,7,14] | Stacked 5ths |

### Progressions Missing

#### Jazz Essentials — **HIGH PRIORITY**
| Progression | Roman Numerals |
|------------|----------------|
| ii-V-i (minor) | iiø7 → V7♭9 → i(maj7) |
| iii-vi-ii-V (full turnaround) | iii7 → vi7 → ii7 → V7 |
| Bird Changes | I → ♯ivø-VII7 → iii-VI7 → ii-V7 |
| Coltrane Changes | I → V7/♭III → ♭III → V7/V → V... |
| Backdoor ii-V | iv7 → ♭VII7 → I |
| Tritone Sub ii-V | ii7 → ♭II7 → I |
| Tadd Dameron Turnaround | I → ♭VI → ♭II7 → I |
| Ladybird Turnaround | I → ♭III → ♭VI → ♭II7 |
| Rhythm Changes (A + Bridge) | Full 32-bar AABA |
| Jazz Blues (with subs) | Full 12-bar with tritone subs |
| Bird Blues | Full 12-bar Charlie Parker changes |
| Minor Blues | Full 12-bar minor form |
| Chromatic bass line cliché | Cm → Cm(maj7) → Cm7 → Cm6 |
| Andalusian Cadence | i → ♭VII → ♭VI → V |

#### Classical Cadences — **MEDIUM PRIORITY**
| Cadence | Pattern |
|---------|---------|
| Perfect Authentic (PAC) | V → I (root position, soprano on tonic) |
| Imperfect Authentic (IAC) | V → I (inversion or soprano not on tonic) |
| Half Cadence | ? → V |
| Plagal | IV → I |
| Deceptive | V → vi |
| Phrygian Half | iv6 → V (in minor) |
| Picardy Third | minor v → major I |

### Chord-Scale Relationships Missing

#### Expanded Chord-Scale Matrix Entries Needed
| Chord Quality | Primary Scale | Secondary Options |
|--------------|---------------|-------------------|
| 7♯11 | Lydian Dominant | — |
| 7♭9 | HW Diminished | Phrygian Dominant |
| 7♯9 | HW Diminished | Altered |
| 7alt | Altered | — |
| 7♯5 | Whole Tone | Altered |
| 7♭5 | Whole Tone | Lydian Dominant |
| 7♭9♭13 | Phrygian Dominant | — |
| dim triad | WH Diminished | — |
| aug triad | Whole Tone | Lydian Augmented |
| sus4 | Mixolydian | Dorian |
| 6 | Ionian | Lydian |
| m6 | Dorian | Melodic Minor |
| 7sus4 | Mixolydian | — |

#### Avoid Notes Table (New)
| Chord/Scale | Avoid Note(s) | Reason |
|-------------|---------------|--------|
| Imaj7 / Ionian | 4th | ♭9 from 3rd |
| iiim7 / Phrygian | ♭2, ♭6 | ♭9 from root, ♭9 from 5th |
| V7 / Mixolydian | 4th | ♭9 from 3rd |
| vim7 / Aeolian | ♭6 | ♭9 from 5th |
| viiø / Locrian | ♭2 | ♭9 from root |

---

## Part 3: Accuracy & Naming Convention Decisions

The app must make explicit choices on contested areas. Proposed conventions:

### Scale Naming Convention (pick one name, list aliases)

| Primary Name (App) | Aliases (shown in UI) | Rationale |
|---|---|---|
| Altered | Super Locrian, Diminished Whole Tone | "Altered" is most used in jazz |
| Lydian Dominant | Overtone Scale, Acoustic, Lydian ♭7 | "Lydian Dominant" is clearest |
| Locrian ♮2 | Half-Diminished Scale, Aeolian ♭5 | Describes the modification clearly |
| Mixolydian ♭6 | Hindu Scale, Aeolian Dominant | Describes the modification clearly |
| Dorian ♯4 | Romanian Minor, Ukrainian Dorian | Modal naming is consistent |
| Double Harmonic Major | Byzantine, Arabic, Hijaz Kar, Bhairav | "Double Harmonic Major" is unambiguous |
| Double Harmonic Minor | Hungarian Minor, Gypsy Minor | Must specify Major/Minor to avoid confusion |
| Phrygian Dominant | Freygish, Spanish Phrygian, Hijaz | "Phrygian Dominant" matches chord-scale theory |
| Diminished (W-H) | Octatonic, Whole-Half Diminished | Always specify W-H or H-W |
| Diminished (H-W) | Half-Whole Diminished, Dominant Diminished | "H-W" for dominant 7th contexts |

### Chord Symbol Convention

| Convention Decision | Choice | Rationale |
|---|---|---|
| Major 7th | `Cmaj7` | Most widely recognized |
| Minor | `Cm` | Shorter than Cmin, clearer than C- |
| Half-diminished | `Cm7♭5` primary, `Cø7` secondary | Descriptive + standard jazz symbol |
| Diminished 7th | `Cdim7` primary, `C°7` secondary | Avoid ambiguity with dim triad |
| Diminished triad | `Cdim` | Distinct from dim7 |
| Minor-Major 7th | `Cm(maj7)` | Parentheses prevent confusion |
| Altered | `C7alt` | Standard jazz |
| Suspended | `Csus4` (never just "sus") | Always explicit |
| Add chords | `Cadd9` (not `Cadd2`) | 9 = above octave convention |

### Melodic Minor Convention
- **Use ascending (jazz) melodic minor exclusively** — display as single ascending form
- **Label it**: "Melodic Minor (Jazz Minor)" with note: "Classical melodic minor descends as natural minor"

### 13th Chord Convention
- **Omit the 11th in dominant 13ths** in voicings — natural 11 clashes with major 3rd
- **Include full theoretical formula** in the data but mark 11th as "typically omitted"
- **Minor 13ths retain the 11th** — no clash with minor 3rd

### ♭5 vs ♯11
- `C7♭5` = 5th is lowered (no natural 5th present): [0,4,6,10]
- `C7♯11` = ♯11 added, natural 5th retained: [0,4,7,10,18]
- **These are different chords** — app must treat them separately

---

## Part 4: Implementation Plan

### Architecture: New Data Layer

```
src/data/
├── scales/
│   ├── scale-registry.ts        # Central scale type system
│   ├── diatonic-modes.ts         # Major (7), Nat Minor (7) 
│   ├── melodic-minor-modes.ts    # 7 modes
│   ├── harmonic-minor-modes.ts   # 7 modes
│   ├── harmonic-major-modes.ts   # 7 modes [NEW]
│   ├── symmetric-scales.ts       # Whole tone, diminished, augmented [NEW]
│   ├── pentatonic-scales.ts      # Pentatonic variants + Japanese [NEW]
│   ├── blues-scales.ts           # Blues hexatonic + major blues [NEW]
│   ├── bebop-scales.ts           # All bebop variants [NEW]
│   └── world-scales.ts           # Ethnic/world scales [NEW]
├── chords/
│   ├── chord-registry.ts         # Central chord type system [REFACTOR]
│   ├── chord-library.ts          # Existing (refactored)
│   └── chord-types.ts            # All chord type definitions with intervals [NEW]
├── arpeggios/
│   ├── arpeggio-registry.ts      # Arpeggio types and patterns [NEW]
│   └── arpeggio-patterns.ts      # Practice patterns (1235, 1357, etc.) [NEW]
├── progressions/
│   ├── progression-registry.ts    # Progression system [REFACTOR]
│   ├── jazz-progressions.ts       # Jazz standards [NEW]
│   ├── blues-progressions.ts      # Blues forms [NEW]
│   ├── pop-progressions.ts        # Pop/rock (existing, expanded)
│   └── cadences.ts                # Classical cadence types [NEW]
├── chord-scale-matrix.ts          # Existing (expanded)
├── chord-scale-extended.ts        # Extended chord-scale mappings [NEW]
├── avoid-notes.ts                 # Avoid note rules [NEW]
├── intervals.ts                   # Interval definitions and utilities [NEW]
└── enharmonics.ts                 # Enharmonic resolution engine [NEW]
```

### Type System

```typescript
// scale-registry.ts
interface ScaleDefinition {
  id: string;                          // "major", "dorian", "whole-tone"
  name: string;                        // Primary display name
  aliases: string[];                   // Alternative names
  family: ScaleFamily;                 // "diatonic" | "melodic-minor" | "harmonic-minor" | "harmonic-major" | "symmetric" | "pentatonic" | "blues" | "bebop" | "world"
  parentScale?: string;                // Parent scale ID (for modes)
  degree?: number;                     // Degree within parent (for modes)
  semitones: number[];                 // Interval formula as semitones from root
  stepPattern: string;                 // "W-W-H-W-W-W-H"
  noteCount: number;                   // 5, 6, 7, 8, 12
  transpositions?: number;             // For symmetric scales (e.g., 3 for diminished)
  characteristicNote?: string;         // What makes this mode unique (e.g., "♯4" for Lydian)
  chordQualities?: string[];           // Chord qualities this scale pairs with
  avoidNotes?: AvoidNote[];            // Notes to avoid
  description: string;                 // Musical character description
  tags: string[];                      // ["jazz", "classical", "world", "beginner"]
}

// chord-types.ts
interface ChordTypeDefinition {
  id: string;                          // "maj7", "m7b5", "7alt"
  name: string;                        // "Major 7th"
  symbols: string[];                   // ["Cmaj7", "CΔ7", "CM7"]
  primarySymbol: string;               // "Cmaj7"
  semitones: number[];                 // [0, 4, 7, 11]
  intervals: string[];                 // ["R", "3", "5", "7"]
  family: ChordFamily;                 // "major" | "minor" | "dominant" | "diminished" | "augmented" | "suspended" | "altered" | "quartal"
  category: ChordCategory;            // "triad" | "seventh" | "sixth" | "extended" | "altered" | "add" | "sus" | "power" | "special"
  optionalOmissions?: number[];        // Semitones that are commonly omitted (e.g., 17 in dom13)
  scales: string[];                    // Scale IDs that pair with this chord
  description: string;
  tags: string[];
}

// enharmonics.ts
interface EnharmonicEngine {
  resolveForKey(note: string, key: string): string;     // "C#" in Db major → "Db"
  resolveForChord(note: string, chord: string): string;  // Proper chord spelling
  resolveForScale(notes: string[], scaleName: string): string[];  // Full scale spelling
  getPreferredSpelling(semitone: number, context: EnharmonicContext): string;
}

// intervals.ts
interface IntervalDefinition {
  semitones: number;
  shortName: string;     // "m3"
  fullName: string;      // "Minor Third"
  quality: string;       // "minor" | "major" | "perfect" | "augmented" | "diminished"
  number: number;        // 3
  isCompound: boolean;   // false for <12 semitones
  simpleEquivalent?: string;  // For compound intervals
  inversion: string;     // "M6" for m3
}
```

### Phase 1: Foundation (Enharmonics + Type System)
**Priority: CRITICAL — blocks everything else**
**Effort: ~3 days**

1. **Build `enharmonics.ts`** — Proper enharmonic resolution engine
   - Key-aware note spelling (Db in Db major, not C#)
   - Chord-aware spelling (♯9 not ♭3 in dominant context)
   - Scale-aware spelling (each letter name appears once in 7-note scales)
   - Replace sharps-only `noteNames` array with context-aware system
   
2. **Build `intervals.ts`** — Complete interval reference
   - All simple intervals (P1 through P8)
   - All compound intervals (m9 through M13)
   - Interval qualities, inversions, enharmonic equivalents
   
3. **Build `scale-registry.ts`** and `chord-types.ts` type systems
   - Centralized definitions with validation
   - Every entry has semitone formula + step pattern + aliases

### Phase 2: Scale Library Expansion
**Priority: HIGH**
**Effort: ~2 days**

1. **Add Harmonic Major modes** (7 modes) to chord-scale matrix
2. **Add symmetric scales**: Whole Tone, Diminished (W-H), Diminished (H-W), Augmented, Chromatic, Tritone
3. **Add pentatonic family**: Major/minor pent, all modes, Kumoi, Hirajoshi, Iwato, In Sen
4. **Add blues scales**: Minor blues, major blues
5. **Add bebop scales**: Dominant, major, Dorian, melodic minor, harmonic minor
6. **Add world scales** (top 10): Double Harmonic Major/Minor, Hungarian Major, Neapolitan Major/Minor, Persian, Enigmatic, Prometheus, Spanish 8-Tone, Algerian

### Phase 3: Chord Library Expansion
**Priority: HIGH**
**Effort: ~2 days**

1. **Add missing chord types**: Power, m6, m6/9, m(add9), 7sus2, 9sus4, 13sus4, aug-maj7, dim-maj7, 9♭5, 9♯5, all double-altered dominants
2. **Add quartal/quintal voicings**: So What chord, stacked 4ths/5ths
3. **Refactor chord library** to use ChordTypeDefinition system
4. **Validate all existing chord interval formulas** against Tonal.js output

### Phase 4: Chord-Scale Matrix Expansion
**Priority: HIGH**
**Effort: ~1 day**

1. **Add Harmonic Major family** (7 new entries)
2. **Add extended chord-scale mappings** for all dominant alterations
3. **Add avoid notes** for every chord-scale pairing
4. **Add primary/secondary scale recommendations** per chord quality
5. **Add Upper Structure Triad data**

### Phase 5: Arpeggio System
**Priority: MEDIUM**
**Effort: ~2 days**

1. **Build arpeggio registry** — every chord type generates an arpeggio
2. **Add arpeggio practice patterns**: ascending, descending, broken, 1-3-5-7, 1-2-3-5, digital patterns
3. **Add diatonic arpeggio sequences** — arpeggios through a key (I-ii-iii-IV-V-vi-vii)
4. **Connect to existing piano/guitar visualization**

### Phase 6: Progression Library Expansion
**Priority: MEDIUM**
**Effort: ~1 day**

1. **Add all jazz essentials**: Minor ii-V-i, Bird changes, Coltrane changes, backdoor ii-V, tritone sub ii-V, Dameron/Ladybird turnarounds, rhythm changes
2. **Add blues forms**: Jazz blues, Bird blues, minor blues
3. **Add classical cadences**: PAC, IAC, half, plagal, deceptive, Phrygian half
4. **Add harmonic sequences**: Circle of fifths, chromatic line cliché, diatonic/chromatic planing
5. **Add modulation patterns**

### Phase 7: Validation & Testing
**Priority: CRITICAL (runs parallel)**
**Effort: ~2 days**

1. **Cross-reference every semitone formula** against Tonal.js output
2. **Write tests for enharmonic engine** — every key, every chord spelling
3. **Write tests for chord-scale relationships** — verify scale notes contain all chord tones
4. **Spot-check against authoritative references**: Mark Levine "Jazz Theory Book", Bert Ligon "Jazz Theory Resources", Kostka/Payne "Tonal Harmony"
5. **Test edge cases**: F♭, C♭, E♯, B♯ in appropriate keys; double flats in dim7 chords; enharmonic key equivalents (C♯/D♭, F♯/G♭)

---

## Part 5: Naming Ambiguity Reference

The app should include an "aliases/also known as" system. This table documents known naming conflicts for implementation:

| Scale/Chord | Name Conflict | App Decision |
|---|---|---|
| Mode 7 of Melodic Minor | Super Locrian / Altered / Diminished Whole Tone | **Altered** (primary), others as aliases |
| Mode 4 of Melodic Minor | Lydian Dominant / Overtone / Acoustic / Lydian ♭7 | **Lydian Dominant** (primary) |
| Mode 5 of Melodic Minor | Mixolydian ♭6 / Hindu / Aeolian Dominant | **Mixolydian ♭6** (primary) |
| [0,1,4,5,7,8,11] | Double Harmonic Major / Byzantine / Arabic / Hijaz Kar / Gypsy Major | **Double Harmonic Major** (primary) |
| [0,2,3,6,7,8,11] | Double Harmonic Minor / Hungarian Minor / Gypsy Minor | **Double Harmonic Minor** (primary), note: **NOT the same as Double Harmonic Major** |
| [0,2,3,5,6,8,9,11] | Diminished (W-H) / Whole-Half / Octatonic | **Diminished (W-H)** — always specify direction |
| [0,1,3,4,6,7,9,10] | Diminished (H-W) / Half-Whole / Dominant Diminished | **Diminished (H-W)** — always specify direction |
| Cdim vs Cdim7 | Ambiguous: triad or 7th? | **Cdim** = triad, **Cdim7** = 7th chord, always explicit |
| Csus | Ambiguous: sus4 or sus2? | **Never use "sus" alone** — always Csus4 or Csus2 |
| C- | C minor or something else? | **Use Cm** — avoid "C-" |
| CM | C major triad or Cmaj7? | **Use C for triad, Cmaj7 for seventh** — avoid "CM" |

---

## Summary: Total New Content

| Category | Current | After Implementation | Delta |
|----------|---------|---------------------|-------|
| Scale types | 28 modes (4 families) | 85+ scales (10 families) | +57 |
| Chord types | ~25 types | 50+ types | +25 |
| Chord library entries | ~150 | ~200+ | +50 |
| Chord-scale matrix | 28 entries | 50+ entries | +22 |
| Progressions | 9 presets | 30+ presets | +21 |
| Arpeggios | 0 (implicit) | 30+ patterns | +30 |
| Cadence types | 0 | 7 | +7 |
| Interval definitions | 0 | 25 | +25 |

**Total estimated effort: ~13 days across 7 phases**

Phase 1 (Foundation) is blocking — nothing else can be accurate without proper enharmonic handling. Phases 2-6 can partially parallelize. Phase 7 runs continuously.
