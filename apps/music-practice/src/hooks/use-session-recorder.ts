/**
 * useSessionRecorder — accumulate right/wrong answers during a quiz and
 * write one practice-journal session when the user leaves (unmount).
 * Feeds /stats streaks and the session builder's weakness weighting.
 */

import { useEffect, useRef } from 'react';
import { Storage } from '@/lib/utils/storage';

export function useSessionRecorder(module: string): (correct: boolean) => void {
  const tally = useRef({ correct: 0, incorrect: 0 });

  useEffect(() => {
    const current = tally.current;
    return () => {
      if (current.correct + current.incorrect > 0) {
        Storage.saveSession({
          module,
          correct: current.correct,
          incorrect: current.incorrect,
        });
        current.correct = 0;
        current.incorrect = 0;
      }
    };
  }, [module]);

  return (correct: boolean) => {
    if (correct) tally.current.correct++;
    else tally.current.incorrect++;
  };
}
