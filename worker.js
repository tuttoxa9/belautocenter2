// Cloudflare Worker для BelAutoCenter – ФИНАЛЬНАЯ ИДЕАЛЬНАЯ ВЕРСИЯ
//
// Сочетает лучшие качества двух подходов:
// 1.  **Надежная и масштабируемая архитектура (из Версии 2):**
//     - Универсальный прокси для Firestore, не требующий ручного парсинга данных.
//     - Аутентификация через Firebase Auth для защищенных действий.
//     - Надежная стратегия полной очистки кэша ("Purge Everything") при любом изменении данных.
//     - Продвинутая обработка изображений с "ленивой" конвертацией в WebP.
//
// 2.  **Точечная оптимизация производительности (из Версии 1):**
//     - Специальный эндпоинт `/cars` для каталога с агрессивным кэшированием на 24 часа.
//     - **ИЗМЕНЕНО:** Стандартное кэширование на 24 часа для всех остальных API-запросов.

// ====================================================================================
// 1. КОНСТАНТЫ И ОСНОВНЫЕ ХЕЛПЕРЫ
// ====================================================================================

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
const CATALOG_CACHE_TTL_SECONDS = 86400;  // 24 часа для основного каталога /cars
const GENERAL_API_CACHE_TTL_SECONDS = 86400; // 24 ЧАСА для остальных API ответов
const IMAGE_CACHE_TTL_SECONDS = 2592000;   // 30 дней для изображений
const GOOGLE_JWKS_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

/** Универсальный ответ в формате JSON. */
function json(data, init = {}) {
  const defaultHeaders = { 'content-type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' };
  return new Response(JSON.stringify(data), { ...init, headers: { ...defaultHeaders, ...init.headers } });
}

/** Универсальный ответ с ошибкой. */
function error(status, message, extra = {}) {
  console.error(`Returning error: ${status} - ${message}`, extra);
  return json({ error: message, ...extra }, { status });
}

/** Обработчик CORS preflight-запросов (OPTIONS). */
function handleCors(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
  return new Response(null, { headers });
}

// ====================================================================================
// 2. ВЕРИФИКАЦИЯ FIREBASE AUTH JWT (без изменений, сжато для краткости)
// ====================================================================================

async function fetchJWKS(cache, ctx) { const cached = await cache.match(GOOGLE_JWKS_URL); if (cached) return cached.json(); const res = await fetch(GOOGLE_JWKS_URL, { cf: { cacheTtl: 3600, cacheEverything: true } }); if (!res.ok) throw new Error("Failed to fetch Google JWKS"); const jwks = await res.json(); const cacheableResponse = new Response(JSON.stringify(jwks), { headers: JSON_HEADERS }); ctx.waitUntil(cache.put(GOOGLE_JWKS_URL, cacheableResponse)); return jwks; }
function base64UrlToUint8Array(base64Url) { const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); const raw = atob(base64); const arr = new Uint8Array(raw.length); for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i); return arr; }
async function importPublicKey(jwk) { return crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]); }
function decodeJwt(token) { const parts = token.split("."); if (parts.length !== 3) throw new Error("Invalid JWT format"); const header = JSON.parse(atob(parts[0])); const payload = JSON.parse(atob(parts[1])); const signature = base64UrlToUint8Array(parts[2]); return { header, payload, signature, signingInput: parts[0] + "." + parts[1] }; }
async function verifyFirebaseIdToken(token, projectId, cache, ctx) { const { header, payload, signature, signingInput } = decodeJwt(token); if (header.alg !== "RS256") throw new Error("Unexpected algorithm"); const expectedIssuer = `https://securetoken.google.com/${projectId}`; if (payload.iss !== expectedIssuer) throw new Error("Invalid issuer"); if (payload.aud !== projectId) throw new Error("Invalid audience"); const now = Math.floor(Date.now() / 1000); if (payload.exp && now > payload.exp) throw new Error("Token expired"); if (!payload.sub) throw new Error("No subject (sub)"); const jwks = await fetchJWKS(cache, ctx); const jwk = jwks.keys.find((k) => k.kid === header.kid); if (!jwk) throw new Error("JWKS key not found"); const key = await importPublicKey(jwk); const dataToVerify = new TextEncoder().encode(signingInput); const isValid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, dataToVerify); if (!isValid) throw new Error("Invalid signature"); return payload; }
function withAuth(handler) { return async (request, env, ctx) => { try { const authHeader = request.headers.get("Authorization"); if (!authHeader || !authHeader.startsWith("Bearer ")) return error(401, "Missing or invalid Authorization header"); const token = authHeader.substring(7); const decodedToken = await verifyFirebaseIdToken(token, env.FIREBASE_PROJECT_ID, caches.default, ctx); request.firebaseUser = decodedToken; return handler(request, env, ctx); } catch (e) { return error(403, "Forbidden", { details: e.message }); } }; }

// ====================================================================================
// 3. ХЕЛПЕРЫ ДЛЯ КЭША И ОЧИСТКИ
// ====================================================================================

function cacheKey(request) {
  const url = new URL(request.url);
  url.hash = "";
  // Ключ кэша теперь зависит ТОЛЬКО от URL, все заголовки игнорируются.
  return new Request(url.toString(), { method: 'GET' });
}
async function cacheGetOrSet(request, ctx, computeResponse, ttl) {
  const key = cacheKey(request);
  const cache = caches.default;
  const cachedResponse = await cache.match(key);
  if (cachedResponse) {
    const response = new Response(cachedResponse.body, cachedResponse);
    response.headers.set("X-Cache-Status", "HIT");
    return response;
  }
  const freshResponse = await computeResponse();
  if (freshResponse.ok) {
    // Создаем новый объект Response, чтобы можно было изменять заголовки.
    const response = new Response(freshResponse.body, freshResponse);

    // Удаляем заголовок Vary, чтобы Cloudflare кэшировал один ответ для всех.
    response.headers.delete('Vary');

    response.headers.set("Cache-Control", `public, max-age=${ttl}`);
    response.headers.set("X-Cache-Status", "MISS");
    ctx.waitUntil(cache.put(key, response.clone()));
    return response;
  }
  return freshResponse;
}

async function purgeEverything(env) {
  if (!env.CLOUDFLARE_API_TOKEN || !env.CLOUDFLARE_ZONE_ID) {
    console.error("Purge Everything skipped: missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ZONE_ID.");
    return;
  }
  try {
    const endpoint = `https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/purge_cache`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Authorization": `Bearer ${env.CLOUDFLARE_API_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ purge_everything: true }),
    });
    if (response.ok) console.log("Purge Everything command sent successfully.");
    else console.error("Purge Everything command failed:", await response.text());
  } catch (e) { console.error('Purge Everything failed:', e); }
}

// ====================================================================================
// 4. БИЗНЕС-ЛОГИКА
// ====================================================================================

/** Специальный обработчик для каталога с оптимизированным кэшированием на 24 часа */
async function handleGetCars(request, env, ctx) {
    const firebaseUrl = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/cars`;
    const firestoreRequest = new Request(firebaseUrl, request);

    // Используем универсальный хелпер кэширования, но передаем специальный TTL для каталога
    return cacheGetOrSet(request, ctx, () => fetch(firestoreRequest), CATALOG_CACHE_TTL_SECONDS);
}

/** Обработчик для получения файлов из R2 с кэшированием и авто-конвертацией в WebP */
async function handleGetImage(request, env, ctx) {
  const cache = caches.default;
  const url = new URL(request.url);
  const path = url.pathname.slice(1);
  if (!path) return error(400, "File path is missing");
  const acceptHeader = request.headers.get('Accept') || '';
  const supportsWebP = acceptHeader.includes('image/webp');
  const isConvertibleImage = /\.(jpg|jpeg|png)$/i.test(path);
  const shouldConvertToWebP = supportsWebP && isConvertibleImage;
  const cacheUrl = shouldConvertToWebP ? request.url + '?webp=true' : request.url;
  const imageCacheKey = new Request(cacheUrl, request);
  let response = await cache.match(imageCacheKey);
  if (response) {
    const cachedResponse = new Response(response.body, response);
    cachedResponse.headers.set("X-Cache-Status", "HIT");
    return cachedResponse;
  }
  const object = await env.IMAGE_BUCKET.get(path);
  if (object === null) return new Response('File Not Found in R2', { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', `public, max-age=${IMAGE_CACHE_TTL_SECONDS}`);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set("X-Cache-Status", "MISS");
  if (shouldConvertToWebP) {
    const imageUrl = `https://${url.hostname}/${path}`;
    const webpResponse = await fetch(imageUrl, { cf: { image: { format: 'webp', quality: 85 } } });
    if (webpResponse.ok) {
      headers.set('Content-Type', 'image/webp');
      response = new Response(webpResponse.body, { headers });
      ctx.waitUntil(cache.put(imageCacheKey, response.clone()));
      return response;
    }
  }
  response = new Response(object.body, { headers });
  ctx.waitUntil(cache.put(imageCacheKey, response.clone()));
  return response;
}

/** Обработчики загрузки и удаления файлов */
async function handleUpload(request, env) { /* ... без изменений ... */ if (request.method !== 'POST') return error(405, 'Method Not Allowed'); try { const formData = await request.formData(); const file = formData.get('file'); const path = formData.get('path'); if (!file || !path) return error(400, 'Требуются поля "file" и "path"'); await env.IMAGE_BUCKET.put(path, file.stream(), { httpMetadata: { contentType: file.type } }); return json({ success: true, path: path }); } catch (e) { return error(500, `Upload failed: ${e.message}`); } }
async function handleDeleteImage(request, env) { /* ... без изменений ... */ if (request.method !== 'POST') return error(405, 'Method Not Allowed'); try { const { path } = await request.json(); if (!path) return error(400, 'Требуется поле "path"'); await env.IMAGE_BUCKET.delete(path); return json({ success: true, path: path }); } catch (e) { return error(400, `Invalid request: ${e.message}`); } }

/** Обработчик для получения курса валют с кэшированием на 1 час. */
async function handleExchangeRate(request, ctx) {
    const VERCEL_PROXY_URL = "https://belautocenter.by/api/exchange-rate";
    return cacheGetOrSet(request, ctx, () => fetch(VERCEL_PROXY_URL), GENERAL_API_CACHE_TTL_SECONDS);
}

/** Универсальный прокси для запросов к Firestore с кэшированием на 1 час. */
async function proxyFirestore(request, env, ctx) {
  const url = new URL(request.url);
  const firebaseUrl = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents${url.pathname}${url.search}`;

  if (request.method === 'GET') {
    if (request.headers.get('Cache-Control') === 'no-cache') {
      console.log(`Bypassing cache for: ${url.pathname}`);
      return fetch(new Request(firebaseUrl, request));
    }
    return cacheGetOrSet(request, ctx, () => fetch(new Request(firebaseUrl, request)), GENERAL_API_CACHE_TTL_SECONDS);
  }

  const response = await fetch(new Request(firebaseUrl, request));
  if (response.ok) {
    console.log(`Data changed via ${request.method} for ${url.pathname}. Purging everything.`);
    ctx.waitUntil(purgeEverything(env));
  }
  return new Response(response.body, response);
}

// ====================================================================================
// 5. ГЛАВНЫЙ ОБРАБОТЧИК FETCH
// ====================================================================================

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return handleCors(request);
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // --- Маршрутизация запросов ---

      // 1. СПЕЦИАЛЬНЫЙ ЭНДПОИНТ ДЛЯ КАТАЛОГА С 24-ЧАСОВЫМ КЭШЕМ
      if (path === '/cars' && request.method === 'GET') {
        return handleGetCars(request, env, ctx);
      }

      // 2. ОБРАБОТКА ИЗОБРАЖЕНИЙ
      const isImageRequest = request.method === 'GET' && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(path);
      if (isImageRequest) {
        return handleGetImage(request, env, ctx);
      }

      // 3. ЗАЩИЩЕННЫЕ ЭНДПОИНТЫ
      if (path.startsWith('/upload')) {
        return withAuth(handleUpload)(request, env, ctx);
      }
      if (path.startsWith('/delete-image')) {
        return withAuth(handleDeleteImage)(request, env, ctx);
      }
      if (path.startsWith('/purge-everything')) {
        return withAuth(async () => {
          ctx.waitUntil(purgeEverything(env));
          return json({ success: true, message: "Purge Everything task initiated." });
        })(request, env, ctx);
      }

      // 4. ПУБЛИЧНЫЕ API ЭНДПОИНТЫ
      if (path.startsWith('/exchange-rate')) {
          return handleExchangeRate(request, ctx);
      }

      // 5. ВСЕ ОСТАЛЬНЫЕ ЗАПРОСЫ К ДАННЫМ ПРОКСИРУЕМ В FIRESTORE
      if (request.method !== 'GET') {
        return withAuth(proxyFirestore)(request, env, ctx); // Защищаем изменяющие методы
      } else {
        return proxyFirestore(request, env, ctx); // GET запросы публичны
      }

    } catch (e) {
      console.error('Unhandled Fetch Error:', e);
      return error(500, "Internal Server Error", { details: e.message });
    }
  }
}
