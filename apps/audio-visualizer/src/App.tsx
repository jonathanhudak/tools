import { useState, useRef } from 'react';
import { Toaster } from 'sonner';
import { AudioUploader } from './components/AudioUploader';
import { VisualizerCanvas } from './components/VisualizerCanvas';
import { ControlPanel } from './components/ControlPanel';
import { ExportButton } from './components/ExportButton';
import { Header } from './components/Header';
import { useAudioFiles } from './hooks/useAudioFiles';
import type { VisualizationSettings } from './types';

export default function App() {
  const { audioFiles, addAudioFiles, removeAudioFile, clearAudioFiles } = useAudioFiles();
  const p5InstanceRef = useRef<any>(null);

  const [settings, setSettings] = useState<VisualizationSettings>({
    lineThickness: 2,
    rotationSpeed: 0.5,
    baseHue: Math.random() * 360,
    animate: true,
  });

  const updateSetting = <K extends keyof VisualizationSettings>(
    key: K,
    value: VisualizationSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const regenerateColors = () => {
    updateSetting('baseHue', Math.random() * 360);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" />

      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8">
          {/* Main visualization area */}
          <div className="flex flex-col gap-6">
            <AudioUploader
              onFilesAdded={addAudioFiles}
              hasFiles={audioFiles.length > 0}
              onClear={clearAudioFiles}
            />

            <div className="relative bg-card rounded-lg border border-border p-4 min-h-[500px] flex items-center justify-center">
              {audioFiles.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  <p className="text-lg mb-2">No audio files loaded</p>
                  <p className="text-sm">Upload audio files to start visualizing</p>
                </div>
              ) : (
                <VisualizerCanvas
                  audioFiles={audioFiles}
                  settings={settings}
                  onRemoveFile={removeAudioFile}
                  p5InstanceRef={p5InstanceRef}
                />
              )}
            </div>
          </div>

          {/* Control panel */}
          <aside className="lg:w-80 space-y-4">
            <ControlPanel
              settings={settings}
              onSettingChange={updateSetting}
              onRegenerateColors={regenerateColors}
              disabled={audioFiles.length === 0}
            />
            <ExportButton
              p5Instance={p5InstanceRef.current}
              audioFileCount={audioFiles.length}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
