import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  type: ToastType
  removing: boolean
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 0

const borderColor: Record<ToastType, string> = {
  success: '#10b981',
  error: '#ef4444',
  info: '#3b82f6',
}

const iconColor: Record<ToastType, string> = {
  success: 'text-green-600',
  error: 'text-red-500',
  info: 'text-blue-500',
}

const icons: Record<ToastType, string> = {
  success: '\u2713',
  error: '\u2717',
  info: '\u2139',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: number) => {
    const existing = timers.current.get(id)
    if (existing) {
      clearTimeout(existing)
      timers.current.delete(id)
    }
    setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t))
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 300)
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId++
    setToasts(prev => [...prev, { id, message, type, removing: false }])
    const timer = setTimeout(() => dismiss(id), 4000)
    timers.current.set(id, timer)
  }, [dismiss])

  useEffect(() => {
    const currentTimers = timers.current
    return () => {
      currentTimers.forEach(t => clearTimeout(t))
    }
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            className="pointer-events-auto cursor-pointer rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-[400px] transition-all duration-300"
            style={{
              backgroundColor: 'var(--toast-bg, #fff)',
              borderLeft: `4px solid ${borderColor[t.type]}`,
              opacity: t.removing ? 0 : 1,
              transform: t.removing ? 'translateX(100%)' : 'translateX(0)',
            }}
          >
            <span className={`text-base font-bold ${iconColor[t.type]}`}>{icons[t.type]}</span>
            <span className="text-sm flex-1" style={{ color: 'var(--toast-text, #1e293b)' }}>
              {t.message}
            </span>
            <X size={14} className="shrink-0 opacity-40 hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
