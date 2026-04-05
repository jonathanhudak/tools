import { useRef, useEffect, useId } from 'react';
import { StaffRenderer, type ClefType } from '../../lib/notation/staff-renderer';

interface StaffDisplayProps {
  note?: string;
  notes?: string[];
  clef?: ClefType;
  /** When true, render all notes stacked as a chord instead of sequential */
  asChord?: boolean;
  className?: string;
}

export function StaffDisplay({ note, notes, clef = 'treble', asChord = false, className }: StaffDisplayProps) {
  const id = useId().replace(/:/g, '-');
  const containerId = `staff-${id}`;
  const rendererRef = useRef<StaffRenderer | null>(null);

  useEffect(() => {
    rendererRef.current = new StaffRenderer(containerId);
    return () => { rendererRef.current?.clear(); };
  }, [containerId]);

  useEffect(() => {
    if (!rendererRef.current) return;
    rendererRef.current.setClef(clef);
    if (notes && notes.length > 0) {
      if (asChord) {
        rendererRef.current.renderChord(notes);
      } else {
        rendererRef.current.renderNotes(notes);
      }
    } else if (note) {
      rendererRef.current.renderNote(note);
    } else {
      rendererRef.current.showWelcome();
    }
  }, [note, notes, clef, asChord]);

  return <div id={containerId} className={className} />;
}
