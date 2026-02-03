/**
 * Waveform analysis utilities
 */

import type { WaveformOptions, WaveformData } from './types';

const DEFAULT_OPTIONS: Required<WaveformOptions> = {
  sampleCount: 1000,
  channel: -1, // Average both channels
  normalize: true,
};

/**
 * Analyzes an audio buffer and extracts waveform data
 */
export function analyzeWaveform(
  audioBuffer: AudioBuffer,
  options: WaveformOptions = {}
): WaveformData {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { sampleCount, channel, normalize } = opts;

  // Get channel data
  let channelData: Float32Array;

  if (channel === -1 && audioBuffer.numberOfChannels > 1) {
    // Average both channels
    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);
    channelData = new Float32Array(left.length);
    for (let i = 0; i < left.length; i++) {
      channelData[i] = (left[i] + right[i]) / 2;
    }
  } else {
    channelData = audioBuffer.getChannelData(Math.max(0, channel));
  }

  // Downsample to requested sample count
  const amplitudes = downsample(channelData, sampleCount);

  // Calculate peak and RMS
  let peak = 0;
  let sumSquares = 0;

  for (const amplitude of amplitudes) {
    const abs = Math.abs(amplitude);
    if (abs > peak) peak = abs;
    sumSquares += amplitude * amplitude;
  }

  const rms = Math.sqrt(sumSquares / amplitudes.length);

  // Normalize if requested
  const finalAmplitudes = normalize ? normalizeAmplitude(amplitudes) : amplitudes;

  return {
    amplitudes: finalAmplitudes,
    peak,
    rms,
    duration: audioBuffer.duration,
    sampleRate: audioBuffer.sampleRate,
  };
}

/**
 * Downsamples audio data to a target number of samples
 */
function downsample(data: Float32Array, targetSamples: number): number[] {
  const result: number[] = [];
  const blockSize = Math.floor(data.length / targetSamples);

  for (let i = 0; i < targetSamples; i++) {
    const start = i * blockSize;
    const end = Math.min(start + blockSize, data.length);

    // Take peak value in this block
    let blockPeak = 0;
    for (let j = start; j < end; j++) {
      const abs = Math.abs(data[j]);
      if (abs > blockPeak) blockPeak = abs;
    }

    result.push(data[start + Math.floor(blockSize / 2)] || 0);
  }

  return result;
}

/**
 * Normalizes amplitude data to 0-1 range
 */
export function normalizeAmplitude(data: number[] | Float32Array): number[] {
  const array = Array.isArray(data) ? data : Array.from(data);
  const peak = Math.max(...array.map(Math.abs));

  if (peak === 0) return array.map(() => 0);

  return array.map((value) => value / peak);
}

/**
 * Extracts frequency data from an audio buffer using FFT
 */
export function extractFrequencyData(
  audioContext: AudioContext,
  audioBuffer: AudioBuffer,
  fftSize: number = 2048
): Uint8Array {
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  const source = offlineContext.createBufferSource();
  const analyser = offlineContext.createAnalyser();

  analyser.fftSize = fftSize;
  source.buffer = audioBuffer;
  source.connect(analyser);
  analyser.connect(offlineContext.destination);

  const frequencyData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(frequencyData);

  return frequencyData;
}
