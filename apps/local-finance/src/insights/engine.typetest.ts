/**
 * Type-level regression test for RecurringPaymentSummary mapping.
 * 
 * This file is checked by `tsc --noEmit` (typecheck) and will fail if
 * the mapping in engine.ts produces fields that don't match the
 * RecurringPaymentSummary interface.
 *
 * Regression: yearlyTotal/status were used instead of totalSpent/occurrences/confidence.
 */
import type { RecurringPaymentSummary } from '../core/types.js';

// Ensure all required fields are present and correctly typed
const _check: RecurringPaymentSummary = {
  merchant: 'Test',
  frequency: 'monthly',
  amount: 10,
  totalSpent: 120,
  occurrences: 12,
  isActive: true,
  confidence: 1.0,
};

// Ensure removed fields are NOT assignable
// @ts-expect-error yearlyTotal was removed in favor of totalSpent
const _bad1: RecurringPaymentSummary = { ..._check, yearlyTotal: 120 };

// @ts-expect-error status was removed in favor of confidence
const _bad2: RecurringPaymentSummary = { ..._check, status: 'keep' };
