import { cn } from '@/lib/utils'

interface CategoryBadgeProps {
  category: {
    id: string
    name: string
    parentId?: string | null
    color?: string | null
    icon?: string | null
  }
  parentName?: string
  size?: 'sm' | 'md'
}

export function CategoryBadge({
  category,
  parentName,
  size = 'sm',
}: CategoryBadgeProps) {
  const color = category.color || '#64748b'
  const label = parentName
    ? `${parentName} > ${category.name}`
    : category.name

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      )}
      style={{
        backgroundColor: `${color}18`,
        color,
      }}
    >
      {category.icon && <span>{category.icon}</span>}
      {label}
    </span>
  )
}
