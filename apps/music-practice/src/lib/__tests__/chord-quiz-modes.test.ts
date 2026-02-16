/**
 * Tests for chord-quiz-modes.ts
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  generateQuizQuestions,
  initializeQuizState,
  recordAnswer,
  nextQuestion,
  calculateStats,
  loadLeaderboard,
  saveLeaderboardEntry,
  getTopScores,
} from '../chord-quiz-modes';

describe('Chord Quiz Modes', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('generateQuizQuestions', () => {
    it('should generate correct number of questions', () => {
      const questions = generateQuizQuestions('speed', 'beginner', 10);
      expect(questions.length).toBe(10);
    });

    it('should generate questions with 4 options', () => {
      const questions = generateQuizQuestions('accuracy', 'intermediate', 5);
      questions.forEach(q => {
        expect(q.options.length).toBe(4);
      });
    });

    it('should have correct chord in options', () => {
      const questions = generateQuizQuestions('progression', 'advanced', 5);
      questions.forEach(q => {
        expect(q.options[q.correctIndex].id).toBe(q.chord.id);
      });
    });

    it('should have no duplicate chords in single quiz', () => {
      const questions = generateQuizQuestions('speed', 'beginner', 10);
      const ids = questions.map(q => q.chord.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should respect difficulty filter', () => {
      const questions = generateQuizQuestions('accuracy', 'intermediate', 5);
      questions.forEach(q => {
        expect(q.difficulty).toBe('intermediate');
      });
    });
  });

  describe('initializeQuizState', () => {
    it('should create initial quiz state', () => {
      const state = initializeQuizState('speed', 'beginner', 10);
      expect(state.mode).toBe('speed');
      expect(state.difficulty).toBe('beginner');
      expect(state.currentQuestionIndex).toBe(0);
      expect(state.score).toBe(0);
      expect(state.isComplete).toBe(false);
    });

    it('should initialize user answers array', () => {
      const state = initializeQuizState('accuracy', 'intermediate', 5);
      expect(state.userAnswers.length).toBe(5);
      state.userAnswers.forEach(answer => {
        expect(answer).toBeNull();
      });
    });

    it('should set start time', () => {
      const before = Date.now();
      const state = initializeQuizState('progression', 'advanced', 10);
      const after = Date.now();
      expect(state.startTime).toBeGreaterThanOrEqual(before);
      expect(state.startTime).toBeLessThanOrEqual(after);
    });
  });

  describe('recordAnswer', () => {
    it('should record correct answer', () => {
      const state = initializeQuizState('speed', 'beginner', 5);
      const correctIndex = state.questions[0].correctIndex;
      const newState = recordAnswer(state, correctIndex);
      expect(newState.userAnswers[0]).toBe(correctIndex);
    });

    it('should increase score for correct answer', () => {
      const state = initializeQuizState('accuracy', 'beginner', 5);
      const correctIndex = state.questions[0].correctIndex;
      const newState = recordAnswer(state, correctIndex);
      expect(newState.score).toBeGreaterThan(0);
    });

    it('should not increase score for wrong answer', () => {
      const state = initializeQuizState('accuracy', 'beginner', 5);
      const correctIndex = state.questions[0].correctIndex;
      const wrongIndex = (correctIndex + 1) % 4;
      const newState = recordAnswer(state, wrongIndex);
      expect(newState.score).toBe(0);
    });

    it('should handle different modes differently', () => {
      const speedState = initializeQuizState('speed', 'beginner', 5);
      const accuracyState = initializeQuizState('accuracy', 'beginner', 5);
      const correctIndex = 0;

      const speedResult = recordAnswer(speedState, correctIndex);
      const accuracyResult = recordAnswer(accuracyState, correctIndex);

      // Speed mode may award different points based on time
      expect(speedResult.score).toBeGreaterThanOrEqual(0);
      expect(accuracyResult.score).toBeGreaterThanOrEqual(10);
    });
  });

  describe('nextQuestion', () => {
    it('should increment current question index', () => {
      const state = initializeQuizState('accuracy', 'beginner', 5);
      const newState = nextQuestion(state);
      expect(newState.currentQuestionIndex).toBe(1);
    });

    it('should mark quiz as complete on last question', () => {
      const state = initializeQuizState('speed', 'intermediate', 3);
      let newState = state;
      newState = nextQuestion(newState);
      newState = nextQuestion(newState);
      newState = nextQuestion(newState);
      expect(newState.isComplete).toBe(true);
    });

    it('should set total time when complete', () => {
      const state = initializeQuizState('progression', 'advanced', 1);
      const newState = nextQuestion(state);
      expect(newState.totalTime).toBeGreaterThan(0);
    });
  });

  describe('calculateStats', () => {
    it('should calculate correct count', () => {
      const state = initializeQuizState('accuracy', 'beginner', 3);
      let newState = state;

      // Answer first question correctly
      newState.userAnswers[0] = newState.questions[0].correctIndex;
      // Answer second question incorrectly
      newState.userAnswers[1] =
        (newState.questions[1].correctIndex + 1) % 4;
      // Answer third question correctly
      newState.userAnswers[2] = newState.questions[2].correctIndex;

      const stats = calculateStats(newState);
      expect(stats.correct).toBe(2);
      expect(stats.incorrect).toBe(1);
    });

    it('should calculate accuracy percentage', () => {
      const state = initializeQuizState('speed', 'intermediate', 4);
      let newState = state;

      // Answer 3 out of 4 correctly
      newState.userAnswers[0] = newState.questions[0].correctIndex;
      newState.userAnswers[1] = newState.questions[1].correctIndex;
      newState.userAnswers[2] = newState.questions[2].correctIndex;
      newState.userAnswers[3] =
        (newState.questions[3].correctIndex + 1) % 4;

      const stats = calculateStats(newState);
      expect(stats.accuracy).toBe(75);
    });

    it('should include all required stat fields', () => {
      const state = initializeQuizState('progression', 'advanced', 2);
      const stats = calculateStats(state);

      expect(stats).toHaveProperty('score');
      expect(stats).toHaveProperty('totalQuestions');
      expect(stats).toHaveProperty('correct');
      expect(stats).toHaveProperty('incorrect');
      expect(stats).toHaveProperty('accuracy');
      expect(stats).toHaveProperty('averageTime');
      expect(stats).toHaveProperty('mode');
      expect(stats).toHaveProperty('difficulty');
      expect(stats).toHaveProperty('timestamp');
    });
  });

  describe('Leaderboard', () => {
    it('should load empty leaderboard initially', () => {
      const leaderboard = loadLeaderboard();
      expect(leaderboard.length).toBe(0);
    });

    it('should save leaderboard entry', () => {
      const entry = {
        score: 100,
        totalQuestions: 10,
        correct: 8,
        incorrect: 2,
        accuracy: 80,
        averageTime: 5000,
        mode: 'speed' as const,
        difficulty: 'beginner' as const,
        timestamp: Date.now(),
      };

      saveLeaderboardEntry(entry, 'Test Player');
      const leaderboard = loadLeaderboard();
      expect(leaderboard.length).toBe(1);
      expect(leaderboard[0].playerName).toBe('Test Player');
    });

    it('should retrieve top scores', () => {
      // Save multiple entries
      for (let i = 0; i < 5; i++) {
        saveLeaderboardEntry(
          {
            score: 100 + i * 10,
            totalQuestions: 10,
            correct: 8 + i,
            incorrect: 2 - i,
            accuracy: 80 + i * 5,
            averageTime: 5000,
            mode: 'speed',
            difficulty: 'beginner',
            timestamp: Date.now(),
          },
          `Player ${i}`
        );
      }

      const topScores = getTopScores('speed', 'beginner', 3);
      expect(topScores.length).toBe(3);
      // Check if sorted by score descending
      expect(topScores[0].score).toBeGreaterThanOrEqual(topScores[1].score);
      expect(topScores[1].score).toBeGreaterThanOrEqual(topScores[2].score);
    });

    it('should filter leaderboard by mode', () => {
      saveLeaderboardEntry(
        {
          score: 100,
          totalQuestions: 10,
          correct: 8,
          incorrect: 2,
          accuracy: 80,
          averageTime: 5000,
          mode: 'speed',
          difficulty: 'beginner',
          timestamp: Date.now(),
        },
        'Speed Player'
      );

      saveLeaderboardEntry(
        {
          score: 90,
          totalQuestions: 10,
          correct: 9,
          incorrect: 1,
          accuracy: 90,
          averageTime: 8000,
          mode: 'accuracy',
          difficulty: 'beginner',
          timestamp: Date.now(),
        },
        'Accuracy Player'
      );

      const speedScores = getTopScores('speed');
      const accuracyScores = getTopScores('accuracy');

      expect(speedScores.length).toBe(1);
      expect(accuracyScores.length).toBe(1);
      expect(speedScores[0].playerName).toBe('Speed Player');
      expect(accuracyScores[0].playerName).toBe('Accuracy Player');
    });
  });
});
