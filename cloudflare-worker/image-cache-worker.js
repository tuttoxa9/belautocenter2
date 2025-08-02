// Firebase конфигурация
const FIREBASE_PROJECT_ID = "belauto-5dd94";
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/`;
const STORAGE_BASE_URL = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_PROJECT_ID}.firebasestorage.app/o/`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Определяем тип запроса: файлы или данные Firestore
    if (url.pathname.startsWith('/api/firestore/') || url.pathname.startsWith('/firestore/')) {
      return handleFirestoreRequest(request, env, ctx);
    } else if (url.pathname.startsWith('/api/images/') || url.pathname.startsWith('/images/')) {
      return handleImageRequest(request, env, ctx);
    } else {
      // Обрабатываем как файл изображения (обратная совместимость)
      return handleImageRequest(request, env, ctx);
    }
  },
};

// Обработчик Firestore запросов с кэшированием
async function handleFirestoreRequest(request, env, ctx) {
  const url = new URL(request.url);

  // Обрабатываем CORS preflight запросы
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cache-Control, If-None-Match',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  // Очищаем путь от префиксов и извлекаем параметры
  let firestorePath = url.pathname.replace(/^\/api\/firestore\//, '').replace(/^\/firestore\//, '');
  const collection = url.searchParams.get('collection');
  const document = url.searchParams.get('document');

  // Если путь не задан, строим его из параметров
  if (!firestorePath && collection) {
    firestorePath = collection;
    if (document) {
      firestorePath += `/${document}`;
    }
  }

  if (!firestorePath) {
    return new Response('Missing Firestore path or collection parameter', { status: 400 });
  }

  // Создаем URL для Firestore REST API
  const firestoreUrl = `${FIRESTORE_BASE_URL}${firestorePath}`;

  // Создаем улучшенный ключ для кэша с учетом параметров
  const cacheKey = new Request(`${request.url}?${url.searchParams.toString()}`);
  const cache = caches.default;

  // Проверяем If-None-Match заголовок для условного кэширования
  const ifNoneMatch = request.headers.get('if-none-match');

  // Проверяем кэш
  let response = await cache.match(cacheKey);

  if (!response) {
    // Запрашиваем данные из Firestore
    response = await fetch(firestoreUrl, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Cloudflare-Worker-Firestore-Cache/2.0'
      },
      cf: {
        cacheTtl: 108000, // 30 часов в Cloudflare cache
        cacheEverything: true
      }
    });

    if (!response.ok) {
      return new Response(`Firestore error: ${response.status} ${response.statusText}`, {
        status: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'X-Cache-Status': 'ERROR'
        }
      });
    }

    // Получаем данные для создания ETag
    const responseBody = await response.text();

    // Создаем ETag на основе содержимого
    const etag = `"${await crypto.subtle.digest('SHA-256', new TextEncoder().encode(responseBody))
      .then(buffer => Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 16)
      )}"`;

    // Если ETag совпадает с If-None-Match, возвращаем 304
    if (ifNoneMatch === etag) {
      return new Response(null, {
        status: 304,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'ETag': etag,
          'X-Cache-Status': 'NOT_MODIFIED'
        }
      });
    }

    // Добавляем улучшенные заголовки кэширования
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=108000, stale-while-revalidate=3600, must-revalidate');
    headers.set('CDN-Cache-Control', 'public, max-age=108000, stale-while-revalidate=3600');
    headers.set('Cloudflare-CDN-Cache-Control', 'public, max-age=108000');
    headers.set('ETag', etag);
    headers.set('Vary', 'Accept-Encoding, If-None-Match');
    headers.set('X-Cached-By', 'Cloudflare-Worker-Firestore-v2');
    headers.set('X-Cache-Status', 'MISS');
    headers.set('X-Cache-TTL', '108000');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, If-None-Match');
    headers.set('Access-Control-Expose-Headers', 'ETag, X-Cache-Status, X-Cache-TTL');
    headers.set('Content-Type', 'application/json; charset=utf-8');

    response = new Response(responseBody, {
      status: response.status,
      headers: headers
    });

    // Сохраняем в кэш с увеличенным TTL
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
  } else {
    // Добавляем заголовок о попадании в кэш
    const headers = new Headers(response.headers);
    headers.set('X-Cache-Status', 'HIT');
    headers.set('Access-Control-Allow-Origin', '*');

    response = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    });
  }

  return response;
}

// Обработчик изображений (существующая логика)
async function handleImageRequest(request, env, ctx) {
  const url = new URL(request.url);

  // Очищаем путь от префиксов
  let imagePath = url.pathname
    .replace(/^\/api\/images\//, '')
    .replace(/^\/images\//, '')
    .replace(/^\//, '');

  if (!imagePath) {
    return new Response('Missing file path', { status: 400 });
  }

  // Firebase Storage требует кодирование слэшей
  const encodedImagePath = imagePath.replace(/\//g, '%2F');
  const firebaseStorageUrl = `${STORAGE_BASE_URL}${encodedImagePath}?alt=media`;

  // Кэширование изображений
  const cacheKey = new Request(request.url);
  const cache = caches.default;

  let response = await cache.match(cacheKey);

  if (!response) {
    response = await fetch(firebaseStorageUrl, {
      headers: {
        'User-Agent': 'Cloudflare-Worker-Image-Cache/1.0'
      },
      cf: {
        cacheTtl: 2592000, // 30 дней
        cacheEverything: true
      }
    });

    if (!response.ok) {
      return response;
    }

    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'public, max-age=2592000, immutable');
    headers.set('CDN-Cache-Control', 'public, max-age=86400');
    headers.set('Cloudflare-CDN-Cache-Control', 'public, max-age=2592000');
    headers.set('X-Cached-By', 'Cloudflare-Worker-Images');
    headers.set('X-Cache-Status', 'MISS');

    response = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    });

    ctx.waitUntil(cache.put(cacheKey, response.clone()));
  } else {
    const headers = new Headers(response.headers);
    headers.set('X-Cache-Status', 'HIT');

    response = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    });
  }

  return response;
}
