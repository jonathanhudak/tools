import { useRef, useEffect, useId } from 'react';
import { TabRenderer } from '../../lib/notation/tab-renderer';

interface TabDisplayProps {
  midiNote?: number;
  midiNotes?: number[];
  instrumentId?: string;
  showStaff?: boolean;
  /** When true, render all notes stacked as a chord instead of sequential (scale) */
  asChord?: boolean;
  className?: string;
}

export function TabDisplay({ midiNote, midiNotes, instrumentId = 'guitar', showStaff = false, asChord = false, className }: TabDisplayProps) {
  const id = useId().replace(/:/g, '-');
  const containerId = `tab-${id}`;
  const rendererRef = useRef<TabRenderer | null>(null);

  useEffect(() => {
    rendererRef.current = new TabRenderer(containerId, instrumentId);
    return () => { rendererRef.current?.clear(); };
  }, [containerId, instrumentId]);

  useEffect(() => {
    if (!rendererRef.current) return;
    if (midiNotes && midiNotes.length > 0) {
      if (asChord) {
        rendererRef.current.renderChord(midiNotes);
      } else {
        rendererRef.current.renderNotes(midiNotes);
      }
    } else if (midiNote !== undefined) {
      if (showStaff) {
        rendererRef.current.renderStaffAndTab(midiNote);
      } else {
        rendererRef.current.renderNote(midiNote);
      }
    } else {
      rendererRef.current.showWelcome();
    }
  }, [midiNote, midiNotes, showStaff, asChord]);

  return <div id={containerId} className={className} />;
}
