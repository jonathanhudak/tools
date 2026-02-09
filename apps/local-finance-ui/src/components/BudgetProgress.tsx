import { cn } from '@/lib/utils'

interface BudgetProgressProps {
  categoryName: string
  allocated: number
  spent: number
  rollover?: number
}

function formatCurrency(value: number): string {
  return Math.abs(value).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function BudgetProgress({
  categoryName,
  allocated,
  spent,
  rollover = 0,
}: BudgetProgressProps) {
  const effectiveBudget = allocated + rollover
  const percentage = effectiveBudget > 0 ? (spent / effectiveBudget) * 100 : 0
  const remaining = effectiveBudget - spent
  const isOver = percentage > 100
  const isWarning = percentage >= 80 && percentage <= 100

  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-slate-700">
          {categoryName}
        </span>
        <span className="text-xs text-slate-500">
          {formatCurrency(spent)} / {formatCurrency(effectiveBudget)}
        </span>
      </div>

      <div className="relative h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full transition-all',
            isOver
              ? 'bg-expense'
              : isWarning
                ? 'bg-amber-500'
                : 'bg-income',
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
        {isOver && (
          <div
            className="absolute inset-y-0 right-0 rounded-r-full opacity-30 bg-expense"
            style={{
              width: `${Math.min(percentage - 100, 100)}%`,
              left: `${100 - Math.min(percentage - 100, 100)}%`,
            }}
          />
        )}
      </div>

      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2">
          {rollover > 0 && (
            <span className="text-xs text-slate-400">
              +{formatCurrency(rollover)} rollover
            </span>
          )}
        </div>
        <span
          className={cn(
            'text-xs font-medium',
            remaining >= 0 ? 'text-income' : 'text-expense',
          )}
        >
          {remaining >= 0
            ? `${formatCurrency(remaining)} left`
            : `${formatCurrency(Math.abs(remaining))} over`}
        </span>
      </div>
    </div>
  )
}
