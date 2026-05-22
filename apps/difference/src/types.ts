import type { Language } from './lib/highlight';

export type ViewMode = 'unified' | 'split';

export interface FileDiff {
  /** Stable id (the display path). */
  id: string;
  /** Path shown in the tree / header. */
  path: string;
  oldPath?: string;
  additions: number;
  deletions: number;
  status: 'added' | 'deleted' | 'renamed' | 'modified';
  language: Language;
  /** Flattened rows for the unified view. */
  unified: UnifiedRow[];
  /** Flattened rows for the split view. */
  split: SplitRow[];
  /** Every code line's raw content, used to pre-warm syntax highlighting. */
  lines: string[];
}

export type RowKind = 'hunk' | 'normal' | 'add' | 'del';

export interface UnifiedRow {
  kind: RowKind;
  content: string;
  oldNo?: number;
  newNo?: number;
}

export interface SplitCell {
  kind: 'normal' | 'add' | 'del' | 'empty';
  content: string;
  no?: number;
}

export interface SplitRow {
  kind: 'hunk' | 'change';
  /** Present when kind === 'hunk'. */
  header?: string;
  left?: SplitCell;
  right?: SplitCell;
}
