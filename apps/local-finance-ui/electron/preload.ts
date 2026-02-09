import { contextBridge, ipcRenderer } from 'electron'

export interface TransactionFilters {
  accountId?: string
  categoryId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  limit?: number
  offset?: number
}

export interface DbStats {
  totalTransactions: number
  totalAccounts: number
  dateRange: { earliest: string | null; latest: string | null }
}

const api = {
  // Transactions
  getTransactions: (filters?: TransactionFilters) =>
    ipcRenderer.invoke('transactions:list', filters),
  getTransaction: (id: string) =>
    ipcRenderer.invoke('transactions:get', id),

  // Accounts
  getAccounts: () =>
    ipcRenderer.invoke('accounts:list'),
  getAccount: (id: string) =>
    ipcRenderer.invoke('accounts:get', id),

  // Categories
  getCategories: () =>
    ipcRenderer.invoke('categories:list'),

  // Recurring payments
  getRecurringPayments: () =>
    ipcRenderer.invoke('recurring:list'),
  updateRecurringStatus: (id: string, isActive: boolean) =>
    ipcRenderer.invoke('recurring:update-status', id, isActive),

  // Account balances
  getAccountBalances: () =>
    ipcRenderer.invoke('accounts:balances') as Promise<Record<string, number>>,

  // Database stats
  getDbStats: () =>
    ipcRenderer.invoke('db:stats'),

  // ─── Budget methods ────────────────────────────────────────
  getBudgets: () =>
    ipcRenderer.invoke('budgets:list'),
  getBudget: (id: string) =>
    ipcRenderer.invoke('budgets:get', id),
  createBudget: (name: string, periodType: 'monthly' | 'weekly' | 'yearly') =>
    ipcRenderer.invoke('budgets:create', name, periodType),
  deleteBudget: (id: string) =>
    ipcRenderer.invoke('budgets:delete', id),

  // ─── Allocation methods ────────────────────────────────────
  getAllocations: (budgetId: string) =>
    ipcRenderer.invoke('allocations:list', budgetId),
  setAllocation: (budgetId: string, categoryId: string, amount: number, rollover: boolean) =>
    ipcRenderer.invoke('allocations:set', budgetId, categoryId, amount, rollover),
  removeAllocation: (budgetId: string, categoryId: string) =>
    ipcRenderer.invoke('allocations:remove', budgetId, categoryId),

  // ─── Budget status methods ─────────────────────────────────
  getBudgetStatus: (budgetId: string) =>
    ipcRenderer.invoke('budget:status', budgetId),
  getBudgetVsActual: (budgetId: string, periodStart: string, periodEnd: string) =>
    ipcRenderer.invoke('budget:vs-actual', budgetId, periodStart, periodEnd),
  getBudgetSuggestions: (months?: number) =>
    ipcRenderer.invoke('budget:suggestions', months),

  // ─── Report methods ────────────────────────────────────────
  getCategorySummary: (year: number) =>
    ipcRenderer.invoke('reports:category-summary', year),
  getMerchantSummary: (year: number) =>
    ipcRenderer.invoke('reports:merchant-summary', year),
  getYearReport: (year: number) =>
    ipcRenderer.invoke('reports:year', year),

  // ─── Snapshot methods ──────────────────────────────────────
  createSnapshot: (accountId: string, date: string, balance: number, source: 'import' | 'manual' | 'calculated') =>
    ipcRenderer.invoke('snapshots:create', accountId, date, balance, source),
  getSnapshots: (accountId: string) =>
    ipcRenderer.invoke('snapshots:list', accountId),
  getLatestSnapshot: (accountId: string) =>
    ipcRenderer.invoke('snapshots:latest', accountId),

  // ─── Transaction editing ────────────────────────────────────
  updateTransactionCategory: (id: string, categoryId: string) =>
    ipcRenderer.invoke('transaction:update-category', id, categoryId),
  updateTransactionMerchant: (id: string, merchant: string) =>
    ipcRenderer.invoke('transaction:update-merchant', id, merchant),

  // ─── Insights methods ────────────────────────────────────────
  getSpendingSummary: (year: number, month?: number) =>
    ipcRenderer.invoke('insights:spending-summary', year, month),
  getInsights: (year: number) =>
    ipcRenderer.invoke('insights:generate', year),

  // ─── Categorization Rules methods ───────────────────────────
  getRules: () =>
    ipcRenderer.invoke('rules:list'),
  createRule: (pattern: string, matchType: string, categoryId: string, priority: number) =>
    ipcRenderer.invoke('rules:create', pattern, matchType, categoryId, priority),
  deleteRule: (id: string) =>
    ipcRenderer.invoke('rules:delete', id),
  toggleRule: (id: string, isActive: boolean) =>
    ipcRenderer.invoke('rules:toggle', id, isActive),

  // ─── CSV Import methods ────────────────────────────────────
  importOpenFileDialog: () =>
    ipcRenderer.invoke('import:open-file-dialog') as Promise<string | null>,
  importParseFile: (filePath: string) =>
    ipcRenderer.invoke('import:parse-file', filePath),
  importCheckDuplicates: (transactions: { date: string; description: string; amount: number; accountId: string }[]) =>
    ipcRenderer.invoke('import:check-duplicates', transactions) as Promise<boolean[]>,
  importExecute: (payload: { transactions: { date: string; description: string; amount: number; rawRow: Record<string, string> }[]; accountId: string; filename: string }) =>
    ipcRenderer.invoke('import:execute', payload) as Promise<{ imported: number; skipped: number }>,
  importCreateAccount: (name: string, institution: string, type: string) =>
    ipcRenderer.invoke('import:create-account', name, institution, type),
}

export type Api = typeof api

contextBridge.exposeInMainWorld('api', api)
