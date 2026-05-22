import { useMemo, useState } from 'react';
import { cn } from '@hudak/ui/lib/utils';
import { ChevronDown, ChevronRight, File } from 'lucide-react';
import type { FileDiff } from '../types';

interface TreeFile {
  type: 'file';
  name: string;
  file: FileDiff;
}
interface TreeDir {
  type: 'dir';
  name: string;
  path: string;
  children: TreeNode[];
}
type TreeNode = TreeFile | TreeDir;

function buildTree(files: FileDiff[]): TreeNode[] {
  const root: TreeDir = { type: 'dir', name: '', path: '', children: [] };
  for (const file of files) {
    const segments = file.path.split('/');
    let dir = root;
    for (let i = 0; i < segments.length - 1; i++) {
      const seg = segments[i];
      let next = dir.children.find((c): c is TreeDir => c.type === 'dir' && c.name === seg);
      if (!next) {
        next = { type: 'dir', name: seg, path: dir.path ? `${dir.path}/${seg}` : seg, children: [] };
        dir.children.push(next);
      }
      dir = next;
    }
    dir.children.push({ type: 'file', name: segments[segments.length - 1], file });
  }
  return collapse(root.children);
}

/** Collapse single-child directory chains (a/b/c -> a/b/c) like editors do. */
function collapse(nodes: TreeNode[]): TreeNode[] {
  return nodes.map((node) => {
    if (node.type !== 'dir') return node;
    let dir = node;
    while (dir.children.length === 1 && dir.children[0].type === 'dir') {
      const only = dir.children[0];
      dir = { type: 'dir', name: `${dir.name}/${only.name}`, path: only.path, children: only.children };
    }
    return { ...dir, children: collapse(dir.children) };
  }).sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

const STATUS_COLOR: Record<FileDiff['status'], string> = {
  added: 'text-emerald-600 dark:text-emerald-400',
  deleted: 'text-rose-600 dark:text-rose-400',
  renamed: 'text-violet-600 dark:text-violet-400',
  modified: 'text-amber-600 dark:text-amber-400',
};

function FileRow({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: TreeFile;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const f = node.file;
  const active = f.id === selectedId;
  return (
    <button
      type="button"
      onClick={() => onSelect(f.id)}
      title={f.path}
      style={{ paddingLeft: depth * 12 + 8 }}
      className={cn(
        'flex w-full items-center gap-1.5 py-1 pr-2 text-left text-sm transition-colors',
        active
          ? 'bg-[hsl(var(--color-primary))]/10 text-[hsl(var(--color-foreground))]'
          : 'text-[hsl(var(--color-muted-foreground))] hover:bg-[hsl(var(--color-muted))]/50',
      )}
    >
      <File className={cn('h-3.5 w-3.5 shrink-0', STATUS_COLOR[f.status])} />
      <span className="truncate">{node.name}</span>
      <span className="ml-auto shrink-0 font-mono text-[11px] tabular-nums">
        {f.additions > 0 && <span className="text-emerald-600 dark:text-emerald-400">+{f.additions}</span>}
        {f.additions > 0 && f.deletions > 0 && ' '}
        {f.deletions > 0 && <span className="text-rose-600 dark:text-rose-400">−{f.deletions}</span>}
      </span>
    </button>
  );
}

function DirRow({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: TreeDir;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{ paddingLeft: depth * 12 + 8 }}
        className="flex w-full items-center gap-1 py-1 pr-2 text-left text-sm font-medium text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-muted))]/50"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
        <span className="truncate">{node.name}</span>
      </button>
      {open &&
        node.children.map((child) =>
          child.type === 'dir' ? (
            <DirRow key={child.path} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
          ) : (
            <FileRow key={child.file.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
          ),
        )}
    </div>
  );
}

export function FileTree({
  files,
  selectedId,
  onSelect,
}: {
  files: FileDiff[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const tree = useMemo(() => buildTree(files), [files]);
  return (
    <nav className="h-full overflow-auto py-1">
      {tree.map((node) =>
        node.type === 'dir' ? (
          <DirRow key={node.path} node={node} depth={0} selectedId={selectedId} onSelect={onSelect} />
        ) : (
          <FileRow key={node.file.id} node={node} depth={0} selectedId={selectedId} onSelect={onSelect} />
        ),
      )}
    </nav>
  );
}
