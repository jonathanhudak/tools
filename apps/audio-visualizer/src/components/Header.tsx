import { Waves } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <Waves className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Audio Visualizer</h1>
            <p className="text-sm text-muted-foreground">
              Create beautiful radial waveform visualizations
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
