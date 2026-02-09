// Database migration system

import type Database from 'better-sqlite3';

interface Migration {
  version: number;
  description: string;
  up: (db: Database.Database) => void;
}

const migrations: Migration[] = [
  // Version 1 is the original schema (handled by schema.ts CREATE_TABLES)
  {
    version: 2,
    description: 'Add budget tables and balance snapshots',
    up: (db) => {
      db.exec(`
        CREATE TABLE budgets (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          period_type TEXT NOT NULL CHECK(period_type IN ('monthly', 'weekly', 'yearly')),
          start_date TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE budget_allocations (
          id TEXT PRIMARY KEY,
          budget_id TEXT NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
          category_id TEXT NOT NULL REFERENCES categories(id),
          amount REAL NOT NULL,
          rollover INTEGER NOT NULL DEFAULT 0,
          UNIQUE(budget_id, category_id)
        );

        CREATE TABLE budget_periods (
          id TEXT PRIMARY KEY,
          budget_id TEXT NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'closed')),
          UNIQUE(budget_id, start_date)
        );

        CREATE TABLE balance_snapshots (
          id TEXT PRIMARY KEY,
          account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
          date TEXT NOT NULL,
          balance REAL NOT NULL,
          source TEXT NOT NULL DEFAULT 'manual' CHECK(source IN ('import', 'manual', 'calculated')),
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(account_id, date)
        );

        CREATE INDEX idx_budget_allocations_budget ON budget_allocations(budget_id);
        CREATE INDEX idx_budget_periods_budget ON budget_periods(budget_id);
        CREATE INDEX idx_balance_snapshots_account ON balance_snapshots(account_id);
        CREATE INDEX idx_balance_snapshots_date ON balance_snapshots(account_id, date);
      `);
    },
  },
];

export function runMigrations(database: Database.Database): void {
  const row = database.prepare('SELECT version FROM schema_version LIMIT 1').get() as
    | { version: number }
    | undefined;

  const currentVersion = row?.version ?? 1;

  const pending = migrations.filter((m) => m.version > currentVersion);
  if (pending.length === 0) return;

  for (const migration of pending) {
    const migrate = database.transaction(() => {
      migration.up(database);
      database.prepare('UPDATE schema_version SET version = ?').run(migration.version);
    });
    migrate();
  }
}
