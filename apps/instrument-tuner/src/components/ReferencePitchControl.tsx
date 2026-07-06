/**
 * Reference pitch (A4) preference control.
 * Preset chips (440 concert standard, 432 Verdi) plus a custom Hz field.
 */

import { useId } from 'react';
import { Button, Label } from '@hudak/ui';
import {
  MAX_REFERENCE_PITCH,
  MIN_REFERENCE_PITCH,
  REFERENCE_PITCH_PRESETS,
  STANDARD_A4,
} from '@hudak/tuning-data';
import { useReferencePitch } from '../hooks/use-reference-pitch';

export function ReferencePitchControl() {
  const { referencePitch, setReferencePitch } = useReferencePitch();
  const customInputId = useId();
  const isPreset = REFERENCE_PITCH_PRESETS.some((preset) => preset.hz === referencePitch);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Reference Pitch (A4)</Label>
        <span className="text-sm text-muted-foreground">A4 = {referencePitch} Hz</span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {REFERENCE_PITCH_PRESETS.map((preset) => (
          <Button
            key={preset.hz}
            variant={referencePitch === preset.hz ? 'default' : 'outline'}
            size="sm"
            className="h-8"
            onClick={() => setReferencePitch(preset.hz)}
            title={preset.description}
          >
            {preset.label}
          </Button>
        ))}
        <div className="flex items-center gap-1.5">
          <Label htmlFor={customInputId} className="text-xs text-muted-foreground">
            Custom
          </Label>
          <input
            id={customInputId}
            type="number"
            min={MIN_REFERENCE_PITCH}
            max={MAX_REFERENCE_PITCH}
            step={1}
            value={isPreset ? '' : referencePitch}
            placeholder={String(referencePitch)}
            onChange={(e) => {
              const parsed = Number(e.target.value);
              if (Number.isFinite(parsed) && parsed >= MIN_REFERENCE_PITCH && parsed <= MAX_REFERENCE_PITCH) {
                setReferencePitch(parsed);
              }
            }}
            className="h-8 w-20 rounded-md border border-input bg-background px-2 text-sm"
            aria-label={`Custom A4 reference in hertz (${MIN_REFERENCE_PITCH}–${MAX_REFERENCE_PITCH})`}
          />
          <span className="text-xs text-muted-foreground">Hz</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {referencePitch === STANDARD_A4
          ? 'Concert standard. Every note is derived from A4 = 440 Hz in equal temperament.'
          : `True mathematical retuning: every frequency — detection, string targets, and reference tones — is scaled by exactly ${referencePitch}/440. Microtonal cent offsets are preserved.`}
      </p>
    </div>
  );
}
