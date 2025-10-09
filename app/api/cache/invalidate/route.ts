export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { collection: collectionName, documentId, action } = await request.json()

    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.CACHE_INVALIDATION_API_KEY

    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cloudflareZoneId = process.env.CLOUDFLARE_ZONE_ID
    const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN

    if (cloudflareZoneId && cloudflareApiToken) {

      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${cloudflareZoneId}/purge_cache`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cloudflareApiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ purge_everything: true }),
        }
      )

      if (response.ok) {

      } else {

        // Не возвращаем ошибку клиенту, так как это фоновая задача,
        // но логируем ее для отладки.
      }
    } else {

    }

    return Response.json({
      success: true,
      message: `Cache invalidation triggered for collection: ${collectionName}. The entire site cache will be refreshed.`,
      action,
    })

  } catch (error) {

    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
