// Database operations using better-sqlite3

import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';
import type {
  Account,
  Transaction,
  Category,
  CategorizationRule,
  RecurringPayment,
  AICache,
  Import,
} from './types.js';
import { CREATE_TABLES, DEFAULT_CATEGORIES, INSERT_CATEGORY, SCHEMA_VERSION } from './schema.js';

let db: Database.Database | null = null;

export function getDatabase(dbPath: string): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initializeDatabase(db);
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

function initializeDatabase(database: Database.Database): void {
  // Run schema creation
  database.exec(CREATE_TABLES);

  // Check schema version
  const versionRow = database.prepare('SELECT version FROM schema_version LIMIT 1').get() as
    | { version: number }
    | undefined;

  if (!versionRow) {
    // Fresh database, insert version and default categories
    database.prepare('INSERT INTO schema_version (version) VALUES (?)').run(SCHEMA_VERSION);
    insertDefaultCategories(database);
  }
}

function insertDefaultCategories(database: Database.Database): void {
  const insert = database.prepare(INSERT_CATEGORY);
  const insertMany = database.transaction((categories: typeof DEFAULT_CATEGORIES) => {
    for (const cat of categories) {
      insert.run(cat.id, cat.name, cat.parentId, cat.isIncome ? 1 : 0, cat.sortOrder);
    }
  });
  insertMany(DEFAULT_CATEGORIES);
}

// Account operations
export function createAccount(
  database: Database.Database,
  name: string,
  institution: string,
  type: Account['type']
): Account {
  const id = nanoid();
  database
    .prepare('INSERT INTO accounts (id, name, institution, type) VALUES (?, ?, ?, ?)')
    .run(id, name, institution, type);

  return getAccount(database, id)!;
}

export function getAccount(database: Database.Database, id: string): Account | null {
  const row = database.prepare('SELECT * FROM accounts WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? mapRowToAccount(row) : null;
}

export function getAccountByName(database: Database.Database, name: string): Account | null {
  const row = database.prepare('SELECT * FROM accounts WHERE name = ?').get(name) as
    | Record<string, unknown>
    | undefined;
  return row ? mapRowToAccount(row) : null;
}

export function getAllAccounts(database: Database.Database): Account[] {
  const rows = database.prepare('SELECT * FROM accounts ORDER BY name').all() as Record<
    string,
    unknown
  >[];
  return rows.map(mapRowToAccount);
}

function mapRowToAccount(row: Record<string, unknown>): Account {
  return {
    id: row.id as string,
    name: row.name as string,
    institution: row.institution as string,
    type: row.type as Account['type'],
    createdAt: new Date(row.created_at as string),
  };
}

// Transaction operations
export function insertTransaction(
  database: Database.Database,
  tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
): Transaction {
  const id = nanoid();
  database
    .prepare(
      `INSERT INTO transactions (
      id, account_id, date, description, normalized_merchant, amount,
      category_id, category_source, category_confidence, is_recurring,
      recurring_id, notes, raw_csv_row, import_hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      tx.accountId,
      tx.date.toISOString().split('T')[0],
      tx.description,
      tx.normalizedMerchant,
      tx.amount,
      tx.categoryId,
      tx.categorySource,
      tx.categoryConfidence,
      tx.isRecurring ? 1 : 0,
      tx.recurringId,
      tx.notes,
      tx.rawCsvRow,
      tx.importHash
    );

  return getTransaction(database, id)!;
}

export function getTransaction(database: Database.Database, id: string): Transaction | null {
  const row = database.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? mapRowToTransaction(row) : null;
}

export function transactionExists(database: Database.Database, importHash: string): boolean {
  const row = database
    .prepare('SELECT 1 FROM transactions WHERE import_hash = ?')
    .get(importHash);
  return !!row;
}

export function getTransactions(
  database: Database.Database,
  options: {
    accountId?: string;
    categoryId?: string;
    from?: Date;
    to?: Date;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}
): Transaction[] {
  let sql = 'SELECT * FROM transactions WHERE 1=1';
  const params: unknown[] = [];

  if (options.accountId) {
    sql += ' AND account_id = ?';
    params.push(options.accountId);
  }
  if (options.categoryId) {
    sql += ' AND category_id = ?';
    params.push(options.categoryId);
  }
  if (options.from) {
    sql += ' AND date >= ?';
    params.push(options.from.toISOString().split('T')[0]);
  }
  if (options.to) {
    sql += ' AND date <= ?';
    params.push(options.to.toISOString().split('T')[0]);
  }
  if (options.search) {
    sql += ' AND (description LIKE ? OR normalized_merchant LIKE ?)';
    const searchPattern = `%${options.search}%`;
    params.push(searchPattern, searchPattern);
  }

  sql += ' ORDER BY date DESC';

  if (options.limit) {
    sql += ' LIMIT ?';
    params.push(options.limit);
  }
  if (options.offset) {
    sql += ' OFFSET ?';
    params.push(options.offset);
  }

  const rows = database.prepare(sql).all(...params) as Record<string, unknown>[];
  return rows.map(mapRowToTransaction);
}

export function getUncategorizedTransactions(database: Database.Database): Transaction[] {
  const rows = database
    .prepare('SELECT * FROM transactions WHERE category_id IS NULL ORDER BY date DESC')
    .all() as Record<string, unknown>[];
  return rows.map(mapRowToTransaction);
}

export function updateTransactionCategory(
  database: Database.Database,
  id: string,
  categoryId: string,
  source: 'rule' | 'ai' | 'manual',
  confidence: number | null
): void {
  database
    .prepare(
      `UPDATE transactions
     SET category_id = ?, category_source = ?, category_confidence = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
    )
    .run(categoryId, source, confidence, id);
}

export function updateTransactionMerchant(
  database: Database.Database,
  id: string,
  normalizedMerchant: string
): void {
  database
    .prepare('UPDATE transactions SET normalized_merchant = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(normalizedMerchant, id);
}

function mapRowToTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    accountId: row.account_id as string,
    date: new Date(row.date as string),
    description: row.description as string,
    normalizedMerchant: row.normalized_merchant as string | null,
    amount: row.amount as number,
    categoryId: row.category_id as string | null,
    categorySource: row.category_source as Transaction['categorySource'],
    categoryConfidence: row.category_confidence as number | null,
    isRecurring: !!(row.is_recurring as number),
    recurringId: row.recurring_id as string | null,
    notes: row.notes as string | null,
    rawCsvRow: row.raw_csv_row as string | null,
    importHash: row.import_hash as string,
    createdAt: new Date(row.created_at as string),
    updatedAt: row.updated_at ? new Date(row.updated_at as string) : null,
  };
}

// Category operations
export function getAllCategories(database: Database.Database): Category[] {
  const rows = database.prepare('SELECT * FROM categories ORDER BY sort_order').all() as Record<
    string,
    unknown
  >[];
  return rows.map(mapRowToCategory);
}

export function getCategory(database: Database.Database, id: string): Category | null {
  const row = database.prepare('SELECT * FROM categories WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? mapRowToCategory(row) : null;
}

function mapRowToCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    name: row.name as string,
    parentId: row.parent_id as string | null,
    icon: row.icon as string | null,
    color: row.color as string | null,
    isIncome: !!(row.is_income as number),
    isSystem: !!(row.is_system as number),
    sortOrder: row.sort_order as number,
  };
}

// Categorization rules
export function getAllRules(database: Database.Database): CategorizationRule[] {
  const rows = database
    .prepare('SELECT * FROM categorization_rules WHERE is_active = 1 ORDER BY priority DESC')
    .all() as Record<string, unknown>[];
  return rows.map(mapRowToRule);
}

export function createRule(
  database: Database.Database,
  pattern: string,
  matchType: CategorizationRule['matchType'],
  categoryId: string,
  priority: number = 0
): CategorizationRule {
  const id = nanoid();
  database
    .prepare(
      'INSERT INTO categorization_rules (id, pattern, match_type, category_id, priority) VALUES (?, ?, ?, ?, ?)'
    )
    .run(id, pattern, matchType, categoryId, priority);
  return getRule(database, id)!;
}

export function getRule(database: Database.Database, id: string): CategorizationRule | null {
  const row = database.prepare('SELECT * FROM categorization_rules WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? mapRowToRule(row) : null;
}

function mapRowToRule(row: Record<string, unknown>): CategorizationRule {
  return {
    id: row.id as string,
    pattern: row.pattern as string,
    matchType: row.match_type as CategorizationRule['matchType'],
    categoryId: row.category_id as string,
    priority: row.priority as number,
    isActive: !!(row.is_active as number),
    createdAt: new Date(row.created_at as string),
  };
}

// Recurring payments
export function getAllRecurringPayments(database: Database.Database): RecurringPayment[] {
  const rows = database
    .prepare('SELECT * FROM recurring_payments ORDER BY merchant')
    .all() as Record<string, unknown>[];
  return rows.map(mapRowToRecurring);
}

export function getActiveRecurringPayments(database: Database.Database): RecurringPayment[] {
  const rows = database
    .prepare('SELECT * FROM recurring_payments WHERE is_active = 1 ORDER BY merchant')
    .all() as Record<string, unknown>[];
  return rows.map(mapRowToRecurring);
}

export function createRecurringPayment(
  database: Database.Database,
  payment: Omit<RecurringPayment, 'id' | 'createdAt' | 'updatedAt'>
): RecurringPayment {
  const id = nanoid();
  database
    .prepare(
      `INSERT INTO recurring_payments (
      id, merchant, normalized_merchant, category_id, frequency,
      expected_amount, amount_variance, is_active, last_seen, next_expected, notes, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      payment.merchant,
      payment.normalizedMerchant,
      payment.categoryId,
      payment.frequency,
      payment.expectedAmount,
      payment.amountVariance,
      payment.isActive ? 1 : 0,
      payment.lastSeen?.toISOString().split('T')[0] ?? null,
      payment.nextExpected?.toISOString().split('T')[0] ?? null,
      payment.notes,
      payment.status
    );
  return getRecurringPayment(database, id)!;
}

export function getRecurringPayment(
  database: Database.Database,
  id: string
): RecurringPayment | null {
  const row = database.prepare('SELECT * FROM recurring_payments WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? mapRowToRecurring(row) : null;
}

export function updateRecurringPaymentStatus(
  database: Database.Database,
  id: string,
  isActive: boolean
): void {
  database
    .prepare('UPDATE recurring_payments SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(isActive ? 1 : 0, id);
}

function mapRowToRecurring(row: Record<string, unknown>): RecurringPayment {
  return {
    id: row.id as string,
    merchant: row.merchant as string,
    normalizedMerchant: row.normalized_merchant as string | null,
    categoryId: row.category_id as string | null,
    frequency: row.frequency as RecurringPayment['frequency'],
    expectedAmount: row.expected_amount as number | null,
    amountVariance: row.amount_variance as number | null,
    isActive: !!(row.is_active as number),
    lastSeen: row.last_seen ? new Date(row.last_seen as string) : null,
    nextExpected: row.next_expected ? new Date(row.next_expected as string) : null,
    notes: row.notes as string | null,
    status: row.status as RecurringPayment['status'],
    createdAt: new Date(row.created_at as string),
    updatedAt: row.updated_at ? new Date(row.updated_at as string) : null,
  };
}

// AI Cache
export function getCachedAIResult(
  database: Database.Database,
  inputHash: string,
  provider: string,
  operation: string
): string | null {
  const row = database
    .prepare('SELECT result FROM ai_cache WHERE input_hash = ? AND provider = ? AND operation = ?')
    .get(inputHash, provider, operation) as { result: string } | undefined;
  return row?.result ?? null;
}

export function setCachedAIResult(
  database: Database.Database,
  inputHash: string,
  provider: string,
  operation: AICache['operation'],
  result: string
): void {
  const id = nanoid();
  database
    .prepare(
      'INSERT OR REPLACE INTO ai_cache (id, input_hash, provider, operation, result) VALUES (?, ?, ?, ?, ?)'
    )
    .run(id, inputHash, provider, operation, result);
}

// Import history
export function createImport(
  database: Database.Database,
  imp: Omit<Import, 'id' | 'createdAt'>
): Import {
  const id = nanoid();
  database
    .prepare(
      `INSERT INTO imports (id, filename, bank_profile, account_id, row_count, imported_count, skipped_count)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      imp.filename,
      imp.bankProfile,
      imp.accountId,
      imp.rowCount,
      imp.importedCount,
      imp.skippedCount
    );
  return getImport(database, id)!;
}

export function getImport(database: Database.Database, id: string): Import | null {
  const row = database.prepare('SELECT * FROM imports WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? mapRowToImport(row) : null;
}

function mapRowToImport(row: Record<string, unknown>): Import {
  return {
    id: row.id as string,
    filename: row.filename as string,
    bankProfile: row.bank_profile as string | null,
    accountId: row.account_id as string | null,
    rowCount: row.row_count as number,
    importedCount: row.imported_count as number,
    skippedCount: row.skipped_count as number,
    createdAt: new Date(row.created_at as string),
  };
}

// Aggregation queries for reports
export function getTransactionsByYear(
  database: Database.Database,
  year: number
): Transaction[] {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;
  const rows = database
    .prepare('SELECT * FROM transactions WHERE date >= ? AND date <= ? ORDER BY date')
    .all(startDate, endDate) as Record<string, unknown>[];
  return rows.map(mapRowToTransaction);
}

export function getTransactionsByMonth(
  database: Database.Database,
  year: number,
  month: number
): Transaction[] {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
  const rows = database
    .prepare('SELECT * FROM transactions WHERE date >= ? AND date <= ? ORDER BY date')
    .all(startDate, endDate) as Record<string, unknown>[];
  return rows.map(mapRowToTransaction);
}

export function getCategorySummary(
  database: Database.Database,
  year: number
): { categoryId: string; total: number; count: number }[] {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;
  const rows = database
    .prepare(
      `SELECT category_id, SUM(amount) as total, COUNT(*) as count
     FROM transactions
     WHERE date >= ? AND date <= ? AND category_id IS NOT NULL
     GROUP BY category_id
     ORDER BY total`
    )
    .all(startDate, endDate) as { category_id: string; total: number; count: number }[];

  return rows.map((r) => ({
    categoryId: r.category_id,
    total: r.total,
    count: r.count,
  }));
}

export function getMerchantSummary(
  database: Database.Database,
  year: number,
  limit: number = 20
): { merchant: string; total: number; count: number }[] {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;
  const rows = database
    .prepare(
      `SELECT COALESCE(normalized_merchant, description) as merchant, SUM(amount) as total, COUNT(*) as count
     FROM transactions
     WHERE date >= ? AND date <= ? AND amount < 0
     GROUP BY merchant
     ORDER BY total ASC
     LIMIT ?`
    )
    .all(startDate, endDate, limit) as { merchant: string; total: number; count: number }[];

  return rows;
}
