/**
 * ChordQuizModes - Quiz game logic and mode definitions
 */

import type { Chord } from './chord-library';
import { CHORD_LIBRARY, getRandomChord } from './chord-library';

export type QuizMode = 'speed' | 'accuracy' | 'progression';

export interface QuizQuestion {
  chord: Chord;
  options: Chord[];
  correctIndex: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface QuizState {
  mode: QuizMode;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  currentQuestionIndex: number;
  questions: QuizQuestion[];
  userAnswers: (number | null)[];
  score: number;
  timePerQuestion: number; // milliseconds
  totalTime: number; // milliseconds
  startTime: number;
  isComplete: boolean;
}

export interface QuizStats {
  score: number;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  accuracy: number; // percentage
  averageTime: number; // milliseconds
  mode: QuizMode;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timestamp: number;
}

/**
 * Generate quiz questions
 */
export function generateQuizQuestions(
  mode: QuizMode,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  questionCount: number = 10
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  for (let i = 0; i < questionCount; i++) {
    // Get a random chord of the selected difficulty
    let chord: Chord;
    let attempts = 0;

    do {
      chord = getRandomChord(difficulty);
      attempts++;
    } while (questions.some(q => q.chord.id === chord.id) && attempts < 100);

    // Generate wrong answer options
    let options = [chord];
    const availableChords = CHORD_LIBRARY.filter(c => c.id !== chord.id);

    while (options.length < 4 && availableChords.length > 0) {
      const randomIdx = Math.floor(Math.random() * availableChords.length);
      const option = availableChords[randomIdx];

      // Filter options by similar difficulty to make it challenging
      const difficultyMatch = mode === 'accuracy' || mode === 'progression';

      if (
        !options.some(o => o.id === option.id) &&
        (!difficultyMatch || option.difficulty === difficulty)
      ) {
        options.push(option);
      }

      availableChords.splice(randomIdx, 1);
    }

    // Shuffle options
    options = options.sort(() => Math.random() - 0.5);
    const correctIndex = options.findIndex(o => o.id === chord.id);

    questions.push({
      chord,
      options,
      correctIndex,
      difficulty,
    });
  }

  return questions;
}

/**
 * Initialize quiz state
 */
export function initializeQuizState(
  mode: QuizMode,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  questionCount: number = 10
): QuizState {
  const questions = generateQuizQuestions(mode, difficulty, questionCount);

  return {
    mode,
    difficulty,
    currentQuestionIndex: 0,
    questions,
    userAnswers: Array(questions.length).fill(null),
    score: 0,
    timePerQuestion: 0,
    totalTime: 0,
    startTime: Date.now(),
    isComplete: false,
  };
}

/**
 * Record user answer and update score
 */
export function recordAnswer(state: QuizState, answerIndex: number): QuizState {
  const newState = { ...state };
  const question = state.questions[state.currentQuestionIndex];
  const isCorrect = answerIndex === question.correctIndex;

  newState.userAnswers[state.currentQuestionIndex] = answerIndex;

  // Update score based on mode
  if (isCorrect) {
    switch (state.mode) {
      case 'speed':
        // Speed mode: more points for fast answers
        const questionStartTime = state.startTime + state.totalTime;
        const timeTaken = Date.now() - questionStartTime;
        const speedBonus = Math.max(0, 100 - Math.floor(timeTaken / 100));
        newState.score += speedBonus + 10;
        break;
      case 'accuracy':
        // Accuracy mode: fixed points
        newState.score += 10;
        break;
      case 'progression':
        // Progression mode: points increase with difficulty
        const difficultyMultiplier =
          state.difficulty === 'beginner' ? 1 : state.difficulty === 'intermediate' ? 2 : 3;
        newState.score += 10 * difficultyMultiplier;
        break;
    }
  }

  return newState;
}

/**
 * Move to next question
 */
export function nextQuestion(state: QuizState): QuizState {
  const newState = { ...state };
  newState.currentQuestionIndex += 1;

  if (newState.currentQuestionIndex >= newState.questions.length) {
    newState.isComplete = true;
    newState.totalTime = Date.now() - state.startTime;
  }

  return newState;
}

/**
 * Calculate quiz statistics
 */
export function calculateStats(state: QuizState): QuizStats {
  const correct = state.userAnswers.filter((answer, index) => {
    if (answer === null) return false;
    return answer === state.questions[index].correctIndex;
  }).length;

  const incorrect = state.userAnswers.filter((answer, index) => {
    if (answer === null) return false;
    return answer !== state.questions[index].correctIndex;
  }).length;

  const totalTime = Date.now() - state.startTime;
  const validAnswers = state.userAnswers.filter(a => a !== null).length;

  return {
    score: state.score,
    totalQuestions: state.questions.length,
    correct,
    incorrect,
    accuracy: (correct / state.questions.length) * 100,
    averageTime: validAnswers > 0 ? totalTime / validAnswers : 0,
    mode: state.mode,
    difficulty: state.difficulty,
    timestamp: Date.now(),
  };
}

/**
 * Get leaderboard entry structure
 */
export interface LeaderboardEntry extends QuizStats {
  playerName: string;
  date: Date;
}

/**
 * Load leaderboard from localStorage
 */
export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const data = localStorage.getItem('chord-quiz-leaderboard');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save leaderboard entry
 */
export function saveLeaderboardEntry(stats: QuizStats, playerName: string): void {
  try {
    const leaderboard = loadLeaderboard();
    leaderboard.push({
      ...stats,
      playerName,
      date: new Date(),
    });

    // Keep only top 100 entries
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem(
      'chord-quiz-leaderboard',
      JSON.stringify(leaderboard.slice(0, 100))
    );
  } catch (e) {
    console.error('Failed to save leaderboard entry:', e);
  }
}

/**
 * Get top scores for a specific mode and difficulty
 */
export function getTopScores(mode?: QuizMode, difficulty?: string, limit = 10): LeaderboardEntry[] {
  const leaderboard = loadLeaderboard();

  return leaderboard
    .filter(entry => {
      if (mode && entry.mode !== mode) return false;
      if (difficulty && entry.difficulty !== difficulty) return false;
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
