import { useEffect, useState, useMemo } from 'react'
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Wallet,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useIPC } from '@/hooks/useIPC'
import { TransactionList, BudgetProgress, TransactionDetail } from '@/components'

const CHART_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
]

function formatCurrency(value: number): string {
  return Math.abs(value).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  loading,
}: {
  label: string
  value: string
  icon: React.ElementType
  color: string
  loading?: boolean
}) {
  return (
    <div
      className="rounded-xl bg-white p-5 shadow-sm border border-border"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg"
          style={{ backgroundColor: `${color}15`, color }}
        >
          <Icon size={18} />
        </div>
      </div>
      {loading ? (
        <div className="h-8 bg-slate-100 rounded w-28 animate-pulse" />
      ) : (
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
      )}
    </div>
  )
}

interface Transaction {
  id: string
  accountId: string
  date: string | Date
  description: string
  normalizedMerchant: string | null
  amount: number
  categoryId: string | null
  categorySource: 'rule' | 'ai' | 'manual' | null
  categoryConfidence: number | null
  isRecurring: boolean
  recurringId: string | null
  notes: string | null
}

interface Category {
  id: string
  name: string
  parentId: string | null
  color: string | null
  icon: string | null
}

interface Account {
  id: string
  name: string
}

interface CatSummary {
  categoryId: string
  total: number
  count: number
}

interface Budget {
  id: string
  name: string
}

interface BudgetActualItem {
  categoryId: string
  categoryName: string
  allocated: number
  spent: number
  remaining: number
  percentUsed: number
  status: 'under' | 'warning' | 'over'
  rolloverAmount: number
}

export default function Dashboard() {
  const currentYear = new Date().getFullYear()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0]
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split('T')[0]

  const { data: accounts, loading: accountsLoading } =
    useIPC<Account[]>('getAccounts')
  const { data: balances, loading: balancesLoading } =
    useIPC<Record<string, number>>('getAccountBalances')
  const { data: categories } = useIPC<Category[]>('getCategories')
  const { data: catSummary, loading: catLoading } = useIPC<CatSummary[]>(
    'getCategorySummary',
    currentYear,
  )
  const { data: budgets } = useIPC<Budget[]>('getBudgets')

  const [monthTxns, setMonthTxns] = useState<Transaction[] | null>(null)
  const [recentTxns, setRecentTxns] = useState<Transaction[] | null>(null)
  const [recentLoading, setRecentLoading] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [budgetItems, setBudgetItems] = useState<BudgetActualItem[] | null>(
    null,
  )

  // Fetch current-month transactions for income/expenses
  useEffect(() => {
    if (!window.api) return
    window.api
      .getTransactions({ dateFrom: monthStart, dateTo: monthEnd })
      .then((txns: Transaction[]) => setMonthTxns(txns))
      .catch(() => setMonthTxns([]))
  }, [monthStart, monthEnd])

  // Fetch recent transactions
  const fetchRecentTxns = () => {
    if (!window.api) return
    setRecentLoading(true)
    window.api
      .getTransactions({ limit: 10 })
      .then((txns: Transaction[]) => {
        setRecentTxns(txns)
        setRecentLoading(false)
      })
      .catch(() => {
        setRecentTxns([])
        setRecentLoading(false)
      })
  }

  useEffect(() => {
    fetchRecentTxns()
  }, [])

  // Fetch budget vs actual for first budget
  useEffect(() => {
    if (!budgets || budgets.length === 0) return
    const budget = budgets[0]
    window.api
      .getBudgetVsActual(budget.id, monthStart, monthEnd)
      .then((items: BudgetActualItem[]) => setBudgetItems(items))
      .catch(() => setBudgetItems(null))
  }, [budgets, monthStart, monthEnd])

  // Computed stats
  const netBalance = useMemo(() => {
    if (!balances) return 0
    return Object.values(balances).reduce((sum, b) => sum + b, 0)
  }, [balances])

  const { monthIncome, monthExpenses } = useMemo(() => {
    if (!monthTxns)
      return { monthIncome: 0, monthExpenses: 0 }
    let income = 0
    let expenses = 0
    for (const tx of monthTxns) {
      if (tx.amount >= 0) income += tx.amount
      else expenses += Math.abs(tx.amount)
    }
    return { monthIncome: income, monthExpenses: expenses }
  }, [monthTxns])

  // Category chart data: top 8 expense categories
  const categoryChart = useMemo(() => {
    if (!catSummary || !categories) return []
    const catMap = new Map(categories.map((c) => [c.id, c.name]))
    return catSummary
      .filter((c) => c.total < 0)
      .sort((a, b) => a.total - b.total) // most negative first
      .slice(0, 8)
      .map((c) => ({
        name: catMap.get(c.categoryId) || c.categoryId,
        amount: Math.abs(c.total),
      }))
  }, [catSummary, categories])

  const statsLoading = accountsLoading || balancesLoading || !monthTxns

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Net Balance"
          value={formatCurrency(netBalance)}
          icon={DollarSign}
          color="var(--color-primary)"
          loading={statsLoading}
        />
        <StatCard
          label="Month Income"
          value={formatCurrency(monthIncome)}
          icon={TrendingUp}
          color="var(--color-income)"
          loading={statsLoading}
        />
        <StatCard
          label="Month Expenses"
          value={formatCurrency(monthExpenses)}
          icon={TrendingDown}
          color="var(--color-expense)"
          loading={statsLoading}
        />
        <StatCard
          label="Accounts"
          value={accounts ? String(accounts.length) : '--'}
          icon={CreditCard}
          color="#8b5cf6"
          loading={accountsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Spending by Category chart */}
        <div
          className="rounded-xl bg-white p-5 shadow-sm border border-border"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Spending by Category
          </h2>
          {catLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <span className="text-sm text-slate-400">Loading...</span>
            </div>
          ) : categoryChart.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center">
              <span className="text-sm text-slate-400">
                No category data for {currentYear}
              </span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={categoryChart}
                layout="vertical"
                margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  fontSize={12}
                  stroke="#94a3b8"
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  fontSize={12}
                  stroke="#94a3b8"
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: number | undefined) => [
                    `$${(value ?? 0).toLocaleString()}`,
                    'Spent',
                  ]}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={22}>
                  {categoryChart.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Budget Summary Widget */}
        <div
          className="rounded-xl bg-white p-5 shadow-sm border border-border"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Budget Summary
          </h2>
          {!budgets ? (
            <div className="h-[300px] flex items-center justify-center">
              <span className="text-sm text-slate-400">Loading...</span>
            </div>
          ) : budgets.length === 0 ? (
            <div className="h-[300px] flex flex-col items-center justify-center gap-3">
              <Wallet size={32} className="text-slate-300" />
              <span className="text-sm text-slate-400">
                No budgets set up yet
              </span>
              <span className="text-xs text-slate-400">
                Create a budget to track your spending
              </span>
            </div>
          ) : !budgetItems ? (
            <div className="h-[300px] flex items-center justify-center">
              <span className="text-sm text-slate-400">Loading...</span>
            </div>
          ) : budgetItems.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center">
              <span className="text-sm text-slate-400">
                No budget categories configured
              </span>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {budgetItems.slice(0, 5).map((item) => (
                <BudgetProgress
                  key={item.categoryId}
                  categoryName={item.categoryName}
                  allocated={item.allocated}
                  spent={item.spent}
                  rollover={item.rolloverAmount}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div
        className="rounded-xl bg-white p-5 shadow-sm border border-border"
      >
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Recent Transactions
        </h2>
        {recentLoading || !recentTxns ? (
          <TransactionList
            transactions={[]}
            categories={categories || []}
            accounts={accounts || []}
            loading
          />
        ) : recentTxns.length === 0 ? (
          <div className="text-sm text-slate-400 py-12 text-center">
            No transactions yet
          </div>
        ) : (
          <TransactionList
            transactions={recentTxns}
            categories={categories || []}
            accounts={accounts || []}
            onTransactionClick={(tx) => setSelectedTransaction(tx as Transaction)}
          />
        )}
      </div>

      {selectedTransaction && (
        <TransactionDetail
          transaction={selectedTransaction}
          categories={categories || []}
          accounts={accounts || []}
          onClose={() => setSelectedTransaction(null)}
          onUpdate={() => {
            setSelectedTransaction(null)
            fetchRecentTxns()
          }}
        />
      )}
    </div>
  )
}
