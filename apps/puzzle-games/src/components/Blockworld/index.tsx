import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  Camera,
  DEFAULT_CAMERA,
  project,
  viewDir,
  clampPitch,
  Vec3,
} from "./camera";
import {
  FACES,
  FaceId,
  faceAdjacencyOffset,
  faceShade,
  blockKey,
  parseKey,
} from "./geometry";
import {
  TEXTURES,
  TextureId,
  PatternDefs,
  fillRef,
} from "./textures";
import {
  BlockworldProject,
  blocksArrayToMap,
  blocksMapToArray,
  getCurrentProjectId,
  getProject,
  newProjectId,
  renameProject,
  saveProject,
  setCurrentProjectId,
} from "./storage";
import { ProjectsPanel } from "./ProjectsPanel";

type Tool = "add" | "remove" | "paint";

const WORLD_RADIUS = 12;
const WORLD_HEIGHT = 16;
const AUTOSAVE_DEBOUNCE_MS = 400;

interface Face {
  bx: number;
  by: number;
  bz: number;
  texture: TextureId;
  face: FaceId;
  /** projected screen polygon */
  points: [number, number][];
  /** average camera-space depth for painter sort */
  depth: number;
  /** for ground tiles */
  isGround?: boolean;
}

export function Blockworld() {
  const [blocks, setBlocks] = useState<Map<string, TextureId>>(new Map());
  const [tool, setTool] = useState<Tool>("add");
  const [selectedTexture, setSelectedTexture] = useState<TextureId>("crosshatch");
  const [camera, setCamera] = useState<Camera>(DEFAULT_CAMERA);

  // Project state
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>("Untitled");
  const [projectCreatedAt, setProjectCreatedAt] = useState<number>(() => Date.now());
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const hasHydratedRef = useRef(false);

  // Pan offset in screen pixels (applied after projection)
  const [panScreen, setPanScreen] = useState({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement | null>(null);
  const didDragRef = useRef(false);

  /* -------- mutations -------- */

  const withinBounds = useCallback(
    (x: number, y: number, z: number) =>
      Math.abs(x) <= WORLD_RADIUS &&
      Math.abs(z) <= WORLD_RADIUS &&
      y >= 0 &&
      y < WORLD_HEIGHT,
    [],
  );

  const addBlockAt = useCallback(
    (x: number, y: number, z: number) => {
      if (!withinBounds(x, y, z)) return;
      setBlocks((prev) => {
        if (prev.has(blockKey(x, y, z))) return prev;
        const next = new Map(prev);
        next.set(blockKey(x, y, z), selectedTexture);
        return next;
      });
    },
    [selectedTexture, withinBounds],
  );

  const removeBlockAt = useCallback((x: number, y: number, z: number) => {
    setBlocks((prev) => {
      const key = blockKey(x, y, z);
      if (!prev.has(key)) return prev;
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const paintBlockAt = useCallback(
    (x: number, y: number, z: number) => {
      setBlocks((prev) => {
        const key = blockKey(x, y, z);
        if (!prev.has(key)) return prev;
        const next = new Map(prev);
        next.set(key, selectedTexture);
        return next;
      });
    },
    [selectedTexture],
  );

  const onFaceClick = (
    bx: number,
    by: number,
    bz: number,
    face: FaceId,
    isGround: boolean,
  ) => {
    if (didDragRef.current) return;
    if (isGround) {
      if (tool === "add") addBlockAt(bx, 0, bz);
      return;
    }
    if (tool === "remove") {
      removeBlockAt(bx, by, bz);
    } else if (tool === "paint") {
      paintBlockAt(bx, by, bz);
    } else {
      const [dx, dy, dz] = faceAdjacencyOffset(face);
      addBlockAt(bx + dx, by + dy, bz + dz);
    }
  };

  /* -------- project hydrate + autosave -------- */

  // Hydrate on mount
  useEffect(() => {
    const id = getCurrentProjectId();
    if (id) {
      const p = getProject(id);
      if (p) {
        setProjectId(p.id);
        setProjectName(p.name);
        setProjectCreatedAt(p.createdAt);
        setBlocks(blocksArrayToMap(p.blocks));
        hasHydratedRef.current = true;
        return;
      }
    }
    hasHydratedRef.current = true;
  }, []);

  // Debounced autosave: only persist when there's a current projectId
  useEffect(() => {
    if (!hasHydratedRef.current || !projectId) return;
    setSaveStatus("saving");
    const t = setTimeout(() => {
      saveProject({
        id: projectId,
        name: projectName,
        createdAt: projectCreatedAt,
        updatedAt: Date.now(),
        blocks: blocksMapToArray(blocks),
      });
      setSaveStatus("saved");
      const clear = setTimeout(() => setSaveStatus("idle"), 1200);
      return () => clearTimeout(clear);
    }, AUTOSAVE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [blocks, projectId, projectName, projectCreatedAt]);

  const ensureProject = useCallback(() => {
    if (projectId) return projectId;
    const id = newProjectId();
    const now = Date.now();
    setProjectId(id);
    setProjectCreatedAt(now);
    setCurrentProjectId(id);
    saveProject({
      id,
      name: projectName,
      createdAt: now,
      updatedAt: now,
      blocks: blocksMapToArray(blocks),
    });
    return id;
  }, [projectId, projectName, blocks]);

  const saveNow = () => {
    const id = ensureProject();
    saveProject({
      id,
      name: projectName,
      createdAt: projectCreatedAt,
      updatedAt: Date.now(),
      blocks: blocksMapToArray(blocks),
    });
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 1200);
  };

  const handleLoadProject = (p: BlockworldProject) => {
    setProjectId(p.id);
    setProjectName(p.name);
    setProjectCreatedAt(p.createdAt);
    setBlocks(blocksArrayToMap(p.blocks));
    setCurrentProjectId(p.id);
  };

  const handleNewProject = () => {
    const id = newProjectId();
    const now = Date.now();
    const name = "Untitled";
    setProjectId(id);
    setProjectName(name);
    setProjectCreatedAt(now);
    setBlocks(new Map());
    setCurrentProjectId(id);
    saveProject({
      id,
      name,
      createdAt: now,
      updatedAt: now,
      blocks: [],
    });
  };

  const commitRename = () => {
    const name = nameDraft.trim();
    if (name.length > 0) {
      setProjectName(name);
      if (projectId) renameProject(projectId, name);
    }
    setEditingName(false);
    setNameDraft("");
  };

  /* -------- camera interactions -------- */

  // Multi-pointer tracking: supports 1-finger orbit + 2-finger pinch/pan on touch,
  // and mouse drag / shift-drag / wheel on desktop.
  const pointersRef = useRef<
    Map<number, { x: number; y: number; pointerType: string }>
  >(new Map());

  // Gesture state snapshot (captured at gesture start / when finger count changes)
  const gestureRef = useRef<{
    mode: "orbit" | "pan" | "pinch" | null;
    startYaw: number;
    startPitch: number;
    startScale: number;
    startPanX: number;
    startPanY: number;
    anchorX: number; // midpoint x at gesture start
    anchorY: number;
    startDist: number; // pointer distance for pinch
    captured: boolean;
    capturedId: number | null;
    moved: boolean;
  }>({
    mode: null,
    startYaw: 0,
    startPitch: 0,
    startScale: 0,
    startPanX: 0,
    startPanY: 0,
    anchorX: 0,
    anchorY: 0,
    startDist: 0,
    captured: false,
    capturedId: null,
    moved: false,
  });

  // Sensitivity tuned for touch — lower means less flinchy
  const ORBIT_SENSITIVITY = 0.005; // rad per px  (was 0.01)
  const DRAG_THRESHOLD_PX = 6; // was 4

  const computeGestureAnchor = () => {
    const pts = [...pointersRef.current.values()];
    let sx = 0;
    let sy = 0;
    for (const p of pts) {
      sx += p.x;
      sy += p.y;
    }
    const n = Math.max(1, pts.length);
    return { x: sx / n, y: sy / n };
  };

  const computeGestureDist = () => {
    const pts = [...pointersRef.current.values()];
    if (pts.length < 2) return 0;
    const dx = pts[0].x - pts[1].x;
    const dy = pts[0].y - pts[1].y;
    return Math.hypot(dx, dy);
  };

  const snapshotGesture = (shiftKey: boolean) => {
    const g = gestureRef.current;
    const count = pointersRef.current.size;
    const anchor = computeGestureAnchor();
    g.anchorX = anchor.x;
    g.anchorY = anchor.y;
    g.startYaw = camera.yaw;
    g.startPitch = camera.pitch;
    g.startScale = camera.scale;
    g.startPanX = panScreen.x;
    g.startPanY = panScreen.y;
    g.startDist = computeGestureDist();
    g.moved = false;
    if (count >= 2) {
      g.mode = "pinch";
    } else {
      // Mouse right-click / middle-click / shift = pan; otherwise orbit
      g.mode = shiftKey ? "pan" : "orbit";
    }
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    // Mouse middle / right click → pan
    const isMousePan =
      e.pointerType === "mouse" && (e.button === 1 || e.button === 2);

    pointersRef.current.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
      pointerType: e.pointerType,
    });

    snapshotGesture(e.shiftKey || isMousePan);
    didDragRef.current = false;
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const tracked = pointersRef.current.get(e.pointerId);
    if (!tracked) return;

    // Update tracked position
    tracked.x = e.clientX;
    tracked.y = e.clientY;

    const g = gestureRef.current;
    if (!g.mode) return;

    const count = pointersRef.current.size;
    const anchor = computeGestureAnchor();
    const dx = anchor.x - g.anchorX;
    const dy = anchor.y - g.anchorY;
    const movedDistSq = dx * dx + dy * dy;

    // Drag confirmation — block synthetic clicks once we've moved past threshold
    if (!g.moved && movedDistSq > DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) {
      g.moved = true;
      didDragRef.current = true;
      // Capture pointer on single-touch gestures to keep receiving events even if finger leaves SVG
      if (count === 1 && !g.captured) {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
          g.captured = true;
          g.capturedId = e.pointerId;
        } catch {}
      }
    }
    if (!g.moved) return;

    if (g.mode === "pinch" && count >= 2) {
      // Pinch zoom + two-finger pan
      const dist = computeGestureDist();
      if (g.startDist > 0 && dist > 0) {
        const ratio = dist / g.startDist;
        const nextScale = Math.max(12, Math.min(200, g.startScale * ratio));
        setCamera((c) => ({ ...c, scale: nextScale }));
      }
      // Two-finger pan — move canvas with the midpoint of the two fingers
      setPanScreen({ x: g.startPanX + dx, y: g.startPanY + dy });
    } else if (g.mode === "orbit") {
      setCamera((c) => ({
        ...c,
        yaw: g.startYaw - dx * ORBIT_SENSITIVITY,
        pitch: clampPitch(g.startPitch - dy * ORBIT_SENSITIVITY),
      }));
    } else if (g.mode === "pan") {
      setPanScreen({ x: g.startPanX + dx, y: g.startPanY + dy });
    }
  };

  const endPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    pointersRef.current.delete(e.pointerId);
    const g = gestureRef.current;
    if (g.capturedId === e.pointerId) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      g.captured = false;
      g.capturedId = null;
    }
    if (pointersRef.current.size === 0) {
      g.mode = null;
      // Reset drag guard next tick so the synthetic click is blocked
      const wasMoved = g.moved;
      setTimeout(() => {
        didDragRef.current = false;
        g.moved = false;
      }, 0);
      // If we didn't drag and it was a single tap, click fires naturally — nothing to do
      void wasMoved;
    } else {
      // Re-snapshot for the remaining pointer(s) so lifting one finger of a pinch
      // doesn't teleport anything.
      snapshotGesture(e.shiftKey);
    }
  };

  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => endPointer(e);
  const onPointerCancel = (e: React.PointerEvent<SVGSVGElement>) => endPointer(e);

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    // Much gentler zoom — wheel ticks are coarse, especially on trackpads
    const delta = -e.deltaY * 0.0012;
    setCamera((c) => {
      const next = c.scale * Math.exp(delta);
      return { ...c, scale: Math.max(12, Math.min(200, next)) };
    });
  };

  // Attach wheel non-passively (React makes onWheel passive by default → preventDefault warns).
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard: Q/E rotate, R reset
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "q" || e.key === "Q") {
        setCamera((c) => ({ ...c, yaw: c.yaw - Math.PI / 12 }));
      } else if (e.key === "e" || e.key === "E") {
        setCamera((c) => ({ ...c, yaw: c.yaw + Math.PI / 12 }));
      } else if (e.key === "r" || e.key === "R") {
        setCamera(DEFAULT_CAMERA);
        setPanScreen({ x: 0, y: 0 });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* -------- build visible face list -------- */

  const faceList: Face[] = useMemo(() => {
    const view = viewDir(camera);
    const out: Face[] = [];

    // Ground tiles — only the top faces of empty ground cells
    for (let x = -WORLD_RADIUS; x <= WORLD_RADIUS; x++) {
      for (let z = -WORLD_RADIUS; z <= WORLD_RADIUS; z++) {
        if (blocks.has(blockKey(x, 0, z))) continue;
        // top face of a "ground slab" at y=0 (slab fills y in [-0.01, 0]); treat as top at y=0
        const corners: [Vec3, Vec3, Vec3, Vec3] = [
          [x, 0, z],
          [x + 1, 0, z],
          [x + 1, 0, z + 1],
          [x, 0, z + 1],
        ];
        // back-face cull: normal is +y
        const normal: Vec3 = [0, 1, 0];
        const dot = normal[0] * view[0] + normal[1] * view[1] + normal[2] * view[2];
        if (dot >= 0) continue; // camera looking away
        const projected = corners.map((c) => project(camera, c));
        const points = projected.map(([sx, sy]) => [sx, sy] as [number, number]);
        const depth =
          (projected[0][2] + projected[1][2] + projected[2][2] + projected[3][2]) / 4;
        out.push({
          bx: x,
          by: 0,
          bz: z,
          texture: "plain",
          face: "top",
          points,
          depth,
          isGround: true,
        });
      }
    }

    // Block faces — cull internal faces (face shared with neighbor) + back-face cull
    for (const key of blocks.keys()) {
      const [x, y, z] = parseKey(key);
      const tex = blocks.get(key)!;
      for (const f of FACES) {
        // Skip face if adjacent block exists
        const [nx, ny, nz] = f.normal;
        if (blocks.has(blockKey(x + nx, y + ny, z + nz))) continue;
        // Back-face cull
        const dot = nx * viewDir(camera)[0] + ny * viewDir(camera)[1] + nz * viewDir(camera)[2];
        if (dot >= 0) continue;
        // Project 4 corners (corners are in unit-cube space, offset by block origin)
        const worldCorners: Vec3[] = f.corners.map(
          ([cx, cy, cz]) => [x + cx, y + cy, z + cz] as Vec3,
        );
        const projected = worldCorners.map((c) => project(camera, c));
        const points = projected.map(([sx, sy]) => [sx, sy] as [number, number]);
        const depth =
          projected.reduce((a, b) => a + b[2], 0) / projected.length;
        out.push({
          bx: x,
          by: y,
          bz: z,
          texture: tex,
          face: f.id,
          points,
          depth,
        });
      }
    }

    // Painter's sort: farthest first (smaller depth = farther when camera looks toward +z)
    out.sort((a, b) => a.depth - b.depth);
    return out;
  }, [blocks, camera]);

  /* -------- viewBox sizing: use actual SVG client size for full-bleed -------- */

  const [svgSize, setSvgSize] = useState({ w: 1000, h: 600 });
  useEffect(() => {
    if (!svgRef.current) return;
    const el = svgRef.current;
    const ro = new ResizeObserver(() => {
      setSvgSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const viewBox = `${-svgSize.w / 2 - panScreen.x} ${-svgSize.h / 2 - panScreen.y} ${svgSize.w} ${svgSize.h}`;

  const clearAll = () => setBlocks(new Map());

  const resetCamera = () => {
    setCamera(DEFAULT_CAMERA);
    setPanScreen({ x: 0, y: 0 });
  };

  return (
    <div className="blockworld">
      <div className="blockworld-projectbar">
        {editingName ? (
          <form
            className="bw-name-form"
            onSubmit={(e) => {
              e.preventDefault();
              commitRename();
            }}
          >
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={commitRename}
              autoFocus
            />
          </form>
        ) : (
          <button
            className="bw-name"
            onClick={() => {
              setEditingName(true);
              setNameDraft(projectName);
            }}
            title="Click to rename"
          >
            <span className="bw-name-label">{projectName}</span>
            <span className="bw-name-edit">✎</span>
          </button>
        )}
        <span className={`bw-save-status bw-save-${saveStatus}`}>
          {saveStatus === "saving" && "saving…"}
          {saveStatus === "saved" && "✓ saved"}
          {saveStatus === "idle" && projectId && "saved"}
          {!projectId && "unsaved"}
        </span>
        <div className="bw-projectbar-actions">
          <button className="tool-btn" onClick={saveNow} title="Save now">
            💾 Save
          </button>
          <button className="tool-btn" onClick={() => setProjectsOpen(true)}>
            📁 Projects
          </button>
          <button className="tool-btn" onClick={handleNewProject} title="New project">
            + New
          </button>
        </div>
      </div>

      <div className="blockworld-toolbar">
        <div className="tool-group" role="group" aria-label="Tool">
          {(["add", "remove", "paint"] as Tool[]).map((t) => (
            <button
              key={t}
              className={`tool-btn ${tool === t ? "active" : ""}`}
              onClick={() => setTool(t)}
              aria-pressed={tool === t}
            >
              {t === "add" ? "+ Add" : t === "remove" ? "− Remove" : "✎ Paint"}
            </button>
          ))}
        </div>
        <div className="tool-group" role="group" aria-label="Texture">
          {TEXTURES.map((tex) => (
            <button
              key={tex.id}
              className={`tex-btn ${selectedTexture === tex.id ? "active" : ""}`}
              onClick={() => setSelectedTexture(tex.id)}
              aria-pressed={selectedTexture === tex.id}
              aria-label={tex.label}
              title={tex.label}
            >
              <span className="tex-glyph">{tex.glyph}</span>
              <span className="tex-label">{tex.label}</span>
            </button>
          ))}
        </div>
        <div className="tool-group">
          <button className="tool-btn" onClick={resetCamera} title="Reset camera (R)">
            ⟲ View
          </button>
          <button className="tool-btn" onClick={clearAll}>
            ✕ Clear
          </button>
        </div>
      </div>

      <div className="blockworld-stage">
        <svg
          ref={svgRef}
          viewBox={viewBox}
          className="blockworld-svg"
          preserveAspectRatio="xMidYMid meet"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onContextMenu={(e) => e.preventDefault()}
          style={{ touchAction: "none" }}
        >
          <defs>
            <PatternDefs />
          </defs>
          {faceList.map((f, i) => {
            const ptsStr = f.points.map(([x, y]) => `${x},${y}`).join(" ");
            const shade = f.isGround
              ? "top"
              : faceShade(FACES.find((fd) => fd.id === f.face)!.normal);
            const fill = f.isGround ? "#ffffff" : fillRef(f.texture, shade);
            return (
              <polygon
                key={`${f.bx},${f.by},${f.bz}-${f.face}-${i}`}
                points={ptsStr}
                fill={fill}
                stroke="#000"
                strokeWidth={1}
                strokeLinejoin="miter"
                className={f.isGround ? "bw-ground" : "bw-face"}
                onClick={() =>
                  onFaceClick(f.bx, f.by, f.bz, f.face, !!f.isGround)
                }
              />
            );
          })}
        </svg>
      </div>

      <div className="blockworld-hint">
        <span>
          <b>{tool === "add" ? "Add" : tool === "remove" ? "Remove" : "Paint"}</b>
          {tool === "add" && " — click ground or a block face to build. "}
          {tool === "remove" && " — click any block to delete. "}
          {tool === "paint" && ` — click a block to apply ${TEXTURES.find((t) => t.id === selectedTexture)?.label}. `}
        </span>
        <span className="blockworld-hint-pan">
          1 finger = orbit · 2 fingers = pinch/pan · scroll/pinch = zoom
        </span>
      </div>

      <ProjectsPanel
        isOpen={projectsOpen}
        onClose={() => setProjectsOpen(false)}
        currentProjectId={projectId}
        onLoad={handleLoadProject}
        onNew={handleNewProject}
      />
    </div>
  );
}
