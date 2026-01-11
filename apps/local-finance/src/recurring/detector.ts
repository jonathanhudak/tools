// Recurring payment detection

import { differenceInDays, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import type { Transaction, RecurringPayment } from '../core/types.js';

export interface RecurringAnalysis {
  merchant: string;
  transactions: Transaction[];
  frequency: RecurringPayment['frequency'];
  confidence: number;
  averageAmount: number;
  amountVariance: number;
  totalSpent: number;
  occurrences: number;
  isActive: boolean;
  lastSeen: Date;
  nextExpected: Date | null;
}

interface FrequencyMatch {
  frequency: RecurringPayment['frequency'];
  score: number;
  expectedDays: number;
}

const FREQUENCY_DAYS: Record<RecurringPayment['frequency'], number> = {
  weekly: 7,
  biweekly: 14,
  monthly: 30,
  quarterly: 91,
  yearly: 365,
};

export function detectRecurringPayments(transactions: Transaction[]): RecurringAnalysis[] {
  // Filter to only expenses (negative amounts)
  const expenses = transactions.filter(tx => tx.amount < 0);

  // Group transactions by normalized merchant or description
  const byMerchant = groupByMerchant(expenses);
  const results: RecurringAnalysis[] = [];

  for (const [merchant, txs] of Object.entries(byMerchant)) {
    // Need more than 2 transactions to detect a recurring pattern
    if (txs.length <= 2) continue;

    // Sort by date
    const sorted = [...txs].sort((a, b) => a.date.getTime() - b.date.getTime());

    // Analyze frequency
    const analysis = analyzeFrequency(merchant, sorted);

    if (analysis && analysis.confidence >= 0.6) {
      results.push(analysis);
    }
  }

  // Sort by confidence
  return results.sort((a, b) => b.confidence - a.confidence);
}

function groupByMerchant(transactions: Transaction[]): Record<string, Transaction[]> {
  const groups: Record<string, Transaction[]> = {};

  for (const tx of transactions) {
    // Use normalized merchant if available, otherwise clean the description
    const key = (tx.normalizedMerchant || cleanDescription(tx.description)).toLowerCase();

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(tx);
  }

  return groups;
}

function cleanDescription(description: string): string {
  // Remove common prefixes
  let cleaned = description
    .replace(/^(SQ \*|TST\*|PP\*|PAYPAL \*)/i, '')
    .replace(/\s+#\d+/g, '')
    .replace(/\s+\d{4,}/g, '')
    .trim();

  // Take first few words
  const words = cleaned.split(/\s+/).slice(0, 3);
  return words.join(' ');
}

function analyzeFrequency(merchant: string, transactions: Transaction[]): RecurringAnalysis | null {
  // Require more than 2 transactions to establish a pattern
  if (transactions.length <= 2) return null;

  // Calculate intervals between transactions
  const intervals: number[] = [];
  for (let i = 1; i < transactions.length; i++) {
    const days = differenceInDays(transactions[i].date, transactions[i - 1].date);
    intervals.push(days);
  }

  // Find best matching frequency
  const frequencyMatch = findBestFrequency(intervals);
  if (!frequencyMatch) return null;

  // Calculate amount statistics (use absolute value since all are expenses)
  const amounts = transactions.map((t) => Math.abs(t.amount));
  const averageAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const amountVariance = calculateVariance(amounts, averageAmount);

  // Determine if still active
  const lastTransaction = transactions[transactions.length - 1];
  const daysSinceLast = differenceInDays(new Date(), lastTransaction.date);
  const expectedDays = FREQUENCY_DAYS[frequencyMatch.frequency];
  const isActive = daysSinceLast < expectedDays * 1.5;

  // Calculate next expected date
  const nextExpected = isActive
    ? calculateNextExpected(lastTransaction.date, frequencyMatch.frequency)
    : null;

  // Adjust confidence based on amount consistency
  const amountConsistency = 1 - Math.min(amountVariance / averageAmount, 1);
  const finalConfidence = frequencyMatch.score * 0.7 + amountConsistency * 0.3;

  // Calculate actual total spent
  const totalSpent = amounts.reduce((sum, amt) => sum + amt, 0);

  return {
    merchant: merchant.charAt(0).toUpperCase() + merchant.slice(1),
    transactions,
    frequency: frequencyMatch.frequency,
    confidence: finalConfidence,
    averageAmount,
    amountVariance,
    totalSpent,
    occurrences: transactions.length,
    isActive,
    lastSeen: lastTransaction.date,
    nextExpected,
  };
}

function findBestFrequency(intervals: number[]): FrequencyMatch | null {
  if (intervals.length === 0) return null;

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

  let bestMatch: FrequencyMatch | null = null;

  for (const [freq, days] of Object.entries(FREQUENCY_DAYS)) {
    // Calculate how well the intervals match this frequency
    const scores = intervals.map((interval) => {
      const deviation = Math.abs(interval - days) / days;
      return Math.max(0, 1 - deviation);
    });

    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Also check if average interval matches
    const avgDeviation = Math.abs(avgInterval - days) / days;
    const avgMatchScore = Math.max(0, 1 - avgDeviation);

    const combinedScore = avgScore * 0.6 + avgMatchScore * 0.4;

    if (combinedScore > 0.5 && (!bestMatch || combinedScore > bestMatch.score)) {
      bestMatch = {
        frequency: freq as RecurringPayment['frequency'],
        score: combinedScore,
        expectedDays: days,
      };
    }
  }

  return bestMatch;
}

function calculateVariance(values: number[], mean: number): number {
  if (values.length === 0) return 0;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

function calculateNextExpected(lastDate: Date, frequency: RecurringPayment['frequency']): Date {
  switch (frequency) {
    case 'weekly':
      return addWeeks(lastDate, 1);
    case 'biweekly':
      return addWeeks(lastDate, 2);
    case 'monthly':
      return addMonths(lastDate, 1);
    case 'quarterly':
      return addMonths(lastDate, 3);
    case 'yearly':
      return addYears(lastDate, 1);
    default:
      return addMonths(lastDate, 1);
  }
}

export function getFrequencyMultiplier(frequency: RecurringPayment['frequency']): number {
  switch (frequency) {
    case 'weekly':
      return 52;
    case 'biweekly':
      return 26;
    case 'monthly':
      return 12;
    case 'quarterly':
      return 4;
    case 'yearly':
      return 1;
    default:
      return 12;
  }
}

export function formatFrequency(frequency: RecurringPayment['frequency']): string {
  switch (frequency) {
    case 'weekly':
      return 'Weekly';
    case 'biweekly':
      return 'Bi-weekly';
    case 'monthly':
      return 'Monthly';
    case 'quarterly':
      return 'Quarterly';
    case 'yearly':
      return 'Yearly';
    default:
      return frequency;
  }
}
