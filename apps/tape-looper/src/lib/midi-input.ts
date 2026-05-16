/**
 * Web MIDI input — detects external MIDI keyboards and captures note events.
 * Lightweight — no class, just functions + callbacks.
 */

type NoteCallback = (midiNote: number, velocity: number) => void;

let midiAccess: MIDIAccess | null = null;
let midiInput: MIDIInput | null = null;
let onNoteOn: NoteCallback | null = null;
let onNoteOff: NoteCallback | null = null;
let onChange: ((connected: boolean) => void) | null = null;

export type MIDIInitResult =
  | { ok: true; connected: boolean }
  | { ok: false; reason: string };

export async function initMIDI(): Promise<MIDIInitResult> {
  if (!navigator.requestMIDIAccess) {
    return { ok: false, reason: 'Web MIDI API not supported in this browser' };
  }
  try {
    midiAccess = await navigator.requestMIDIAccess({ sysex: false });
    connectFirstInput();

    midiAccess.onstatechange = (e) => {
      const port = (e as MIDIConnectionEvent).port;
      if (port?.type === 'input' && port.state === 'disconnected' && midiInput?.id === port.id) {
        midiInput = null;
        onChange?.(false);
      }
      connectFirstInput();
    };

    const inputCount = [...midiAccess.inputs.values()].length;
    console.log(`[MIDI] access granted, ${inputCount} input(s) found`);
    return { ok: true, connected: midiInput !== null };
  } catch (err) {
    const reason = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error('[MIDI] init failed:', reason);
    return { ok: false, reason };
  }
}

function connectFirstInput() {
  if (!midiAccess) return;
  // Don't filter by state — some browsers/OS (e.g. Daylight) don't report 'connected'
  for (const input of midiAccess.inputs.values()) {
    midiInput = input;
    midiInput.onmidimessage = handleMIDIMessage;
    onChange?.(true);
    return;
  }
}

function handleMIDIMessage(e: MIDIMessageEvent) {
  if (!e.data || e.data.length < 3) return;
  const [status, note, velocity] = e.data;
  const cmd = status & 0xf0;

  if (cmd === 0x90 && velocity > 0) {
    onNoteOn?.(note, velocity / 127);
  } else if (cmd === 0x80 || (cmd === 0x90 && velocity === 0)) {
    onNoteOff?.(note, 0);
  }
}

export function setMIDICallbacks(
  noteOn: NoteCallback,
  noteOff: NoteCallback,
  change?: (connected: boolean) => void,
) {
  onNoteOn = noteOn;
  onNoteOff = noteOff;
  if (change) onChange = change;
}

export function hasMIDI(): boolean {
  return midiInput !== null;
}

export function disposeMIDI() {
  if (midiInput) {
    midiInput.onmidimessage = null;
    midiInput = null;
  }
  midiAccess = null;
}
