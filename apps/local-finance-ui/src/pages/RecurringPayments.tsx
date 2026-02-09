import { useMemo } from 'react'
import {
  RefreshCw,
  Repeat,
  DollarSign,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIPC } from '@/hooks/useIPC'
import { CategoryBadge } from '@/components'

interface RecurringPayment {
  id: string
  merchant: string
  normalizedMerchant: string | null
  categoryId: string | null
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual'
  expectedAmount: number | null
  amountVariance: number | null
  isActive: boolean
  lastSeen: string | null
  nextExpected: string | null
  notes: string | null
  status: string
  createdAt: string
  updatedAt: string | null
}

interface Category {
  id: string
  name: string
  parentId: string | null
  color: string | null
  icon: string | null
}

const frequencyLabels: Record<string, string> = {
  weekly: 'Weekly',
  biweekly: 'Biweekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annual: 'Annual',
}

const frequencyMultiplier: Record<string, number> = {
  weekly: 52 / 12,
  biweekly: 26 / 12,
  monthly: 1,
  quarterly: 1 / 3,
  annual: 1 / 12,
}

function formatCurrency(value: number): string {
  return Math.abs(value).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '--'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-5 w-10 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-emerald-500' : 'bg-slate-300',
      )}
    >
      <span
        className={cn(
          'inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-1',
        )}
      />
    </button>
  )
}

export default function RecurringPayments() {
  const { data: payments, loading, refetch } = useIPC<RecurringPayment[]>('getRecurringPayments')
  const { data: categories } = useIPC<Category[]>('getCategories')

  const catMap = useMemo(() => {
    if (!categories) return new Map<string, Category>()
    return new Map(categories.map((c) => [c.id, c]))
  }, [categories])

  const active = useMemo(() => (payments ?? []).filter((p) => p.isActive), [payments])
  const inactive = useMemo(() => (payments ?? []).filter((p) => !p.isActive), [payments])

  const monthlyCost = useMemo(() => {
    return active.reduce((sum, p) => {
      if (!p.expectedAmount) return sum
      const mult = frequencyMultiplier[p.frequency] ?? 1
      return sum + Math.abs(p.expectedAmount) * mult
    }, 0)
  }, [active])

  async function handleToggle(id: string, currentlyActive: boolean) {
    try {
      await window.api.updateRecurringStatus(id, !currentlyActive)
      refetch()
    } catch {
      // toggle failed silently — data unchanged
    }
  }

  function renderRow(payment: RecurringPayment) {
    const cat = payment.categoryId ? catMap.get(payment.categoryId) : null
    return (
      <div
        key={payment.id}
        className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors"
      >
        {/* Merchant */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">
            {payment.normalizedMerchant || payment.merchant}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-400">
              {frequencyLabels[payment.frequency] || payment.frequency}
            </span>
            {cat && <CategoryBadge category={cat} size="sm" />}
          </div>
        </div>

        {/* Expected amount */}
        <div className="text-right shrink-0 w-24">
          {payment.expectedAmount != null ? (
            <span className="text-sm font-semibold text-slate-900 tabular-nums">
              {formatCurrency(payment.expectedAmount)}
            </span>
          ) : (
            <span className="text-xs text-slate-400">--</span>
          )}
        </div>

        {/* Last seen */}
        <div className="text-right shrink-0 w-28 hidden sm:block">
          <span className="text-xs text-slate-400">{formatDate(payment.lastSeen)}</span>
        </div>

        {/* Next expected */}
        <div className="text-right shrink-0 w-28 hidden md:block">
          <span className="text-xs text-slate-400">{formatDate(payment.nextExpected)}</span>
        </div>

        {/* Toggle */}
        <div className="shrink-0">
          <ToggleSwitch
            checked={payment.isActive}
            onChange={() => handleToggle(payment.id, payment.isActive)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Recurring Payments</h1>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Active Subscriptions"
          value={loading ? '--' : String(active.length)}
          icon={Repeat}
          color="#10b981"
          loading={loading}
        />
        <StatCard
          label="Est. Monthly Cost"
          value={loading ? '--' : formatCurrency(monthlyCost)}
          icon={DollarSign}
          color="#3b82f6"
          loading={loading}
        />
        <StatCard
          label="Inactive"
          value={loading ? '--' : String(inactive.length)}
          icon={XCircle}
          color="#94a3b8"
          loading={loading}
        />
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="rounded-xl bg-white shadow-sm border border-border divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 animate-pulse">
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-40 mb-1" />
                <div className="h-3 bg-slate-200 rounded w-24" />
              </div>
              <div className="h-4 bg-slate-200 rounded w-16" />
              <div className="h-5 bg-slate-200 rounded-full w-10" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && (!payments || payments.length === 0) && (
        <div className="rounded-xl bg-white shadow-sm border border-border p-12 text-center">
          <RefreshCw size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-400">
            No recurring payments detected yet.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Import more transactions to help detect recurring patterns.
          </p>
        </div>
      )}

      {/* Active section */}
      {!loading && active.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Active ({active.length})
          </h2>
          <div className="rounded-xl bg-white shadow-sm border border-border divide-y divide-border">
            {/* Header row */}
            <div className="flex items-center gap-4 px-5 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
              <div className="flex-1">Merchant</div>
              <div className="text-right w-24">Amount</div>
              <div className="text-right w-28 hidden sm:block">Last Seen</div>
              <div className="text-right w-28 hidden md:block">Next Expected</div>
              <div className="w-10">Status</div>
            </div>
            {active.map(renderRow)}
          </div>
        </div>
      )}

      {/* Inactive section */}
      {!loading && inactive.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Inactive ({inactive.length})
          </h2>
          <div className="rounded-xl bg-white shadow-sm border border-border divide-y divide-border">
            {inactive.map(renderRow)}
          </div>
        </div>
      )}
    </div>
  )
}
