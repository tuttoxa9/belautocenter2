export interface CacheInvalidationParams {
  collection: string
  documentId?: string
  action: 'create' | 'update' | 'delete'
}

/**
 * Определяет какие пути нужно очистить в зависимости от коллекции и действия
 */
export function getPathsToInvalidate(collection: string, documentId?: string): string[] {
  const paths: string[] = []

  switch (collection) {
    case 'cars':
      paths.push('/catalog')
      paths.push('/')
      if (documentId) {
        paths.push(`/catalog/${documentId}`)
      }
      break

    case 'reviews':
      paths.push('/reviews')
      paths.push('/')
      break

    case 'stories':
      paths.push('/')
      paths.push('/about')
      break

    case 'settings':
      // При изменении настроек обновляем все основные страницы
      paths.push('/')
      paths.push('/catalog')
      paths.push('/about')
      paths.push('/contacts')
      paths.push('/credit')
      paths.push('/leasing')
      paths.push('/reviews')
      break

    case 'leads':
      // Заявки не влияют на публичные страницы
      break

    default:
      // Для других коллекций очищаем главную
      paths.push('/')
  }

  return paths
}

export async function invalidateCache(params: CacheInvalidationParams): Promise<void> {
  try {
    const apiKey = process.env.CACHE_INVALIDATION_API_KEY || process.env.NEXT_PUBLIC_CACHE_INVALIDATION_API_KEY

    if (!apiKey) {
      console.warn('[Cache Invalidation] API key not found')
      return
    }

    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const paths = getPathsToInvalidate(params.collection, params.documentId)

    const response = await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        collection: params.collection,
        documentId: params.documentId,
        paths,
        action: params.action
      })
    })

    if (!response.ok) {
      console.error('[Cache Invalidation] Failed:', await response.text())
    } else {
      console.log('[Cache Invalidation] Success:', { collection: params.collection, paths })
    }
  } catch (error) {
    console.error('[Cache Invalidation] Error:', error)
  }
}

/**
 * Сбрасывает весь кэш сайта (Cloudflare + Vercel)
 */
export async function purgeAllCache(): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = process.env.CACHE_INVALIDATION_API_KEY || process.env.NEXT_PUBLIC_CACHE_INVALIDATION_API_KEY

    if (!apiKey) {
      return { success: false, error: 'API key not configured' }
    }

    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const response = await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        purgeAll: true
      })
    })

    if (!response.ok) {
      const error = await response.text()
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export function createCacheInvalidator(collection: string) {
  return {
    onCreate: (documentId?: string) => invalidateCache({
      collection,
      documentId,
      action: 'create'
    }),
    onUpdate: (documentId?: string) => invalidateCache({
      collection,
      documentId,
      action: 'update'
    }),
    onDelete: (documentId?: string) => invalidateCache({
      collection,
      documentId,
      action: 'delete'
    })
  }
}
