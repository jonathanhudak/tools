/**
 * Audio Playback Utility
 * Synthesizes piano-like sounds using Web Audio API
 */

export class AudioPlayback {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.12; // Master volume (softer)
      this.masterGain.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  /**
   * Play a note with a piano-like sound
   * @param midiNote - MIDI note number (0-127)
   * @param duration - Duration in seconds (default: 0.5)
   */
  public playNote(midiNote: number, duration: number = 0.5): void {
    if (!this.audioContext || !this.masterGain) {
      console.warn('Audio context not initialized');
      return;
    }

    // Resume audio context if suspended (for user gesture requirement)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const frequency = this.midiToFrequency(midiNote);
    const now = this.audioContext.currentTime;

    // Create oscillators for a softer, mellower piano-like sound
    // Fundamental frequency (pure sine for softness)
    const osc1 = this.audioContext.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = frequency;

    // Second harmonic (subtle brightness)
    const osc2 = this.audioContext.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = frequency * 2;

    // Third harmonic (very subtle warmth)
    const osc3 = this.audioContext.createOscillator();
    osc3.type = 'sine'; // Changed to sine for softer sound
    osc3.frequency.value = frequency * 3;

    // Create gain nodes for each oscillator
    const gain1 = this.audioContext.createGain();
    const gain2 = this.audioContext.createGain();
    const gain3 = this.audioContext.createGain();

    // Set relative volumes for each harmonic (much softer mix)
    gain1.gain.value = 1.0;    // Fundamental
    gain2.gain.value = 0.15;   // Second harmonic (reduced)
    gain3.gain.value = 0.08;   // Third harmonic (reduced)

    // Connect oscillators to their gains
    osc1.connect(gain1);
    osc2.connect(gain2);
    osc3.connect(gain3);

    // Create envelope gain for ADSR
    const envelopeGain = this.audioContext.createGain();
    gain1.connect(envelopeGain);
    gain2.connect(envelopeGain);
    gain3.connect(envelopeGain);

    // Connect to master gain
    envelopeGain.connect(this.masterGain);

    // ADSR Envelope (soft and mellow)
    const attackTime = 0.02;   // Gentle attack
    const decayTime = 0.15;    // Smooth decay
    const sustainLevel = 0.5;  // Lower sustain (softer)
    const releaseTime = 0.4;   // Longer release for smoothness

    envelopeGain.gain.setValueAtTime(0, now);
    envelopeGain.gain.exponentialRampToValueAtTime(0.8, now + attackTime); // Softer peak
    envelopeGain.gain.exponentialRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
    envelopeGain.gain.setValueAtTime(sustainLevel, now + duration - releaseTime);
    envelopeGain.gain.exponentialRampToValueAtTime(0.001, now + duration); // Smooth fade out

    // Start and stop oscillators
    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    osc1.stop(now + duration);
    osc2.stop(now + duration);
    osc3.stop(now + duration);
  }

  /**
   * Convert MIDI note number to frequency in Hz
   * @param midiNote - MIDI note number (0-127)
   * @returns Frequency in Hz
   */
  private midiToFrequency(midiNote: number): number {
    // A4 (MIDI note 69) = 440 Hz
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  /**
   * Set master volume
   * @param volume - Volume level (0-1)
   */
  public setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Clean up audio context
   */
  public cleanup(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
