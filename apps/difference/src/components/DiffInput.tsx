import { useState } from 'react';
import { Button } from '@hudak/ui/components/button';
import { FileDiff, Github, Loader2, Moon, Sun } from 'lucide-react';

interface DiffInputProps {
  loading: boolean;
  dark: boolean;
  onToggleTheme: () => void;
  onLoadUrl: (url: string) => void;
  onLoadText: (text: string) => void;
}

export function DiffInput({ loading, dark, onToggleTheme, onLoadUrl, onLoadText }: DiffInputProps) {
  const [tab, setTab] = useState<'url' | 'paste'>('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');

  return (
    <header className="border-b border-[hsl(var(--color-border))] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-semibold text-[hsl(var(--color-foreground))]">
          <FileDiff className="h-5 w-5 text-[hsl(var(--color-primary))]" />
          <span>Difference</span>
        </div>

        <div className="flex rounded-md border border-[hsl(var(--color-border))] p-0.5 text-sm">
          {(['url', 'paste'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={
                'rounded px-2.5 py-1 capitalize transition-colors ' +
                (tab === t
                  ? 'bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))]'
                  : 'text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))]')
              }
            >
              {t === 'url' ? 'GitHub URL' : 'Paste diff'}
            </button>
          ))}
        </div>

        <div className="ml-auto">
          <Button variant="ghost" size="icon" onClick={onToggleTheme} aria-label="Toggle theme">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {tab === 'url' ? (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onLoadUrl(url);
          }}
        >
          <div className="flex flex-1 items-center gap-2 rounded-md border border-[hsl(var(--color-border))] px-3">
            <Github className="h-4 w-4 shrink-0 text-[hsl(var(--color-muted-foreground))]" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repo/pull/123 (or /commit/… or /compare/…)"
              className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-[hsl(var(--color-muted-foreground))]"
              spellCheck={false}
            />
          </div>
          <Button type="submit" disabled={loading || !url.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'View diff'}
          </Button>
        </form>
      ) : (
        <form
          className="mt-3 flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onLoadText(text);
          }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste a unified diff (git diff / .patch) here…"
            className="diff-mono h-28 w-full resize-y rounded-md border border-[hsl(var(--color-border))] bg-transparent p-2 outline-none"
            spellCheck={false}
          />
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={loading || !text.trim()}>
              View diff
            </Button>
            <label className="cursor-pointer text-sm text-[hsl(var(--color-primary))] hover:underline">
              or open a .diff / .patch file
              <input
                type="file"
                accept=".diff,.patch,.txt,text/plain"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) onLoadText(await file.text());
                }}
              />
            </label>
          </div>
        </form>
      )}
    </header>
  );
}
