import { useEffect, useRef } from 'react';
import type p5Type from 'p5';
import type { AudioFileData, VisualizationSettings } from '../types';
import { createVisualizerSketch } from '../utils/p5-visualizer';

interface VisualizerCanvasProps {
  audioFiles: AudioFileData[];
  settings: VisualizationSettings;
  onRemoveFile: (id: string) => void;
  p5InstanceRef?: React.MutableRefObject<p5Type | null>;
}

export function VisualizerCanvas({
  audioFiles,
  settings,
  onRemoveFile: _onRemoveFile,
  p5InstanceRef: externalRef,
}: VisualizerCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const localRef = useRef<p5Type | null>(null);
  const p5InstanceRef = externalRef || localRef;

  useEffect(() => {
    if (!containerRef.current) return;

    // Dynamically import p5 to avoid SSR issues
    import('p5').then((P5) => {
      const sketch = createVisualizerSketch(audioFiles, settings);
      p5InstanceRef.current = new P5.default(sketch, containerRef.current!);
    });

    return () => {
      p5InstanceRef.current?.remove();
      p5InstanceRef.current = null;
    };
  }, []);

  // Update sketch when audioFiles or settings change
  useEffect(() => {
    if (p5InstanceRef.current) {
      // Update the sketch's data
      (p5InstanceRef.current as any).audioFiles = audioFiles;
      (p5InstanceRef.current as any).settings = settings;
    }
  }, [audioFiles, settings]);

  return (
    <div
      ref={containerRef}
      data-p5-container
      className="w-full h-full flex items-center justify-center"
    >
      {/* p5.js will render here */}
    </div>
  );
}
