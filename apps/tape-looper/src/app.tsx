import { useRef, useEffect, useCallback, useState } from 'react';
import { useStore } from './lib/store';
import { getCtx, getMasterGain, startRecording, boostGain } from './lib/audio-engine';
import { synthTrack } from './lib/midi-engine';
import { initMIDI, setMIDICallbacks } from './lib/midi-input';
import {
  serializeTracks, deserializeTracks, saveProject,
  getProject, newProjectId,
  getCurrentProjectId,
} from './lib/storage';
import type { NoteEvent } from './lib/types';
import { seedPatchesIfEmpty } from './lib/patch-presets';
import { PatternDefs } from './components/pattern-defs';
import { TransportBar } from './components/transport-bar';
import { TrackRow } from './components/track-row';
import { ProjectsPanel } from './components/projects-panel';

/* ── Piano key mapping: 2 rows of computer keyboard → 1 octave ── */
const PIANO_KEYS: { key: string; midiNote: number; label: string }[] = [
  { key: 'a', midiNote: 60, label: 'C' },
  { key: 'w', midiNote: 61, label: 'C#' },
  { key: 's', midiNote: 62, label: 'D' },
  { key: 'e', midiNote: 63, label: 'D#' },
  { key: 'd', midiNote: 64, label: 'E' },
  { key: 'f', midiNote: 65, label: 'F' },
  { key: 't', midiNote: 66, label: 'F#' },
  { key: 'g', midiNote: 67, label: 'G' },
  { key: 'y', midiNote: 68, label: 'G#' },
  { key: 'h', midiNote: 69, label: 'A' },
  { key: 'u', midiNote: 70, label: 'A#' },
  { key: 'j', midiNote: 71, label: 'B' },
  { key: 'k', midiNote: 72, label: 'C' },
];
const PIANO_KEY_SET = new Set(PIANO_KEYS.map((k) => k.key));
const PIANO_NOTE_MAP = Object.fromEntries(PIANO_KEYS.map((k) => [k.key, k.midiNote]));

/* ── Main App ── */
export function App() {
  const tracks = useStore((s) => s.tracks);
  const addAudioTrack = useStore((s) => s.addAudioTrack);
  const addMidiTrack = useStore((s) => s.addMidiTrack);
  const transport = useStore((s) => s.transport);
  const setTransport = useStore((s) => s.setTransport);
  const armedTrackId = useStore((s) => s.armedTrackId);
  const overwriteClip = useStore((s) => s.overwriteClip);
  const overwriteNotes = useStore((s) => s.overwriteNotes);
  const inputGain = useStore((s) => s.inputGain);
  const zoom = useStore((s) => s.zoom);

  const [playheadTime, setPlayheadTime] = useState(0);
  const [octaveOffset, setOctaveOffset] = useState(0);
  const octaveOffsetRef = useRef(0);
  // MIDI — try auto-init (works if permission granted), fallback to button
  const [midiConnected, setMIDIConnected] = useState(false);
  const [midiError, setMidiError] = useState<string | null>(null);
  // Wrap setMIDIConnected so connecting via onstatechange also clears error
  const handleMIDIConnected = useCallback((connected: boolean) => {
    setMIDIConnected(connected);
    if (connected) setMidiError(null);
  }, []);
  const connectMIDI = useCallback(async () => {
    setMidiError(null);
    const result = await initMIDI();
    if (result.ok) {
      handleMIDIConnected(result.connected);
      if (!result.connected) setMidiError('No MIDI device found — plug in keyboard and try again');
    } else {
      setMIDIConnected(false);
      setMidiError(result.reason);
    }
  }, [handleMIDIConnected]);

  // Auto-detect MIDI on mount (works if permission already granted)
  useEffect(() => { connectMIDI(); }, [connectMIDI]);

  const playingSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const recordingRef = useRef<{ stop: () => Promise<AudioBuffer> } | null>(null);
  const recordStartTimeRef = useRef(0);
  const playheadRef = useRef(0);
  const startCtxTimeRef = useRef(0);
  const rafRef = useRef(0);

  // Transport ref for keyboard handler (avoids stale closure)
  const transportRef = useRef(transport);
  transportRef.current = transport;

  // MIDI recording state
  const midiRecordingRef = useRef(false);
  const midiNotesRef = useRef<NoteEvent[]>([]);
  const midiNoteStartRef = useRef<Map<number, number>>(new Map());
  const activeOscillatorsRef = useRef<Map<number, OscillatorNode>>(new Map());

  // Project state
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const setProjectId = useStore((s) => s.setProjectId);
  const setProjectName = useStore((s) => s.setProjectName);
  const setTracks = useStore((s) => s.setTracks);
  const projectId = useStore((s) => s.projectId);
  const projectName = useStore((s) => s.projectName);
  const hasHydrated = useRef(false);

  // Hydrate: load the last project on mount
  useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;
    // Seed default patches once (no-op if already populated)
    seedPatchesIfEmpty();
    // Set a project ID synchronously so Save works immediately (before DB resolves)
    const tempId = newProjectId();
    setProjectId(tempId);
    (async () => {
      try {
        const savedId = await getCurrentProjectId();
        if (savedId) {
          const project = await getProject(savedId);
          if (project) {
            const loadedTracks = await deserializeTracks(project.tracks);
            if (loadedTracks.length > 0) setTracks(loadedTracks);
            setProjectId(project.id);
            setProjectName(project.name);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to load saved project:', err);
      }
      // No saved project or load failed — use tempId already set above
      setProjectName('Untitled');
    })();
  }, [setTracks, setProjectId, setProjectName]);

  // Auto-save on track changes (debounced)
  useEffect(() => {
    if (!hasHydrated.current || !projectId) return;
    const timer = setTimeout(async () => {
      const proj = {
        id: projectId,
        name: projectName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tracks: await serializeTracks(tracks),
      };
      await saveProject(proj);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1500);
    }, 2000);
    return () => clearTimeout(timer);
  }, [tracks, projectId, projectName]);

  // Save handlers
  const handleSave = useCallback(async () => {
    const id = projectId ?? newProjectId();
    if (!projectId) setProjectId(id);
    try {
      const proj = {
        id,
        name: projectName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tracks: await serializeTracks(tracks),
      };
      await saveProject(proj);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1500);
    } catch (err) {
      console.error('Save failed:', err);
      setSaveStatus('idle');
    }
  }, [projectId, projectName, tracks, setProjectId]);

  const handleNewProject = useCallback(async () => {
    await handleSave();
    const id = newProjectId();
    setProjectId(id);
    setProjectName('Untitled');
    setTracks([{ id: 't1', name: 'Audio 1', armed: false, muted: false, solo: false, trackType: 'audio' as const, waveform: 'sine' as const, patchId: null, clips: [], notes: [], volume: 0.8, pan: 0 }]);
    setProjectsOpen(false);
  }, [handleSave, setProjectId, setProjectName, setTracks]);

  const handleLoadProject = useCallback(async (id: string) => {
    await handleSave();
    const project = await getProject(id);
    if (!project) return;
    const loaded = await deserializeTracks(project.tracks);
    setTracks(loaded.length > 0 ? loaded : [{ id: 't1', name: 'Audio 1', armed: false, muted: false, solo: false, trackType: 'audio' as const, waveform: 'sine' as const, patchId: null, clips: [], notes: [], volume: 0.8, pan: 0 }]);
    setProjectId(project.id);
    setProjectName(project.name);
    setProjectsOpen(false);
  }, [handleSave, setTracks, setProjectId, setProjectName]);

  const seekTo = useCallback((time: number) => {
    if (transport !== 'stopped') return;
    const t = Math.max(0, time);
    playheadRef.current = t;
    setPlayheadTime(t);
    startCtxTimeRef.current = getCtx().currentTime - t;
  }, [transport]);

  // Playhead animation
  useEffect(() => {
    if (transport === 'playing' || transport === 'recording') {
      startCtxTimeRef.current = getCtx().currentTime - playheadRef.current;
      const tick = () => {
        const t = getCtx().currentTime - startCtxTimeRef.current;
        playheadRef.current = t;
        setPlayheadTime(t);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafRef.current);
    }
    return undefined;
  }, [transport]);

  const stopAllSources = useCallback(() => {
    playingSourcesRef.current.forEach((s) => { try { s.stop(); } catch { /* noop */ } });
    playingSourcesRef.current = [];
  }, []);

  const startPlayback = useCallback((skipArmed = false) => {
    stopAllSources();
    const ctx = getCtx();
    const master = getMasterGain();
    const state = useStore.getState();
    const currentTracks = state.tracks;
    const currentArmedId = state.armedTrackId;
    const anySolo = currentTracks.some((t) => t.solo);

    for (const track of currentTracks) {
      // When recording, skip the armed track (don't play back what we're overwriting)
      if (skipArmed && track.armed && track.id === currentArmedId) continue;
      const effectiveMute = anySolo ? !track.solo : track.muted;
      if (effectiveMute) continue;

      if (track.trackType === 'midi') {
        // Synthesize MIDI notes into audio buffer and play
        const buf = synthTrack(track.notes, ctx, track.waveform);
        if (buf) {
          const offset = playheadRef.current;
          const src = ctx.createBufferSource();
          src.buffer = buf;
          const gain = ctx.createGain();
          gain.gain.value = 1.0;
          gain.connect(master);
          src.connect(gain);
          src.start(ctx.currentTime, offset);
          playingSourcesRef.current.push(src);
        }
      } else {
        for (const clip of track.clips) {
          const clipEnd = clip.startTime + clip.duration;
          if (clipEnd <= playheadRef.current) continue;
          const offset = playheadRef.current - clip.startTime;
          const clipOffset = Math.max(0, offset);
          const when = Math.max(0, -offset);
          const remaining = clip.duration - clipOffset;
          const gain = ctx.createGain();
          gain.gain.value = 0.8;
          gain.connect(master);
          const src = ctx.createBufferSource();
          src.buffer = clip.buffer;
          src.connect(gain);
          src.start(ctx.currentTime + when, clipOffset, remaining);
          playingSourcesRef.current.push(src);
        }
      }
    }
  }, [stopAllSources]);

  // Restart playback when mute/solo changes during playback
  const prevMuteSoloRef = useRef('');
  useEffect(() => {
    const hash = tracks.map((t) => `${t.id}:${t.muted}:${t.solo}`).join('|');
    if (prevMuteSoloRef.current === hash) return;
    const prev = prevMuteSoloRef.current;
    prevMuteSoloRef.current = hash;
    // Skip first render
    if (!prev) return;
    if (transportRef.current === 'playing') {
      stopAllSources();
      startPlayback(false);
    } else if (transportRef.current === 'recording') {
      stopAllSources();
      startPlayback(true);
    }
  }, [tracks, stopAllSources, startPlayback]);

  const stopRecording = useCallback(async () => {
    stopAllSources();
    const armedTrack = tracks.find((t) => t.id === armedTrackId);

    if (armedTrack?.trackType === 'midi') {
      // End any held MIDI notes
      endAllMIDINotes();
      midiRecordingRef.current = false;
      if (midiNotesRef.current.length > 0) {
        overwriteNotes(armedTrackId!, [...midiNotesRef.current], 0);
        midiNotesRef.current = [];
      }
    } else {
      if (recordingRef.current) {
        const buffer = await recordingRef.current.stop();
        recordingRef.current = null;
        if (armedTrackId && buffer.duration > 0.1) {
          const boosted = boostGain(buffer, inputGain);
          const startTime = recordStartTimeRef.current - startCtxTimeRef.current;
          overwriteClip(armedTrackId, boosted, Math.max(0, startTime));
        }
      }
    }
    // Don't auto-disarm — let user manually disarm
    setTransport('stopped');
  }, [armedTrackId, tracks, overwriteClip, overwriteNotes, inputGain, stopAllSources, setTransport]);

  const handlePlay = useCallback(() => {
    if (transport === 'playing') { stopAllSources(); setTransport('stopped'); return; }
    if (transport === 'recording') { stopRecording(); return; }
    startPlayback();
    setTransport('playing');
  }, [transport, setTransport, stopAllSources, startPlayback, stopRecording]);

  const handleRecord = useCallback(async () => {
    if (transport === 'recording') { await stopRecording(); return; }
    if (transport === 'playing') return;
    if (!armedTrackId) return;

    const armedTrack = tracks.find((t) => t.id === armedTrackId);
    startPlayback(true); // skip armed track during recording

    if (armedTrack?.trackType === 'midi') {
      midiRecordingRef.current = true;
      midiNotesRef.current = [];
    } else {
      recordingRef.current = await startRecording();
      recordStartTimeRef.current = getCtx().currentTime;
    }
    setTransport('recording');
  }, [transport, armedTrackId, tracks, setTransport, startPlayback, stopRecording]);

  const handleSeekToStart = useCallback(() => seekTo(0), [seekTo]);

  // ── MIDI keyboard input ──
  const playNote = useCallback((midiNote: number) => {
    const ctx = getCtx();
    const master = getMasterGain();
    const state = useStore.getState();
    const armedTrack = state.tracks.find((t) => t.id === state.armedTrackId);
    const waveform = armedTrack?.waveform ?? 'sine';
    const osc = ctx.createOscillator();
    osc.type = waveform;
    osc.frequency.value = 440 * Math.pow(2, (midiNote - 69) / 12);
    const gain = ctx.createGain();
    gain.gain.value = 0.3;
    gain.connect(master);
    osc.connect(gain);
    osc.start();
    activeOscillatorsRef.current.set(midiNote, osc);

    // MIDI recording capture (works for touch + keyboard)
    if (midiRecordingRef.current) {
      const t = getCtx().currentTime - startCtxTimeRef.current;
      midiNoteStartRef.current.set(midiNote, t);
    }
  }, []);

  const stopNote = useCallback((midiNote: number) => {
    const osc = activeOscillatorsRef.current.get(midiNote);
    if (osc) {
      try { osc.stop(); } catch { /* noop */ }
      osc.disconnect();
      activeOscillatorsRef.current.delete(midiNote);
    }

    // MIDI recording capture (works for touch + keyboard)
    if (midiRecordingRef.current) {
      const startTime = midiNoteStartRef.current.get(midiNote);
      if (startTime !== undefined) {
        const endTime = getCtx().currentTime - startCtxTimeRef.current;
        midiNotesRef.current.push({ midiNote, startTime, duration: Math.max(0.05, endTime - startTime) });
        midiNoteStartRef.current.delete(midiNote);
      }
    }
  }, []);

  const endAllMIDINotes = useCallback(() => {
    activeOscillatorsRef.current.forEach((osc) => {
      try { osc.stop(); } catch { /* noop */ }
      osc.disconnect();
    });
    activeOscillatorsRef.current.clear();
  }, []);

  // Keep ref in sync so keydown handler reads latest octave without re-registering
  useEffect(() => { octaveOffsetRef.current = octaveOffset; }, [octaveOffset]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

      const key = e.key.toLowerCase();

      // Octave shift (Ableton-style: Z = down, X = up)
      if (key === 'z') { e.preventDefault(); setOctaveOffset((o) => Math.max(-4, o - 1)); return; }
      if (key === 'x') { e.preventDefault(); setOctaveOffset((o) => Math.min(4, o + 1)); return; }

      if (PIANO_KEY_SET.has(key)) {
        if (e.repeat) return;
        const midiNote = Math.max(0, Math.min(127, PIANO_NOTE_MAP[key] + octaveOffsetRef.current * 12));
        if (e.type === 'keydown') {
          playNote(midiNote);
        }
        e.preventDefault();
        return;
      }

      // Transport shortcuts
      switch (e.code) {
        case 'Space': e.preventDefault(); handlePlay(); break;
        case 'KeyR': e.preventDefault(); handleRecord(); break;
        case 'KeyH': case 'Home': e.preventDefault(); handleSeekToStart(); break;
        case 'ArrowUp': e.preventDefault(); useStore.getState().setZoom(Math.min(500, useStore.getState().zoom + 30)); break;
        case 'ArrowDown': e.preventDefault(); useStore.getState().setZoom(Math.max(10, useStore.getState().zoom - 30)); break;
      }
    };

    const keyupHandler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (PIANO_KEY_SET.has(key)) {
        const midiNote = Math.max(0, Math.min(127, PIANO_NOTE_MAP[key] + octaveOffsetRef.current * 12));
        stopNote(midiNote);
      }
    };

    window.addEventListener('keydown', handler);
    window.addEventListener('keyup', keyupHandler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('keyup', keyupHandler);
    };
  }, [handlePlay, handleRecord, handleSeekToStart, playNote, stopNote]);

  // Scroll wheel: horizontal scroll pans, no modifier zooms
  useEffect(() => {
    const tracksEl = document.querySelector('.tracks-container');
    if (!tracksEl) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const z = useStore.getState().zoom;
        useStore.getState().setZoom(Math.max(10, Math.min(500, z - Math.sign(e.deltaY) * 30)));
      }
    };
    tracksEl.addEventListener('wheel', onWheel as EventListener, { passive: false });
    return () => tracksEl.removeEventListener('wheel', onWheel as EventListener);
  }, []);

  // Wire MIDI callbacks — re-wired when playNote/stopNote change
  useEffect(() => {
    setMIDICallbacks(playNote, stopNote, handleMIDIConnected);
  }, [playNote, stopNote, handleMIDIConnected]);

  return (
    <div className="daw-app">
      <PatternDefs />
      <TransportBar playheadTime={playheadTime} onPlay={handlePlay} onRecord={handleRecord} onSeekToStart={handleSeekToStart} onOpenProjects={() => setProjectsOpen(true)} onNewProject={handleNewProject} onSave={handleSave} saveStatus={saveStatus} midiConnected={midiConnected} onConnectMIDI={connectMIDI} midiError={midiError} octaveOffset={octaveOffset} onOctaveDown={() => setOctaveOffset((o) => Math.max(-4, o - 1))} onOctaveUp={() => setOctaveOffset((o) => Math.min(4, o + 1))} />
      <div className="tracks-container">
        {tracks.map((track, i) => (
          <TrackRow key={track.id} track={track} idx={i} playheadTime={playheadTime} transport={transport} onSeek={seekTo} zoom={zoom} />
        ))}
        <button className="add-track-btn" onClick={addAudioTrack}>+ Audio Track</button>
        <button className="add-track-btn" onClick={addMidiTrack} style={{ borderStyle: 'dashed' }}>+ MIDI Track</button>
      </div>
      <ProjectsPanel open={projectsOpen} onClose={() => setProjectsOpen(false)} onLoadProject={handleLoadProject} />
    </div>
  );
}
