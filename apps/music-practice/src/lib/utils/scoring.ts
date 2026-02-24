/**
 * Scoring Utilities
 * Game scoring logic for sight reading practice
 */

export interface RoundConfig {
  duration: number; // seconds
  notesPerRound: number;
  successThreshold: number; // 0-1 (e.g., 0.80 = 80%)
}

export const ROUND_CONFIGS: Record<'beginner' | 'intermediate' | 'advanced', RoundConfig> = {
  beginner: {
    duration: 45,
    notesPerRound: 6,
    successThreshold: 0.75,
  },
  intermediate: {
    duration: 35,
    notesPerRound: 10,
    successThreshold: 0.80,
  },
  advanced: {
    duration: 25,
    notesPerRound: 12,
    successThreshold: 0.85,
  },
};

export interface ScoreResult {
  baseScore: number;
  speedBonus: number;
  streakMultiplier: number;
  finalScore: number;
  rank: ScoreRank;
}

export type ScoreRank = 'S' | 'A' | 'B' | 'C' | 'D';

export interface RankInfo {
  min: number;
  label: string;
  color: string;
}

export const SCORE_RANKS: Record<ScoreRank, RankInfo> = {
  S: { min: 120, label: 'Perfect!', color: 'text-[var(--warning-color)]' },
  A: { min: 100, label: 'Excellent', color: 'text-[var(--success-color)]' },
  B: { min: 80, label: 'Good', color: 'text-[var(--accent-color)]' },
  C: { min: 60, label: 'Keep Practicing', color: 'text-muted-foreground' },
  D: { min: 0, label: 'Try Again', color: 'text-[var(--error-color)]' },
};

/**
 * Calculate score for a completed round
 * Formula: accuracy × (1 + speedBonus × 0.5) × streakMultiplier
 */
export function calculateScore(
  correct: number,
  total: number,
  timeLeft: number,
  maxTime: number,
  streak: number = 0
): ScoreResult {
  // Accuracy percentage
  const accuracyPercent = total > 0 ? correct / total : 0;

  // Speed bonus (0-1 based on time remaining)
  const speedBonus = maxTime > 0 ? timeLeft / maxTime : 0;

  // Streak multiplier (1.0 to 2.0)
  const streakMultiplier = Math.min(1 + streak / 20, 2.0);

  // Base score (0-100)
  const baseScore = accuracyPercent * 100;

  // Apply speed bonus (up to 50% extra)
  const scoreWithSpeed = baseScore * (1 + speedBonus * 0.5);

  // Apply streak multiplier
  const finalScore = Math.round(scoreWithSpeed * streakMultiplier);

  // Determine rank
  const rank = getScoreRank(finalScore);

  return {
    baseScore: Math.round(baseScore),
    speedBonus: Math.round(speedBonus * 100),
    streakMultiplier,
    finalScore,
    rank,
  };
}

/**
 * Get rank based on final score
 */
export function getScoreRank(score: number): ScoreRank {
  if (score >= SCORE_RANKS.S.min) return 'S';
  if (score >= SCORE_RANKS.A.min) return 'A';
  if (score >= SCORE_RANKS.B.min) return 'B';
  if (score >= SCORE_RANKS.C.min) return 'C';
  return 'D';
}

/**
 * Calculate streak multiplier
 */
export function getStreakMultiplier(streak: number): number {
  return Math.min(1 + streak / 20, 2.0);
}

/**
 * Check if round is successful
 */
export function isRoundSuccessful(
  correct: number,
  total: number,
  threshold: number
): boolean {
  if (total === 0) return false;
  return correct / total >= threshold;
}

/**
 * Calculate level from total lifetime score and accuracy
 */
export function calculateLevel(lifetimeScore: number, avgAccuracy: number): number {
  if (lifetimeScore >= 2000 && avgAccuracy >= 0.90) return 5;
  if (lifetimeScore >= 1000 && avgAccuracy >= 0.80) return 4;
  if (lifetimeScore >= 500 && avgAccuracy >= 0.80) return 3;
  if (lifetimeScore >= 200) return 2;
  return 1;
}

/**
 * Get level name
 */
export function getLevelName(level: number): string {
  const names = ['', 'Beginner', 'Novice', 'Intermediate', 'Advanced', 'Master'];
  return names[level] || 'Unknown';
}

/**
 * Calculate points to next level
 */
export function getPointsToNextLevel(lifetimeScore: number, currentLevel: number): number {
  const thresholds = [0, 0, 200, 500, 1000, 2000];
  const nextLevelThreshold = thresholds[Math.min(currentLevel + 1, 5)];
  return Math.max(0, nextLevelThreshold - lifetimeScore);
}

/**
 * Check if streak milestone reached
 */
export function isStreakMilestone(streak: number): boolean {
  return streak > 0 && (streak === 5 || streak === 10 || streak === 20 || streak % 25 === 0);
}

/**
 * Get streak milestone message
 */
export function getStreakMilestoneMessage(streak: number): string {
  if (streak >= 50) return `Legendary! ${streak} streak!`;
  if (streak >= 25) return `Unstoppable! ${streak} streak!`;
  if (streak === 20) return `On fire! ${streak} streak!`;
  if (streak === 10) return `Great streak! ${streak} in a row!`;
  if (streak === 5) return `Nice! ${streak} correct!`;
  return '';
}
