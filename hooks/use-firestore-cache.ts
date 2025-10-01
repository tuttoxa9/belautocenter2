import { useState, useEffect, useCallback } from 'react'
import { firestoreCache } from '@/lib/firestore-cache'

export interface UseFirestoreCacheOptions {
  enabled?: boolean
  refetchOnWindowFocus?: boolean
  staleTime?: number // время в миллисекундах, после которого данные считаются устаревшими
}

export interface UseFirestoreCacheResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  lastUpdated: Date | null
}

export function useFirestoreCollection<T = any>(
  collectionName: string,
  options: UseFirestoreCacheOptions = {}
): UseFirestoreCacheResult<T[]> {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    staleTime = 5 * 60 * 1000 // 5 минут по умолчанию
  } = options

  const [data, setData] = useState<T[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled || !collectionName) return

    // Проверяем, не устарели ли данные
    if (data && lastUpdated && (Date.now() - lastUpdated.getTime()) < staleTime) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const result = await firestoreCache.getCollection(collectionName)
      setData(result as T[])
      setLastUpdated(new Date())

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [collectionName, enabled, data, lastUpdated, staleTime])

  const refetch = useCallback(async () => {
    setLastUpdated(null) // Принудительно сбрасываем кэш
    await fetchData()
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Опциональное обновление при фокусе окна
  useEffect(() => {
    if (!refetchOnWindowFocus) return

    const handleFocus = () => {
      // Обновляем только если данные устарели
      if (lastUpdated && (Date.now() - lastUpdated.getTime()) > staleTime) {
        fetchData()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetchOnWindowFocus, fetchData, lastUpdated, staleTime])

  return {
    data,
    loading,
    error,
    refetch,
    lastUpdated
  }
}

export function useFirestoreDocument<T = any>(
  collectionName: string,
  documentId: string,
  options: UseFirestoreCacheOptions = {}
): UseFirestoreCacheResult<T> {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    staleTime = 5 * 60 * 1000 // 5 минут по умолчанию
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled || !collectionName || !documentId) return

    // Проверяем, не устарели ли данные
    if (data && lastUpdated && (Date.now() - lastUpdated.getTime()) < staleTime) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const result = await firestoreCache.getDocument(collectionName, documentId)
      setData(result as T)
      setLastUpdated(new Date())

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [collectionName, documentId, enabled, data, lastUpdated, staleTime])

  const refetch = useCallback(async () => {
    setLastUpdated(null) // Принудительно сбрасываем кэш
    await fetchData()
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Опциональное обновление при фокусе окна
  useEffect(() => {
    if (!refetchOnWindowFocus) return

    const handleFocus = () => {
      // Обновляем только если данные устарели
      if (lastUpdated && (Date.now() - lastUpdated.getTime()) > staleTime) {
        fetchData()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetchOnWindowFocus, fetchData, lastUpdated, staleTime])

  return {
    data,
    loading,
    error,
    refetch,
    lastUpdated
  }
}

// Хук для предзагрузки данных
export function usePrefetchFirestore() {
  const prefetch = useCallback(async (collectionName: string, documentId?: string) => {
    try {
      if (documentId) {
        await firestoreCache.getDocument(collectionName, documentId)
      } else {
        await firestoreCache.getCollection(collectionName)
      }
    } catch (error) {
    }
  }, [])

  return { prefetch }
}
