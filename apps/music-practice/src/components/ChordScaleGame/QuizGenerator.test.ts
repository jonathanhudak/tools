/**
 * QuizGenerator Tests
 */

import { describe, it, expect } from 'vitest';
import {
  generateScaleQuizQuestion,
  generateQuizQuestions,
  validateAnswer,
} from './QuizGenerator';
import { type ScaleType } from '../../data/chord-scale-matrix';

describe('QuizGenerator', () => {
  describe('generateScaleQuizQuestion', () => {
    it('should generate a valid question', () => {
      const question = generateScaleQuizQuestion();
      expect(question).toBeDefined();
      expect(question.scaleType).toBeDefined();
      expect(question.degree).toBeGreaterThanOrEqual(1);
      expect(question.degree).toBeLessThanOrEqual(7);
      expect(question.correctAnswer).toBeDefined();
      expect(question.options).toHaveLength(4);
    });

    it('should include correct answer in options', () => {
      const question = generateScaleQuizQuestion();
      expect(question.options).toContain(question.correctAnswer);
    });

    it('should generate questions for specified scales', () => {
      const scales: ScaleType[] = ['major'];
      const question = generateScaleQuizQuestion(scales);
      expect(question.scaleType).toBe('major');
    });

    it('should handle multiple scale types', () => {
      const scales: ScaleType[] = ['major', 'naturalMinor'];
      const question = generateScaleQuizQuestion(scales);
      expect(scales).toContain(question.scaleType);
    });

    it('should throw error for empty scale types', () => {
      expect(() => generateScaleQuizQuestion([])).toThrow();
    });

    it('should generate unique questions on multiple calls', () => {
      const questions = [
        generateScaleQuizQuestion(),
        generateScaleQuizQuestion(),
        generateScaleQuizQuestion(),
      ];
      const unique = new Set(questions.map(q => `${q.scaleType}-${q.degree}`));
      expect(unique.size).toBeGreaterThan(1);
    });
  });

  describe('generateQuizQuestions', () => {
    it('should generate requested number of questions', () => {
      const questions = generateQuizQuestions(5);
      expect(questions).toHaveLength(5);
    });

    it('should generate multiple questions', () => {
      const questions = generateQuizQuestions(10);
      expect(questions).toHaveLength(10);
      questions.forEach(q => {
        expect(q.correctAnswer).toBeDefined();
        expect(q.options).toHaveLength(4);
      });
    });

    it('should handle zero questions', () => {
      const questions = generateQuizQuestions(0);
      expect(questions).toHaveLength(0);
    });

    it('should respect scale type filters', () => {
      const scales: ScaleType[] = ['major'];
      const questions = generateQuizQuestions(5, scales);
      questions.forEach(q => {
        expect(q.scaleType).toBe('major');
      });
    });
  });

  describe('validateAnswer', () => {
    it('should validate correct answer', () => {
      const question = generateScaleQuizQuestion();
      const isCorrect = validateAnswer(question, question.correctAnswer);
      expect(isCorrect).toBe(true);
    });

    it('should reject incorrect answer', () => {
      const question = generateScaleQuizQuestion();
      const wrongAnswer = question.options.find(opt => opt !== question.correctAnswer);
      if (wrongAnswer) {
        const isCorrect = validateAnswer(question, wrongAnswer);
        expect(isCorrect).toBe(false);
      }
    });

    it('should be case-sensitive', () => {
      const question = generateScaleQuizQuestion();
      const lowerAnswer = question.correctAnswer.toLowerCase();
      const isCorrect = validateAnswer(question, lowerAnswer);
      expect(isCorrect).toBe(false);
    });
  });
});
