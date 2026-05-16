/**
 * AudioEngine — singleton managing Web Audio lifecycle.
 * Recording via MediaRecorder (simple, works everywhere).
 * Playback via AudioBufferSourceNode (no Tone.js dependency for POC).
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

export async function getInputStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  });
}

/** Record audio, returns AudioBuffer on stop */
export function startRecording(): { stop: () => Promise<AudioBuffer> } {
  let chunks: Blob[] = [];
  let mediaRecorder: MediaRecorder | null = null;

  const startPromise = getInputStream().then((stream) => {
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm',
    });
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    mediaRecorder.start(100);
  });

  const stop = async (): Promise<AudioBuffer> => {
    await startPromise;
    return new Promise((resolve, reject) => {
      if (!mediaRecorder) return reject('Not recording');
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await getCtx().decodeAudioData(arrayBuffer);
        mediaRecorder!.stream.getTracks().forEach((t) => t.stop());
        resolve(audioBuffer);
      };
      mediaRecorder.stop();
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

/** Play all clips on all tracks, respecting mute/solo */
export function playAllClips(
  clips: { buffer: AudioBuffer; startTime: number; duration: number; muted: boolean }[]
): AudioBufferSourceNode[] {
  const sources: AudioBufferSourceNode[] = [];
  const master = getMasterGain();

  for (const clip of clips) {
    if (clip.muted) continue;
    const gain = getCtx().createGain();
    gain.gain.value = 0.8;
    gain.connect(master);
    const src = getCtx().createBufferSource();
    src.buffer = clip.buffer;
    src.connect(gain);
    src.start(getCtx().currentTime + 0.05, 0, clip.duration);
    sources.push(src);
  }
  return sources;
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
