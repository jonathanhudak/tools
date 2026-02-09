import { Landmark, PiggyBank, CreditCard, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AmountDisplay } from './AmountDisplay'

interface AccountCardProps {
  account: {
    id: string
    name: string
    institution: string
    type: 'checking' | 'savings' | 'credit' | 'brokerage'
  }
  balance?: number
  onClick?: () => void
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

export function AccountCard({ account, balance, onClick }: AccountCardProps) {
  const config = typeConfig[account.type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'rounded-xl bg-white p-5 shadow-sm border border-border transition-colors',
        onClick && 'cursor-pointer hover:shadow-md',
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick()
            }
          : undefined
      }
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg"
          style={{ backgroundColor: `${config.color}15`, color: config.color }}
        >
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {account.name}
          </p>
          <p className="text-xs text-slate-400 truncate">
            {account.institution}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${config.color}15`,
            color: config.color,
          }}
        >
          {config.label}
        </span>
        {balance !== undefined && (
          <AmountDisplay amount={balance} size="lg" />
        )}
      </div>
    </div>
  )
}
