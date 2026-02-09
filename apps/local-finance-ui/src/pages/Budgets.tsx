import { useState, useEffect, useCallback } from 'react'
import {
  PlusCircle,
  Trash2,
  X,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Wallet,
  Calendar,
  TrendingDown,
  DollarSign,
} from 'lucide-react'
import { useIPC } from '@/hooks/useIPC'
import { BudgetProgress } from '@/components'
import { cn } from '@/lib/utils'

// ---- Types ----

interface Budget {
  id: string
  name: string
  periodType: 'monthly' | 'weekly' | 'yearly'
  startDate: string
  createdAt: string
}

interface BudgetAllocation {
  id: string
  budgetId: string
  categoryId: string
  amount: number
  rollover: boolean
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

interface BudgetStatus {
  budgetId: string
  budgetName: string
  periodType: string
  currentPeriod: { start: string; end: string } | null
  totalAllocated: number
  totalSpent: number
  totalRemaining: number
  percentUsed: number
  overBudgetCategories: { categoryId: string; categoryName: string; overBy: number }[]
  warningCategories: { categoryId: string; categoryName: string; percentUsed: number }[]
  daysRemainingInPeriod: number
  dailyBudgetRemaining: number
}

interface AllocationSuggestion {
  categoryId: string
  categoryName: string
  suggestedAmount: number
  basedOn: string
  historicalAvg: number
}

interface Category {
  id: string
  name: string
  parentId: string | null
  color: string | null
  icon: string | null
  isIncome: boolean
  isSystem: boolean
  sortOrder: number
}

// ---- Helpers ----

function formatCurrency(value: number | undefined | null): string {
  if (value == null) return '$0'
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

const periodLabels: Record<string, string> = {
  monthly: 'Monthly',
  weekly: 'Weekly',
  yearly: 'Yearly',
}

// ---- Component ----

export default function Budgets() {
  const { data: budgets, loading: budgetsLoading, refetch: refetchBudgets } = useIPC<Budget[]>('getBudgets')
  const { data: categories } = useIPC<Category[]>('getCategories')

  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Create form state
  const [newName, setNewName] = useState('')
  const [newPeriod, setNewPeriod] = useState<'monthly' | 'weekly' | 'yearly'>('monthly')
  const [creating, setCreating] = useState(false)

  // Budget detail state
  const [status, setStatus] = useState<BudgetStatus | null>(null)
  const [actuals, setActuals] = useState<BudgetActualItem[]>([])
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([])
  const [detailLoading, setDetailLoading] = useState(false)

  // Add allocation form
  const [allocCategoryId, setAllocCategoryId] = useState('')
  const [allocAmount, setAllocAmount] = useState('')
  const [allocRollover, setAllocRollover] = useState(false)
  const [allocSaving, setAllocSaving] = useState(false)

  // Suggestions
  const [suggestions, setSuggestions] = useState<AllocationSuggestion[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Auto-select first budget
  useEffect(() => {
    if (budgets && budgets.length > 0 && !selectedBudgetId) {
      setSelectedBudgetId(budgets[0].id)
    }
    if (budgets && budgets.length === 0) {
      setSelectedBudgetId(null)
    }
  }, [budgets, selectedBudgetId])

  // Fetch detail data when selected budget changes
  const fetchDetail = useCallback(async (budgetId: string) => {
    setDetailLoading(true)
    try {
      const [statusRes, allocRes] = await Promise.all([
        window.api.getBudgetStatus(budgetId),
        window.api.getAllocations(budgetId),
      ])
      setStatus(statusRes)
      setAllocations(allocRes)

      if (statusRes.currentPeriod) {
        const actualsRes = await window.api.getBudgetVsActual(
          budgetId,
          statusRes.currentPeriod.start,
          statusRes.currentPeriod.end
        )
        setActuals(actualsRes)
      } else {
        setActuals([])
      }
    } catch {
      setStatus(null)
      setActuals([])
      setAllocations([])
    } finally {
      setDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedBudgetId) {
      fetchDetail(selectedBudgetId)
    }
  }, [selectedBudgetId, fetchDetail])

  // ---- Handlers ----

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const created = await window.api.createBudget(newName.trim(), newPeriod)
      await refetchBudgets()
      setSelectedBudgetId(created.id)
      setShowCreateForm(false)
      setNewName('')
      setNewPeriod('monthly')
    } catch {
      // silently fail
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedBudgetId) return
    try {
      await window.api.deleteBudget(selectedBudgetId)
      setSelectedBudgetId(null)
      setShowDeleteConfirm(false)
      await refetchBudgets()
    } catch {
      // silently fail
    }
  }

  const handleAddAllocation = async () => {
    if (!selectedBudgetId || !allocCategoryId || !allocAmount) return
    setAllocSaving(true)
    try {
      await window.api.setAllocation(selectedBudgetId, allocCategoryId, parseFloat(allocAmount), allocRollover)
      setAllocCategoryId('')
      setAllocAmount('')
      setAllocRollover(false)
      await fetchDetail(selectedBudgetId)
    } catch {
      // silently fail
    } finally {
      setAllocSaving(false)
    }
  }

  const handleRemoveAllocation = async (categoryId: string) => {
    if (!selectedBudgetId) return
    try {
      await window.api.removeAllocation(selectedBudgetId, categoryId)
      await fetchDetail(selectedBudgetId)
    } catch {
      // silently fail
    }
  }

  const handleAutoSuggest = async () => {
    setSuggestionsLoading(true)
    try {
      const result = await window.api.getBudgetSuggestions(3)
      setSuggestions(result)
    } catch {
      setSuggestions([])
    } finally {
      setSuggestionsLoading(false)
    }
  }

  const handleApplySuggestion = async (suggestion: AllocationSuggestion) => {
    if (!selectedBudgetId) return
    try {
      await window.api.setAllocation(selectedBudgetId, suggestion.categoryId, Math.round(suggestion.suggestedAmount), false)
      setSuggestions((prev) => prev.filter((s) => s.categoryId !== suggestion.categoryId))
      await fetchDetail(selectedBudgetId)
    } catch {
      // silently fail
    }
  }

  // ---- Derived ----

  const allocatedCategoryIds = new Set(allocations.map((a) => a.categoryId))
  const availableCategories = (categories ?? []).filter(
    (c) => !c.isIncome && !c.isSystem && !allocatedCategoryIds.has(c.id)
  )

  const selectedBudget = budgets?.find((b) => b.id === selectedBudgetId)

  // ---- Loading ----

  if (budgetsLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Budgets</h1>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl bg-white p-6 shadow-sm border border-border animate-pulse"
            >
              <div className="h-5 bg-slate-200 rounded w-48 mb-4" />
              <div className="h-3 bg-slate-200 rounded w-32 mb-2" />
              <div className="h-3 bg-slate-200 rounded w-64" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ---- Empty state ----

  if (!budgets || budgets.length === 0) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Budgets</h1>
        </div>

        {showCreateForm ? (
          <CreateBudgetForm
            name={newName}
            onNameChange={setNewName}
            period={newPeriod}
            onPeriodChange={setNewPeriod}
            onCreate={handleCreate}
            onCancel={() => { setShowCreateForm(false); setNewName(''); setNewPeriod('monthly') }}
            creating={creating}
          />
        ) : (
          <div
            className="rounded-xl bg-white shadow-sm border border-border p-16 text-center"
          >
            <Wallet size={40} className="mx-auto mb-4 text-slate-300" />
            <p className="text-sm text-slate-500 mb-1">No budgets configured yet.</p>
            <p className="text-xs text-slate-400 mb-6">
              Create a budget to start tracking your spending by category.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-primary transition-opacity hover:opacity-90"
            >
              <PlusCircle size={16} />
              Create Your First Budget
            </button>
          </div>
        )}
      </div>
    )
  }

  // ---- Main render ----

  return (
    <div className="p-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Budgets</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary transition-opacity hover:opacity-90"
        >
          <PlusCircle size={16} />
          New Budget
        </button>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="mb-6">
          <CreateBudgetForm
            name={newName}
            onNameChange={setNewName}
            period={newPeriod}
            onPeriodChange={setNewPeriod}
            onCreate={handleCreate}
            onCancel={() => { setShowCreateForm(false); setNewName(''); setNewPeriod('monthly') }}
            creating={creating}
          />
        </div>
      )}

      {/* Budget tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {budgets.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedBudgetId(b.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border whitespace-nowrap transition-colors',
              b.id === selectedBudgetId
                ? 'bg-white shadow-sm text-slate-900 border-primary'
                : 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-white/50 border-border'
            )}
          >
            {b.name}
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                b.id === selectedBudgetId
                  ? 'bg-primary text-white'
                  : 'bg-slate-200 text-slate-500'
              )}
            >
              {periodLabels[b.periodType]}
            </span>
          </button>
        ))}
      </div>

      {/* Selected budget detail */}
      {selectedBudget && (
        <BudgetDetail
          budget={selectedBudget}
          status={status}
          actuals={actuals}
          allocations={allocations}
          categories={categories ?? []}
          availableCategories={availableCategories}
          loading={detailLoading}
          allocCategoryId={allocCategoryId}
          allocAmount={allocAmount}
          allocRollover={allocRollover}
          allocSaving={allocSaving}
          suggestions={suggestions}
          suggestionsLoading={suggestionsLoading}
          showDeleteConfirm={showDeleteConfirm}
          onAllocCategoryChange={setAllocCategoryId}
          onAllocAmountChange={setAllocAmount}
          onAllocRolloverChange={setAllocRollover}
          onAddAllocation={handleAddAllocation}
          onRemoveAllocation={handleRemoveAllocation}
          onAutoSuggest={handleAutoSuggest}
          onApplySuggestion={handleApplySuggestion}
          onDeleteClick={() => setShowDeleteConfirm(true)}
          onDeleteConfirm={handleDelete}
          onDeleteCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}

// ---- Sub-components ----

function CreateBudgetForm({
  name,
  onNameChange,
  period,
  onPeriodChange,
  onCreate,
  onCancel,
  creating,
}: {
  name: string
  onNameChange: (v: string) => void
  period: 'monthly' | 'weekly' | 'yearly'
  onPeriodChange: (v: 'monthly' | 'weekly' | 'yearly') => void
  onCreate: () => void
  onCancel: () => void
  creating: boolean
}) {
  return (
    <div
      className="rounded-xl bg-white shadow-sm border border-border p-5"
    >
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Create New Budget</h3>
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-500">Budget Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Main Budget"
            className="px-3 py-2 rounded-lg border border-border text-sm text-slate-700 bg-white outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 w-56"
            onKeyDown={(e) => e.key === 'Enter' && onCreate()}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-500">Period</label>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(['monthly', 'weekly', 'yearly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={cn(
                  'px-3 py-2 text-sm font-medium transition-colors',
                  p === period ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCreate}
            disabled={!name.trim() || creating}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 border border-border transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function BudgetDetail({
  budget,
  status,
  actuals,
  allocations,
  categories,
  availableCategories,
  loading,
  allocCategoryId,
  allocAmount,
  allocRollover,
  allocSaving,
  suggestions,
  suggestionsLoading,
  showDeleteConfirm,
  onAllocCategoryChange,
  onAllocAmountChange,
  onAllocRolloverChange,
  onAddAllocation,
  onRemoveAllocation,
  onAutoSuggest,
  onApplySuggestion,
  onDeleteClick,
  onDeleteConfirm,
  onDeleteCancel,
}: {
  budget: Budget
  status: BudgetStatus | null
  actuals: BudgetActualItem[]
  allocations: BudgetAllocation[]
  categories: Category[]
  availableCategories: Category[]
  loading: boolean
  allocCategoryId: string
  allocAmount: string
  allocRollover: boolean
  allocSaving: boolean
  suggestions: AllocationSuggestion[]
  suggestionsLoading: boolean
  showDeleteConfirm: boolean
  onAllocCategoryChange: (v: string) => void
  onAllocAmountChange: (v: string) => void
  onAllocRolloverChange: (v: boolean) => void
  onAddAllocation: () => void
  onRemoveAllocation: (categoryId: string) => void
  onAutoSuggest: () => void
  onApplySuggestion: (s: AllocationSuggestion) => void
  onDeleteClick: () => void
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl bg-white p-6 shadow-sm border border-border animate-pulse"
          >
            <div className="h-4 bg-slate-200 rounded w-48 mb-3" />
            <div className="h-3 bg-slate-200 rounded w-80 mb-2" />
            <div className="h-3 bg-slate-200 rounded w-64" />
          </div>
        ))}
      </div>
    )
  }

  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      {status && (
        <div
          className="rounded-xl bg-white shadow-sm border border-border p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{status.budgetName}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium bg-primary text-white"
                >
                  {periodLabels[status.periodType] ?? status.periodType}
                </span>
                {status.currentPeriod && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(status.currentPeriod.start)} - {formatDate(status.currentPeriod.end)}
                  </span>
                )}
              </div>
            </div>
            {/* Percentage ring */}
            <div className="text-right">
              <span
                className={cn(
                  'text-2xl font-bold',
                  status.percentUsed > 100 ? 'text-expense' : status.percentUsed >= 80 ? 'text-amber-500' : 'text-income'
                )}
              >
                {Math.round(status.percentUsed)}%
              </span>
              <p className="text-xs text-slate-400">used</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox icon={<DollarSign size={14} />} label="Allocated" value={formatCurrency(status.totalAllocated)} />
            <StatBox
              icon={<TrendingDown size={14} />}
              label="Spent"
              value={formatCurrency(status.totalSpent)}
              colorClass="text-expense"
            />
            <StatBox
              icon={<Wallet size={14} />}
              label="Remaining"
              value={formatCurrency(status.totalRemaining)}
              colorClass={status.totalRemaining >= 0 ? 'text-income' : 'text-expense'}
            />
            <StatBox
              icon={<Calendar size={14} />}
              label={`${status.daysRemainingInPeriod}d left`}
              value={status.dailyBudgetRemaining > 0 ? `${formatCurrency(status.dailyBudgetRemaining)}/day` : '--'}
            />
          </div>
        </div>
      )}

      {/* Alert Banners */}
      {status && status.overBudgetCategories.length > 0 && (
        <div
          className="rounded-lg px-4 py-3 flex items-start gap-3 border bg-red-50 border-red-200"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-expense" />
          <div>
            <p className="text-sm font-medium text-expense">Over Budget</p>
            <p className="text-xs text-slate-600 mt-0.5">
              {status.overBudgetCategories.map((c) => `${c.categoryName} (+${formatCurrency(c.overBy)})`).join(', ')}
            </p>
          </div>
        </div>
      )}

      {status && status.warningCategories.length > 0 && (
        <div
          className="rounded-lg px-4 py-3 flex items-start gap-3 border bg-amber-50 border-amber-200"
        >
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-medium text-amber-700">Approaching Limit</p>
            <p className="text-xs text-slate-600 mt-0.5">
              {status.warningCategories.map((c) => `${c.categoryName} (${Math.round(c.percentUsed)}%)`).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Category Allocations */}
      {actuals.length > 0 && (
        <div
          className="rounded-xl bg-white shadow-sm border border-border p-6"
        >
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Spending by Category</h3>
          <div className="divide-y divide-border">
            {actuals.map((item) => (
              <BudgetProgress
                key={item.categoryId}
                categoryName={item.categoryName}
                allocated={item.allocated}
                spent={item.spent}
                rollover={item.rolloverAmount}
              />
            ))}
          </div>
        </div>
      )}

      {/* Allocation Manager */}
      <div
        className="rounded-xl bg-white shadow-sm border border-border p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700">Manage Allocations</h3>
          <button
            onClick={onAutoSuggest}
            disabled={suggestionsLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-primary transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <Sparkles size={13} />
            {suggestionsLoading ? 'Loading...' : 'Auto-suggest'}
          </button>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-5 rounded-lg p-4 space-y-2 bg-sky-50">
            <p className="text-xs font-medium text-slate-600 mb-2">Suggested allocations based on spending history:</p>
            {suggestions.map((s) => (
              <div key={s.categoryId} className="flex items-center justify-between py-1.5">
                <div>
                  <span className="text-sm font-medium text-slate-700">{s.categoryName}</span>
                  <span className="text-xs text-slate-400 ml-2">
                    avg {formatCurrency(s.historicalAvg)} ({s.basedOn})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-primary">
                    {formatCurrency(s.suggestedAmount)}
                  </span>
                  <button
                    onClick={() => onApplySuggestion(s)}
                    className="px-2 py-1 rounded text-xs font-medium text-white bg-primary transition-opacity hover:opacity-90"
                  >
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add allocation form */}
        {availableCategories.length > 0 && (
          <div className="flex flex-wrap items-end gap-3 mb-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500">Category</label>
              <select
                value={allocCategoryId}
                onChange={(e) => onAllocCategoryChange(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border text-sm text-slate-700 bg-white"
              >
                <option value="">Select category...</option>
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500">Amount</label>
              <input
                type="number"
                value={allocAmount}
                onChange={(e) => onAllocAmountChange(e.target.value)}
                placeholder="0"
                min={0}
                className="px-3 py-2 rounded-lg border border-border text-sm text-slate-700 bg-white outline-none w-28"
                onKeyDown={(e) => e.key === 'Enter' && onAddAllocation()}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-500">Rollover</label>
              <button
                type="button"
                onClick={() => onAllocRolloverChange(!allocRollover)}
                className="flex items-center gap-1.5 py-2 text-sm text-slate-600"
              >
                {allocRollover
                  ? <ToggleRight size={22} className="text-primary" />
                  : <ToggleLeft size={22} className="text-slate-400" />
                }
                <span className="text-xs">{allocRollover ? 'On' : 'Off'}</span>
              </button>
            </div>
            <button
              onClick={onAddAllocation}
              disabled={!allocCategoryId || !allocAmount || allocSaving}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {allocSaving ? 'Adding...' : 'Add'}
            </button>
          </div>
        )}

        {availableCategories.length === 0 && allocations.length > 0 && (
          <p className="text-xs text-slate-400 mb-4">All expense categories have been allocated.</p>
        )}

        {/* Existing allocations list */}
        {allocations.length > 0 ? (
          <div className="divide-y divide-border">
            {allocations.map((alloc) => {
              const cat = categoryMap.get(alloc.categoryId)
              return (
                <div key={alloc.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    {cat?.color && (
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                    )}
                    <span className="text-sm text-slate-700">{cat?.name ?? alloc.categoryId}</span>
                    {alloc.rollover && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
                        rollover
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700">{formatCurrency(alloc.amount)}</span>
                    <button
                      onClick={() => onRemoveAllocation(alloc.categoryId)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">No allocations yet. Add one above or use auto-suggest.</p>
        )}
      </div>

      {/* Delete budget */}
      <div className="flex justify-end">
        {showDeleteConfirm ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">Delete "{budget.name}"?</span>
            <button
              onClick={onDeleteConfirm}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-expense transition-opacity hover:opacity-90"
            >
              Yes, Delete
            </button>
            <button
              onClick={onDeleteCancel}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 border border-border transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={onDeleteClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={13} />
            Delete Budget
          </button>
        )}
      </div>
    </div>
  )
}

function StatBox({
  icon,
  label,
  value,
  colorClass,
}: {
  icon: React.ReactNode
  label: string
  value: string
  colorClass?: string
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-slate-400">{icon}</span>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <span className={cn('text-sm font-semibold', colorClass)}>
        {value}
      </span>
    </div>
  )
}
