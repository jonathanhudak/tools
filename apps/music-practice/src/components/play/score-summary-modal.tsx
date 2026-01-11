import { AnimatePresence } from 'framer-motion';
import { ScoreSummary } from '../score-summary';
import type { ScoreResult } from '../../lib/utils/scoring';

interface ScoreSummaryModalProps {
  isOpen: boolean;
  scoreResult: ScoreResult | null;
  correctCount: number;
  totalNotes: number;
  isSuccessful: boolean;
  onContinue: () => void;
  onRetry?: () => void;
}

export function ScoreSummaryModal({
  isOpen,
  scoreResult,
  correctCount,
  totalNotes,
  isSuccessful,
  onContinue,
  onRetry,
}: ScoreSummaryModalProps) {
  return (
    <AnimatePresence>
      {isOpen && scoreResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <ScoreSummary
            scoreResult={scoreResult}
            correctCount={correctCount}
            totalNotes={totalNotes}
            isSuccessful={isSuccessful}
            onContinue={onContinue}
            onRetry={onRetry}
            showConfetti={isSuccessful}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
