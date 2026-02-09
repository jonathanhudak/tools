import { cn } from '@/lib/utils'

interface DateRange {
  start: string // YYYY-MM-DD
  end: string   // YYYY-MM-DD
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

function toYMD(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getPresets(): { label: string; range: DateRange }[] {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()

  // This month
  const thisMonthStart = new Date(y, m, 1)
  const thisMonthEnd = new Date(y, m + 1, 0)

  // Last month
  const lastMonthStart = new Date(y, m - 1, 1)
  const lastMonthEnd = new Date(y, m, 0)

  // Last 3 months
  const last3Start = new Date(y, m - 2, 1)

  // This year
  const yearStart = new Date(y, 0, 1)
  const yearEnd = new Date(y, 11, 31)

  return [
    { label: 'This Month', range: { start: toYMD(thisMonthStart), end: toYMD(thisMonthEnd) } },
    { label: 'Last Month', range: { start: toYMD(lastMonthStart), end: toYMD(lastMonthEnd) } },
    { label: 'Last 3 Months', range: { start: toYMD(last3Start), end: toYMD(thisMonthEnd) } },
    { label: 'This Year', range: { start: toYMD(yearStart), end: toYMD(yearEnd) } },
    { label: 'All Time', range: { start: '2000-01-01', end: toYMD(now) } },
  ]
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const presets = getPresets()

  const activePreset = presets.find(
    (p) => p.range.start === value.start && p.range.end === value.end,
  )

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {presets.map((preset) => {
        const isActive = activePreset?.label === preset.label
        return (
          <button
            key={preset.label}
            onClick={() => onChange(preset.range)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              isActive
                ? 'text-white bg-primary border-primary'
                : 'bg-white text-slate-600 hover:bg-slate-50 border-border',
            )}
          >
            {preset.label}
          </button>
        )
      })}

      <div className="flex items-center gap-1.5 ml-2">
        <input
          type="date"
          value={value.start}
          onChange={(e) => onChange({ ...value, start: e.target.value })}
          className="px-2 py-1.5 rounded-lg border border-border text-xs text-slate-600 bg-white"
        />
        <span className="text-xs text-slate-400">to</span>
        <input
          type="date"
          value={value.end}
          onChange={(e) => onChange({ ...value, end: e.target.value })}
          className="px-2 py-1.5 rounded-lg border border-border text-xs text-slate-600 bg-white"
        />
      </div>
    </div>
  )
}
