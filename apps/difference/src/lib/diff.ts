import parseDiff, { type Change, type File } from 'parse-diff';
import { langForPath } from './highlight';
import type { FileDiff, SplitCell, SplitRow, UnifiedRow } from '../types';

/** Strip the leading +/-/space marker that parse-diff keeps on each line. */
function body(content: string): string {
  return content.length ? content.slice(1) : content;
}

function displayPath(file: File): { path: string; oldPath?: string } {
  const from = file.from && file.from !== '/dev/null' ? file.from : undefined;
  const to = file.to && file.to !== '/dev/null' ? file.to : undefined;
  if (from && to && from !== to) return { path: to, oldPath: from };
  return { path: to ?? from ?? 'unknown' };
}

function statusOf(file: File): FileDiff['status'] {
  if (file.new) return 'added';
  if (file.deleted) return 'deleted';
  if (file.from && file.to && file.from !== file.to) return 'renamed';
  return 'modified';
}

function buildUnified(file: File): UnifiedRow[] {
  const rows: UnifiedRow[] = [];
  for (const chunk of file.chunks) {
    rows.push({ kind: 'hunk', content: chunk.content });
    for (const change of chunk.changes) {
      if (change.type === 'normal') {
        rows.push({ kind: 'normal', content: body(change.content), oldNo: change.ln1, newNo: change.ln2 });
      } else if (change.type === 'add') {
        rows.push({ kind: 'add', content: body(change.content), newNo: change.ln });
      } else {
        rows.push({ kind: 'del', content: body(change.content), oldNo: change.ln });
      }
    }
  }
  return rows;
}

const EMPTY: SplitCell = { kind: 'empty', content: '' };

function buildSplit(file: File): SplitRow[] {
  const rows: SplitRow[] = [];
  for (const chunk of file.chunks) {
    rows.push({ kind: 'hunk', header: chunk.content });

    let dels: Change[] = [];
    let adds: Change[] = [];
    const flush = () => {
      const n = Math.max(dels.length, adds.length);
      for (let i = 0; i < n; i++) {
        const d = dels[i];
        const a = adds[i];
        rows.push({
          kind: 'change',
          left: d ? { kind: 'del', content: body(d.content), no: (d as { ln: number }).ln } : EMPTY,
          right: a ? { kind: 'add', content: body(a.content), no: (a as { ln: number }).ln } : EMPTY,
        });
      }
      dels = [];
      adds = [];
    };

    for (const change of chunk.changes) {
      if (change.type === 'del') {
        dels.push(change);
      } else if (change.type === 'add') {
        adds.push(change);
      } else {
        flush();
        rows.push({
          kind: 'change',
          left: { kind: 'normal', content: body(change.content), no: change.ln1 },
          right: { kind: 'normal', content: body(change.content), no: change.ln2 },
        });
      }
    }
    flush();
  }
  return rows;
}

export function parseDiffText(text: string): FileDiff[] {
  const files = parseDiff(text);
  return files.map((file) => {
    const { path, oldPath } = displayPath(file);
    const lines: string[] = [];
    for (const chunk of file.chunks) {
      for (const change of chunk.changes) lines.push(body(change.content));
    }
    return {
      id: path,
      path,
      oldPath,
      additions: file.additions ?? 0,
      deletions: file.deletions ?? 0,
      status: statusOf(file),
      language: langForPath(path),
      unified: buildUnified(file),
      split: buildSplit(file),
      lines,
    } satisfies FileDiff;
  });
}
