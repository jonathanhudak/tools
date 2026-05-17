/**
 * AudioEngine — singleton managing Web Audio lifecycle.
 * Recording via MediaRecorder with Safari fallback support.
 */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;

export function getCtx(): AudioContext {
  if (!ctx || ctx.state === 'closed') {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.8;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function getMasterGain(): GainNode {
  getCtx();
  return masterGain!;
}

/**
 * Set the master gain node's value (0–1, clamped).
 * Clamped to avoid blowing speakers. The default is 0.8; the mixer in
 * the UI subscribes to store.masterVolume changes and pushes them here.
 */
export function setMasterGainValue(v: number): void {
  if (masterGain) {
    masterGain.gain.value = Math.max(0, Math.min(1, v));
  }
}

async function getInputStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  });
}

/** Find best supported mime type — Chrome=webm, Safari=mp4 */
function getMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/mpeg',
    'audio/ogg;codecs=opus',
  ];
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return 'audio/webm'; // last resort
}

/** Record audio, returns AudioBuffer on stop. Throws if mic access denied. */
export async function startRecording(): Promise<{ stop: () => Promise<AudioBuffer> }> {
  let chunks: Blob[] = [];
  let mediaRecorder: MediaRecorder;

  const stream = await getInputStream();
  const mimeType = getMimeType();

  mediaRecorder = new MediaRecorder(stream, { mimeType });
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  mediaRecorder.start(100);

  const stop = async (): Promise<AudioBuffer> => {
    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: mimeType });
          const arrayBuffer = await blob.arrayBuffer();
          const audioBuffer = await getCtx().decodeAudioData(arrayBuffer);
          mediaRecorder.stream.getTracks().forEach((t) => t.stop());
          resolve(audioBuffer);
        } catch (e) {
          reject(e);
        }
      };
      mediaRecorder.onerror = (e) => reject(e);
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      } else {
        reject('MediaRecorder not recording');
      }
    });
  };

  return { stop };
}

/** Play a buffer at a given time offset */
export function playBuffer(
  buffer: AudioBuffer,
  when: number = 0,
  offset: number = 0,
  duration?: number,
  destination?: AudioNode
): AudioBufferSourceNode {
  const c = getCtx();
  const src = c.createBufferSource();
  src.buffer = buffer;
  const dest = destination ?? getMasterGain();
  src.connect(dest);
  src.start(c.currentTime + when, offset, duration);
  return src;
}

export function dispose(): void {
  if (ctx && ctx.state !== 'closed') ctx.close();
  ctx = null;
  masterGain = null;
}

/** Boost gain of an AudioBuffer by multiplying sample values */
export function boostGain(buffer: AudioBuffer, multiplier: number): AudioBuffer {
  const c = getCtx();
  const boosted = c.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const src = buffer.getChannelData(ch);
    const dst = boosted.getChannelData(ch);
    for (let i = 0; i < src.length; i++) {
      dst[i] = Math.max(-1, Math.min(1, src[i] * multiplier));
    }
  }
  return boosted;
}
