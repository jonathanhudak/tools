import { ipcMain, dialog } from 'electron'
import type Database from 'better-sqlite3'
import {
  getDatabase,
  getTransactions,
  getTransaction,
  getAllAccounts,
  getAccount,
  getAllCategories,
  getAllRecurringPayments,
  updateRecurringPaymentStatus,
  getCategorySummary,
  getMerchantSummary,
  updateTransactionCategory,
  updateTransactionMerchant,
  transactionExists,
  insertTransaction,
  createImport,
  createAccount,
  listAllRules,
  createRule,
  deleteRule,
  updateRuleStatus,
} from '../../local-finance/src/core/database'
import { parseCSVFile, generateImportHash } from '../../local-finance/src/import/csv-parser'
import {
  getAllBudgets,
  getBudget as getBudgetById,
  deleteBudget,
  getAllocations as getBudgetAllocations,
  setAllocation,
  removeAllocation,
  createSnapshot,
  getSnapshots,
  getLatestSnapshot,
} from '../../local-finance/src/core/budget-database'
import {
  createBudgetWithDefaults,
  getBudgetStatus,
  getBudgetVsActual,
  suggestAllocations,
} from '../../local-finance/src/core/budget'
import { generateYearReport, generateSpendingSummary, generateRuleBasedInsights } from '../../local-finance/src/insights/engine'
import { getDatabasePath, ensureDataDir } from '../../local-finance/src/core/config'
import type { TransactionFilters } from './preload'

let db: Database.Database | null = null

function getDb(): Database.Database {
  if (!db) {
    ensureDataDir()
    db = getDatabase(getDatabasePath())
  }
  return db
}

export function registerIpcHandlers(): void {
  // Transactions
  ipcMain.handle('transactions:list', (_event, filters?: TransactionFilters) => {
    const database = getDb()
    return getTransactions(database, {
      accountId: filters?.accountId,
      categoryId: filters?.categoryId,
      from: filters?.dateFrom ? new Date(filters.dateFrom) : undefined,
      to: filters?.dateTo ? new Date(filters.dateTo) : undefined,
      search: filters?.search,
      limit: filters?.limit,
      offset: filters?.offset,
    })
  })

  ipcMain.handle('transactions:get', (_event, id: string) => {
    const database = getDb()
    return getTransaction(database, id)
  })

  // Accounts
  ipcMain.handle('accounts:list', () => {
    const database = getDb()
    return getAllAccounts(database)
  })

  ipcMain.handle('accounts:get', (_event, id: string) => {
    const database = getDb()
    return getAccount(database, id)
  })

  // Categories
  ipcMain.handle('categories:list', () => {
    const database = getDb()
    return getAllCategories(database)
  })

  // Recurring payments
  ipcMain.handle('recurring:list', () => {
    const database = getDb()
    return getAllRecurringPayments(database)
  })

  ipcMain.handle('recurring:update-status', (_event, id: string, isActive: boolean) => {
    updateRecurringPaymentStatus(getDb(), id, isActive)
    return { success: true }
  })

  // Database stats
  ipcMain.handle('db:stats', () => {
    const database = getDb()
    const transactions = database
      .prepare('SELECT COUNT(*) as count FROM transactions')
      .get() as { count: number }
    const accounts = database
      .prepare('SELECT COUNT(*) as count FROM accounts')
      .get() as { count: number }
    const dateRange = database
      .prepare('SELECT MIN(date) as earliest, MAX(date) as latest FROM transactions')
      .get() as { earliest: string | null; latest: string | null }

    return {
      totalTransactions: transactions.count,
      totalAccounts: accounts.count,
      dateRange,
    }
  })

  // Account balances (SUM transactions per account)
  ipcMain.handle('accounts:balances', () => {
    const database = getDb()
    const rows = database
      .prepare(
        `SELECT account_id, SUM(amount) as balance
         FROM transactions
         GROUP BY account_id`
      )
      .all() as { account_id: string; balance: number }[]
    const balances: Record<string, number> = {}
    for (const row of rows) {
      balances[row.account_id] = row.balance
    }
    return balances
  })

  // ─── Transaction editing ─────────────────────────────────────
  ipcMain.handle('transaction:update-category', (_event, id: string, categoryId: string) => {
    updateTransactionCategory(getDb(), id, categoryId, 'manual', null)
    return { success: true }
  })

  ipcMain.handle('transaction:update-merchant', (_event, id: string, merchant: string) => {
    updateTransactionMerchant(getDb(), id, merchant)
    return { success: true }
  })

  // ─── Budget channels ───────────────────────────────────────
  ipcMain.handle('budgets:list', () => {
    return getAllBudgets(getDb())
  })

  ipcMain.handle('budgets:get', (_event, id: string) => {
    return getBudgetById(getDb(), id)
  })

  ipcMain.handle('budgets:create', (_event, name: string, periodType: 'monthly' | 'weekly' | 'yearly') => {
    return createBudgetWithDefaults(getDb(), name, periodType)
  })

  ipcMain.handle('budgets:delete', (_event, id: string) => {
    deleteBudget(getDb(), id)
    return { success: true }
  })

  // ─── Allocation channels ──────────────────────────────────
  ipcMain.handle('allocations:list', (_event, budgetId: string) => {
    return getBudgetAllocations(getDb(), budgetId)
  })

  ipcMain.handle('allocations:set', (_event, budgetId: string, categoryId: string, amount: number, rollover: boolean) => {
    return setAllocation(getDb(), budgetId, categoryId, amount, rollover)
  })

  ipcMain.handle('allocations:remove', (_event, budgetId: string, categoryId: string) => {
    removeAllocation(getDb(), budgetId, categoryId)
    return { success: true }
  })

  // ─── Budget status channels ───────────────────────────────
  ipcMain.handle('budget:status', (_event, budgetId: string) => {
    return getBudgetStatus(getDb(), budgetId)
  })

  ipcMain.handle('budget:vs-actual', (_event, budgetId: string, periodStart: string, periodEnd: string) => {
    return getBudgetVsActual(getDb(), budgetId, periodStart, periodEnd)
  })

  ipcMain.handle('budget:suggestions', (_event, months?: number) => {
    return suggestAllocations(getDb(), months ?? 3)
  })

  // ─── Report channels ─────────────────────────────────────
  ipcMain.handle('reports:category-summary', (_event, year: number) => {
    return getCategorySummary(getDb(), year)
  })

  ipcMain.handle('reports:merchant-summary', (_event, year: number) => {
    return getMerchantSummary(getDb(), year)
  })

  ipcMain.handle('reports:year', (_event, year: number) => {
    return generateYearReport(getDb(), year)
  })

  // ─── Snapshot channels ────────────────────────────────────
  ipcMain.handle('snapshots:create', (_event, accountId: string, date: string, balance: number, source: 'import' | 'manual' | 'calculated') => {
    return createSnapshot(getDb(), accountId, date, balance, source)
  })

  ipcMain.handle('snapshots:list', (_event, accountId: string) => {
    return getSnapshots(getDb(), accountId)
  })

  ipcMain.handle('snapshots:latest', (_event, accountId: string) => {
    return getLatestSnapshot(getDb(), accountId)
  })

  // ─── Insights methods ────────────────────────────────────────
  ipcMain.handle('insights:spending-summary', (_event, year: number, month?: number) => {
    return generateSpendingSummary(getDb(), year, month)
  })

  ipcMain.handle('insights:generate', (_event, year: number) => {
    const report = generateYearReport(getDb(), year)
    return generateRuleBasedInsights(report)
  })

  // ─── Categorization Rules methods ───────────────────────────
  ipcMain.handle('rules:list', () => {
    return listAllRules(getDb())
  })

  ipcMain.handle('rules:create', (_event, pattern: string, matchType: string, categoryId: string, priority: number) => {
    return createRule(getDb(), pattern, matchType as 'contains' | 'regex' | 'exact', categoryId, priority)
  })

  ipcMain.handle('rules:delete', (_event, id: string) => {
    deleteRule(getDb(), id)
    return { success: true }
  })

  ipcMain.handle('rules:toggle', (_event, id: string, isActive: boolean) => {
    updateRuleStatus(getDb(), id, isActive)
    return { success: true }
  })

  // ─── CSV Import methods ────────────────────────────────────
  ipcMain.handle('import:open-file-dialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'CSV', extensions: ['csv'] }],
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  ipcMain.handle('import:parse-file', (_event, filePath: string) => {
    const result = parseCSVFile(filePath)
    return {
      transactions: result.transactions.map(tx => ({
        date: tx.date.toISOString().split('T')[0],
        description: tx.description,
        amount: tx.amount,
        rawRow: tx.rawRow,
      })),
      detectedProfile: result.detectedProfile
        ? { id: result.detectedProfile.id, name: result.detectedProfile.name }
        : null,
      errors: result.errors,
      totalRows: result.totalRows,
    }
  })

  ipcMain.handle('import:check-duplicates', (_event, transactions: { date: string; description: string; amount: number; accountId: string }[]) => {
    const database = getDb()
    return transactions.map(tx => {
      const hash = generateImportHash(new Date(tx.date), tx.description, tx.amount, tx.accountId)
      return transactionExists(database, hash)
    })
  })

  ipcMain.handle('import:execute', (_event, payload: {
    transactions: { date: string; description: string; amount: number; rawRow: Record<string, string> }[]
    accountId: string
    filename: string
  }) => {
    const database = getDb()
    let imported = 0
    let skipped = 0

    for (const tx of payload.transactions) {
      const date = new Date(tx.date)
      const hash = generateImportHash(date, tx.description, tx.amount, payload.accountId)

      if (transactionExists(database, hash)) {
        skipped++
        continue
      }

      insertTransaction(database, {
        accountId: payload.accountId,
        date,
        description: tx.description,
        normalizedMerchant: null,
        amount: tx.amount,
        categoryId: null,
        categorySource: null,
        categoryConfidence: null,
        isRecurring: false,
        recurringId: null,
        notes: null,
        rawCsvRow: JSON.stringify(tx.rawRow),
        importHash: hash,
      })
      imported++
    }

    createImport(database, {
      filename: payload.filename,
      bankProfile: null,
      accountId: payload.accountId,
      rowCount: payload.transactions.length,
      importedCount: imported,
      skippedCount: skipped,
    })

    return { imported, skipped }
  })

  ipcMain.handle('import:create-account', (_event, name: string, institution: string, type: string) => {
    return createAccount(getDb(), name, institution, type as 'checking' | 'savings' | 'credit' | 'brokerage')
  })
}
