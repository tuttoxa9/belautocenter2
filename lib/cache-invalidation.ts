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

export async function invalidateCache(params: CacheInvalidationParams): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = process.env.CACHE_INVALIDATION_API_KEY || process.env.NEXT_PUBLIC_CACHE_INVALIDATION_API_KEY

    if (!apiKey) {
      console.warn('[Cache Invalidation] ⚠️ API key не настроен. Настройте CACHE_INVALIDATION_API_KEY в Vercel Environment Variables')
      // Не выбрасываем ошибку, чтобы не блокировать работу приложения
      return { success: false, error: 'API key not configured' }
    }

    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const paths = getPathsToInvalidate(params.collection, params.documentId)

    console.log(`[Cache Invalidation] 🔄 Очистка кэша для ${params.collection}${params.documentId ? `/${params.documentId}` : ''}, пути:`, paths)

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
      const errorText = await response.text()
      console.error('[Cache Invalidation] ❌ Failed:', errorText)
      return { success: false, error: errorText }
    }

    const result = await response.json()
    console.log('[Cache Invalidation] ✅ Success:', { collection: params.collection, documentId: params.documentId, paths, result })
    return { success: true }
  } catch (error) {
    console.error('[Cache Invalidation] ❌ Error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Сбрасывает весь кэш сайта (Cloudflare + Vercel + Next.js ISR)
 */
export async function purgeAllCache(): Promise<{ success: boolean; error?: string; details?: any }> {
  try {
    const apiKey = process.env.CACHE_INVALIDATION_API_KEY || process.env.NEXT_PUBLIC_CACHE_INVALIDATION_API_KEY

    if (!apiKey) {
      const errorMessage = 'API key не настроен. Перейдите в Vercel Dashboard → Settings → Environment Variables и добавьте CACHE_INVALIDATION_API_KEY'
      console.error('[Purge All Cache] ❌', errorMessage)
      return { success: false, error: errorMessage }
    }

    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    console.log('[Purge All Cache] 🔄 Начинаем полную очистку кэша...')

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
      const errorText = await response.text()
      console.error('[Purge All Cache] ❌ Failed:', errorText)
      return { success: false, error: `Ошибка ${response.status}: ${errorText}` }
    }

    const result = await response.json()
    console.log('[Purge All Cache] ✅ Success:', result)
    return { success: true, details: result }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Purge All Cache] ❌ Error:', errorMessage)
    return {
      success: false,
      error: `Произошла ошибка: ${errorMessage}`
    }
  }
}

/**
 * Создает объект для автоматической инвалидации кэша при изменениях в коллекции
 */
export function createCacheInvalidator(collection: string) {
  return {
    onCreate: async (documentId?: string) => {
      console.log(`[Cache Invalidator] 📝 onCreate: ${collection}${documentId ? `/${documentId}` : ''}`)
      return await invalidateCache({
        collection,
        documentId,
        action: 'create'
      })
    },
    onUpdate: async (documentId?: string) => {
      console.log(`[Cache Invalidator] ✏️ onUpdate: ${collection}${documentId ? `/${documentId}` : ''}`)
      return await invalidateCache({
        collection,
        documentId,
        action: 'update'
      })
    },
    onDelete: async (documentId?: string) => {
      console.log(`[Cache Invalidator] 🗑️ onDelete: ${collection}${documentId ? `/${documentId}` : ''}`)
      return await invalidateCache({
        collection,
        documentId,
        action: 'delete'
      })
    }
  }
}
