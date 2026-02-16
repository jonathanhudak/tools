/**
 * Quiz Generator Utility
 *
 * Generates random scale/mode quiz questions with multiple choice options.
 */

import {
  getDegreeInfo,
  type ScaleType,
  type Degree,
} from '../../data/chord-scale-matrix';

export interface QuizQuestion {
  scaleType: ScaleType;
  degree: Degree;
  correctAnswer: string;
  modeName: string;
  options: string[];
  questionText: string;
}

/**
 * Generate a single random quiz question
 */
export function generateScaleQuizQuestion(
  allowedScaleTypes: ScaleType[] = ['major', 'naturalMinor', 'melodicMinor', 'harmonicMinor'],
): QuizQuestion {
  // Filter to only allowed scale types
  const availableScaleTypes = allowedScaleTypes.filter(st => st);

  if (availableScaleTypes.length === 0) {
    throw new Error('No valid scale types provided');
  }

  // Pick a random scale type
  const scaleType = availableScaleTypes[
    Math.floor(Math.random() * availableScaleTypes.length)
  ] as ScaleType;

  // Pick a random degree (1-7)
  const degree = (Math.floor(Math.random() * 7) + 1) as Degree;

  // Get the correct answer
  const entry = getDegreeInfo(scaleType, degree);
  if (!entry) {
    throw new Error(`No entry found for ${scaleType} degree ${degree}`);
  }

  const correctAnswer = entry.modeName;
  const modeName = entry.modeName;

  // Generate multiple choice options (including the correct one)
  const allModes = [
    'Ionian',
    'Dorian',
    'Phrygian',
    'Lydian',
    'Mixolydian',
    'Aeolian',
    'Locrian',
  ];

  const incorrectOptions = allModes
    .filter(m => m !== correctAnswer)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [correctAnswer, ...incorrectOptions].sort(() => Math.random() - 0.5);

  return {
    scaleType,
    degree,
    correctAnswer,
    modeName,
    options,
    questionText: `What mode is on degree ${degree} of ${scaleType}?`,
  };
}

/**
 * Generate a batch of quiz questions
 */
export function generateQuizQuestions(
  count: number,
  allowedScaleTypes: ScaleType[] = ['major', 'naturalMinor', 'melodicMinor', 'harmonicMinor'],
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  for (let i = 0; i < count; i++) {
    questions.push(generateScaleQuizQuestion(allowedScaleTypes));
  }
  return questions;
}

/**
 * Validate an answer
 */
export function validateAnswer(question: QuizQuestion, selectedAnswer: string): boolean {
  return selectedAnswer === question.correctAnswer;
}
