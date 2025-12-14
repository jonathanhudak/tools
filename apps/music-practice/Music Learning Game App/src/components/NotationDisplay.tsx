import { Note, NotationType, Instrument } from '../App';

interface NotationDisplayProps {
  note: Note;
  notationType: NotationType;
  instrument: Instrument;
}

export function NotationDisplay({ note, notationType, instrument }: NotationDisplayProps) {
  if (notationType === 'tablature' && (instrument === 'guitar' || instrument === 'bass')) {
    return <TablatureDisplay note={note} instrument={instrument} />;
  }
  return <StaffDisplay note={note} />;
}

function StaffDisplay({ note }: { note: Note }) {
  // Calculate position on staff (middle C is position 0)
  const middleC = 4 * 7; // C4
  const relativePosition = (note.staffPosition || 0) - middleC;
  
  // Calculate if we need ledger lines
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
    <div className="border border-border bg-card p-8">
      <div className="flex items-center justify-center">
        <svg width="400" height="300" viewBox="0 0 400 300" className="max-w-full">
          {/* Treble Clef */}
          <text x="20" y="165" fontSize="80" fill="currentColor" className="text-foreground">
            𝄞
          </text>

          {/* Staff Lines */}
          {[0, 1, 2, 3, 4].map((line) => (
            <line
              key={line}
              x1="80"
              y1={120 + line * 20}
              x2="380"
              y2={120 + line * 20}
              stroke="currentColor"
              strokeWidth="2"
              className="text-foreground"
            />
          ))}

          {/* Ledger Lines */}
          {ledgerLines.map((ledgerPos) => (
            <line
              key={ledgerPos}
              x1="180"
              y1={200 - ledgerPos * 10}
              x2="220"
              y2={200 - ledgerPos * 10}
              stroke="currentColor"
              strokeWidth="2"
              className="text-foreground"
            />
          ))}

          {/* Note Head */}
          <ellipse
            cx="200"
            cy={200 - relativePosition * 10}
            rx="12"
            ry="10"
            fill="currentColor"
            className="text-accent"
          />

          {/* Stem */}
          {relativePosition >= 0 ? (
            <line
              x1="212"
              y1={200 - relativePosition * 10}
              x2="212"
              y2={200 - relativePosition * 10 - 60}
              stroke="currentColor"
              strokeWidth="2"
              className="text-accent"
            />
          ) : (
            <line
              x1="188"
              y1={200 - relativePosition * 10}
              x2="188"
              y2={200 - relativePosition * 10 + 60}
              stroke="currentColor"
              strokeWidth="2"
              className="text-accent"
            />
          )}
        </svg>
      </div>
      <div className="text-center mt-4 text-muted-foreground text-sm tracking-wider">
        STAFF NOTATION
      </div>
    </div>
  );
}

function TablatureDisplay({ note, instrument }: { note: Note; instrument: Instrument }) {
  const numStrings = instrument === 'bass' ? 4 : 6;
  const strings = Array.from({ length: numStrings }, (_, i) => numStrings - i);

  return (
    <div className="border border-border bg-card p-8">
      <div className="flex items-center justify-center">
        <svg width="400" height="200" viewBox="0 0 400 200" className="max-w-full">
          {/* TAB label */}
          <text x="20" y="110" fontSize="24" fill="currentColor" className="text-muted-foreground tracking-wider">
            TAB
          </text>

          {/* String Lines */}
          {strings.map((string, idx) => (
            <line
              key={string}
              x1="80"
              y1={60 + idx * 25}
              x2="380"
              y2={60 + idx * 25}
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-foreground"
            />
          ))}

          {/* Fret Number */}
          {note.tabString && (
            <>
              {/* Highlight circle */}
              <circle
                cx="200"
                cy={60 + (numStrings - note.tabString) * 25}
                r="18"
                fill="currentColor"
                className="text-accent opacity-20"
              />
              {/* Fret number */}
              <text
                x="200"
                y={60 + (numStrings - note.tabString) * 25}
                fontSize="20"
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
      <div className="text-center mt-4 text-muted-foreground text-sm tracking-wider">
        TABLATURE
      </div>
    </div>
  );
}
