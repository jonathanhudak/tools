import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@hudak/ui/lib/utils';
import type { FileDiff, SplitCell, ViewMode } from '../types';

const ROW_HEIGHT = 20;

interface DiffViewProps {
  file: FileDiff;
  mode: ViewMode;
  highlights: Map<string, string>;
}

function Code({ text, highlights }: { text: string; highlights: Map<string, string> }) {
  const html = highlights.get(text);
  if (html !== undefined) {
    return <span className="diff-mono" dangerouslySetInnerHTML={{ __html: html || ' ' }} />;
  }
  return <span className="diff-mono">{text || ' '}</span>;
}

const GUTTER =
  'select-none text-right pr-2 pl-3 text-[11px] tabular-nums text-[hsl(var(--color-muted-foreground))]';

export function DiffView({ file, mode, highlights }: DiffViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rows = mode === 'unified' ? file.unified : file.split;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 24,
  });

  return (
    <div ref={scrollRef} className="h-full overflow-auto bg-[hsl(var(--color-background))]">
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }} className="diff-mono min-w-full">
        {virtualizer.getVirtualItems().map((vi) => {
          const style = {
            position: 'absolute' as const,
            top: 0,
            left: 0,
            width: '100%',
            height: ROW_HEIGHT,
            transform: `translateY(${vi.start}px)`,
          };

          if (mode === 'unified') {
            const row = file.unified[vi.index];
            if (row.kind === 'hunk') {
              return (
                <div
                  key={vi.key}
                  style={style}
                  className="flex bg-[hsl(var(--diff-hunk-bg))] text-[hsl(var(--color-muted-foreground))]"
                >
                  <span className="px-3 whitespace-pre">{row.content}</span>
                </div>
              );
            }
            const bg =
              row.kind === 'add'
                ? 'bg-[hsl(var(--diff-add-bg))]'
                : row.kind === 'del'
                  ? 'bg-[hsl(var(--diff-del-bg))]'
                  : '';
            const sign = row.kind === 'add' ? '+' : row.kind === 'del' ? '−' : ' ';
            return (
              <div key={vi.key} style={style} className={cn('flex', bg)}>
                <span className={cn(GUTTER, 'w-12')}>{row.oldNo ?? ''}</span>
                <span className={cn(GUTTER, 'w-12')}>{row.newNo ?? ''}</span>
                <span className="w-4 select-none text-center text-[hsl(var(--color-muted-foreground))]">{sign}</span>
                <span className="flex-1 whitespace-pre pr-4">
                  <Code text={row.content} highlights={highlights} />
                </span>
              </div>
            );
          }

          const row = file.split[vi.index];
          if (row.kind === 'hunk') {
            return (
              <div
                key={vi.key}
                style={style}
                className="flex bg-[hsl(var(--diff-hunk-bg))] text-[hsl(var(--color-muted-foreground))]"
              >
                <span className="px-3 whitespace-pre">{row.header}</span>
              </div>
            );
          }
          return (
            <div key={vi.key} style={style} className="flex">
              <SplitSide cell={row.left} side="left" highlights={highlights} />
              <div className="w-px shrink-0 bg-[hsl(var(--color-border))]" />
              <SplitSide cell={row.right} side="right" highlights={highlights} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SplitSide({
  cell,
  side,
  highlights,
}: {
  cell?: SplitCell;
  side: 'left' | 'right';
  highlights: Map<string, string>;
}) {
  const bg =
    cell?.kind === 'add'
      ? 'bg-[hsl(var(--diff-add-bg))]'
      : cell?.kind === 'del'
        ? 'bg-[hsl(var(--diff-del-bg))]'
        : cell?.kind === 'empty'
          ? 'bg-[hsl(var(--color-muted))]/30'
          : '';
  const sign = cell?.kind === 'add' ? '+' : cell?.kind === 'del' ? '−' : '';
  return (
    <div className={cn('flex min-w-0 flex-1', bg)}>
      <span className={cn(GUTTER, 'w-12', side === 'right' && 'border-l-0')}>{cell?.no ?? ''}</span>
      <span className="w-3 select-none text-center text-[hsl(var(--color-muted-foreground))]">{sign}</span>
      <span className="min-w-0 flex-1 overflow-hidden whitespace-pre pr-3">
        {cell && cell.kind !== 'empty' ? <Code text={cell.content} highlights={highlights} /> : null}
      </span>
    </div>
  );
}
