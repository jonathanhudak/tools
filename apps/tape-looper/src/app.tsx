import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { useStore } from './lib/store';
import { getCtx, startRecording, boostGain, setMasterGainValue } from './lib/audio-engine';
import { initMIDI, setMIDICallbacks } from './lib/midi-input';
import {
  serializeTracks, deserializeTracks, saveProject,
  getProject, newProjectId,
  getCurrentProjectId,
} from './lib/storage';
import { initToneBridge } from './lib/tone-bridge';
import {
  startPlayback as engineStartPlayback,
  stopAllSources as engineStopAllSources,
  playLiveNote as enginePlayLiveNote,
  stopLiveNote as engineStopLiveNote,
  releaseAllLiveNotes as engineReleaseAllLiveNotes,
  getTransportSeconds,
  getOrCreateTrackRouting,
} from './lib/transport-playback';
import type { NoteEvent } from './lib/types';
import { PatternDefs } from './components/pattern-defs';
import { TransportBar } from './components/transport-bar';
import { TrackRail, TrackLaneRow } from './components/track-row';
import { computeTotalDuration } from './components/track-lane';
import { TimelineRuler } from './components/timeline-ruler';
import { PlayheadOverlay } from './components/playhead-overlay';
import { ProjectsPanel } from './components/projects-panel';
import { SynthEditor } from './components/synth-editor';
import { useAutoScroll } from './hooks/use-auto-scroll';

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
  const [midiConnected, setMIDIConnected] = useState(false);
  const [midiError, setMidiError] = useState<string | null>(null);
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

  useEffect(() => { connectMIDI(); }, [connectMIDI]);

  const recordingRef = useRef<{ stop: () => Promise<AudioBuffer> } | null>(null);
  /** Transport.seconds when recording started — clip startTime. */
  const recordStartTransportRef = useRef(0);
  const playheadRef = useRef(0);
  const rafRef = useRef(0);

  const transportRef = useRef(transport);
  transportRef.current = transport;

  const midiRecordingRef = useRef(false);
  const midiNotesRef = useRef<NoteEvent[]>([]);
  const midiNoteStartRef = useRef<Map<number, number>>(new Map());
  /** trackId currently receiving live notes (armed MIDI track or first MIDI track). */
  const liveTrackRef = useRef<string | null>(null);

  const [projectsOpen, setProjectsOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const setProjectId = useStore((s) => s.setProjectId);
  const setProjectName = useStore((s) => s.setProjectName);
  const setTracks = useStore((s) => s.setTracks);
  const projectId = useStore((s) => s.projectId);
  const projectName = useStore((s) => s.projectName);
  const hasHydrated = useRef(false);

  // Hydrate: bind Tone to our AudioContext, then load the last project on mount.
  useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;
    const tempId = newProjectId();
    setProjectId(tempId);
    (async () => {
      try {
        await initToneBridge();
      } catch (err) {
        console.warn('Tone bridge init failed:', err);
      }
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
  }, [transport]);

  // Playhead animation — reads Tone.Transport.seconds.
  useEffect(() => {
    if (transport === 'playing' || transport === 'recording') {
      const tick = () => {
        const t = getTransportSeconds();
        playheadRef.current = t;
        setPlayheadTime(t);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafRef.current);
    }
    return undefined;
  }, [transport]);

  /**
   * Pick the trackId for live notes.
   *   1. Armed MIDI track (REC + tap = capture).
   *   2. First MIDI track (non-armed tinkering).
   *   3. null — no MIDI track.
   */
  const resolveLiveTrackId = useCallback((): string | null => {
    const state = useStore.getState();
    const armed = state.tracks.find((t) => t.id === state.armedTrackId);
    if (armed?.trackType === 'midi') return armed.id;
    const firstMidi = state.tracks.find((t) => t.trackType === 'midi');
    return firstMidi?.id ?? null;
  }, []);

  const stopAllSources = useCallback(() => {
    engineStopAllSources();
  }, []);

  const startPlayback = useCallback(async (skipArmed = false) => {
    const state = useStore.getState();
    const armedId = skipArmed ? state.armedTrackId : null;
    await engineStartPlayback({
      from: playheadRef.current,
      skipArmedTrackId: armedId,
    }, state.tracks);
  }, []);

  // Restart playback when mute/solo changes during playback.
  const prevMuteSoloRef = useRef('');
  useEffect(() => {
    const hash = tracks.map((t) => `${t.id}:${t.muted}:${t.solo}`).join('|');
    if (prevMuteSoloRef.current === hash) return;
    const prev = prevMuteSoloRef.current;
    prevMuteSoloRef.current = hash;
    if (!prev) return;
    if (transportRef.current === 'playing') {
      void startPlayback(false);
    } else if (transportRef.current === 'recording') {
      void startPlayback(true);
    }
  }, [tracks, startPlayback]);

  const stopRecording = useCallback(async () => {
    const transportAtStop = getTransportSeconds();
    stopAllSources();
    const armedTrack = tracks.find((t) => t.id === armedTrackId);

    if (armedTrack?.trackType === 'midi') {
      engineReleaseAllLiveNotes();
      midiRecordingRef.current = false;
      if (midiNotesRef.current.length > 0) {
        overwriteNotes(armedTrackId!, [...midiNotesRef.current], 0);
        midiNotesRef.current = [];
      }
      midiNoteStartRef.current.clear();
    } else if (recordingRef.current) {
      const buffer = await recordingRef.current.stop();
      recordingRef.current = null;
      if (armedTrackId && buffer.duration > 0.1) {
        const boosted = boostGain(buffer, inputGain);
        const startTime = recordStartTransportRef.current;
        const actualDuration = Math.min(buffer.duration, Math.max(0.1, transportAtStop - startTime));
        if (actualDuration > 0 && actualDuration < buffer.duration) {
          const ctx = getCtx();
          const newLen = Math.floor(actualDuration * boosted.sampleRate);
          const cropped = ctx.createBuffer(boosted.numberOfChannels, newLen, boosted.sampleRate);
          for (let ch = 0; ch < boosted.numberOfChannels; ch++) {
            cropped.getChannelData(ch).set(boosted.getChannelData(ch).subarray(0, newLen));
          }
          overwriteClip(armedTrackId, cropped, Math.max(0, startTime));
        } else {
          overwriteClip(armedTrackId, boosted, Math.max(0, startTime));
        }
      }
    }
    setTransport('stopped');
  }, [armedTrackId, tracks, overwriteClip, overwriteNotes, inputGain, stopAllSources, setTransport]);

  const handlePlay = useCallback(async () => {
    if (transport === 'playing') { stopAllSources(); setTransport('stopped'); return; }
    if (transport === 'recording') { await stopRecording(); return; }
    await startPlayback(false);
    setTransport('playing');
  }, [transport, setTransport, stopAllSources, startPlayback, stopRecording]);

  const handleRecord = useCallback(async () => {
    if (transport === 'recording') { await stopRecording(); return; }
    if (transport === 'playing') return;
    if (!armedTrackId) return;

    const armedTrack = tracks.find((t) => t.id === armedTrackId);
    await startPlayback(true);

    if (armedTrack?.trackType === 'midi') {
      midiRecordingRef.current = true;
      midiNotesRef.current = [];
      midiNoteStartRef.current.clear();
    } else {
      recordingRef.current = await startRecording();
      recordStartTransportRef.current = getTransportSeconds();
    }
    setTransport('recording');
  }, [transport, armedTrackId, tracks, setTransport, startPlayback, stopRecording]);

  const handleSeekToStart = useCallback(() => seekTo(0), [seekTo]);

  // Live MIDI through Tone.PolySynth per-track.
  const playNote = useCallback((midiNote: number) => {
    const trackId = resolveLiveTrackId();
    if (!trackId) return;
    liveTrackRef.current = trackId;
    const state = useStore.getState();
    const trk = state.tracks.find((t) => t.id === trackId);
    void enginePlayLiveNote(trackId, trk?.patchId ?? null, midiNote);

    if (midiRecordingRef.current) {
      const t = getTransportSeconds();
      midiNoteStartRef.current.set(midiNote, t);
    }
  }, [resolveLiveTrackId]);

  const stopNote = useCallback((midiNote: number) => {
    const trackId = liveTrackRef.current ?? resolveLiveTrackId();
    if (trackId) engineStopLiveNote(trackId, midiNote);

    if (midiRecordingRef.current) {
      const startTime = midiNoteStartRef.current.get(midiNote);
      if (startTime !== undefined) {
        const endTime = getTransportSeconds();
        midiNotesRef.current.push({ midiNote, startTime, duration: Math.max(0.05, endTime - startTime) });
        midiNoteStartRef.current.delete(midiNote);
      }
    }
  }, [resolveLiveTrackId]);

  useEffect(() => { octaveOffsetRef.current = octaveOffset; }, [octaveOffset]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

      const key = e.key.toLowerCase();

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

  // Scroll wheel: ctrl/meta + wheel zooms.
  useEffect(() => {
    const tracksEl = document.querySelector('.timeline-scroll');
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

  useEffect(() => {
    setMIDICallbacks(playNote, stopNote, handleMIDIConnected);
  }, [playNote, stopNote, handleMIDIConnected]);

  // ── Layout: shared timeline width + scroll container + auto-scroll ──
  const followPlayhead = useStore((s) => s.followPlayhead);
  const bpm = useStore((s) => s.bpm);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewportW, setViewportW] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setViewportW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const totalWidth = useMemo(() => {
    let longest = 0;
    for (const t of tracks) {
      const d = computeTotalDuration(t);
      if (d > longest) longest = d;
    }
    return Math.max(viewportW, longest * zoom + 200);
  }, [tracks, zoom, viewportW]);

  const totalHeight = TimelineRuler.HEIGHT + tracks.length * 100;

  useAutoScroll(scrollRef, playheadTime, zoom, followPlayhead, transport);

  // ── Mixer: push store volume/pan/masterVolume into the audio graph.
  // The transport-playback module owns per-track GainNode + StereoPannerNode;
  // here we just nudge their .value when the user moves a slider.
  const masterVolume = useStore((s) => s.masterVolume);
  useEffect(() => {
    setMasterGainValue(masterVolume);
  }, [masterVolume]);
  useEffect(() => {
    for (const t of tracks) {
      const r = getOrCreateTrackRouting(t.id);
      r.gain.gain.value = t.volume;
      r.panner.pan.value = t.pan;
    }
  }, [tracks]);

  return (
    <div className="daw-app">
      <PatternDefs />
      <SynthEditor />
      <TransportBar playheadTime={playheadTime} onPlay={handlePlay} onRecord={handleRecord} onSeekToStart={handleSeekToStart} onOpenProjects={() => setProjectsOpen(true)} onNewProject={handleNewProject} onSave={handleSave} saveStatus={saveStatus} midiConnected={midiConnected} onConnectMIDI={connectMIDI} midiError={midiError} octaveOffset={octaveOffset} onOctaveDown={() => setOctaveOffset((o) => Math.max(-4, o - 1))} onOctaveUp={() => setOctaveOffset((o) => Math.min(4, o + 1))} />
      <div className="timeline-stack">
        <div className="rail-column">
          <div className="ruler-rail-spacer" />
          {tracks.map((track) => (
            <TrackRail key={track.id} track={track} transport={transport} />
          ))}
          <button className="add-track-btn" onClick={addAudioTrack}>+ Audio Track</button>
          <button className="add-track-btn" onClick={addMidiTrack} style={{ borderStyle: 'dashed' }}>+ MIDI Track</button>
        </div>
        <div className="timeline-scroll" ref={scrollRef}>
          <TimelineRuler bpm={bpm} zoom={zoom} totalWidth={totalWidth} transport={transport} onSeek={seekTo} />
          {tracks.map((track, i) => (
            <TrackLaneRow key={track.id} track={track} idx={i} transport={transport} onSeek={seekTo} zoom={zoom} totalWidth={totalWidth} />
          ))}
          <PlayheadOverlay playheadTime={playheadTime} zoom={zoom} totalHeight={totalHeight} />
        </div>
      </div>
      <ProjectsPanel open={projectsOpen} onClose={() => setProjectsOpen(false)} onLoadProject={handleLoadProject} />
    </div>
  );
}
