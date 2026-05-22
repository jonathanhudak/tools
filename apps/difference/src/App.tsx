import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@hudak/ui/lib/utils';
import { AlertCircle, Columns2, Rows3 } from 'lucide-react';
import { DiffInput } from './components/DiffInput';
import { FileTree } from './components/FileTree';
import { DiffView } from './components/DiffView';
import { fetchDiff, resolveGitHubUrl } from './lib/github';
import { parseDiffText } from './lib/diff';
import { highlightLines } from './lib/highlight';
import type { FileDiff, ViewMode } from './types';

const EXAMPLES = [
  { label: 'A small PR', url: 'https://github.com/sindresorhus/slugify/pull/41' },
  { label: 'A single commit', url: 'https://github.com/expressjs/express/commit/508936853' },
];

export default function App() {
  const [dark, setDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
  const [files, setFiles] = useState<FileDiff[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewMode>('unified');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [label, setLabel] = useState('');
  const [highlights, setHighlights] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const selectedFile = useMemo(
    () => files.find((f) => f.id === selectedId) ?? null,
    [files, selectedId],
  );

  const loadText = useCallback((text: string, sourceLabel = 'Pasted diff') => {
    try {
      const parsed = parseDiffText(text);
      if (parsed.length === 0) {
        setError('No file changes found in that diff.');
        return;
      }
      setError('');
      setFiles(parsed);
      setSelectedId(parsed[0].id);
      setLabel(sourceLabel);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse diff.');
    }
  }, []);

  const loadUrl = useCallback(
    async (url: string) => {
      setLoading(true);
      setError('');
      try {
        const { diffUrl, label: lbl } = resolveGitHubUrl(url);
        const text = await fetchDiff(diffUrl);
        loadText(text, lbl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load diff.');
      } finally {
        setLoading(false);
      }
    },
    [loadText],
  );

  // Auto-load from ?diff= / ?url= query param (used by the skill launcher).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get('diff') ?? params.get('url');
    if (params.get('view') === 'split') setMode('split');
    if (url) void loadUrl(url);
  }, [loadUrl]);

  // Pre-warm syntax highlighting for the selected file.
  useEffect(() => {
    if (!selectedFile) {
      setHighlights(new Map());
      return;
    }
    let cancelled = false;
    setHighlights(new Map());
    void highlightLines(selectedFile.lines, selectedFile.language).then((map) => {
      if (!cancelled) setHighlights(map);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedFile]);

  const totals = useMemo(
    () => files.reduce((acc, f) => ({ add: acc.add + f.additions, del: acc.del + f.deletions }), { add: 0, del: 0 }),
    [files],
  );

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--color-background))] text-[hsl(var(--color-foreground))]">
      <DiffInput
        loading={loading}
        dark={dark}
        onToggleTheme={() => setDark((d) => !d)}
        onLoadUrl={loadUrl}
        onLoadText={loadText}
      />

      {error && (
        <div className="flex items-center gap-2 border-b border-rose-300/50 bg-rose-500/10 px-4 py-2 text-sm text-rose-700 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {files.length === 0 ? (
        <EmptyState loading={loading} onPick={loadUrl} />
      ) : (
        <div className="flex min-h-0 flex-1">
          <aside className="flex w-72 shrink-0 flex-col border-r border-[hsl(var(--color-border))]">
            <div className="border-b border-[hsl(var(--color-border))] px-3 py-2 text-xs text-[hsl(var(--color-muted-foreground))]">
              <div className="truncate font-medium text-[hsl(var(--color-foreground))]">{label}</div>
              <div className="mt-0.5 font-mono">
                {files.length} file{files.length === 1 ? '' : 's'}{' '}
                <span className="text-emerald-600 dark:text-emerald-400">+{totals.add}</span>{' '}
                <span className="text-rose-600 dark:text-rose-400">−{totals.del}</span>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <FileTree files={files} selectedId={selectedId} onSelect={setSelectedId} />
            </div>
          </aside>

          <main className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-3 border-b border-[hsl(var(--color-border))] px-4 py-2">
              <span className="truncate font-mono text-sm">{selectedFile?.path}</span>
              <div className="ml-auto flex rounded-md border border-[hsl(var(--color-border))] p-0.5">
                <ModeButton active={mode === 'unified'} onClick={() => setMode('unified')} label="Unified">
                  <Rows3 className="h-3.5 w-3.5" />
                </ModeButton>
                <ModeButton active={mode === 'split'} onClick={() => setMode('split')} label="Split">
                  <Columns2 className="h-3.5 w-3.5" />
                </ModeButton>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              {selectedFile && <DiffView file={selectedFile} mode={mode} highlights={highlights} />}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={cn(
        'flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors',
        active
          ? 'bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))]'
          : 'text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))]',
      )}
    >
      {children}
      {label}
    </button>
  );
}

function EmptyState({ loading, onPick }: { loading: boolean; onPick: (url: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-semibold">View any GitHub diff, fast.</h1>
        <p className="mt-2 text-sm text-[hsl(var(--color-muted-foreground))]">
          Paste a pull request, commit, or compare URL — or a raw diff — and browse it with a file tree,
          unified/split views, and syntax highlighting. Large diffs stay smooth thanks to row virtualization.
        </p>
      </div>
      {!loading && (
        <div className="flex flex-wrap justify-center gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.url}
              type="button"
              onClick={() => onPick(ex.url)}
              className="rounded-md border border-[hsl(var(--color-border))] px-3 py-1.5 text-sm hover:bg-[hsl(var(--color-muted))]/50"
            >
              {ex.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
