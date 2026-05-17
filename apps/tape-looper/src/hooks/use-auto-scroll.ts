import { useEffect, useRef, useState, type RefObject } from 'react';
import type { TransportState } from '../lib/types';

/**
 * Auto-scrolls a horizontally-scrollable container to follow the playhead.
 * - When playhead is past `right - margin`, scrolls forward so it sits at that boundary.
 * - When playhead jumps back (rewind / seek before scrollLeft), realigns to playhead.
 * - If the user manually scrolls during playback, auto-scroll suspends until either:
 *   (a) transport returns to 'stopped', or (b) `enabled` changes (toggled off then on).
 *
 * Programmatic scrolls set a brief flag so the resulting `scroll` event isn't
 * misread as a manual scroll.
 */
export function useAutoScroll(
  scrollRef: RefObject<HTMLDivElement | null>,
  playheadTime: number,
  zoom: number,
  enabled: boolean,
  transport: TransportState,
): { userScrolled: boolean } {
  const [userScrolled, setUserScrolled] = useState(false);
  const programmaticScrollUntilRef = useRef(0);
  const lastTransportRef = useRef<TransportState>(transport);

  // Reset userScrolled when transport stops, or when follow is toggled back on.
  useEffect(() => {
    if (transport === 'stopped') {
      setUserScrolled(false);
    }
    lastTransportRef.current = transport;
  }, [transport]);

  useEffect(() => {
    if (enabled) setUserScrolled(false);
  }, [enabled]);

  // Detect manual scrolls.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (performance.now() < programmaticScrollUntilRef.current) return;
      if (lastTransportRef.current === 'stopped') return;
      setUserScrolled(true);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [scrollRef]);

  // Drive auto-scroll from playheadTime updates.
  useEffect(() => {
    if (!enabled || userScrolled) return;
    if (transport === 'stopped') return;
    const el = scrollRef.current;
    if (!el) return;

    const px = playheadTime * zoom;
    const left = el.scrollLeft;
    const viewW = el.clientWidth;
    const right = left + viewW;
    const margin = viewW * 0.2;

    let target = left;
    if (px > right - margin) {
      target = px - viewW + margin;
    } else if (px < left) {
      target = px;
    }

    if (target !== left) {
      // Mark next ~500ms of scroll events as programmatic.
      programmaticScrollUntilRef.current = performance.now() + 500;
      el.scrollLeft = Math.max(0, target);
    }
  }, [playheadTime, zoom, enabled, userScrolled, transport, scrollRef]);

  return { userScrolled };
}
