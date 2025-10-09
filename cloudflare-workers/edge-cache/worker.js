/**
 * Edge Cache Worker для BelAutoCenter
 *
 * Назначение: Кэширование HTML страниц в Cloudflare Edge Cache
 * Преимущества:
 * - Минимальный расход Workers (только при cache miss)
 * - Максимальная скорость (5-20ms при cache hit)
 * - Глобальное распределение кэша
 *
 * Логика:
 * 1. Проверяет Cloudflare Edge Cache
 * 2. При HIT → отдает напрямую (Worker завершается)
 * 3. При MISS → вызывает Next.js Worker
 * 4. Добавляет заголовки Cache-Control
 * 5. Сохраняет в Edge Cache на 24 часа
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cache = caches.default;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS(request);
    }

    // ============================================
    // 1. ПРОВЕРКА EDGE CACHE
    // ============================================

    // Создаем ключ кэша (без query параметров для админки)
    const cacheKey = new Request(url.toString(), {
      method: 'GET',
      headers: request.headers
    });

    // Пытаемся получить из кэша
    let response = await cache.match(cacheKey);

    if (response) {
      console.log(`✅ Edge Cache HIT: ${url.pathname}`);

      // Добавляем заголовок для отладки
      const headers = new Headers(response.headers);
      headers.set('X-Cache-Status', 'HIT');
      headers.set('X-Cache-Worker', 'edge-cache');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }

    console.log(`❌ Edge Cache MISS: ${url.pathname}`);

    // ============================================
    // 2. ЗАПРОС К NEXT.JS WORKER
    // ============================================

    try {
      // Вызываем Next.js Worker (Service Binding)
      response = await env.NEXTJS.fetch(request);

      // Если ответ не успешный - возвращаем как есть
      if (!response.ok) {
        console.log(`⚠️ Next.js returned ${response.status} for ${url.pathname}`);
        return response;
      }

      // ============================================
      // 3. ОПРЕДЕЛЕНИЕ ПОЛИТИКИ КЭШИРОВАНИЯ
      // ============================================

      const shouldCache = shouldCachePath(url.pathname);

      if (!shouldCache) {
        console.log(`🚫 Not caching: ${url.pathname}`);
        return response;
      }

      // ============================================
      // 4. ДОБАВЛЕНИЕ ЗАГОЛОВКОВ И КЭШИРОВАНИЕ
      // ============================================

      const headers = new Headers(response.headers);

      // Заголовки для Edge кэша (24 часа)
      headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');
      headers.set('CDN-Cache-Control', 'max-age=86400');
      headers.set('Cloudflare-CDN-Cache-Control', 'max-age=86400');

      // Заголовки для отладки
      headers.set('X-Cache-Status', 'MISS');
      headers.set('X-Cache-Worker', 'edge-cache');
      headers.set('X-Cached-At', new Date().toISOString());

      const cachedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });

      // Сохраняем в Edge Cache асинхронно
      ctx.waitUntil(cache.put(cacheKey, cachedResponse.clone()));

      console.log(`💾 Cached in Edge: ${url.pathname}`);

      return cachedResponse;

    } catch (error) {
      console.error(`❌ Error fetching from Next.js:`, error);

      return new Response('Internal Server Error', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
          'X-Cache-Status': 'ERROR'
        }
      });
    }
  }
};

/**
 * Определяет, нужно ли кэшировать путь
 */
function shouldCachePath(pathname) {
  // Кэшируем страницы каталога
  if (pathname.startsWith('/catalog')) {
    return true;
  }

  // Кэшируем главную страницу
  if (pathname === '/' || pathname === '') {
    return true;
  }

  // Кэшируем статические страницы
  const staticPages = ['/about', '/contacts', '/credit', '/leasing', '/reviews', '/privacy'];
  if (staticPages.includes(pathname)) {
    return true;
  }

  // НЕ кэшируем API роуты
  if (pathname.startsWith('/api/')) {
    return false;
  }

  // НЕ кэшируем админку
  if (pathname.startsWith('/adminbel')) {
    return false;
  }

  // Все остальное кэшируем с осторожностью
  return false;
}

/**
 * Обработка CORS preflight запросов
 */
function handleCORS(request) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }
  });
}