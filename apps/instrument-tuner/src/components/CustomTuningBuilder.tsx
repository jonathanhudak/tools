import { useState } from 'react';
import { Note } from 'tonal';
import { Plus, Trash2, Wand2 } from 'lucide-react';
import { Button } from '@hudak/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui';
import { Input } from '@hudak/ui';
import { Label } from '@hudak/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@hudak/ui';
import { type Tuning, createCustomTuning } from '../data/tunings';

interface CustomTuningBuilderProps {
  onTuningCreate: (tuning: Tuning) => void;
  onCancel?: () => void;
}

// Available notes for selection (expanded range)
const OCTAVES = [0, 1, 2, 3, 4, 5, 6];
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Generate all possible notes
const ALL_NOTES = OCTAVES.flatMap((octave) =>
  NOTE_NAMES.map((note) => `${note}${octave}`)
).filter((note) => {
  const freq = Note.freq(note);
  // Filter to playable range (roughly 20Hz to 5000Hz)
  return freq && freq >= 20 && freq <= 5000;
});

// Common starting configurations
const PRESETS = {
  '6-string': ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  '4-string': ['E1', 'A1', 'D2', 'G2'],
  '5-string': ['B0', 'E1', 'A1', 'D2', 'G2'],
  '7-string': ['B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  ukulele: ['G4', 'C4', 'E4', 'A4'],
  violin: ['G3', 'D4', 'A4', 'E5'],
  '3-string': ['G3', 'B3', 'D4'],
};

export function CustomTuningBuilder({ onTuningCreate, onCancel }: CustomTuningBuilderProps) {
  const [notes, setNotes] = useState<string[]>(['E2', 'A2', 'D3', 'G3', 'B3', 'E4']);
  const [tuningName, setTuningName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const updateNote = (index: number, note: string) => {
    const newNotes = [...notes];
    newNotes[index] = note;
    setNotes(newNotes);
    setError(null);
  };

  const addString = () => {
    if (notes.length >= 12) {
      setError('Maximum 12 strings supported');
      return;
    }
    // Add a note higher than the current highest
    const lastNote = notes[notes.length - 1];
    const lastMidi = Note.midi(lastNote);
    if (lastMidi !== null) {
      const newMidi = Math.min(lastMidi + 5, 96); // Don't go too high
      const newNote = Note.fromMidi(newMidi);
      setNotes([...notes, newNote]);
    } else {
      setNotes([...notes, 'E4']);
    }
    setError(null);
  };

  const removeString = (index: number) => {
    if (notes.length <= 1) {
      setError('At least one string is required');
      return;
    }
    const newNotes = notes.filter((_, i) => i !== index);
    setNotes(newNotes);
    setError(null);
  };

  const applyPreset = (preset: keyof typeof PRESETS) => {
    setNotes([...PRESETS[preset]]);
    setError(null);
  };

  const handleCreate = () => {
    // Validate notes
    const invalidNotes = notes.filter((n) => Note.freq(n) === null);
    if (invalidNotes.length > 0) {
      setError(`Invalid notes: ${invalidNotes.join(', ')}`);
      return;
    }

    const tuning = createCustomTuning(notes, tuningName || undefined);
    if (tuning) {
      onTuningCreate(tuning);
    } else {
      setError('Failed to create tuning. Please check your notes.');
    }
  };

  // Calculate frequency for display
  const getFrequency = (note: string): string => {
    const freq = Note.freq(note);
    return freq ? `${freq.toFixed(1)} Hz` : 'Invalid';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Custom Tuning Builder
        </CardTitle>
        <CardDescription>
          Create your own tuning by specifying notes for each string
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tuning Name */}
        <div className="space-y-2">
          <Label htmlFor="tuning-name">Tuning Name (optional)</Label>
          <Input
            id="tuning-name"
            placeholder="My Custom Tuning"
            value={tuningName}
            onChange={(e) => setTuningName(e.target.value)}
          />
        </div>

        {/* Quick Presets */}
        <div className="space-y-2">
          <Label>Quick Start</Label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(PRESETS).map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset as keyof typeof PRESETS)}
              >
                {preset}
              </Button>
            ))}
          </div>
        </div>

        {/* String Editor */}
        <div className="space-y-2">
          <Label>Strings (low to high)</Label>
          <div className="space-y-2">
            {notes.map((note, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-16">
                  String {notes.length - index}
                </span>
                <Select value={note} onValueChange={(value) => updateNote(index, value)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {ALL_NOTES.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground w-20">
                  {getFrequency(note)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeString(index)}
                  disabled={notes.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addString}
            disabled={notes.length >= 12}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Add String
          </Button>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="p-3 bg-muted rounded-md">
            <div className="text-lg font-mono">
              {notes.map((n) => Note.pitchClass(n) || n.replace(/\d/g, '')).join(' - ')}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {notes.join(' - ')} ({notes.length} strings)
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleCreate} className="flex-1">
            Use This Tuning
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
