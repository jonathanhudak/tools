import { useCallback, useEffect, useState } from 'react'
import type { Api } from '../../electron/preload'

declare global {
  interface Window {
    api: Api
  }
}

interface UseIPCResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useIPC<T>(
  method: keyof Api,
  ...args: unknown[]
): UseIPCResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!window.api) {
      setError('API not available (preload not loaded)')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const fn = window.api[method] as (...a: unknown[]) => Promise<T>
      const result = await fn(...args)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, JSON.stringify(args)])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}
