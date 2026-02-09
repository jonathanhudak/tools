import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, ChevronDown, X } from 'lucide-react'
import { useIPC } from '@/hooks/useIPC'
import { TransactionList, DateRangePicker, TransactionDetail } from '@/components'
import { cn } from '@/lib/utils'

interface DateRange {
  start: string
  end: string
}

function defaultDateRange(): DateRange {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const start = new Date(y, m - 2, 1)
  const end = new Date(y, m + 1, 0)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  return { start: fmt(start), end: fmt(end) }
}

const LIMIT = 50

export default function Transactions() {
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [accountId, setAccountId] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [transactions, setTransactions] = useState<unknown[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)

  const { data: categories } = useIPC<{ id: string; name: string; parentId: string | null; color: string | null; icon: string | null }[]>('getCategories')
  const { data: accounts } = useIPC<{ id: string; name: string; institution: string; type: string }[]>('getAccounts')

  const fetchTransactions = useCallback(async (newOffset: number, append: boolean) => {
    setLoading(true)
    try {
      const filters: Record<string, unknown> = {
        limit: LIMIT,
        offset: newOffset,
        dateFrom: dateRange.start,
        dateTo: dateRange.end,
      }
      if (search) filters.search = search
      if (categoryId) filters.categoryId = categoryId
      if (accountId) filters.accountId = accountId

      const results = await window.api.getTransactions(filters as never)
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
      setLoading(false)
    }
  }, [dateRange, search, categoryId, accountId])

  // Refetch when filters change
  useEffect(() => {
    setOffset(0)
    fetchTransactions(0, false)
  }, [fetchTransactions])

  const handleLoadMore = () => {
    const newOffset = offset + LIMIT
    setOffset(newOffset)
    fetchTransactions(newOffset, true)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const hasActiveFilters = categoryId || accountId || search

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-border text-sm">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search transactions..."
              className="outline-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 w-48"
            />
            {searchInput && (
              <button type="button" onClick={() => { setSearchInput(''); setSearch('') }} className="text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </form>
          <button
            className={cn(
              'flex items-center gap-2 px-3 py-2 bg-white rounded-lg border text-sm font-medium text-slate-600 relative',
              hasActiveFilters ? 'border-primary' : 'border-border'
            )}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filters
            <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            {hasActiveFilters && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">
                {[categoryId, accountId, search].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Date range picker */}
      <div className="mb-4">
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Filter dropdowns */}
      {showFilters && (
        <div className="mb-4 flex items-center gap-3 p-4 bg-white rounded-xl border border-border">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-border text-sm text-slate-700 bg-white"
            >
              <option value="">All Categories</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Account</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-border text-sm text-slate-700 bg-white"
            >
              <option value="">All Accounts</option>
              {accounts?.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => { setCategoryId(''); setAccountId(''); setSearch(''); setSearchInput('') }}
              className="mt-4 text-xs font-medium text-primary hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Transaction list */}
      <TransactionList
        transactions={transactions as never[]}
        categories={categories ?? []}
        accounts={accounts ?? []}
        loading={loading && transactions.length === 0}
        onTransactionClick={(tx) => setSelectedTransaction(tx)}
      />

      {/* Load more */}
      {hasMore && !loading && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 rounded-lg border border-border text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 transition-colors"
          >
            Load more
          </button>
        </div>
      )}
      {loading && transactions.length > 0 && (
        <div className="mt-4 text-center text-sm text-slate-400">Loading...</div>
      )}

      {selectedTransaction != null && (
        <TransactionDetail
          transaction={selectedTransaction}
          categories={categories ?? []}
          accounts={accounts ?? []}
          onClose={() => setSelectedTransaction(null)}
          onUpdate={() => {
            setSelectedTransaction(null)
            fetchTransactions(0, false)
          }}
        />
      )}
    </div>
  )
}
