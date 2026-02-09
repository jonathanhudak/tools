import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { useIPC } from '@/hooks/useIPC'
import { CategoryBadge, useToast } from '@/components'
import { cn } from '@/lib/utils'

interface CategorizationRule {
  id: string
  pattern: string
  matchType: 'contains' | 'regex' | 'exact'
  categoryId: string
  priority: number
  isActive: boolean
  createdAt: string
}

interface Category {
  id: string
  name: string
  parentId: string | null
  color: string | null
  icon: string | null
}

const MATCH_TYPE_LABELS: Record<string, string> = {
  contains: 'Contains',
  exact: 'Exact',
  regex: 'Regex',
}

export default function Rules() {
  const { data: rules, loading, refetch } = useIPC<CategorizationRule[]>('getRules')
  const { data: categories } = useIPC<Category[]>('getCategories')
  const { toast } = useToast()

  const [pattern, setPattern] = useState('')
  const [matchType, setMatchType] = useState<string>('contains')
  const [categoryId, setCategoryId] = useState('')
  const [priority, setPriority] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const categoryMap = new Map((categories ?? []).map(c => [c.id, c]))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pattern.trim() || !categoryId) return

    setSubmitting(true)
    try {
      await window.api.createRule(pattern.trim(), matchType, categoryId, priority)
      toast('Rule created', 'success')
      setPattern('')
      setMatchType('contains')
      setCategoryId('')
      setPriority(0)
      refetch()
    } catch {
      toast('Failed to create rule', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this categorization rule?')) return
    try {
      await window.api.deleteRule(id)
      toast('Rule deleted', 'success')
      refetch()
    } catch {
      toast('Failed to delete rule', 'error')
    }
  }

  const handleToggle = async (id: string, currentlyActive: boolean) => {
    try {
      await window.api.toggleRule(id, !currentlyActive)
      refetch()
    } catch {
      toast('Failed to update rule', 'error')
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Categorization Rules</h1>

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="bg-white rounded-xl border border-border p-5 mb-6"
      >
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Create Rule</h2>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
            <label className="text-xs font-medium text-slate-500">Pattern</label>
            <input
              type="text"
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              placeholder="e.g. AMAZON or Netflix"
              className="px-3 py-2 rounded-lg border border-border text-sm text-slate-700 bg-white"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Match Type</label>
            <select
              value={matchType}
              onChange={e => setMatchType(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border text-sm text-slate-700 bg-white"
            >
              <option value="contains">Contains</option>
              <option value="exact">Exact</option>
              <option value="regex">Regex</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-xs font-medium text-slate-500">Category</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border text-sm text-slate-700 bg-white"
              required
            >
              <option value="">Select category...</option>
              {categories?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 w-24">
            <label className="text-xs font-medium text-slate-500">Priority</label>
            <input
              type="number"
              value={priority}
              onChange={e => setPriority(Number(e.target.value))}
              className="px-3 py-2 rounded-lg border border-border text-sm text-slate-700 bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !pattern.trim() || !categoryId}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
              submitting || !pattern.trim() || !categoryId
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90'
            )}
          >
            <Plus size={16} />
            Create Rule
          </button>
        </div>
      </form>

      {/* Rules table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading rules...</div>
        ) : !rules || rules.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No categorization rules yet. Create one to auto-categorize transactions.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-slate-500">Pattern</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Match Type</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Category</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Priority</th>
                <th className="text-center px-4 py-3 font-medium text-slate-500">Active</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(rule => {
                const cat = categoryMap.get(rule.categoryId)
                return (
                  <tr key={rule.id} className="border-b border-border last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-800">{rule.pattern}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-xs font-medium">
                        {MATCH_TYPE_LABELS[rule.matchType] || rule.matchType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {cat ? <CategoryBadge category={cat} /> : (
                        <span className="text-slate-400 text-xs">Unknown</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{rule.priority}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggle(rule.id, rule.isActive)}
                        className={cn(
                          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                          rule.isActive ? 'bg-primary' : 'bg-slate-300'
                        )}
                      >
                        <span
                          className={cn(
                            'inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform',
                            rule.isActive ? 'translate-x-[18px]' : 'translate-x-[3px]'
                          )}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete rule"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
