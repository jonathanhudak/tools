/* ── SVG Pattern Defs ── */
export function PatternDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <pattern id="pat-dots" patternUnits="userSpaceOnUse" width="6" height="6">
          <rect width="6" height="6" fill="#fff" />
          <circle cx="3" cy="3" r="1.2" fill="#000" />
        </pattern>
        <pattern id="pat-diag" patternUnits="userSpaceOnUse" width="6" height="6">
          <rect width="6" height="6" fill="#fff" />
          <path d="M0,6 L6,0" stroke="#000" strokeWidth="1" />
        </pattern>
        <pattern id="pat-cross" patternUnits="userSpaceOnUse" width="6" height="6">
          <rect width="6" height="6" fill="#fff" />
          <path d="M0,6 L6,0 M0,0 L6,6" stroke="#000" strokeWidth="1" />
        </pattern>
        <pattern id="pat-lines" patternUnits="userSpaceOnUse" width="6" height="6">
          <rect width="6" height="6" fill="#fff" />
          <line x1="0" y1="3" x2="6" y2="3" stroke="#000" strokeWidth="1.2" />
        </pattern>
        <pattern id="pat-brick" patternUnits="userSpaceOnUse" width="12" height="12">
          <rect width="12" height="12" fill="#fff" />
          <path d="M0,0 L12,0 M0,6 L12,6 M0,12 L12,12" stroke="#000" strokeWidth="0.8" />
          <path d="M6,0 L6,6 M0,6 L0,12 M12,6 L12,12" stroke="#000" strokeWidth="0.8" />
        </pattern>
        <pattern id="pat-piano" patternUnits="userSpaceOnUse" width="16" height="16">
          <rect width="16" height="16" fill="#fff" />
          <line x1="0" y1="16" x2="16" y2="16" stroke="#000" strokeWidth="1" />
          <line x1="8" y1="0" x2="8" y2="16" stroke="#ddd" strokeWidth="0.5" />
        </pattern>
      </defs>
    </svg>
  );
}
