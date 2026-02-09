// Budget business logic - higher-level computations over budget DB operations

import type Database from 'better-sqlite3';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  startOfYear,
  endOfYear,
  differenceInDays,
  subMonths,
  addDays,
} from 'date-fns';
import type { Budget, BudgetPeriod } from './types.js';
import {
  createBudget as dbCreateBudget,
  getBudget,
  getAllocations,
  createPeriod as dbCreatePeriod,
} from './budget-database.js';

// --- Exported interfaces ---

export interface BudgetActualItem {
  categoryId: string;
  categoryName: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  status: 'under' | 'warning' | 'over';
  rolloverAmount: number;
}

export interface RolloverResult {
  categoryId: string;
  previousAllocated: number;
  previousSpent: number;
  rolloverAmount: number;
}

export interface BudgetStatus {
  budgetId: string;
  budgetName: string;
  periodType: string;
  currentPeriod: { start: string; end: string } | null;
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  percentUsed: number;
  overBudgetCategories: { categoryId: string; categoryName: string; overBy: number }[];
  warningCategories: { categoryId: string; categoryName: string; percentUsed: number }[];
  daysRemainingInPeriod: number;
  dailyBudgetRemaining: number;
}

export interface AllocationSuggestion {
  categoryId: string;
  categoryName: string;
  suggestedAmount: number;
  basedOn: string;
  historicalAvg: number;
}

// Re-export CRUD operations from budget-database for convenience
export {
  createBudget,
  getBudget,
  getAllBudgets,
  updateBudget,
  deleteBudget,
  setAllocation,
  getAllocations,
  removeAllocation,
  createPeriod,
  getPeriod,
  getOpenPeriod,
  closePeriod,
  createSnapshot,
  getSnapshots,
  getLatestSnapshot,
} from './budget-database.js';

// --- Period date calculations ---

export function getCurrentPeriodDates(
  periodType: 'monthly' | 'weekly' | 'yearly',
  startDate: string
): { start: string; end: string } {
  const now = new Date();

  switch (periodType) {
    case 'monthly': {
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      return { start: format(start, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd') };
    }
    case 'weekly': {
      // Align to the same weekday as the budget's start_date
      const budgetStart = new Date(startDate + 'T00:00:00');
      const budgetWeekday = budgetStart.getDay();
      const todayWeekday = now.getDay();
      const daysSinceStart = (todayWeekday - budgetWeekday + 7) % 7;
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - daysSinceStart);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = addDays(weekStart, 6);
      return { start: format(weekStart, 'yyyy-MM-dd'), end: format(weekEnd, 'yyyy-MM-dd') };
    }
    case 'yearly': {
      const start = startOfYear(now);
      const end = endOfYear(now);
      return { start: format(start, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd') };
    }
  }
}

export function getNextPeriodDates(
  periodType: 'monthly' | 'weekly' | 'yearly',
  currentPeriodEnd: string
): { start: string; end: string } {
  const endDate = new Date(currentPeriodEnd + 'T00:00:00');
  const nextStart = addDays(endDate, 1);

  switch (periodType) {
    case 'monthly': {
      const end = endOfMonth(nextStart);
      return { start: format(nextStart, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd') };
    }
    case 'weekly': {
      const end = addDays(nextStart, 6);
      return { start: format(nextStart, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd') };
    }
    case 'yearly': {
      const end = endOfYear(nextStart);
      return { start: format(nextStart, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd') };
    }
  }
}

// --- Budget Period Management ---

export function getOrCreateCurrentPeriod(db: Database.Database, budgetId: string): BudgetPeriod {
  const budget = getBudget(db, budgetId);
  if (!budget) throw new Error(`Budget not found: ${budgetId}`);

  const dates = getCurrentPeriodDates(budget.periodType, budget.startDate);

  // Check if period already exists
  const existing = db
    .prepare('SELECT * FROM budget_periods WHERE budget_id = ? AND start_date = ?')
    .get(budgetId, dates.start) as Record<string, unknown> | undefined;

  if (existing) {
    return {
      id: existing.id as string,
      budgetId: existing.budget_id as string,
      startDate: existing.start_date as string,
      endDate: existing.end_date as string,
      status: existing.status as BudgetPeriod['status'],
    };
  }

  // Create new period
  return dbCreatePeriod(db, budgetId, dates.start, dates.end);
}

// --- Core budget computations ---

export function getBudgetVsActual(
  db: Database.Database,
  budgetId: string,
  periodStart: string,
  periodEnd: string
): BudgetActualItem[] {
  // Get all allocations with category names
  const allocations = db
    .prepare(
      `SELECT ba.*, c.name as category_name
       FROM budget_allocations ba
       JOIN categories c ON c.id = ba.category_id
       WHERE ba.budget_id = ?`
    )
    .all(budgetId) as {
      id: string;
      budget_id: string;
      category_id: string;
      amount: number;
      rollover: number;
      category_name: string;
    }[];

  // Get spending by category in the period
  const spending = db
    .prepare(
      `SELECT category_id, SUM(ABS(amount)) as total_spent
       FROM transactions
       WHERE date >= ? AND date <= ? AND amount < 0 AND category_id IS NOT NULL
       GROUP BY category_id`
    )
    .all(periodStart, periodEnd) as { category_id: string; total_spent: number }[];

  const spendingMap = new Map(spending.map((s) => [s.category_id, s.total_spent]));

  // Calculate rollover for allocations that have it enabled
  const rolloverMap = new Map<string, number>();
  const rolloverAllocations = allocations.filter((a) => a.rollover);
  if (rolloverAllocations.length > 0) {
    const previousPeriod = getPreviousPeriodDates(periodStart, periodEnd);
    if (previousPeriod) {
      const rollovers = calculateRollover(db, budgetId, previousPeriod.start, previousPeriod.end);
      for (const r of rollovers) {
        rolloverMap.set(r.categoryId, r.rolloverAmount);
      }
    }
  }

  return allocations.map((alloc) => {
    const spent = spendingMap.get(alloc.category_id) ?? 0;
    const rolloverAmount = rolloverMap.get(alloc.category_id) ?? 0;
    const effectiveAllocated = alloc.amount + rolloverAmount;
    const remaining = effectiveAllocated - spent;
    const percentUsed = effectiveAllocated > 0 ? (spent / effectiveAllocated) * 100 : spent > 0 ? 100 : 0;

    let status: 'under' | 'warning' | 'over';
    if (percentUsed > 100) {
      status = 'over';
    } else if (percentUsed >= 80) {
      status = 'warning';
    } else {
      status = 'under';
    }

    return {
      categoryId: alloc.category_id,
      categoryName: alloc.category_name,
      allocated: effectiveAllocated,
      spent,
      remaining,
      percentUsed: Math.round(percentUsed * 100) / 100,
      status,
      rolloverAmount,
    };
  });
}

export function calculateRollover(
  db: Database.Database,
  budgetId: string,
  fromPeriodStart: string,
  fromPeriodEnd: string
): RolloverResult[] {
  // Only get allocations with rollover enabled
  const allocations = db
    .prepare(
      `SELECT category_id, amount
       FROM budget_allocations
       WHERE budget_id = ? AND rollover = 1`
    )
    .all(budgetId) as { category_id: string; amount: number }[];

  if (allocations.length === 0) return [];

  const categoryIds = allocations.map((a) => a.category_id);
  const placeholders = categoryIds.map(() => '?').join(',');

  // Sum spending per category in the previous period
  const spending = db
    .prepare(
      `SELECT category_id, SUM(ABS(amount)) as total_spent
       FROM transactions
       WHERE date >= ? AND date <= ? AND amount < 0
         AND category_id IN (${placeholders})
       GROUP BY category_id`
    )
    .all(fromPeriodStart, fromPeriodEnd, ...categoryIds) as {
      category_id: string;
      total_spent: number;
    }[];

  const spendingMap = new Map(spending.map((s) => [s.category_id, s.total_spent]));

  return allocations.map((alloc) => {
    const spent = spendingMap.get(alloc.category_id) ?? 0;
    return {
      categoryId: alloc.category_id,
      previousAllocated: alloc.amount,
      previousSpent: spent,
      rolloverAmount: alloc.amount - spent,
    };
  });
}

export function getBudgetStatus(db: Database.Database, budgetId: string): BudgetStatus {
  const budget = getBudget(db, budgetId);
  if (!budget) throw new Error(`Budget not found: ${budgetId}`);

  const currentPeriod = getCurrentPeriodDates(budget.periodType, budget.startDate);
  const items = getBudgetVsActual(db, budgetId, currentPeriod.start, currentPeriod.end);

  const totalAllocated = items.reduce((sum, i) => sum + i.allocated, 0);
  const totalSpent = items.reduce((sum, i) => sum + i.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const percentUsed = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  const overBudgetCategories = items
    .filter((i) => i.status === 'over')
    .map((i) => ({
      categoryId: i.categoryId,
      categoryName: i.categoryName,
      overBy: i.spent - i.allocated,
    }));

  const warningCategories = items
    .filter((i) => i.status === 'warning')
    .map((i) => ({
      categoryId: i.categoryId,
      categoryName: i.categoryName,
      percentUsed: i.percentUsed,
    }));

  const today = new Date();
  const periodEnd = new Date(currentPeriod.end + 'T00:00:00');
  const daysRemainingInPeriod = Math.max(0, differenceInDays(periodEnd, today) + 1);
  const dailyBudgetRemaining = daysRemainingInPeriod > 0 ? totalRemaining / daysRemainingInPeriod : 0;

  return {
    budgetId: budget.id,
    budgetName: budget.name,
    periodType: budget.periodType,
    currentPeriod,
    totalAllocated,
    totalSpent,
    totalRemaining,
    percentUsed: Math.round(percentUsed * 100) / 100,
    overBudgetCategories,
    warningCategories,
    daysRemainingInPeriod,
    dailyBudgetRemaining: Math.round(dailyBudgetRemaining * 100) / 100,
  };
}

// --- Budget creation helper ---

export function createBudgetWithDefaults(
  db: Database.Database,
  name: string,
  periodType: Budget['periodType']
): Budget {
  const now = new Date();
  let startDate: string;

  switch (periodType) {
    case 'monthly':
      startDate = format(startOfMonth(now), 'yyyy-MM-dd');
      break;
    case 'weekly':
      startDate = format(startOfWeek(now), 'yyyy-MM-dd');
      break;
    case 'yearly':
      startDate = format(startOfYear(now), 'yyyy-MM-dd');
      break;
  }

  return dbCreateBudget(db, { name, periodType, startDate });
}

// --- Smart allocation suggestions ---

export function suggestAllocations(
  db: Database.Database,
  months: number = 3
): AllocationSuggestion[] {
  const now = new Date();
  const lookbackStart = format(subMonths(startOfMonth(now), months), 'yyyy-MM-dd');
  const lookbackEnd = format(endOfMonth(subMonths(now, 1)), 'yyyy-MM-dd');

  const basedOn = months === 1 ? 'last month' : `${months}-month average`;

  const rows = db
    .prepare(
      `SELECT t.category_id, c.name as category_name, SUM(ABS(t.amount)) as total_spent
       FROM transactions t
       JOIN categories c ON c.id = t.category_id
       WHERE t.date >= ? AND t.date <= ? AND t.amount < 0 AND t.category_id IS NOT NULL
         AND c.is_income = 0
       GROUP BY t.category_id
       ORDER BY total_spent DESC`
    )
    .all(lookbackStart, lookbackEnd) as {
      category_id: string;
      category_name: string;
      total_spent: number;
    }[];

  return rows
    .map((row) => {
      const monthlyAvg = row.total_spent / months;
      if (monthlyAvg < 10) return null;

      const suggested = Math.round(monthlyAvg / 5) * 5;

      return {
        categoryId: row.category_id,
        categoryName: row.category_name,
        suggestedAmount: suggested,
        basedOn,
        historicalAvg: Math.round(monthlyAvg * 100) / 100,
      };
    })
    .filter((s): s is AllocationSuggestion => s !== null);
}

// --- Internal helpers ---

function getPreviousPeriodDates(
  periodStart: string,
  periodEnd: string
): { start: string; end: string } | null {
  const start = new Date(periodStart + 'T00:00:00');
  const end = new Date(periodEnd + 'T00:00:00');
  const durationDays = differenceInDays(end, start);

  const prevEnd = addDays(start, -1);
  const prevStart = addDays(prevEnd, -durationDays);

  return {
    start: format(prevStart, 'yyyy-MM-dd'),
    end: format(prevEnd, 'yyyy-MM-dd'),
  };
}
