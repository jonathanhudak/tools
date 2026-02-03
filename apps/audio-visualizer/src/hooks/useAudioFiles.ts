import { useState, useCallback } from 'react';
import { analyzeWaveform, generateComplementaryPalette } from '@hudak/audio-viz-core';
import { toast } from 'sonner';
import type { AudioFileData } from '../types';

export function useAudioFiles() {
  const [audioFiles, setAudioFiles] = useState<AudioFileData[]>([]);
  const [audioContext] = useState<AudioContext>(() => new AudioContext());

  const addAudioFiles = useCallback(
    async (files: File[]) => {
      const newFiles: AudioFileData[] = [];
      const colors = generateComplementaryPalette(files.length + audioFiles.length);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const id = `${Date.now()}-${i}`;

        try {
          // Read file as array buffer
          const arrayBuffer = await file.arrayBuffer();

          // Decode audio
          const buffer = await audioContext.decodeAudioData(arrayBuffer);

          // Analyze waveform
          const { amplitudes } = analyzeWaveform(buffer, {
            sampleCount: 500,
            normalize: true,
          });

          newFiles.push({
            id,
            name: file.name,
            file,
            buffer,
            waveformData: amplitudes,
            color: colors[audioFiles.length + i],
          });
        } catch (error) {
          console.error(`Failed to process ${file.name}:`, error);
          toast.error(`Failed to process ${file.name}`);
        }
      }

      setAudioFiles((prev) => [...prev, ...newFiles]);
    },
    [audioContext, audioFiles.length]
  );

  const removeAudioFile = useCallback((id: string) => {
    setAudioFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

  const clearAudioFiles = useCallback(() => {
    setAudioFiles([]);
  }, []);

  return {
    audioFiles,
    addAudioFiles,
    removeAudioFile,
    clearAudioFiles,
  };
}
