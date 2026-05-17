/**
 * Web MIDI input — detects external MIDI keyboards and captures note events.
 *
 * Daylight-specific notes:
 *   - Android Chrome populates `midiAccess.inputs` asynchronously after the
 *     permission grant. We retry the scan a few times.
 *   - Some Android Chrome builds require an explicit `input.open()` before
 *     `onmidimessage` fires. We always call it.
 *   - Re-requesting MIDI access after a granted prompt returns the same
 *     cached `MIDIAccess` instance, so a re-prompt button needs to call
 *     `rescan` rather than `init` to pick up newly-plugged devices.
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

export interface MIDIDiagnostics {
  supported: boolean;
  permission: 'granted' | 'denied' | 'prompt' | 'unknown';
  hasAccess: boolean;
  inputCount: number;
  connectedInputName: string | null;
  inputs: { id: string; name: string; manufacturer: string; state: string; connection: string }[];
}

export async function initMIDI(): Promise<MIDIInitResult> {
  if (!navigator.requestMIDIAccess) {
    return { ok: false, reason: 'Web MIDI API not supported in this browser' };
  }
  try {
    midiAccess = await navigator.requestMIDIAccess({ sysex: false });

    midiAccess.onstatechange = (e) => {
      const port = (e as MIDIConnectionEvent).port;
      if (port?.type === 'input' && port.state === 'disconnected' && midiInput?.id === port.id) {
        try { midiInput.onmidimessage = null; } catch { /* noop */ }
        midiInput = null;
        onChange?.(false);
      }
      // Pick up freshly-connected inputs.
      void connectFirstInput();
    };

    await connectFirstInput();

    // Android enumerates devices async after permission grant — retry a few times.
    if (!midiInput) {
      for (const delay of [150, 350, 700, 1200, 2000]) {
        await new Promise((r) => setTimeout(r, delay));
        await connectFirstInput();
        if (midiInput) break;
      }
    }

    const inputCount = midiAccess ? [...midiAccess.inputs.values()].length : 0;
    console.log(`[MIDI] access granted, ${inputCount} input(s), connected=${midiInput !== null}`);
    return { ok: true, connected: midiInput !== null };
  } catch (err) {
    const reason = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error('[MIDI] init failed:', reason);
    return { ok: false, reason };
  }
}

/**
 * Re-walk the existing MIDIAccess.inputs list. Use this for a "rescan" button:
 * after the user plugs in a device and a previous initMIDI returned with no
 * inputs, this picks up newcomers without re-prompting the user.
 *
 * On Android Chrome the input list can lag the actual device state, so we
 * retry over ~2 seconds before giving up.
 */
export async function rescanMIDI(): Promise<MIDIInitResult> {
  if (!midiAccess) {
    // No access yet — fall back to a full init.
    return initMIDI();
  }
  // Drop any stale handle so we re-pick a usable port.
  if (midiInput) {
    try { midiInput.onmidimessage = null; } catch { /* noop */ }
    midiInput = null;
  }
  for (const delay of [0, 150, 350, 700, 1200, 2000]) {
    if (delay > 0) await new Promise((r) => setTimeout(r, delay));
    await connectFirstInput();
    if (midiInput) break;
  }
  const inputCount = [...midiAccess.inputs.values()].length;
  console.log(`[MIDI] rescan, ${inputCount} input(s), connected=${midiInput !== null}`);
  if (midiInput) return { ok: true, connected: true };
  if (inputCount === 0) return { ok: false, reason: 'No MIDI inputs found — plug in keyboard, ensure it is powered on, then rescan' };
  return { ok: false, reason: 'Found inputs but none could be opened — try unplugging and reconnecting the device' };
}

async function connectFirstInput(): Promise<void> {
  if (!midiAccess) return;
  // Don't filter by state — some browsers/OS (e.g. Daylight) don't report 'connected'.
  for (const input of midiAccess.inputs.values()) {
    try {
      // Some Android Chrome builds require explicit open() before messages fire.
      // Idempotent on browsers that auto-open.
      await input.open();
    } catch (err) {
      console.warn('[MIDI] input.open() failed for', input.name, err);
      continue;
    }
    midiInput = input;
    midiInput.onmidimessage = handleMIDIMessage;
    onChange?.(true);
    console.log(`[MIDI] connected to ${input.name} (${input.manufacturer})`);
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

/**
 * Read current MIDI subsystem state for surfacing in UI / debug overlay.
 * Reads `navigator.permissions` if available — some browsers (Safari) don't
 * implement it for 'midi', so we treat absence as 'unknown'.
 */
export async function getMIDIDiagnostics(): Promise<MIDIDiagnostics> {
  const supported = typeof navigator.requestMIDIAccess === 'function';
  let permission: MIDIDiagnostics['permission'] = 'unknown';
  if ('permissions' in navigator) {
    try {
      const status = await (navigator.permissions as Permissions)
        .query({ name: 'midi' as PermissionName });
      permission = status.state as MIDIDiagnostics['permission'];
    } catch {
      permission = 'unknown';
    }
  }
  const inputs = midiAccess
    ? [...midiAccess.inputs.values()].map((i) => ({
        id: i.id,
        name: i.name ?? '(unnamed)',
        manufacturer: i.manufacturer ?? '',
        state: i.state,
        connection: i.connection,
      }))
    : [];
  return {
    supported,
    permission,
    hasAccess: midiAccess !== null,
    inputCount: inputs.length,
    connectedInputName: midiInput?.name ?? null,
    inputs,
  };
}

export function disposeMIDI() {
  if (midiInput) {
    try { midiInput.onmidimessage = null; } catch { /* noop */ }
    midiInput = null;
  }
  if (midiAccess) {
    midiAccess.onstatechange = null;
    midiAccess = null;
  }
}
