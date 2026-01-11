import type { ClefType } from '../utils/music-theory';
import { midiToVexflow } from '../utils/music-theory';
import type { StaffRenderer } from '../notation/staff-renderer';
import type { TabRenderer } from '../notation/tab-renderer';

interface RenderNoteParams {
  instrument: string;
  tabDisplayMode: 'staff' | 'tab' | 'both';
  clef: ClefType;
  midiNote: number;
  staffRenderer: StaffRenderer | null;
  tabRenderer: TabRenderer | null;
}

export function renderPracticeNote({
  instrument,
  tabDisplayMode,
  clef,
  midiNote,
  staffRenderer,
  tabRenderer,
}: RenderNoteParams): void {
  if (instrument === 'guitar') {
    if (tabDisplayMode === 'both' && tabRenderer) {
      tabRenderer.renderStaffAndTab(midiNote);
      return;
    }
    if (tabDisplayMode === 'tab' && tabRenderer) {
      tabRenderer.renderNote(midiNote);
      return;
    }
  }

  if (!staffRenderer) return;
  const vexflowNote = midiToVexflow(midiNote, clef);
  if (vexflowNote) {
    staffRenderer.renderNote(vexflowNote);
  }
}
