import { cn } from '@/lib/utils'
import { CategoryBadge } from './CategoryBadge'
import { AmountDisplay } from './AmountDisplay'

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

interface TransactionListProps {
  transactions: Transaction[]
  categories?: Category[]
  accounts?: { id: string; name: string }[]
  onTransactionClick?: (transaction: Transaction) => void
  loading?: boolean
}

function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function SkeletonRow() {
  return (
    <div className="flex items-center px-5 py-3.5 border-b border-border animate-pulse">
      <div className="w-28"><div className="h-4 bg-slate-200 rounded w-20" /></div>
      <div className="flex-1"><div className="h-4 bg-slate-200 rounded w-48" /></div>
      <div className="w-36"><div className="h-5 bg-slate-200 rounded-full w-20" /></div>
      <div className="w-28"><div className="h-4 bg-slate-200 rounded w-16" /></div>
      <div className="w-28 flex justify-end"><div className="h-4 bg-slate-200 rounded w-20" /></div>
    </div>
  )
}

function MobileCard({
  transaction,
  category,
  accountName,
  onClick,
}: {
  transaction: Transaction
  category?: Category
  accountName?: string
  onClick?: () => void
}) {
  return (
    <div
      className={cn(
        'px-4 py-3 border-b border-border',
        onClick && 'cursor-pointer active:bg-slate-50',
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900 truncate">
            {transaction.normalizedMerchant || transaction.description}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400">
              {formatDate(transaction.date)}
            </span>
            {accountName && (
              <span className="text-xs text-slate-400">
                {accountName}
              </span>
            )}
          </div>
          {category && (
            <div className="mt-1.5">
              <CategoryBadge category={category} size="sm" />
            </div>
          )}
        </div>
        <AmountDisplay amount={transaction.amount} size="sm" showSign />
      </div>
    </div>
  )
}

export function TransactionList({
  transactions,
  categories = [],
  accounts = [],
  onTransactionClick,
  loading = false,
}: TransactionListProps) {
  const categoryMap = new Map(categories.map((c) => [c.id, c]))
  const accountMap = new Map(accounts.map((a) => [a.id, a.name]))

  if (loading) {
    return (
      <div className="rounded-xl bg-white shadow-sm border border-border">
        <div
          className="hidden md:flex items-center px-5 py-3 border-b border-border text-xs font-medium text-slate-500 uppercase tracking-wider"
        >
          <span className="w-28">Date</span>
          <span className="flex-1">Description</span>
          <span className="w-36">Category</span>
          <span className="w-28">Account</span>
          <span className="w-28 text-right">Amount</span>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl bg-white shadow-sm border border-border">
        <div className="text-sm text-slate-400 py-16 text-center">
          No transactions found
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white shadow-sm border border-border">
      {/* Desktop table header */}
      <div
        className="hidden md:flex items-center px-5 py-3 border-b border-border text-xs font-medium text-slate-500 uppercase tracking-wider"
      >
        <span className="w-28">Date</span>
        <span className="flex-1">Description</span>
        <span className="w-36">Category</span>
        <span className="w-28">Account</span>
        <span className="w-28 text-right">Amount</span>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden">
        {transactions.map((tx) => (
          <MobileCard
            key={tx.id}
            transaction={tx}
            category={tx.categoryId ? categoryMap.get(tx.categoryId) : undefined}
            accountName={accountMap.get(tx.accountId)}
            onClick={onTransactionClick ? () => onTransactionClick(tx) : undefined}
          />
        ))}
      </div>

      {/* Desktop rows */}
      <div className="hidden md:block">
        {transactions.map((tx) => {
          const category = tx.categoryId ? categoryMap.get(tx.categoryId) : undefined
          const accountName = accountMap.get(tx.accountId)

          return (
            <div
              key={tx.id}
              className={cn(
                'flex items-center px-5 py-3 border-b border-border text-sm transition-colors',
                onTransactionClick && 'cursor-pointer hover:bg-slate-50',
              )}
              onClick={onTransactionClick ? () => onTransactionClick(tx) : undefined}
            >
              <span className="w-28 text-slate-500 text-xs">
                {formatDate(tx.date)}
              </span>
              <span className="flex-1 text-slate-900 truncate pr-4">
                {tx.normalizedMerchant || tx.description}
              </span>
              <span className="w-36">
                {category ? (
                  <CategoryBadge category={category} size="sm" />
                ) : (
                  <span className="text-xs text-slate-300">Uncategorized</span>
                )}
              </span>
              <span className="w-28 text-xs text-slate-500 truncate">
                {accountName || tx.accountId}
              </span>
              <span className="w-28 text-right">
                <AmountDisplay amount={tx.amount} size="sm" showSign />
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
