// Budget and balance snapshot database operations

import type Database from 'better-sqlite3';
import { nanoid } from 'nanoid';
import type {
  Budget,
  BudgetAllocation,
  BudgetPeriod,
  BalanceSnapshot,
} from './types.js';

// Budget operations

export function createBudget(
  database: Database.Database,
  data: { name: string; periodType: Budget['periodType']; startDate: string }
): Budget {
  const id = nanoid();
  database
    .prepare(
      'INSERT INTO budgets (id, name, period_type, start_date) VALUES (?, ?, ?, ?)'
    )
    .run(id, data.name, data.periodType, data.startDate);
  return getBudget(database, id)!;
}

export function getBudget(database: Database.Database, id: string): Budget | null {
  const row = database.prepare('SELECT * FROM budgets WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? mapRowToBudget(row) : null;
}

export function getAllBudgets(database: Database.Database): Budget[] {
  const rows = database
    .prepare('SELECT * FROM budgets ORDER BY created_at DESC')
    .all() as Record<string, unknown>[];
  return rows.map(mapRowToBudget);
}

export function updateBudget(
  database: Database.Database,
  id: string,
  data: Partial<{ name: string; periodType: Budget['periodType']; startDate: string }>
): Budget {
  const current = getBudget(database, id);
  if (!current) throw new Error(`Budget not found: ${id}`);

  database
    .prepare(
      'UPDATE budgets SET name = ?, period_type = ?, start_date = ? WHERE id = ?'
    )
    .run(
      data.name ?? current.name,
      data.periodType ?? current.periodType,
      data.startDate ?? current.startDate,
      id
    );
  return getBudget(database, id)!;
}

export function deleteBudget(database: Database.Database, id: string): void {
  database.prepare('DELETE FROM budgets WHERE id = ?').run(id);
}

function mapRowToBudget(row: Record<string, unknown>): Budget {
  return {
    id: row.id as string,
    name: row.name as string,
    periodType: row.period_type as Budget['periodType'],
    startDate: row.start_date as string,
    createdAt: row.created_at as string,
  };
}

// Allocation operations

export function setAllocation(
  database: Database.Database,
  budgetId: string,
  categoryId: string,
  amount: number,
  rollover: boolean
): BudgetAllocation {
  const id = nanoid();
  database
    .prepare(
      `INSERT INTO budget_allocations (id, budget_id, category_id, amount, rollover)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(budget_id, category_id)
       DO UPDATE SET amount = excluded.amount, rollover = excluded.rollover`
    )
    .run(id, budgetId, categoryId, amount, rollover ? 1 : 0);

  const row = database
    .prepare('SELECT * FROM budget_allocations WHERE budget_id = ? AND category_id = ?')
    .get(budgetId, categoryId) as Record<string, unknown>;
  return mapRowToAllocation(row);
}

export function getAllocations(
  database: Database.Database,
  budgetId: string
): BudgetAllocation[] {
  const rows = database
    .prepare('SELECT * FROM budget_allocations WHERE budget_id = ?')
    .all(budgetId) as Record<string, unknown>[];
  return rows.map(mapRowToAllocation);
}

export function removeAllocation(
  database: Database.Database,
  budgetId: string,
  categoryId: string
): void {
  database
    .prepare('DELETE FROM budget_allocations WHERE budget_id = ? AND category_id = ?')
    .run(budgetId, categoryId);
}

function mapRowToAllocation(row: Record<string, unknown>): BudgetAllocation {
  return {
    id: row.id as string,
    budgetId: row.budget_id as string,
    categoryId: row.category_id as string,
    amount: row.amount as number,
    rollover: !!(row.rollover as number),
  };
}

// Period operations

export function createPeriod(
  database: Database.Database,
  budgetId: string,
  startDate: string,
  endDate: string
): BudgetPeriod {
  const id = nanoid();
  database
    .prepare(
      'INSERT INTO budget_periods (id, budget_id, start_date, end_date) VALUES (?, ?, ?, ?)'
    )
    .run(id, budgetId, startDate, endDate);
  return getPeriod(database, id)!;
}

export function getPeriod(database: Database.Database, id: string): BudgetPeriod | null {
  const row = database.prepare('SELECT * FROM budget_periods WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? mapRowToPeriod(row) : null;
}

export function getOpenPeriod(
  database: Database.Database,
  budgetId: string
): BudgetPeriod | null {
  const row = database
    .prepare('SELECT * FROM budget_periods WHERE budget_id = ? AND status = ? ORDER BY start_date DESC LIMIT 1')
    .get(budgetId, 'open') as Record<string, unknown> | undefined;
  return row ? mapRowToPeriod(row) : null;
}

export function closePeriod(database: Database.Database, periodId: string): void {
  database
    .prepare("UPDATE budget_periods SET status = 'closed' WHERE id = ?")
    .run(periodId);
}

function mapRowToPeriod(row: Record<string, unknown>): BudgetPeriod {
  return {
    id: row.id as string,
    budgetId: row.budget_id as string,
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    status: row.status as BudgetPeriod['status'],
  };
}

// Balance Snapshot operations

export function createSnapshot(
  database: Database.Database,
  accountId: string,
  date: string,
  balance: number,
  source: BalanceSnapshot['source']
): BalanceSnapshot {
  const id = nanoid();
  database
    .prepare(
      `INSERT INTO balance_snapshots (id, account_id, date, balance, source)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(account_id, date)
       DO UPDATE SET balance = excluded.balance, source = excluded.source`
    )
    .run(id, accountId, date, balance, source);

  const row = database
    .prepare('SELECT * FROM balance_snapshots WHERE account_id = ? AND date = ?')
    .get(accountId, date) as Record<string, unknown>;
  return mapRowToSnapshot(row);
}

export function getSnapshots(
  database: Database.Database,
  accountId: string
): BalanceSnapshot[] {
  const rows = database
    .prepare('SELECT * FROM balance_snapshots WHERE account_id = ? ORDER BY date')
    .all(accountId) as Record<string, unknown>[];
  return rows.map(mapRowToSnapshot);
}

export function getLatestSnapshot(
  database: Database.Database,
  accountId: string
): BalanceSnapshot | null {
  const row = database
    .prepare('SELECT * FROM balance_snapshots WHERE account_id = ? ORDER BY date DESC LIMIT 1')
    .get(accountId) as Record<string, unknown> | undefined;
  return row ? mapRowToSnapshot(row) : null;
}

function mapRowToSnapshot(row: Record<string, unknown>): BalanceSnapshot {
  return {
    id: row.id as string,
    accountId: row.account_id as string,
    date: row.date as string,
    balance: row.balance as number,
    source: row.source as BalanceSnapshot['source'],
    createdAt: row.created_at as string,
  };
}
