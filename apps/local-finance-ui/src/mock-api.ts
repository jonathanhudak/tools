// Mock API for web-only development (no Electron)

const ACCOUNTS = [
  { id: 'checking-1', name: 'Chase Checking', type: 'checking' },
  { id: 'savings-1', name: 'Ally Savings', type: 'savings' },
  { id: 'credit-1', name: 'Amex Gold', type: 'credit' },
]

const CATEGORIES = [
  { id: 'food', name: 'Food & Dining', parentId: null, color: '#ef4444', icon: null },
  { id: 'groceries', name: 'Groceries', parentId: 'food', color: '#f97316', icon: null },
  { id: 'restaurants', name: 'Restaurants', parentId: 'food', color: '#f59e0b', icon: null },
  { id: 'housing', name: 'Housing', parentId: null, color: '#3b82f6', icon: null },
  { id: 'rent', name: 'Rent', parentId: 'housing', color: '#6366f1', icon: null },
  { id: 'utilities', name: 'Utilities', parentId: 'housing', color: '#8b5cf6', icon: null },
  { id: 'transport', name: 'Transportation', parentId: null, color: '#10b981', icon: null },
  { id: 'entertainment', name: 'Entertainment', parentId: null, color: '#ec4899', icon: null },
  { id: 'shopping', name: 'Shopping', parentId: null, color: '#14b8a6', icon: null },
  { id: 'income', name: 'Income', parentId: null, color: '#10b981', icon: null },
]

function randomDate(daysBack: number): string {
  const d = new Date()
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack))
  return d.toISOString().split('T')[0]
}

const MERCHANTS = [
  'Whole Foods', 'Trader Joes', 'Amazon', 'Netflix', 'Uber',
  'Starbucks', 'Target', 'Costco', 'Shell Gas', 'Spotify',
  'Apple', 'Chipotle', 'DoorDash', 'Electric Co', 'Water Utility',
]

const TRANSACTIONS = Array.from({ length: 80 }, (_, i) => {
  const isIncome = i % 10 === 0
  const merchant = isIncome ? 'Employer Inc' : MERCHANTS[i % MERCHANTS.length]
  const expenseCategories = CATEGORIES.filter(c => c.id !== 'income')
  const cat = isIncome ? 'income' : expenseCategories[i % expenseCategories.length].id
  const amount = isIncome
    ? 3000 + Math.random() * 2000
    : -(10 + Math.random() * 200)

  return {
    id: `txn-${i}`,
    accountId: ACCOUNTS[i % ACCOUNTS.length].id,
    date: randomDate(90),
    description: `${merchant} - Transaction`,
    normalizedMerchant: merchant,
    amount: Math.round(amount * 100) / 100,
    categoryId: cat,
    categorySource: 'rule' as const,
    categoryConfidence: 0.95,
    isRecurring: i % 7 === 0,
    recurringId: null,
    notes: null,
  }
}).sort((a, b) => b.date.localeCompare(a.date))

const BALANCES: Record<string, number> = {
  'checking-1': 4523.67,
  'savings-1': 12840.50,
  'credit-1': -1245.33,
}

const mockApi = {
  getTransactions: async (filters?: Record<string, unknown>) => {
    let txns = [...TRANSACTIONS]
    if (filters?.search) {
      const q = (filters.search as string).toLowerCase()
      txns = txns.filter(t => t.description.toLowerCase().includes(q) || t.normalizedMerchant?.toLowerCase().includes(q))
    }
    if (filters?.categoryId) txns = txns.filter(t => t.categoryId === filters.categoryId)
    if (filters?.accountId) txns = txns.filter(t => t.accountId === filters.accountId)
    const offset = (filters?.offset as number) || 0
    const limit = (filters?.limit as number) || 50
    return txns.slice(offset, offset + limit)
  },
  getTransaction: async (id: string) => TRANSACTIONS.find(t => t.id === id) || null,
  getAccounts: async () => ACCOUNTS,
  getAccount: async (id: string) => ACCOUNTS.find(a => a.id === id) || null,
  getCategories: async () => CATEGORIES,
  getRecurringPayments: async () => TRANSACTIONS.filter(t => t.isRecurring),
  getAccountBalances: async () => BALANCES,
  getDbStats: async () => ({
    totalTransactions: TRANSACTIONS.length,
    totalAccounts: ACCOUNTS.length,
    dateRange: { earliest: TRANSACTIONS[TRANSACTIONS.length - 1].date, latest: TRANSACTIONS[0].date },
  }),
  getBudgets: async () => [{ id: 'budget-1', name: 'Monthly Budget', periodType: 'monthly' }],
  getBudget: async () => ({ id: 'budget-1', name: 'Monthly Budget', periodType: 'monthly' }),
  createBudget: async (name: string, periodType: string) => ({ id: `budget-${Date.now()}`, name, periodType }),
  deleteBudget: async () => ({ success: true }),
  getAllocations: async () => [
    { budgetId: 'budget-1', categoryId: 'groceries', amount: 600, rollover: false },
    { budgetId: 'budget-1', categoryId: 'restaurants', amount: 300, rollover: false },
    { budgetId: 'budget-1', categoryId: 'entertainment', amount: 150, rollover: true },
    { budgetId: 'budget-1', categoryId: 'transport', amount: 200, rollover: false },
  ],
  setAllocation: async () => ({ success: true }),
  removeAllocation: async () => ({ success: true }),
  getBudgetStatus: async () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    const daysLeft = Math.max(1, new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate())
    return {
      budgetId: 'budget-1',
      budgetName: 'Monthly Budget',
      periodType: 'monthly',
      currentPeriod: { start, end },
      totalAllocated: 1250,
      totalSpent: 890,
      totalRemaining: 360,
      percentUsed: 71,
      overBudgetCategories: [
        { categoryId: 'entertainment', categoryName: 'Entertainment', overBy: 15 },
      ],
      warningCategories: [
        { categoryId: 'groceries', categoryName: 'Groceries', percentUsed: 87 },
      ],
      daysRemainingInPeriod: daysLeft,
      dailyBudgetRemaining: Math.round(360 / daysLeft),
    }
  },
  getBudgetVsActual: async () => [
    { categoryId: 'groceries', categoryName: 'Groceries', allocated: 600, spent: 523, remaining: 77, percentUsed: 87, status: 'warning', rolloverAmount: 0 },
    { categoryId: 'restaurants', categoryName: 'Restaurants', allocated: 300, spent: 187, remaining: 113, percentUsed: 62, status: 'under', rolloverAmount: 0 },
    { categoryId: 'entertainment', categoryName: 'Entertainment', allocated: 150, spent: 165, remaining: -15, percentUsed: 110, status: 'over', rolloverAmount: 0 },
    { categoryId: 'transport', categoryName: 'Transportation', allocated: 200, spent: 89, remaining: 111, percentUsed: 44, status: 'under', rolloverAmount: 0 },
  ],
  getBudgetSuggestions: async () => [
    { categoryId: 'groceries', categoryName: 'Groceries', suggestedAmount: 580 },
    { categoryId: 'restaurants', categoryName: 'Restaurants', suggestedAmount: 250 },
    { categoryId: 'entertainment', categoryName: 'Entertainment', suggestedAmount: 120 },
  ],
  getCategorySummary: async () =>
    CATEGORIES.filter(c => c.id !== 'income').map(c => ({
      categoryId: c.id,
      total: -(Math.random() * 3000 + 200),
      count: Math.floor(Math.random() * 20 + 1),
    })),
  getMerchantSummary: async () =>
    MERCHANTS.map(m => ({
      merchant: m,
      total: -(Math.random() * 2000 + 50),
      count: Math.floor(Math.random() * 15 + 1),
    })),
  getYearReport: async (year: number) => {
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: monthNames[i],
      income: 4000 + Math.random() * 1500,
      expenses: 2500 + Math.random() * 1500,
    }))
    const totalIncome = months.reduce((s, m) => s + m.income, 0)
    const totalExpenses = months.reduce((s, m) => s + m.expenses, 0)
    return {
      year,
      totalIncome: Math.round(totalIncome),
      totalExpenses: Math.round(totalExpenses),
      net: Math.round(totalIncome - totalExpenses),
      savingsRate: Math.round(((totalIncome - totalExpenses) / totalIncome) * 100),
      byMonth: months.map(m => ({ ...m, income: Math.round(m.income), expenses: Math.round(m.expenses), net: Math.round(m.income - m.expenses) })),
      byCategory: CATEGORIES.filter(c => c.id !== 'income').map(c => ({
        categoryId: c.id,
        categoryName: c.name,
        amount: Math.round(Math.random() * 5000 + 200),
        count: Math.floor(Math.random() * 50 + 5),
      })),
      topMerchants: MERCHANTS.slice(0, 10).map((m, i) => ({
        merchant: m,
        amount: Math.round(Math.random() * 3000 + 100),
        count: Math.floor(Math.random() * 30 + 3),
        categoryName: CATEGORIES[i % CATEGORIES.length].name,
      })),
    }
  },
  createSnapshot: async () => ({ success: true }),
  getSnapshots: async () => [],
  getLatestSnapshot: async () => null,
}

export function installMockApi() {
  if (!window.api) {
    (window as Record<string, unknown>).api = mockApi
  }
}
