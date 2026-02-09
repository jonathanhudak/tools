import { useState, useMemo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useIPC } from '@/hooks/useIPC'
import { AmountDisplay } from '@/components'

const CHART_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#6366f1',
  '#84cc16',
]

interface YearReport {
  year: number
  totalIncome: number
  totalExpenses: number
  net: number
  byCategory: CategorySummary[]
  byMonth: MonthSummary[]
  topMerchants: MerchantSummary[]
  recurringPayments: unknown[]
  insights: string[]
}

interface CategorySummary {
  categoryId: string
  categoryName: string
  parentName: string | null
  amount: number
  percentage: number
  transactionCount: number
}

interface MonthSummary {
  month: number
  monthName: string
  income: number
  expenses: number
  net: number
}

interface MerchantSummary {
  merchant: string
  amount: number
  count: number
  categoryName: string | null
}

function formatCurrency(value: number): string {
  return Math.abs(value).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function SummaryCard({
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
    <div className="rounded-xl bg-white p-5 shadow-sm border border-border">
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

const RADIAN = Math.PI / 180
function renderPieLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx?: number
  cy?: number
  midAngle?: number
  innerRadius?: number
  outerRadius?: number
  percent?: number
}) {
  if (!cx || !cy || !midAngle || !innerRadius || !outerRadius || !percent) return null
  if (percent < 0.04) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 1.3
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text
      x={x}
      y={y}
      fill="#64748b"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function Reports() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)

  const { data: report, loading } = useIPC<YearReport>('getYearReport', year)

  // Monthly chart data
  const monthlyData = useMemo(() => {
    if (!report) return []
    return report.byMonth.map((m) => ({
      name: m.monthName.slice(0, 3),
      Income: m.income,
      Expenses: Math.abs(m.expenses),
    }))
  }, [report])

  // Category donut data: top 10 expense categories
  const categoryData = useMemo(() => {
    if (!report) return []
    return report.byCategory
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
      .map((c) => ({
        name: c.categoryName,
        value: c.amount,
      }))
  }, [report])

  const savingsRate = useMemo(() => {
    if (!report || report.totalIncome === 0) return 0
    return (report.net / report.totalIncome) * 100
  }, [report])

  return (
    <div className="p-8">
      {/* Header with year selector */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setYear((y) => y - 1)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="px-3 py-1.5 text-sm font-semibold text-slate-700 min-w-[60px] text-center">
            {year}
          </span>
          <button
            onClick={() => setYear((y) => Math.min(y + 1, currentYear))}
            disabled={year >= currentYear}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          label="Total Income"
          value={report ? formatCurrency(report.totalIncome) : '--'}
          icon={TrendingUp}
          color="var(--color-income)"
          loading={loading}
        />
        <SummaryCard
          label="Total Expenses"
          value={report ? formatCurrency(report.totalExpenses) : '--'}
          icon={TrendingDown}
          color="var(--color-expense)"
          loading={loading}
        />
        <SummaryCard
          label="Net"
          value={report ? formatCurrency(report.net) : '--'}
          icon={DollarSign}
          color="var(--color-primary)"
          loading={loading}
        />
        <SummaryCard
          label="Savings Rate"
          value={report ? `${savingsRate.toFixed(1)}%` : '--'}
          icon={PiggyBank}
          color="#8b5cf6"
          loading={loading}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Trend */}
        <div className="rounded-xl bg-white p-5 shadow-sm border border-border">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Monthly Trend
          </h2>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <span className="text-sm text-slate-400">Loading...</span>
            </div>
          ) : monthlyData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center">
              <span className="text-sm text-slate-400">
                No data for {year}
              </span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={monthlyData}
                margin={{ left: 0, right: 8, top: 0, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  fontSize={12}
                  stroke="#94a3b8"
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                  }
                  fontSize={12}
                  stroke="#94a3b8"
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: number | undefined, name: string | undefined) => [
                    `$${(value ?? 0).toLocaleString()}`,
                    name ?? '',
                  ]}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 13, paddingTop: 8 }}
                />
                <Bar dataKey="Income" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar
                  dataKey="Expenses"
                  fill="#ef4444"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Spending by Category Donut */}
        <div className="rounded-xl bg-white p-5 shadow-sm border border-border">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Spending by Category
          </h2>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <span className="text-sm text-slate-400">Loading...</span>
            </div>
          ) : categoryData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center">
              <span className="text-sm text-slate-400">
                No category data for {year}
              </span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  dataKey="value"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  label={renderPieLabel as any}
                  labelLine={false}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {categoryData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
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
              </PieChart>
            </ResponsiveContainer>
          )}
          {/* Legend for donut */}
          {!loading && categoryData.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 px-1">
              {categoryData.map((c, i) => (
                <div key={c.name} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        CHART_COLORS[i % CHART_COLORS.length],
                    }}
                  />
                  <span className="text-xs text-slate-500">{c.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Merchants Table */}
      <div className="rounded-xl bg-white p-5 shadow-sm border border-border">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Top Merchants
        </h2>
        {loading ? (
          <div className="text-sm text-slate-400 py-12 text-center">
            Loading...
          </div>
        ) : !report || report.topMerchants.length === 0 ? (
          <div className="text-sm text-slate-400 py-12 text-center">
            No merchant data for {year}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 pr-4 w-12">#</th>
                  <th className="pb-3 pr-4">Merchant</th>
                  <th className="pb-3 pr-4">Category</th>
                  <th className="pb-3 pr-4 text-right">Amount</th>
                  <th className="pb-3 text-right">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {report.topMerchants.slice(0, 15).map((m, i) => (
                  <tr
                    key={m.merchant}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="py-3 pr-4 text-slate-400 font-medium">
                      {i + 1}
                    </td>
                    <td className="py-3 pr-4 text-slate-900 font-medium">
                      {m.merchant}
                    </td>
                    <td className="py-3 pr-4 text-slate-500">
                      {m.categoryName || '--'}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <AmountDisplay amount={-m.amount} size="sm" />
                    </td>
                    <td className="py-3 text-right text-slate-500">
                      {m.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
