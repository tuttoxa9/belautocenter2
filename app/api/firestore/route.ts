import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const CACHE_TTL = 108000 // 30 часов
const STALE_WHILE_REVALIDATE = 3600 // 1 час

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const collection = url.searchParams.get('collection')
  const documentId = url.searchParams.get('document')

  // Поддержка запросов с параметрами сортировки и фильтрации
  const orderBy = url.searchParams.get('orderBy')
  const limit = url.searchParams.get('limit')
  const where = url.searchParams.get('where')

  if (!collection) {
    return NextResponse.json({ error: 'Collection parameter required' }, { status: 400 })
  }

  // Строим путь к Firestore REST API
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-5dd94'
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`
  let firestoreUrl = `${baseUrl}/${collection}`

  if (documentId) {
    firestoreUrl += `/${documentId}`
  } else {
    // Добавляем параметры запроса для коллекций
    const queryParams = new URLSearchParams()

    if (orderBy) {
      queryParams.set('orderBy', orderBy)
    }
    if (limit) {
      queryParams.set('pageSize', limit)
    }

    if (queryParams.toString()) {
      firestoreUrl += `?${queryParams.toString()}`
    }
  }

  try {
    // Прямой запрос к Firestore всегда
    const response = await fetch(firestoreUrl, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Direct-Firestore/1.0'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch from Firestore: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Генерируем улучшенный ETag на основе данных и метаданных
    const dataString = JSON.stringify(data)
    const etag = `"${btoa(dataString).slice(0, 16)}"`

    // Подсчитываем статистику для мониторинга
    const isCollection = !documentId
    const documentCount = isCollection && data.documents ? data.documents.length : 1

    // Возвращаем данные с улучшенными заголовками кэширования
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_TTL}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}, must-revalidate`,
        'CDN-Cache-Control': `public, max-age=${CACHE_TTL}`,
        'ETag': etag,
        'Vary': 'Accept-Encoding, If-None-Match',
        'X-Cache-TTL': CACHE_TTL.toString(),
        'X-Cache-Source': 'direct',
        'X-Document-Count': documentCount.toString(),
        'X-Collection-Name': collection,
        'Last-Modified': new Date().toUTCString(),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'ETag, X-Cache-TTL, X-Cache-Source, X-Document-Count'
      },
    })

  } catch (error) {
    console.error('Firestore cache error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Добавляем поддержку OPTIONS для CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, If-None-Match, Cache-Control',
      'Access-Control-Max-Age': '86400'
    }
  })
}
