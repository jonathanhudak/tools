import { useState } from 'react';
import type { MIDIDiagnostics } from '../lib/midi-input';

/**
 * MIDI status pill — surface connect/rescan + diagnostics in one place.
 * Tooltips don't work on touch (Daylight), so the diagnostics live in a
 * tappable inline popover.
 */
export function MidiStatus({
  connected,
  error,
  diag,
  onConnect,
}: {
  connected: boolean;
  error: string | null;
  diag: MIDIDiagnostics | null;
  onConnect: () => void;
}): JSX.Element {
  const [open, setOpen] = useState(false);

  const labelEmoji = connected ? '✓' : error ? '⚠' : '…';
  const buttonLabel = connected
    ? `🎹 ${diag?.connectedInputName ?? 'MIDI'} ${labelEmoji}`
    : `🎹 MIDI ${labelEmoji}`;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="track-btn"
        onClick={connected ? () => setOpen((v) => !v) : onConnect}
        style={error && !connected ? { borderColor: '#e53e3e', color: '#e53e3e' } : undefined}
        title={error ?? (connected ? 'Tap to view MIDI status' : 'Tap to connect MIDI keyboard')}
      >
        {buttonLabel}
      </button>
      <button
        className="track-btn"
        onClick={() => setOpen((v) => !v)}
        title="MIDI diagnostics"
        style={{ marginLeft: 4, minWidth: 28, padding: '2px 4px' }}
      >
        ⓘ
      </button>
      {open && (
        <div className="midi-diag-popover">
          <div className="midi-diag-row">
            <span className="midi-diag-label">Support</span>
            <span>{diag?.supported ? 'yes' : 'no'}</span>
          </div>
          <div className="midi-diag-row">
            <span className="midi-diag-label">Permission</span>
            <span>{diag?.permission ?? 'unknown'}</span>
          </div>
          <div className="midi-diag-row">
            <span className="midi-diag-label">Access</span>
            <span>{diag?.hasAccess ? 'granted' : 'no'}</span>
          </div>
          <div className="midi-diag-row">
            <span className="midi-diag-label">Inputs</span>
            <span>{diag?.inputCount ?? 0}</span>
          </div>
          <div className="midi-diag-row">
            <span className="midi-diag-label">Connected</span>
            <span>{diag?.connectedInputName ?? '—'}</span>
          </div>
          {diag && diag.inputs.length > 0 && (
            <div className="midi-diag-inputs">
              {diag.inputs.map((i) => (
                <div key={i.id} className="midi-diag-input">
                  <div style={{ fontWeight: 700 }}>{i.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                    {i.manufacturer || '—'} · {i.state} · {i.connection}
                  </div>
                </div>
              ))}
            </div>
          )}
          {error && (
            <div className="midi-diag-error">{error}</div>
          )}
          <div className="midi-diag-actions">
            <button className="track-btn" onClick={onConnect}>
              ⟳ {diag?.hasAccess ? 'Rescan' : 'Request access'}
            </button>
            <button className="track-btn" onClick={() => setOpen(false)}>Close</button>
          </div>
          <div className="midi-diag-hint">
            On Daylight / Android Chrome: plug keyboard via USB-OTG before tapping.
            If permission shows "denied", clear site permissions in browser settings.
          </div>
        </div>
      )}
    </div>
  );
}
