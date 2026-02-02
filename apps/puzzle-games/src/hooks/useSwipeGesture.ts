import { useCallback, useRef } from 'react';
import type { Direction } from '../types/sokoban';

interface TouchStart {
  x: number;
  y: number;
  timestamp: number;
}

const SWIPE_THRESHOLD = 30; // Minimum distance for swipe
const SWIPE_MAX_TIME = 500; // Maximum time for swipe gesture

export function useSwipeGesture(onSwipe: (direction: Direction) => void) {
  const touchStartRef = useRef<TouchStart | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.timestamp;

      // Check if it's a valid swipe
      if (deltaTime > SWIPE_MAX_TIME) {
        touchStartRef.current = null;
        return;
      }

      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Determine swipe direction
      if (absDeltaX > SWIPE_THRESHOLD || absDeltaY > SWIPE_THRESHOLD) {
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          onSwipe(deltaX > 0 ? 'right' : 'left');
        } else {
          // Vertical swipe
          onSwipe(deltaY > 0 ? 'down' : 'up');
        }
      }

      touchStartRef.current = null;
    },
    [onSwipe]
  );

  return {
    handleTouchStart,
    handleTouchEnd,
  };
}
