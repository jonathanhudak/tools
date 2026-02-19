import { useRef, useEffect, useId } from 'react';
import { TabRenderer } from '../../lib/notation/tab-renderer';

interface TabDisplayProps {
  midiNote?: number;
  midiNotes?: number[];
  instrumentId?: string;
  showStaff?: boolean;
  className?: string;
}

export function TabDisplay({ midiNote, midiNotes, instrumentId = 'guitar', showStaff = false, className }: TabDisplayProps) {
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
      rendererRef.current.renderNotes(midiNotes);
    } else if (midiNote !== undefined) {
      if (showStaff) {
        rendererRef.current.renderStaffAndTab(midiNote);
      } else {
        rendererRef.current.renderNote(midiNote);
      }
    } else {
      rendererRef.current.showWelcome();
    }
  }, [midiNote, midiNotes, showStaff]);

  return <div id={containerId} className={className} />;
}
