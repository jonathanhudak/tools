/**
 * Application types
 */

export interface AudioFileData {
  id: string;
  name: string;
  file: File;
  buffer: AudioBuffer | null;
  waveformData: number[] | null;
  color: string;
}

export interface VisualizationSettings {
  lineThickness: number;
  rotationSpeed: number;
  baseHue: number;
  animate: boolean;
}
