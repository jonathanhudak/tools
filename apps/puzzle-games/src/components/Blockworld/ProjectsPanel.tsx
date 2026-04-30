import { useState, useEffect } from "react";
import { Modal } from "../Modal";
import {
  BlockworldProject,
  listProjects,
  deleteProject,
  renameProject,
} from "./storage";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentProjectId: string | null;
  onLoad: (project: BlockworldProject) => void;
  onNew: () => void;
}

export function ProjectsPanel({
  isOpen,
  onClose,
  currentProjectId,
  onLoad,
  onNew,
}: Props) {
  const [projects, setProjects] = useState<BlockworldProject[]>([]);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");

  useEffect(() => {
    if (isOpen) setProjects(listProjects());
  }, [isOpen]);

  const refresh = () => setProjects(listProjects());

  const handleDelete = (p: BlockworldProject) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    deleteProject(p.id);
    refresh();
  };

  const handleRenameStart = (p: BlockworldProject) => {
    setRenamingId(p.id);
    setRenameDraft(p.name);
  };

  const handleRenameCommit = (id: string) => {
    const name = renameDraft.trim();
    if (name.length > 0) {
      renameProject(id, name);
      refresh();
    }
    setRenamingId(null);
    setRenameDraft("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🧱 Blockworld Projects">
      <div className="bw-projects">
        <button
          className="bw-projects-new"
          onClick={() => {
            onNew();
            onClose();
          }}
        >
          + New Project
        </button>

        {projects.length === 0 ? (
          <p className="bw-projects-empty">No saved projects yet.</p>
        ) : (
          <ul className="bw-projects-list">
            {projects.map((p) => {
              const isCurrent = p.id === currentProjectId;
              const isRenaming = renamingId === p.id;
              return (
                <li
                  key={p.id}
                  className={`bw-projects-item ${isCurrent ? "current" : ""}`}
                >
                  {isRenaming ? (
                    <form
                      className="bw-projects-rename"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleRenameCommit(p.id);
                      }}
                    >
                      <input
                        type="text"
                        value={renameDraft}
                        onChange={(e) => setRenameDraft(e.target.value)}
                        autoFocus
                        onBlur={() => handleRenameCommit(p.id)}
                      />
                    </form>
                  ) : (
                    <button
                      className="bw-projects-name"
                      onClick={() => {
                        onLoad(p);
                        onClose();
                      }}
                      title="Load project"
                    >
                      <span className="name">{p.name}</span>
                      <span className="meta">
                        {p.blocks.length} block{p.blocks.length === 1 ? "" : "s"} ·{" "}
                        {new Date(p.updatedAt).toLocaleDateString()}
                        {isCurrent && " · current"}
                      </span>
                    </button>
                  )}
                  <div className="bw-projects-actions">
                    <button
                      onClick={() => handleRenameStart(p)}
                      aria-label="Rename"
                      title="Rename"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      aria-label="Delete"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}
