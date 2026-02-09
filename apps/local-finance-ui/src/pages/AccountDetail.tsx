import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Landmark, PiggyBank, CreditCard, TrendingUp } from 'lucide-react'
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { useIPC } from '@/hooks/useIPC'
import { TransactionList, AmountDisplay } from '@/components'

interface Account {
  id: string
  name: string
  institution: string
  type: 'checking' | 'savings' | 'credit' | 'brokerage'
}

interface Category {
  id: string
  name: string
  parentId: string | null
  color: string | null
  icon: string | null
}

interface Snapshot {
  date: string
  balance: number
}

const typeConfig: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  checking: { icon: Landmark, color: '#3b82f6', label: 'Checking' },
  savings: { icon: PiggyBank, color: '#10b981', label: 'Savings' },
  credit: { icon: CreditCard, color: '#f97316', label: 'Credit' },
  brokerage: { icon: TrendingUp, color: '#8b5cf6', label: 'Brokerage' },
}

const LIMIT = 50

export default function AccountDetail() {
  const { accountId } = useParams<{ accountId: string }>()
  const navigate = useNavigate()

  const { data: account, loading: accountLoading } = useIPC<Account>('getAccount', accountId)
  const { data: balances, loading: balancesLoading } = useIPC<Record<string, number>>('getAccountBalances')
  const { data: categories } = useIPC<Category[]>('getCategories')
  const { data: snapshots, loading: snapshotsLoading } = useIPC<Snapshot[]>('getSnapshots', accountId)

  const [transactions, setTransactions] = useState<unknown[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [txLoading, setTxLoading] = useState(true)

  const fetchTransactions = useCallback(async (newOffset: number, append: boolean) => {
    if (!accountId) return
    setTxLoading(true)
    try {
      const results = await window.api.getTransactions({
        accountId,
        limit: LIMIT,
        offset: newOffset,
      } as never)
      const arr = results as unknown[]
      if (append) {
        setTransactions((prev) => [...prev, ...arr])
      } else {
        setTransactions(arr)
      }
      setHasMore(arr.length === LIMIT)
    } catch {
      // Error handled silently
    } finally {
      setTxLoading(false)
    }
  }, [accountId])

  useEffect(() => {
    setOffset(0)
    fetchTransactions(0, false)
  }, [fetchTransactions])

  const handleLoadMore = () => {
    const newOffset = offset + LIMIT
    setOffset(newOffset)
    fetchTransactions(newOffset, true)
  }

  const balance = balances && accountId ? balances[accountId] : undefined
  const config = account ? typeConfig[account.type] : null
  const Icon = config?.icon

  const chartData = useMemo(() => {
    if (!snapshots || snapshots.length === 0) return []
    return snapshots.map((s) => ({
      date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      balance: s.balance,
    }))
  }, [snapshots])

  const headerLoading = accountLoading || balancesLoading

  return (
    <div className="p-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/accounts')}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to Accounts
      </button>

      {/* Account header card */}
      {headerLoading ? (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-border mb-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-200" />
            <div className="flex-1">
              <div className="h-5 bg-slate-200 rounded w-40 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-24" />
            </div>
            <div className="h-8 bg-slate-200 rounded w-32" />
          </div>
        </div>
      ) : account && config && Icon ? (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-border mb-6">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-xl"
              style={{ backgroundColor: `${config.color}15`, color: config.color }}
            >
              <Icon size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-slate-900">{account.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-slate-400">{account.institution}</span>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${config.color}15`, color: config.color }}
                >
                  {config.label}
                </span>
              </div>
            </div>
            {balance !== undefined && (
              <AmountDisplay amount={balance} size="xl" />
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-border mb-6">
          <p className="text-sm text-slate-400">Account not found.</p>
        </div>
      )}

      {/* Balance History Chart */}
      {!snapshotsLoading && chartData.length > 0 && (
        <div className="rounded-xl bg-white p-5 shadow-sm border border-border mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Balance History</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
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
                formatter={(value: number | undefined) => [
                  `$${(value ?? 0).toLocaleString()}`,
                  'Balance',
                ]}
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: 13,
                }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#balanceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Transactions</h3>
      </div>

      <TransactionList
        transactions={transactions as never[]}
        categories={categories ?? []}
        accounts={account ? [{ id: account.id, name: account.name }] : []}
        loading={txLoading && transactions.length === 0}
      />

      {/* Load more */}
      {hasMore && !txLoading && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 rounded-lg border border-border text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 transition-colors"
          >
            Load more
          </button>
        </div>
      )}
      {txLoading && transactions.length > 0 && (
        <div className="mt-4 text-center text-sm text-slate-400">Loading...</div>
      )}
    </div>
  )
}
