/**
 * TapeEngine — the overwrite logic.
 * 
 * When recording over existing audio, the new buffer replaces the overlapped
 * portion. No layering — this is tape-machine behavior.
 */
import type { Clip } from './types';

export function applyOverwrite(
  clips: Clip[],
  newBuffer: AudioBuffer,
  recordStart: number,
  trackId: string,
): Clip[] {
  const recordEnd = recordStart + newBuffer.duration;

  // Split clips into: beforeRecord, overlapping, afterRecord
  const before: Clip[] = [];
  const overlapping: Clip[] = [];
  const after: Clip[] = [];

  for (const clip of clips) {
    const clipEnd = clip.startTime + clip.duration;
    if (clipEnd <= recordStart) {
      before.push(clip);
    } else if (clip.startTime >= recordEnd) {
      after.push(clip);
    } else {
      overlapping.push(clip);
    }
  }

  // For each overlapping clip, slice out the unaffected portions
  const result: Clip[] = [...before];

  for (const clip of overlapping) {
    // Portion before the recording
    if (clip.startTime < recordStart) {
      const beforeDuration = recordStart - clip.startTime;
      result.push({
        ...clip,
        id: `${clip.id}-left`,
        buffer: sliceBuffer(clip.buffer, 0, beforeDuration),
        duration: beforeDuration,
      });
    }
    // Portion after the recording
    const clipEnd = clip.startTime + clip.duration;
    if (clipEnd > recordEnd) {
      const afterStart = recordEnd - clip.startTime;
      result.push({
        ...clip,
        id: `${clip.id}-right`,
        buffer: sliceBuffer(clip.buffer, afterStart, clip.duration),
        startTime: recordEnd,
        duration: clip.duration - afterStart,
      });
    }
  }

  // Add the new recording
  result.push({
    id: crypto.randomUUID(),
    trackId,
    startTime: recordStart,
    duration: newBuffer.duration,
    buffer: newBuffer,
    name: `take-${Date.now().toString(36)}`,
  });

  // Add clips after the recording
  result.push(...after);

  return result.sort((a, b) => a.startTime - b.startTime);
}

function sliceBuffer(buffer: AudioBuffer, startSec: number, endSec: number): AudioBuffer {
  const sampleRate = buffer.sampleRate;
  const startSample = Math.floor(startSec * sampleRate);
  const length = Math.ceil((endSec - startSec) * sampleRate);

  // Create a new buffer using an offline context
  const offlineCtx = new OfflineAudioContext(
    buffer.numberOfChannels,
    length,
    sampleRate,
  );
  const newBuf = offlineCtx.createBuffer(buffer.numberOfChannels, length, sampleRate);

  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const srcData = buffer.getChannelData(ch);
    const dstData = newBuf.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      const srcIdx = startSample + i;
      dstData[i] = srcIdx < srcData.length ? srcData[srcIdx] : 0;
    }
  }

  return newBuf;
}

/** Draw a waveform to a canvas context */
export function drawWaveform(
  canvas: HTMLCanvasElement,
  buffer: AudioBuffer,
  startTime: number,
  duration: number,
  color: string = '#000',
) {
  const ctx2d = canvas.getContext('2d');
  if (!ctx2d) return;

  const w = canvas.width;
  const h = canvas.height;
  ctx2d.clearRect(0, 0, w, h);

  // Background
  ctx2d.fillStyle = '#fff';
  ctx2d.fillRect(0, 0, w, h);

  const data = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  const startSample = Math.floor(startTime * sampleRate);
  const endSample = Math.floor((startTime + duration) * sampleRate);

  // Draw waveform line
  ctx2d.strokeStyle = color;
  ctx2d.lineWidth = 1;
  ctx2d.beginPath();

  const step = Math.max(1, Math.floor((endSample - startSample) / w));

  for (let x = 0; x < w; x++) {
    const sampleIdx = startSample + x * step;
    if (sampleIdx >= data.length) break;
    const y = ((data[sampleIdx] + 1) / 2) * h;
    if (x === 0) ctx2d.moveTo(x, y);
    else ctx2d.lineTo(x, y);
  }

  ctx2d.stroke();

  // Center line
  ctx2d.strokeStyle = '#ccc';
  ctx2d.lineWidth = 0.5;
  ctx2d.setLineDash([4, 4]);
  ctx2d.beginPath();
  ctx2d.moveTo(0, h / 2);
  ctx2d.lineTo(w, h / 2);
  ctx2d.stroke();
  ctx2d.setLineDash([]);
}
