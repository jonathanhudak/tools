import { cn } from '@/lib/utils'

interface AmountDisplayProps {
  amount: number
  showSign?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses: Record<string, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-3xl',
}

function formatCurrency(value: number): string {
  return Math.abs(value).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}

export function AmountDisplay({
  amount,
  showSign = false,
  size = 'md',
  className,
}: AmountDisplayProps) {
  const isPositive = amount >= 0
  const sign = showSign ? (isPositive ? '+' : '-') : ''
  const formatted = formatCurrency(amount)

  return (
    <span
      className={cn(
        'font-semibold tabular-nums',
        sizeClasses[size],
        isPositive ? 'text-income' : 'text-expense',
        className,
      )}
    >
      {sign}{formatted}
    </span>
  )
}
