import { useRef, useEffect, useCallback } from 'react';
import type { Clip, NoteEvent } from '../lib/types';

/* ── Pure helpers ── */

export function computeTotalDuration(track: { trackType: string; clips: Clip[]; notes: NoteEvent[] }): number {
  if (track.trackType === 'midi') {
    return track.notes.length > 0
      ? Math.max(...track.notes.map((n) => n.startTime + n.duration))
      : 0;
  }
  return track.clips.length > 0
    ? Math.max(...track.clips.map((c) => c.startTime + c.duration))
    : 0;
}

export function drawAudioClips(ctx: CanvasRenderingContext2D, clips: Clip[], w: number, h: number, zoom: number) {
  if (clips.length === 0) {
    ctx.fillStyle = '#999';
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('No clips — arm track & press ● to record', w / 2, h / 2);
    ctx.textAlign = 'start';
    return;
  }
  for (const clip of clips) {
    const x = clip.startTime * zoom;
    const clipW = Math.max(30, clip.duration * zoom);
    ctx.fillStyle = '#000';
    ctx.fillRect(x, 2, clipW, h - 4);
    const data = clip.buffer.getChannelData(0);
    if (data.length > 0) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const ampScale = 3.0; // scale waveform vertically for visibility
      for (let px = 0; px < clipW; px += 2) {
        const idx = Math.floor((px / clipW) * data.length);
        const sample = data[Math.min(idx, data.length - 1)] * ampScale;
        const y = h / 2 - sample * (h / 2 - 4);
        if (px === 0) ctx.moveTo(x + px, y);
        else ctx.lineTo(x + px, y);
      }
      ctx.stroke();
    }
    ctx.fillStyle = '#fff';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText(clip.name, x + 4, 14);
  }
}

export function drawPianoRoll(ctx: CanvasRenderingContext2D, notes: NoteEvent[], w: number, h: number, zoom: number) {
  if (notes.length === 0) {
    ctx.fillStyle = '#999';
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('No notes — arm track, press ●, play keys (A-K row)', w / 2, h / 2);
    ctx.textAlign = 'start';
    return;
  }

  // Auto-range: cover all recorded notes with at least 1 octave padding
  const allNotes = notes.map((n) => n.midiNote);
  const rawMin = Math.min(...allNotes);
  const rawMax = Math.max(...allNotes);
  const pad = Math.max(6, Math.ceil((rawMax - rawMin) * 0.25));
  const minNote = Math.max(0, rawMin - pad);
  const maxNote = Math.min(127, rawMax + pad);
  const noteRange = maxNote - minNote + 1;
  const rowH = h / noteRange;

  // Grid lines
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 0.5;
  for (let n = minNote; n <= maxNote; n++) {
    const y = h - (n - minNote + 1) * rowH;
    const isBlack = [1, 3, 6, 8, 10].includes(n % 12);
    ctx.fillStyle = isBlack ? '#f0f0f0' : '#fff';
    ctx.fillRect(0, y, w, rowH);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // Beat lines
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 0.5;
  ctx.setLineDash([2, 6]);
  for (let t = 0; t < w / zoom; t += 0.5) {
    const x = t * zoom;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  ctx.setLineDash([]);

  // Note blocks
  for (const note of notes) {
    const x = note.startTime * zoom;
    const nw = Math.max(4, note.duration * zoom);
    const ny = h - (note.midiNote - minNote + 1) * rowH;
    ctx.fillStyle = '#000';
    ctx.fillRect(x, ny + 1, nw, rowH - 2);
    // Label
    if (nw > 20) {
      ctx.fillStyle = '#fff';
      ctx.font = '8px "JetBrains Mono", monospace';
      const noteName = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][note.midiNote % 12];
      ctx.fillText(noteName, x + 3, ny + rowH - 4);
    }
  }
}

/* ── Track Lane ──
 * Canvas-rendered lane of clips/notes. Playhead is NOT drawn here anymore —
 * a single DOM overlay (PlayheadOverlay) draws it across all lanes at once,
 * so this canvas only redraws when track data / zoom / pattern changes.
 *
 * `totalWidth` is the lifted shared timeline width (max content + viewport).
 */
export function TrackLane({
  track,
  patternIdx,
  transport,
  onSeek,
  zoom,
  totalWidth,
}: {
  track: { id: string; trackType: string; clips: Clip[]; notes: NoteEvent[] };
  patternIdx: number;
  transport: string;
  onSeek: (time: number) => void;
  zoom: number;
  totalWidth: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef(false);
  const isSeeking = transport === 'stopped';
  const isMIDI = track.trackType === 'midi';

  const drawLane = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    if (rect.height === 0) return;

    const contentWidth = totalWidth;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== contentWidth * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = contentWidth * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = contentWidth + 'px';
      canvas.style.height = rect.height + 'px';
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = contentWidth;
    const h = rect.height;

    // Background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);

    // Texture lines (audio only)
    if (!isMIDI) {
      ctx.strokeStyle = patternIdx === 0 ? '#e0e0e0' : '#d5d5d5';
      ctx.lineWidth = 0.5;
      for (let y = 4; y < h; y += 8) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
    }

    if (isMIDI) {
      drawPianoRoll(ctx, track.notes, w, h, zoom);
    } else {
      drawAudioClips(ctx, track.clips, w, h, zoom);
    }
  }, [track, patternIdx, zoom, isMIDI, totalWidth]);

  useEffect(() => { drawLane(); }, [drawLane]);
  useEffect(() => {
    const parent = canvasRef.current?.parentElement;
    if (!parent) return;
    const ro = new ResizeObserver(() => drawLane());
    ro.observe(parent);
    return () => ro.disconnect();
  }, [drawLane]);

  const getTimeFromEvent = useCallback((e: React.PointerEvent | PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    return Math.max(0, x / zoom);
  }, [zoom]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isSeeking) return;
    onSeek(getTimeFromEvent(e));
    dragRef.current = true;
    e.preventDefault();
  }, [isSeeking, getTimeFromEvent, onSeek]);

  useEffect(() => {
    if (!isSeeking) return;
    const hm = (e: PointerEvent) => { if (dragRef.current) onSeek(getTimeFromEvent(e)); };
    const hu = () => { dragRef.current = false; };
    window.addEventListener('pointermove', hm);
    window.addEventListener('pointerup', hu);
    return () => {
      window.removeEventListener('pointermove', hm);
      window.removeEventListener('pointerup', hu);
    };
  }, [isSeeking, getTimeFromEvent, onSeek]);

  return (
    <div
      className="track-lane"
      onPointerDown={handlePointerDown}
      style={{ cursor: isSeeking ? 'col-resize' : 'default', width: totalWidth }}
    >
      <canvas ref={canvasRef} style={{ height: '100%', pointerEvents: 'none' }} />
    </div>
  );
}
