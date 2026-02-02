# @hudak/audio-viz-core

Core audio visualization utilities for generating waveform visualizations and complementary color palettes.

## Features

- Waveform analysis utilities
- LCH color space complementary palette generation
- TypeScript support
- Lightweight and dependency-free (except chroma-js)

## Installation

```bash
pnpm add @hudak/audio-viz-core
```

## Usage

```typescript
import { analyzeWaveform, generateComplementaryPalette } from '@hudak/audio-viz-core';

// Analyze audio buffer
const waveformData = analyzeWaveform(audioBuffer);

// Generate color palette
const colors = generateComplementaryPalette(5);
```

## API

### `analyzeWaveform(audioBuffer: AudioBuffer, options?: WaveformOptions): WaveformData`

Analyzes an audio buffer and returns amplitude data suitable for visualization.

### `generateComplementaryPalette(count: number, baseHue?: number): string[]`

Generates a palette of complementary colors in LCH color space.

### `normalizeAmplitude(data: Float32Array): number[]`

Normalizes amplitude data to 0-1 range for easier visualization.
