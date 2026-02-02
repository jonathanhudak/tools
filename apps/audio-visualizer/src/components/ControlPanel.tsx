import { Palette, Settings } from 'lucide-react';
import { Button } from '@hudak/ui/components/button';
import { Label } from '@hudak/ui/components/label';
import { Slider } from '@hudak/ui/components/slider';
import { Switch } from '@hudak/ui/components/switch';
import type { VisualizationSettings } from '../types';

interface ControlPanelProps {
  settings: VisualizationSettings;
  onSettingChange: <K extends keyof VisualizationSettings>(
    key: K,
    value: VisualizationSettings[K]
  ) => void;
  onRegenerateColors: () => void;
  disabled?: boolean;
}

export function ControlPanel({
  settings,
  onSettingChange,
  onRegenerateColors,
  disabled = false,
}: ControlPanelProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-6 sticky top-4">
      <div className="flex items-center gap-2 pb-4 border-b border-border">
        <Settings className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Visualization Settings</h2>
      </div>

      <div className="space-y-6">
        {/* Line Thickness */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="line-thickness">Line Thickness</Label>
            <span className="text-sm text-muted-foreground">{settings.lineThickness}px</span>
          </div>
          <Slider
            id="line-thickness"
            min={1}
            max={10}
            step={0.5}
            value={[settings.lineThickness]}
            onValueChange={([value]) => onSettingChange('lineThickness', value)}
            disabled={disabled}
          />
        </div>

        {/* Rotation Speed */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="rotation-speed">Rotation Speed</Label>
            <span className="text-sm text-muted-foreground">
              {settings.rotationSpeed.toFixed(1)}
            </span>
          </div>
          <Slider
            id="rotation-speed"
            min={0}
            max={2}
            step={0.1}
            value={[settings.rotationSpeed]}
            onValueChange={([value]) => onSettingChange('rotationSpeed', value)}
            disabled={disabled}
          />
        </div>

        {/* Animate */}
        <div className="flex items-center justify-between">
          <Label htmlFor="animate">Animate</Label>
          <Switch
            id="animate"
            checked={settings.animate}
            onCheckedChange={(checked) => onSettingChange('animate', checked)}
            disabled={disabled}
          />
        </div>

        {/* Regenerate Colors */}
        <Button
          variant="outline"
          className="w-full"
          onClick={onRegenerateColors}
          disabled={disabled}
        >
          <Palette className="h-4 w-4 mr-2" />
          Regenerate Colors
        </Button>
      </div>
    </div>
  );
}
