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

export async function initMIDI(): Promise<boolean> {
  try {
    if (!navigator.requestMIDIAccess) return false;
    midiAccess = await navigator.requestMIDIAccess();
    connectFirstInput();

    midiAccess.onstatechange = () => {
      if (midiInput && midiInput.state === 'disconnected') {
        midiInput = null;
        onChange?.(false);
      }
      if (!midiInput) connectFirstInput();
    };

    return midiInput !== null;
  } catch {
    return false;
  }
}

function connectFirstInput() {
  if (!midiAccess) return;
  for (const input of midiAccess.inputs.values()) {
    if (input.state === 'connected') {
      midiInput = input;
      midiInput.onmidimessage = handleMIDIMessage;
      onChange?.(true);
      return;
    }
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
