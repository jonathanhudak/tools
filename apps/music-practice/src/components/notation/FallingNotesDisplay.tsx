import { useRef, useEffect, useId } from 'react';
import { FallingNotesRenderer } from '../../lib/notation/falling-notes';

interface FallingNotesDisplayProps {
  midiNote?: number;
  noteName?: string;
  speed?: number;
  className?: string;
}

export function FallingNotesDisplay({ midiNote, noteName, speed = 2, className }: FallingNotesDisplayProps) {
  const id = useId().replace(/:/g, '-');
  const containerId = `falling-${id}`;
  const rendererRef = useRef<FallingNotesRenderer | null>(null);

  useEffect(() => {
    rendererRef.current = new FallingNotesRenderer(containerId);
    return () => { rendererRef.current?.destroy(); };
  }, [containerId]);

  useEffect(() => {
    if (!rendererRef.current) return;
    rendererRef.current.setSpeed(speed);
  }, [speed]);

  useEffect(() => {
    if (!rendererRef.current || !midiNote || !noteName) return;
    rendererRef.current.addNote(midiNote, noteName);
  }, [midiNote, noteName]);

  return <div id={containerId} className={className} />;
}
