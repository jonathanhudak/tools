export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

const NOTE_RANGES: Record<string, Record<DifficultyLevel, string>> = {
  piano: { beginner: 'c4-c5', intermediate: 'c4-g5', advanced: 'a3-c6' },
  'piano-virtual': { beginner: 'c4-c5', intermediate: 'c4-g5', advanced: 'a3-c6' },
  guitar: { beginner: 'e2-e4', intermediate: 'e2-a4', advanced: 'e2-e5' },
  violin: { beginner: 'g3-g4', intermediate: 'g3-c5', advanced: 'g3-g5' },
};

export function getNoteRange(instrument: string, difficulty: DifficultyLevel): string {
  return NOTE_RANGES[instrument]?.[difficulty] ?? NOTE_RANGES.piano[difficulty];
}
