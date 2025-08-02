// Простое in-memory кэширование для Firebase данных
interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
}

class FirebaseCache {
  private cache = new Map<string, CacheEntry>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 минут

  set(key: string, data: any, ttl = this.DEFAULT_TTL) {
    this.cache.set(key, {
      data: JSON.parse(JSON.stringify(data)), // Очистка от Firestore объектов
      timestamp: Date.now(),
      ttl
    })
  }

  get(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  clear() {
    this.cache.clear()
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  // Очистка устаревших записей
  cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

export const firebaseCache = new FirebaseCache()

// Очистка кэша каждые 10 минут
if (typeof window !== 'undefined') {
  setInterval(() => {
    firebaseCache.cleanup()
  }, 10 * 60 * 1000)
}

// Помощник для кэшированного получения документа
export async function getCachedDocument(collection: string, docId: string) {
  const cacheKey = `${collection}/${docId}`

  // Проверяем кэш
  const cached = firebaseCache.get(cacheKey)
  if (cached) {
    return cached
  }

  try {
    // Загружаем из Firebase
    const { doc, getDoc } = await import('firebase/firestore')
    const { db } = await import('@/lib/firebase')

    const docRef = doc(db, collection, docId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = { id: docSnap.id, ...docSnap.data() }
      firebaseCache.set(cacheKey, data)
      return data
    }

    return null
  } catch (error) {
    console.error(`Error fetching ${collection}/${docId}:`, error)
    return null
  }
}
