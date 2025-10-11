import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const pathname = request.nextUrl.pathname

  // Добавляем заголовки безопасности
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')

  // Кэширование статических ресурсов
  if (pathname.startsWith('/images/') ||
      pathname.startsWith('/_next/static/') ||
      pathname.startsWith('/favicon') ||
      pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot|webp|avif)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    response.headers.set('Vary', 'Accept-Encoding')
  }

  // Улучшенное кэширование для API Firestore запросов
  if (pathname.startsWith('/api/firestore')) {
    response.headers.set('Cache-Control', 'public, max-age=108000, stale-while-revalidate=3600, must-revalidate')
    response.headers.set('Vary', 'Accept-Encoding, If-None-Match')
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, If-None-Match, Cache-Control')
    response.headers.set('Access-Control-Expose-Headers', 'ETag, X-Cache-TTL, X-Cache-Source')
  }

  // Кэширование других API роутов
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/cache/') && !pathname.startsWith('/api/send-telegram')) {
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=30')
    response.headers.set('Vary', 'Accept-Encoding')
  }

  // Кэширование всех публичных страниц на 24 часа
  const publicPages = ['/', '/catalog', '/about', '/contacts', '/credit', '/leasing', '/privacy', '/reviews', '/sale'];
  const isPublicPage = publicPages.some(page =>
    pathname === page || pathname.startsWith(page + '/')
  );

  if (isPublicPage) {
    response.headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=3600')
    response.headers.set('Vary', 'Accept-Encoding')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
