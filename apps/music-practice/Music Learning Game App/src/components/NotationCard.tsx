import { Note, NotationType, Instrument } from '../App';
import { Piano, Mic } from 'lucide-react';
import { useState } from 'react';

interface NotationCardProps {
  note: Note;
  notationType: NotationType;
  instrument: Instrument;
  onSimulateInput: (note: string) => void;
}

export function NotationCard({ note, notationType, instrument, onSimulateInput }: NotationCardProps) {
  const [inputMode, setInputMode] = useState<'midi' | 'mic'>('midi');

  return (
    <div className="space-y-6">
      {/* Main Notation Display */}
      <div className="bg-card border border-border p-12 rounded-sm shadow-lg">
        {notationType === 'tablature' && (instrument === 'guitar' || instrument === 'bass') ? (
          <TablatureDisplay note={note} instrument={instrument} />
        ) : (
          <StaffDisplay note={note} />
        )}
      </div>

      {/* Input Mode Toggle */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setInputMode('midi')}
          className={`flex items-center gap-2 px-4 py-2 transition-colors ${
            inputMode === 'midi'
              ? 'text-accent'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Piano className="size-4" />
          <span className="text-sm tracking-wider">MIDI</span>
        </button>
        <div className="w-px h-6 bg-border" />
        <button
          onClick={() => setInputMode('mic')}
          className={`flex items-center gap-2 px-4 py-2 transition-colors ${
            inputMode === 'mic'
              ? 'text-accent'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Mic className="size-4" />
          <span className="text-sm tracking-wider">MIC</span>
        </button>
      </div>

      {/* Demo Input - for testing only */}
      <details className="text-center">
        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground mb-4">
          Debug: Simulate Input
        </summary>
        <div className="flex flex-wrap gap-2 justify-center">
          {['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4'].map((testNote) => (
            <button
              key={testNote}
              onClick={() => onSimulateInput(testNote)}
              className={`px-3 py-1 text-xs tracking-wider transition-colors ${
                testNote === note.displayName
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {testNote}
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}

function StaffDisplay({ note }: { note: Note }) {
  const middleC = 4 * 7;
  const relativePosition = (note.staffPosition || 0) - middleC;
  
  const needsLedgerLines = relativePosition < -6 || relativePosition > 6;
  const ledgerLines = [];
  
  if (relativePosition < -6) {
    for (let i = -8; i >= relativePosition; i -= 2) {
      ledgerLines.push(i);
    }
  } else if (relativePosition > 6) {
    for (let i = 8; i <= relativePosition; i += 2) {
      ledgerLines.push(i);
    }
  }

  return (
    <div className="flex items-center justify-center">
      <svg width="600" height="350" viewBox="0 0 600 350" className="max-w-full">
        {/* Treble Clef */}
        <text x="40" y="195" fontSize="100" fill="currentColor" className="text-foreground">
          𝄞
        </text>

        {/* Staff Lines */}
        {[0, 1, 2, 3, 4].map((line) => (
          <line
            key={line}
            x1="140"
            y1={150 + line * 25}
            x2="560"
            y2={150 + line * 25}
            stroke="currentColor"
            strokeWidth="2"
            className="text-foreground opacity-40"
          />
        ))}

        {/* Ledger Lines */}
        {ledgerLines.map((ledgerPos) => (
          <line
            key={ledgerPos}
            x1="320"
            y1={275 - ledgerPos * 12.5}
            x2="380"
            y2={275 - ledgerPos * 12.5}
            stroke="currentColor"
            strokeWidth="2"
            className="text-foreground opacity-40"
          />
        ))}

        {/* Note Head */}
        <ellipse
          cx="350"
          cy={275 - relativePosition * 12.5}
          rx="18"
          ry="14"
          fill="currentColor"
          className="text-accent"
        />

        {/* Stem */}
        {relativePosition >= 0 ? (
          <line
            x1="368"
            y1={275 - relativePosition * 12.5}
            x2="368"
            y2={275 - relativePosition * 12.5 - 80}
            stroke="currentColor"
            strokeWidth="3"
            className="text-accent"
          />
        ) : (
          <line
            x1="332"
            y1={275 - relativePosition * 12.5}
            x2="332"
            y2={275 - relativePosition * 12.5 + 80}
            stroke="currentColor"
            strokeWidth="3"
            className="text-accent"
          />
        )}
      </svg>
    </div>
  );
}

function TablatureDisplay({ note, instrument }: { note: Note; instrument: Instrument }) {
  const numStrings = instrument === 'bass' ? 4 : 6;
  const strings = Array.from({ length: numStrings }, (_, i) => numStrings - i);

  return (
    <div className="flex items-center justify-center">
      <svg width="600" height="250" viewBox="0 0 600 250" className="max-w-full">
        {/* TAB label */}
        <text x="40" y="135" fontSize="32" fill="currentColor" className="text-muted-foreground tracking-wider">
          TAB
        </text>

        {/* String Lines */}
        {strings.map((string, idx) => (
          <line
            key={string}
            x1="140"
            y1={80 + idx * 30}
            x2="560"
            y2={80 + idx * 30}
            stroke="currentColor"
            strokeWidth="2"
            className="text-foreground opacity-40"
          />
        ))}

        {/* Fret Number */}
        {note.tabString && (
          <>
            {/* Highlight circle */}
            <circle
              cx="350"
              cy={80 + (numStrings - note.tabString) * 30}
              r="24"
              fill="currentColor"
              className="text-accent opacity-20"
            />
            {/* Fret number */}
            <text
              x="350"
              y={80 + (numStrings - note.tabString) * 30}
              fontSize="28"
              fill="currentColor"
              className="text-accent"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {note.tabFret}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
