// DEPRECATED: Этот API устарел и перенаправляет на /api/revalidate
// Оставлен для обратной совместимости

export async function POST(request: Request) {
  try {
    const { collection: collectionName, documentId, action } = await request.json()

    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.CACHE_INVALIDATION_API_KEY

    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[DEPRECATED] /api/cache/invalidate called, redirecting to /api/revalidate')

    // Перенаправляем на новый API для точечной очистки
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const response = await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        collection: collectionName,
        documentId,
        action,
        // Не делаем purgeAll, используем точечную очистку
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[DEPRECATED] Revalidation failed:', error)
      return Response.json({
        error: 'Failed to invalidate cache',
        details: error
      }, { status: 500 })
    }

    const result = await response.json()

    return Response.json({
      success: true,
      message: `Cache invalidation triggered for collection: ${collectionName}`,
      action,
      deprecated: true,
      redirectedTo: '/api/revalidate',
      result
    })

  } catch (error) {
    console.error('[DEPRECATED] Error:', error)
    return Response.json({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
