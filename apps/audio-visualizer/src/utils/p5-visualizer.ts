/**
 * p5.js sketch for radial waveform visualization
 */

import type p5Type from 'p5';
import type { AudioFileData, VisualizationSettings } from '../types';

export function createVisualizerSketch(
  audioFiles: AudioFileData[],
  settings: VisualizationSettings
) {
  return (p5: p5Type) => {
    let rotation = 0;
    let canvas: HTMLCanvasElement | null = null;

    p5.setup = () => {
      const container = document.querySelector('[data-p5-container]') as HTMLElement;
      const width = container?.clientWidth || 800;
      const height = container?.clientHeight || 600;

      canvas = p5.createCanvas(width, height) as any;
      p5.strokeWeight(settings.lineThickness);
    };

    p5.draw = () => {
      p5.background(0, 0, 0, 25); // Fade effect

      if (audioFiles.length === 0) return;

      p5.translate(p5.width / 2, p5.height / 2);
      p5.rotate(rotation);

      // Calculate radius based on canvas size
      const baseRadius = Math.min(p5.width, p5.height) * 0.2;
      const maxRadius = Math.min(p5.width, p5.height) * 0.45;

      audioFiles.forEach((audioFile) => {
        if (!audioFile.waveformData) return;

        const { waveformData, color } = audioFile;
        const sampleCount = waveformData.length;

        // Set color
        p5.stroke(color);

        // Draw radial waveform
        for (let i = 0; i < sampleCount; i++) {
          const angle = p5.map(i, 0, sampleCount, 0, p5.TWO_PI);
          const amplitude = waveformData[i];

          // Calculate radius based on amplitude
          const radius = baseRadius + amplitude * (maxRadius - baseRadius);

          // Calculate position
          const x = p5.cos(angle) * radius;
          const y = p5.sin(angle) * radius;

          // Draw line from center
          if (i === 0) {
            p5.beginShape();
          }
          p5.vertex(x, y);
        }

        p5.endShape(p5.CLOSE);
      });

      // Update rotation
      if (settings.animate) {
        rotation += settings.rotationSpeed * 0.01;
      }
    };

    p5.windowResized = () => {
      if (!canvas) return;
      const container = canvas.parentElement;
      const width = container?.clientWidth || 800;
      const height = container?.clientHeight || 600;
      p5.resizeCanvas(width, height);
    };

    // Store references for updates
    (p5 as any).audioFiles = audioFiles;
    (p5 as any).settings = settings;
    (p5 as any).canvas = canvas;
  };
}
