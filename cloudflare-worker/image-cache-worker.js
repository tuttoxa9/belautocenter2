/**
 * Улучшенный Cloudflare Worker для управления кэшированием Firestore и изображений
 * Включает обработку R2 хранилища и проксирование запросов к Firestore
 */

// Константы и настройки
const FIREBASE_PROJECT_ID = "belauto-5dd94"; // Заменить на ваш ID проекта
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;
const STORAGE_BASE_URL = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_PROJECT_ID}.appspot.com/o`;

// Настройки кэширования
const FIRESTORE_CACHE_TTL = 108000; // 30 часов для данных Firestore
const FIRESTORE_STALE_TTL = 3600;   // 1 час для stale-while-revalidate
const IMAGE_CACHE_TTL = 2592000;    // 30 дней для изображений
const IMAGE_STALE_TTL = 86400;      // 1 день для stale-while-revalidate изображений

export default {
  async fetch(request, env, ctx) {
    // Обработчик для префлайт CORS запросов
    if (request.method === 'OPTIONS') {
      return handleCorsRequest();
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    // Определяем тип запроса по пути
    if (pathname.includes('/api/firestore') || pathname.includes('/firestore') || url.searchParams.has('collection')) {
      return handleFirestoreRequest(request, env, ctx);
    } else if (pathname.includes('/api/r2-upload') || pathname.includes('/r2-upload')) {
      return handleR2UploadRequest(request, env, ctx);
    } else if (pathname.includes('/api/r2-delete') || pathname.includes('/r2-delete')) {
      return handleR2DeleteRequest(request, env, ctx);
    } else if (pathname.includes('/api/images') || pathname.includes('/images') ||
               pathname.includes('/uploads') || pathname.endsWith('.jpg') ||
               pathname.endsWith('.jpeg') || pathname.endsWith('.png') ||
               pathname.endsWith('.webp') || pathname.endsWith('.gif')) {
      return handleImageRequest(request, env, ctx);
    }

    // По умолчанию пытаемся обработать как изображение
    return handleImageRequest(request, env, ctx);
  },
};

/**
 * Обработчик CORS запросов для предполетных проверок
 */
function handleCorsRequest() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cache-Control, If-None-Match, x-requested-with',
      'Access-Control-Max-Age': '86400', // 24 часа кэширования предполетных запросов
    }
  });
}

/**
 * Обработчик запросов Firestore с улучшенным кэшированием
 */
async function handleFirestoreRequest(request, env, ctx) {
  const url = new URL(request.url);

  // Получаем параметры запроса
  const collection = url.searchParams.get('collection');
  const documentId = url.searchParams.get('document');
  const orderBy = url.searchParams.get('orderBy');
  const limit = url.searchParams.get('limit');
  const where = url.searchParams.get('where');

  if (!collection) {
    return jsonResponse({ error: 'Collection parameter is required' }, 400);
  }

  // Строим путь к Firestore
  let firestoreUrl = `${FIRESTORE_BASE_URL}/${collection}`;
  if (documentId) {
    firestoreUrl += `/${documentId}`;
  }

  // Добавляем параметры запроса
  const queryParams = new URLSearchParams();
  if (orderBy) queryParams.set('orderBy', orderBy);
  if (limit) queryParams.set('pageSize', limit);
  if (where) queryParams.set('where', where);

  if (queryParams.toString()) {
    firestoreUrl += `?${queryParams.toString()}`;
  }

  // Определяем ключ кэша с учетом всех параметров
  const cacheKey = new Request(firestoreUrl);
  const cache = caches.default;

  // Получаем заголовок для условного запроса
  const ifNoneMatch = request.headers.get('if-none-match');

  try {
    // Проверяем кэш
    let response = await cache.match(cacheKey);

    if (response) {
      // Если ответ есть в кэше
      console.log('Firestore cache HIT:', firestoreUrl);

      // Проверяем ETag и если совпадает, возвращаем 304
      const cachedEtag = response.headers.get('etag');
      if (ifNoneMatch && cachedEtag && ifNoneMatch === cachedEtag) {
        return new Response(null, {
          status: 304,
          headers: {
            'ETag': cachedEtag,
            'Cache-Control': `public, max-age=${FIRESTORE_CACHE_TTL}, stale-while-revalidate=${FIRESTORE_STALE_TTL}`,
            'Access-Control-Allow-Origin': '*',
            'X-Cache-Status': 'NOT_MODIFIED'
          }
        });
      }

      // Если ETag не совпадает, возвращаем закэшированный ответ
      const headers = new Headers(response.headers);
      headers.set('X-Cache-Status', 'HIT');
      headers.set('Access-Control-Allow-Origin', '*');

      return new Response(response.body, {
        status: response.status,
        headers: headers
      });
    }

    // Если в кэше нет ответа, делаем запрос к Firestore
    console.log('Firestore cache MISS:', firestoreUrl);

    const firestoreResponse = await fetch(firestoreUrl, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Cloudflare-Worker-Firestore-Cache/3.0'
      },
      cf: {
        cacheTtl: FIRESTORE_CACHE_TTL,
        cacheEverything: true
      }
    });

    if (!firestoreResponse.ok) {
      return jsonResponse({
        error: `Firestore error: ${firestoreResponse.status} ${firestoreResponse.statusText}`
      }, firestoreResponse.status);
    }

    // Получаем данные для создания ETag и кэширования
    const responseData = await firestoreResponse.json();

    // Создаем хеш для ETag
    const dataString = JSON.stringify(responseData);
    const encoder = new TextEncoder();
    const hashedData = await crypto.subtle.digest('SHA-256', encoder.encode(dataString));
    const hashArray = Array.from(new Uint8Array(hashedData));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const etag = `"${hashHex.substring(0, 16)}"`;

    // Если ETag совпадает с If-None-Match, возвращаем 304
    if (ifNoneMatch === etag) {
      return new Response(null, {
        status: 304,
        headers: {
          'ETag': etag,
          'Cache-Control': `public, max-age=${FIRESTORE_CACHE_TTL}, stale-while-revalidate=${FIRESTORE_STALE_TTL}`,
          'Access-Control-Allow-Origin': '*',
          'X-Cache-Status': 'NOT_MODIFIED'
        }
      });
    }

    // Статистика для мониторинга
    const isCollection = !documentId;
    const documentCount = isCollection && responseData.documents ? responseData.documents.length : 1;

    // Создаем улучшенный ответ с кэшированием
    const headers = new Headers();
    headers.set('Content-Type', 'application/json; charset=utf-8');
    headers.set('Cache-Control', `public, max-age=${FIRESTORE_CACHE_TTL}, stale-while-revalidate=${FIRESTORE_STALE_TTL}, must-revalidate`);
    headers.set('CDN-Cache-Control', `public, max-age=${FIRESTORE_CACHE_TTL}, stale-while-revalidate=${FIRESTORE_STALE_TTL}`);
    headers.set('ETag', etag);
    headers.set('Vary', 'Accept-Encoding, If-None-Match');
    headers.set('X-Cache-Status', 'MISS');
    headers.set('X-Cache-TTL', FIRESTORE_CACHE_TTL.toString());
    headers.set('X-Document-Count', documentCount.toString());
    headers.set('X-Collection-Name', collection);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Expose-Headers', 'ETag, X-Cache-TTL, X-Cache-Status, X-Document-Count');

    // Создаем ответ с данными и заголовками
    const newResponse = new Response(JSON.stringify(responseData), {
      status: 200,
      headers: headers
    });

    // Сохраняем в кэш
    ctx.waitUntil(cache.put(cacheKey, newResponse.clone()));

    return newResponse;

  } catch (error) {
    console.error('Firestore request error:', error);

    return jsonResponse({
      error: 'Ошибка при обработке запроса Firestore',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, 500);
  }
}

/**
 * Обработчик запросов изображений с кэшированием и R2 хранилищем
 */
async function handleImageRequest(request, env, ctx) {
  const url = new URL(request.url);

  // Извлекаем путь к файлу, очищая от префиксов API
  let imagePath = url.pathname
    .replace(/^\/api\/images\//, '')
    .replace(/^\/images\//, '')
    .replace(/^\//, '');

  // Если путь пустой, возвращаем ошибку
  if (!imagePath) {
    return jsonResponse({ error: 'Missing image path' }, 400);
  }

  // Ключ для кэша
  const cacheKey = new Request(request.url);
  const cache = caches.default;

  try {
    // Сначала проверяем кэш
    let cachedResponse = await cache.match(cacheKey);

    if (cachedResponse) {
      console.log('Image cache HIT:', imagePath);

      // Улучшаем заголовки для закэшированного ответа
      const headers = new Headers(cachedResponse.headers);
      headers.set('X-Cache-Status', 'HIT');
      headers.set('Access-Control-Allow-Origin', '*');

      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        headers: headers
      });
    }

    // Кэш пропущен, пытаемся получить из R2
    if (env.R2_BUCKET) {
      try {
        console.log('Trying to fetch from R2:', imagePath);

        // Попытка получить файл из R2
        const r2Object = await env.R2_BUCKET.get(imagePath);

        if (r2Object) {
          // Если объект найден в R2, возвращаем с соответствующими заголовками
          const headers = new Headers();

          // Определяем тип контента на основе расширения или метаданных
          const contentType = r2Object.httpMetadata?.contentType || getContentTypeFromPath(imagePath);
          headers.set('Content-Type', contentType);

          // Заголовки кэширования
          headers.set('Cache-Control', `public, max-age=${IMAGE_CACHE_TTL}, immutable`);
          headers.set('CDN-Cache-Control', `public, max-age=${IMAGE_STALE_TTL}`);
          headers.set('X-Cache-Source', 'r2');
          headers.set('X-Cache-Status', 'MISS');
          headers.set('Access-Control-Allow-Origin', '*');

          // Создаем ответ
          const response = new Response(r2Object.body, {
            headers: headers
          });

          // Сохраняем в кэш
          ctx.waitUntil(cache.put(cacheKey, response.clone()));

          return response;
        }
      } catch (r2Error) {
        console.error('R2 error:', r2Error);
        // Если ошибка при получении из R2, продолжаем с Firebase
      }
    }

    // Если в R2 не найдено, пробуем Firebase Storage
    console.log('Fallback to Firebase Storage:', imagePath);

    // Firebase требует кодирования слешей
    const encodedImagePath = imagePath.replace(/\//g, '%2F');
    const firebaseStorageUrl = `${STORAGE_BASE_URL}/${encodedImagePath}?alt=media`;

    // Запрос к Firebase Storage
    const storageResponse = await fetch(firebaseStorageUrl, {
      headers: {
        'User-Agent': 'Cloudflare-Worker-Image-Cache/3.0'
      },
      cf: {
        cacheTtl: IMAGE_CACHE_TTL,
        cacheEverything: true
      }
    });

    if (!storageResponse.ok) {
      return new Response(`Image not found: ${imagePath}`, {
        status: storageResponse.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'X-Error-Source': 'firebase-storage'
        }
      });
    }

    // Если получен успешный ответ, кэшируем его
    const contentType = storageResponse.headers.get('Content-Type') || getContentTypeFromPath(imagePath);

    const headers = new Headers(storageResponse.headers);
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', `public, max-age=${IMAGE_CACHE_TTL}, immutable`);
    headers.set('CDN-Cache-Control', `public, max-age=${IMAGE_STALE_TTL}`);
    headers.set('X-Cache-Source', 'firebase');
    headers.set('X-Cache-Status', 'MISS');
    headers.set('Access-Control-Allow-Origin', '*');

    const newResponse = new Response(storageResponse.body, {
      status: storageResponse.status,
      headers: headers
    });

    // Сохраняем в кэш
    ctx.waitUntil(cache.put(cacheKey, newResponse.clone()));

    return newResponse;

  } catch (error) {
    console.error('Image request error:', error);

    return jsonResponse({
      error: 'Ошибка при обработке запроса изображения',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, 500);
  }
}

/**
 * Обработчик для загрузки файлов в R2
 */
async function handleR2UploadRequest(request, env, ctx) {
  // Только POST запросы
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    // R2 хранилище должно быть доступно
    if (!env.R2_BUCKET) {
      return jsonResponse({ error: 'R2 bucket not configured' }, 500);
    }

    // Получаем данные из FormData
    const formData = await request.formData();
    const file = formData.get('file');
    const path = formData.get('path');

    if (!file || !path) {
      return jsonResponse({ error: 'File and path are required' }, 400);
    }

    // Проверка размера файла (10MB максимум)
    if (file.size > 10 * 1024 * 1024) {
      return jsonResponse({ error: 'File too large (max 10MB)' }, 400);
    }

    // Получаем содержимое файла
    const fileArrayBuffer = await file.arrayBuffer();

    // Определяем тип контента
    const contentType = file.type || getContentTypeFromPath(file.name);

    // Загружаем файл в R2
    await env.R2_BUCKET.put(path, fileArrayBuffer, {
      httpMetadata: {
        contentType: contentType,
        cacheControl: `public, max-age=${IMAGE_CACHE_TTL}, immutable`
      }
    });

    // Генерируем публичный URL
    const r2PublicUrl = `${request.url.split('/api/')[0]}/${path}`;

    return jsonResponse({
      success: true,
      url: r2PublicUrl,
      path: path
    }, 200);

  } catch (error) {
    console.error('R2 upload error:', error);

    return jsonResponse({
      error: 'Ошибка при загрузке файла',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, 500);
  }
}

/**
 * Обработчик для удаления файлов из R2
 */
async function handleR2DeleteRequest(request, env, ctx) {
  // Только DELETE запросы
  if (request.method !== 'DELETE') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    // R2 хранилище должно быть доступно
    if (!env.R2_BUCKET) {
      return jsonResponse({ error: 'R2 bucket not configured' }, 500);
    }

    // Получаем данные из запроса
    const data = await request.json();
    const url = data.url;

    if (!url) {
      return jsonResponse({ error: 'URL is required' }, 400);
    }

    // Извлекаем путь из URL
    const urlObj = new URL(url);
    const path = urlObj.pathname.replace(/^\//, '');

    if (!path) {
      return jsonResponse({ error: 'Invalid URL path' }, 400);
    }

    // Удаляем файл из R2
    await env.R2_BUCKET.delete(path);

    return jsonResponse({
      success: true,
      message: 'File deleted successfully',
      path: path
    }, 200);

  } catch (error) {
    console.error('R2 delete error:', error);

    return jsonResponse({
      error: 'Ошибка при удалении файла',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, 500);
  }
}

/**
 * Хелпер для создания JSON ответов
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  });
}

/**
 * Определяет тип контента на основе расширения файла
 */
function getContentTypeFromPath(path) {
  const extension = path.split('.').pop()?.toLowerCase();

  const contentTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'pdf': 'application/pdf',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'json': 'application/json',
    'js': 'application/javascript',
    'css': 'text/css',
    'html': 'text/html',
    'txt': 'text/plain',
  };

  return contentTypes[extension] || 'application/octet-stream';
}
