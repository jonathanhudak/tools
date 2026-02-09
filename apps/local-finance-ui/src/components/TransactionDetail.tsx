import { useState, useEffect, useRef, useCallback } from 'react'
import {
  X,
  Calendar,
  CreditCard,
  Tag,
  FileText,
  RefreshCw,
  Pencil,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AmountDisplay } from './AmountDisplay'
import { CategoryBadge } from './CategoryBadge'
import { useToast } from './Toast'

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

interface TransactionDetailProps {
  transaction: Transaction
  categories: Category[]
  accounts: Account[]
  onClose: () => void
  onUpdate: () => void
}

function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon size={16} className="text-slate-400 mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-400 mb-1">{label}</p>
        {children}
      </div>
    </div>
  )
}

export function TransactionDetail({
  transaction,
  categories,
  accounts,
  onClose,
  onUpdate,
}: TransactionDetailProps) {
  const { toast } = useToast()
  const [editingMerchant, setEditingMerchant] = useState(false)
  const [merchantValue, setMerchantValue] = useState(
    transaction.normalizedMerchant || transaction.description,
  )
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    transaction.categoryId || '',
  )
  const merchantInputRef = useRef<HTMLInputElement>(null)
  const savingRef = useRef(false)

  const accountName =
    accounts.find((a) => a.id === transaction.accountId)?.name ||
    transaction.accountId
  const category = transaction.categoryId
    ? categories.find((c) => c.id === transaction.categoryId)
    : undefined

  // Focus merchant input when editing
  useEffect(() => {
    if (editingMerchant && merchantInputRef.current) {
      merchantInputRef.current.focus()
      merchantInputRef.current.select()
    }
  }, [editingMerchant])

  // Reset state when transaction changes
  useEffect(() => {
    setMerchantValue(
      transaction.normalizedMerchant || transaction.description,
    )
    setSelectedCategoryId(transaction.categoryId || '')
    setEditingMerchant(false)
  }, [transaction.id, transaction.normalizedMerchant, transaction.description, transaction.categoryId])

  // Close on Escape (but not while editing merchant — let merchant handler cancel first)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !editingMerchant) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, editingMerchant])

  const handleCategoryChange = async (newCategoryId: string) => {
    setSelectedCategoryId(newCategoryId)
    try {
      await window.api.updateTransactionCategory(
        transaction.id,
        newCategoryId,
      )
      toast('Category updated', 'success')
      onUpdate()
    } catch {
      toast('Failed to update category', 'error')
      setSelectedCategoryId(transaction.categoryId || '')
    }
  }

  const handleMerchantSave = useCallback(async () => {
    if (savingRef.current) return
    savingRef.current = true
    setEditingMerchant(false)
    const trimmed = merchantValue.trim()
    if (!trimmed || trimmed === (transaction.normalizedMerchant || transaction.description)) {
      setMerchantValue(transaction.normalizedMerchant || transaction.description)
      savingRef.current = false
      return
    }
    try {
      await window.api.updateTransactionMerchant(transaction.id, trimmed)
      toast('Merchant updated', 'success')
      onUpdate()
    } catch {
      toast('Failed to update merchant', 'error')
      setMerchantValue(transaction.normalizedMerchant || transaction.description)
    } finally {
      savingRef.current = false
    }
  }, [merchantValue, transaction.id, transaction.normalizedMerchant, transaction.description, onUpdate, toast])

  const handleMerchantKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleMerchantSave()
    } else if (e.key === 'Escape') {
      setMerchantValue(transaction.normalizedMerchant || transaction.description)
      setEditingMerchant(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-[420px] max-w-full h-full bg-white shadow-xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-slate-900">
            Transaction Details
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Amount */}
          <div className="text-center py-4 mb-4 border-b border-border">
            <AmountDisplay
              amount={transaction.amount}
              size="xl"
              showSign
            />
          </div>

          {/* Merchant / Description */}
          <DetailRow icon={FileText} label="Merchant">
            {editingMerchant ? (
              <div className="flex items-center gap-2">
                <input
                  ref={merchantInputRef}
                  type="text"
                  value={merchantValue}
                  onChange={(e) => setMerchantValue(e.target.value)}
                  onBlur={handleMerchantSave}
                  onKeyDown={handleMerchantKeyDown}
                  className="flex-1 px-2 py-1 text-sm border border-border rounded-md bg-white text-slate-900 outline-none focus:border-primary"
                />
                <button
                  onClick={handleMerchantSave}
                  className="p-1 text-primary hover:bg-slate-100 rounded"
                >
                  <Check size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <p className="text-sm text-slate-900">
                  {transaction.normalizedMerchant || transaction.description}
                </p>
                <button
                  onClick={() => setEditingMerchant(true)}
                  className="p-1 text-slate-300 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity rounded"
                >
                  <Pencil size={12} />
                </button>
              </div>
            )}
            {transaction.normalizedMerchant &&
              transaction.normalizedMerchant !== transaction.description && (
                <p className="text-xs text-slate-400 mt-1">
                  {transaction.description}
                </p>
              )}
          </DetailRow>

          {/* Date */}
          <DetailRow icon={Calendar} label="Date">
            <p className="text-sm text-slate-900">
              {formatDate(transaction.date)}
            </p>
          </DetailRow>

          {/* Account */}
          <DetailRow icon={CreditCard} label="Account">
            <p className="text-sm text-slate-900">{accountName}</p>
          </DetailRow>

          {/* Category */}
          <DetailRow icon={Tag} label="Category">
            <div className="space-y-2">
              {category && (
                <CategoryBadge category={category} size="sm" />
              )}
              <select
                value={selectedCategoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className={cn(
                  'block w-full px-2 py-1.5 text-sm border border-border rounded-md bg-white text-slate-700 outline-none focus:border-primary',
                  !selectedCategoryId && 'text-slate-400',
                )}
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {transaction.categorySource && (
                <p className="text-xs text-slate-400">
                  Source: {transaction.categorySource}
                  {transaction.categoryConfidence != null &&
                    ` (${Math.round(transaction.categoryConfidence * 100)}%)`}
                </p>
              )}
            </div>
          </DetailRow>

          {/* Recurring */}
          {transaction.isRecurring && (
            <DetailRow icon={RefreshCw} label="Recurring">
              <p className="text-sm text-slate-900">
                This is a recurring payment
              </p>
            </DetailRow>
          )}

          {/* Notes */}
          {transaction.notes && (
            <DetailRow icon={FileText} label="Notes">
              <p className="text-sm text-slate-700">{transaction.notes}</p>
            </DetailRow>
          )}
        </div>
      </div>
    </div>
  )
}
