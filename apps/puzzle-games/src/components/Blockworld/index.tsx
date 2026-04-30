import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  Camera,
  DEFAULT_CAMERA,
  clampPitch,
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

  const snapshotGesture = (shiftKey: boolean, preserveMoved = false) => {
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
    if (!preserveMoved) g.moved = false;
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

    const wasActive = pointersRef.current.size > 0;

    pointersRef.current.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
      pointerType: e.pointerType,
    });

    // If a gesture was already active (e.g. 2nd finger joins), preserve
    // the moved flag so pan doesn't re-require the drag threshold.
    snapshotGesture(e.shiftKey || isMousePan, wasActive);
    if (!wasActive) didDragRef.current = false;
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const tracked = pointersRef.current.get(e.pointerId);
    if (!tracked) return;

    // Update tracked position immediately (sync — state is in a ref)
    tracked.x = e.clientX;
    tracked.y = e.clientY;

    // Promote to drag synchronously so click-suppression works even if rAF hasn't fired
    const g = gestureRef.current;
    if (!g.mode) return;
    if (!g.moved) {
      const anchor = computeGestureAnchor();
      const dx = anchor.x - g.anchorX;
      const dy = anchor.y - g.anchorY;
      if (dx * dx + dy * dy > DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) {
        g.moved = true;
        didDragRef.current = true;
        if (pointersRef.current.size === 1 && !g.captured) {
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
            g.captured = true;
            g.capturedId = e.pointerId;
          } catch {}
        }
      }
    }

    // Coalesce state updates to one per animation frame for smooth touch perf
    scheduleCameraUpdate();
  };

  // rAF-throttled camera/pan update. Reads latest pointer state from refs.
  const rafIdRef = useRef<number | null>(null);
  const scheduleCameraUpdate = useCallback(() => {
    if (rafIdRef.current !== null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      const g = gestureRef.current;
      if (!g.mode || !g.moved) return;
      const count = pointersRef.current.size;
      const anchor = computeGestureAnchor();
      const dx = anchor.x - g.anchorX;
      const dy = anchor.y - g.anchorY;

      if (g.mode === "pinch" && count >= 2) {
        // Two-finger pan — always applied
        setPanScreen({ x: g.startPanX + dx, y: g.startPanY + dy });

        // Pinch zoom with 4% deadzone
        const dist = computeGestureDist();
        if (g.startDist > 0 && dist > 0) {
          const ratio = dist / g.startDist;
          if (Math.abs(ratio - 1) > 0.04) {
            const nextScale = Math.max(12, Math.min(200, g.startScale * ratio));
            setCamera((c) =>
              c.scale === nextScale ? c : { ...c, scale: nextScale },
            );
          }
        }
      } else if (g.mode === "orbit") {
        const yaw = g.startYaw - dx * ORBIT_SENSITIVITY;
        const pitch = clampPitch(g.startPitch - dy * ORBIT_SENSITIVITY);
        setCamera((c) =>
          c.yaw === yaw && c.pitch === pitch ? c : { ...c, yaw, pitch },
        );
      } else if (g.mode === "pan") {
        setPanScreen({ x: g.startPanX + dx, y: g.startPanY + dy });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cancel any pending rAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

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
    // Precompute rotation trig + view direction ONCE per render.
    const cy = Math.cos(camera.yaw);
    const sy = Math.sin(camera.yaw);
    const cp = Math.cos(camera.pitch);
    const sp = Math.sin(camera.pitch);
    const scale = camera.scale;

    // Inline projection: replaces project(camera, [x,y,z])
    const proj = (x: number, y: number, z: number): [number, number, number] => {
      // rotate yaw
      const x1 = cy * x + sy * z;
      const z1 = -sy * x + cy * z;
      // rotate pitch
      const y2 = cp * y - sp * z1;
      const z2 = sp * y + cp * z1;
      return [x1 * scale, -y2 * scale, z2];
    };

    // View direction (same formula as viewDir()):
    const vx = sy * cp;
    const vy = -sp;
    const vz = -cy * cp;

    const out: Face[] = [];

    // Ground tiles — only the top faces of empty ground cells.
    // Normal is (0, 1, 0) — dot with view = vy. Cull once globally, not per-tile.
    if (vy < 0) {
      for (let x = -WORLD_RADIUS; x <= WORLD_RADIUS; x++) {
        for (let z = -WORLD_RADIUS; z <= WORLD_RADIUS; z++) {
          if (blocks.has(blockKey(x, 0, z))) continue;
          const p0 = proj(x, 0, z);
          const p1 = proj(x + 1, 0, z);
          const p2 = proj(x + 1, 0, z + 1);
          const p3 = proj(x, 0, z + 1);
          out.push({
            bx: x,
            by: 0,
            bz: z,
            texture: "plain",
            face: "top",
            points: [
              [p0[0], p0[1]],
              [p1[0], p1[1]],
              [p2[0], p2[1]],
              [p3[0], p3[1]],
            ],
            depth: (p0[2] + p1[2] + p2[2] + p3[2]) * 0.25,
            isGround: true,
          });
        }
      }
    }

    // Block faces — cull internal faces (face shared with neighbor) + back-face cull
    for (const key of blocks.keys()) {
      const [x, y, z] = parseKey(key);
      const tex = blocks.get(key)!;
      for (const f of FACES) {
        const [nx, ny, nz] = f.normal;
        // Skip face if adjacent block exists
        if (blocks.has(blockKey(x + nx, y + ny, z + nz))) continue;
        // Back-face cull
        if (nx * vx + ny * vy + nz * vz >= 0) continue;
        const c0 = f.corners[0];
        const c1 = f.corners[1];
        const c2 = f.corners[2];
        const c3 = f.corners[3];
        const p0 = proj(x + c0[0], y + c0[1], z + c0[2]);
        const p1 = proj(x + c1[0], y + c1[1], z + c1[2]);
        const p2 = proj(x + c2[0], y + c2[1], z + c2[2]);
        const p3 = proj(x + c3[0], y + c3[1], z + c3[2]);
        out.push({
          bx: x,
          by: y,
          bz: z,
          texture: tex,
          face: f.id,
          points: [
            [p0[0], p0[1]],
            [p1[0], p1[1]],
            [p2[0], p2[1]],
            [p3[0], p3[1]],
          ],
          depth: (p0[2] + p1[2] + p2[2] + p3[2]) * 0.25,
        });
      }
    }

    // Painter's sort: farthest first
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

  // Precompute shade per face id once
  const shadeForFace = useMemo(() => {
    const m: Record<string, "top" | "side" | "dark"> = {};
    for (const f of FACES) m[f.id] = faceShade(f.normal);
    return m;
  }, []);

  // Delegated click on the SVG — reads target's data attrs. Avoids N closures per render.
  const onSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (didDragRef.current) return;
    const target = e.target as SVGElement;
    const bx = target.getAttribute("data-bx");
    if (bx === null) return;
    const by = target.getAttribute("data-by");
    const bz = target.getAttribute("data-bz");
    const face = target.getAttribute("data-face") as FaceId | null;
    const isGround = target.getAttribute("data-ground") === "1";
    if (!by || !bz || !face) return;
    onFaceClick(Number(bx), Number(by), Number(bz), face, isGround);
  };

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
          onClick={onSvgClick}
          onContextMenu={(e) => e.preventDefault()}
          style={{ touchAction: "none" }}
        >
          <defs>
            <PatternDefs />
          </defs>
          {faceList.map((f) => {
            const ptsStr = `${f.points[0][0]},${f.points[0][1]} ${f.points[1][0]},${f.points[1][1]} ${f.points[2][0]},${f.points[2][1]} ${f.points[3][0]},${f.points[3][1]}`;
            const shade = f.isGround ? "top" : shadeForFace[f.face];
            const fill = f.isGround ? "#ffffff" : fillRef(f.texture, shade);
            return (
              <polygon
                key={`${f.bx},${f.by},${f.bz}-${f.face}`}
                points={ptsStr}
                fill={fill}
                stroke="#000"
                strokeWidth={1}
                strokeLinejoin="miter"
                className={f.isGround ? "bw-ground" : "bw-face"}
                data-bx={f.bx}
                data-by={f.by}
                data-bz={f.bz}
                data-face={f.face}
                data-ground={f.isGround ? "1" : undefined}
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
