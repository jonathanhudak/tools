import { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { listProjects, deleteProject } from '../lib/storage';
import type { SavedProject } from '../lib/storage';

/* ── Projects Panel (modal) ── */
export function ProjectsPanel({
  open,
  onClose,
  onLoadProject,
}: {
  open: boolean;
  onClose: () => void;
  onLoadProject: (id: string) => void;
}) {
  const projectId = useStore((s) => s.projectId);
  const [projectList, setProjectList] = useState<SavedProject[]>([]);

  useEffect(() => {
    if (open) listProjects().then(setProjectList);
  }, [open]);

  if (!open) return null;

  return (
    <div className="projects-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="projects-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 16 }}>Projects</h3>
          <button className="track-btn" onClick={onClose}>✕</button>
        </div>
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {projectList.length === 0 && (
            <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>No saved projects yet.</p>
          )}
          {projectList.map((p) => (
            <div key={p.id} className="project-item" style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
              border: p.id === projectId ? '2px solid var(--color-text)' : '1px solid var(--color-border)',
              marginBottom: 4, fontFamily: 'var(--font-mono)', fontSize: 13,
              background: p.id === projectId ? 'var(--color-surface)' : 'transparent',
            }}>
              <span style={{ flex: 1, fontWeight: p.id === projectId ? 700 : 400 }}>{p.name}</span>
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                {new Date(p.updatedAt).toLocaleDateString()}
              </span>
              <button className="track-btn" onClick={() => onLoadProject(p.id)}>Load</button>
              <button className="track-btn" onClick={async () => { await deleteProject(p.id); setProjectList(await listProjects()); }}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
