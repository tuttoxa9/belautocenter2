// Cloudflare Worker для BelAutoCenter – УНИВЕРСАЛЬНАЯ ВЕРСИЯ v2.3 (гибрид)
// Поддерживает: R2 (с конвертацией в WebP "на лету") + Кэширующий прокси для Firestore.

// ====================================================================================
// 1. ОСНОВНЫЕ ХЕЛПЕРЫ И КОНСТАНТЫ
// ====================================================================================

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
const API_CACHE_TTL_SECONDS = 86400; // 24 часа для данных Firestore API
const IMAGE_CACHE_TTL_SECONDS = 2592000; // 30 дней для изображений в R2
const GOOGLE_JWKS_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

/** Универсальный ответ в формате JSON. */
function json(data, init = {}) {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  };
  return new Response(JSON.stringify(data), { ...init, headers: {...headers, ...init.headers} });
}

/** Универсальный ответ с ошибкой. */
function error(status, message, extra = {}) {
  console.error(`Returning error: ${status} - ${message}`, extra);
  return json({ error: message, ...extra }, { status });
}

/** Обработчик CORS preflight-запросов. */
function handleCors(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-control-allow-headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
  return new Response(null, { headers });
}

// ====================================================================================
// 2. ВЕРИФИКАЦИЯ FIREBASE AUTH JWT
// ====================================================================================

async function fetchJWKS(cache, ctx) { const cached = await cache.match(GOOGLE_JWKS_URL); if (cached) return cached.json(); const res = await fetch(GOOGLE_JWKS_URL, { cf: { cacheTtl: 3600, cacheEverything: true } }); if (!res.ok) throw new Error("Failed to fetch Google JWKS"); const jwks = await res.json(); const cacheableResponse = new Response(JSON.stringify(jwks), { headers: JSON_HEADERS }); try { ctx.waitUntil(cache.put(GOOGLE_JWKS_URL, cacheableResponse)); } catch(e) { console.error("Failed to cache JWKS:", e); } return jwks; }
function base64UrlToUint8Array(base64Url) { const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); const raw = atob(base64); const arr = new Uint8Array(raw.length); for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i); return arr; }
async function importPublicKey(jwk) { return crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]); }
function decodeJwt(token) { const parts = token.split("."); if (parts.length !== 3) throw new Error("Invalid JWT format"); const header = JSON.parse(atob(parts[0])); const payload = JSON.parse(atob(parts[1])); const signature = base64UrlToUint8Array(parts[2]); return { header, payload, signature, signingInput: parts[0] + "." + parts[1] }; }
async function verifyFirebaseIdToken(token, projectId, cache, ctx) { const { header, payload, signature, signingInput } = decodeJwt(token); if (header.alg !== "RS256") throw new Error("Unexpected algorithm"); const expectedIssuer = `https://securetoken.google.com/${projectId}`; if (payload.iss !== expectedIssuer) throw new Error("Invalid issuer"); if (payload.aud !== projectId) throw new Error("Invalid audience"); const now = Math.floor(Date.now() / 1000); if (payload.exp && now > payload.exp) throw new Error("Token expired"); if (!payload.sub) throw new Error("No subject (sub)"); const jwks = await fetchJWKS(cache, ctx); const jwk = jwks.keys.find((k) => k.kid === header.kid); if (!jwk) throw new Error("JWKS key not found"); const key = await importPublicKey(jwk); const dataToVerify = new TextEncoder().encode(signingInput); const isValid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, dataToVerify); if (!isValid) throw new Error("Invalid signature"); return payload; }
function withAuth(handler) { return async (request, env, ctx) => { try { const authHeader = request.headers.get("Authorization"); if (!authHeader || !authHeader.startsWith("Bearer ")) return error(401, "Missing or invalid Authorization header"); const token = authHeader.substring(7); const decodedToken = await verifyFirebaseIdToken(token, env.FIREBASE_PROJECT_ID, caches.default, ctx); request.firebaseUser = decodedToken; return handler(request, env, ctx); } catch (e) { console.error("Auth verification failed:", e); return error(403, "Forbidden", { details: e.message }); } }; }

// ====================================================================================
// 3. ХЕЛПЕРЫ ДЛЯ КЭША И ОЧИСТКИ
// ====================================================================================

function cacheKey(request) { const url = new URL(request.url); url.hash = ""; return new Request(url.toString(), { headers: request.headers, method: 'GET' }); }
async function cacheGetOrSet(request, ctx, computeResponse) { const key = cacheKey(request); const cache = caches.default; const cachedResponse = await cache.match(key); if (cachedResponse) { console.log(`Cache HIT for API: ${request.url}`); return cachedResponse; } console.log(`Cache MISS for API: ${request.url}`); const freshResponse = await computeResponse(); if (freshResponse.status === 200) { freshResponse.headers.set("Cache-Control", `public, max-age=${API_CACHE_TTL_SECONDS}`); ctx.waitUntil(cache.put(key, freshResponse.clone())); } return freshResponse; }
async function purgeCacheByUrls(env, urls = []) { if (!urls.length || !env.CLOUDFLARE_API_TOKEN || !env.CLOUDFLARE_ZONE_ID) return; try { const endpoint = `https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/purge_cache`; await fetch(endpoint, { method: "POST", headers: { "Authorization": `Bearer ${env.CLOUDFLARE_API_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify({ files: urls }), }); console.log('Successfully purged cache for:', urls); } catch (e) { console.error('Cache purge failed:', e); } }

// ====================================================================================
// 4. БИЗНЕС-ЛОГИКА (R2 + FIRESTORE PROXY)
//    (Взят рабочий код из версии 2.2)
// ====================================================================================

/** Обработчик для получения файлов из R2 с кэшированием и автоматической конвертацией в WebP */
async function handleGetImage(request, env, ctx) {
  const cache = caches.default;
  const url = new URL(request.url);
  const path = url.pathname.slice(1);

  if (!path) return error(400, "File path is missing");

  const acceptHeader = request.headers.get('Accept') || '';
  const supportsWebP = acceptHeader.includes('image/webp');
  const isConvertibleImage = /\.(jpg|jpeg|png)$/i.test(path);
  const shouldConvertToWebP = supportsWebP && isConvertibleImage;

  const cacheKey = shouldConvertToWebP ?
    new Request(request.url + '?webp=true', request) :
    new Request(request.url, request);

  let response = await cache.match(cacheKey);
  if (response) {
    console.log(`Cache HIT for: ${request.url} (WebP: ${shouldConvertToWebP})`);
    return response;
  }
  console.log(`Cache MISS for: ${request.url} (WebP: ${shouldConvertToWebP})`);

  const object = await env.IMAGE_BUCKET.get(path);
  if (object === null) {
    return new Response('File Not Found in R2', {
      status: 404,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', `public, max-age=${IMAGE_CACHE_TTL_SECONDS}`);
  headers.set('Access-Control-Allow-Origin', '*');

  if (shouldConvertToWebP) {
    try {
      const imageResponse = new Response(object.body, { headers });
      const imageUrl = `https://${url.hostname}/${path}`;

      const webpResponse = await fetch(imageUrl, {
        cf: { image: { format: 'webp', quality: 85 } }
      });

      if (webpResponse.ok) {
        console.log(`Successfully converted to WebP: ${path}`);
        headers.set('Content-Type', 'image/webp');
        headers.set('X-Converted-To-WebP', 'true');
        response = new Response(webpResponse.body, { headers });
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
        return response;
      }
    } catch (conversionError) {
      console.error(`WebP conversion error: ${conversionError.message}`);
    }
  }

  response = new Response(object.body, { headers });
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

/** Обработчик для загрузки файлов в R2 (без конвертации при загрузке) */
async function handleUpload(request, env) {
  if (request.method !== 'POST') return error(405, 'Method Not Allowed');
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const path = formData.get('path');

    if (!file || !path) return error(400, 'Требуются поля "file" и "path"');

    await env.IMAGE_BUCKET.put(path, file.stream(), {
      httpMetadata: { contentType: file.type },
    });

    return json({
      success: true,
      path: path,
      originalType: file.type,
    });
  } catch (e) {
    return error(500, `Upload failed: ${e.message}`);
  }
}


/** Обработчик для удаления файлов из R2 */
async function handleDeleteImage(request, env) {
    if (request.method !== 'POST') return error(405, 'Method Not Allowed');
    try {
        const { path } = await request.json();
        if (!path) return error(400, 'Требуется поле "path"');
        await env.IMAGE_BUCKET.delete(path);
        return json({ success: true, path: path });
    } catch(e) {
        return error(400, `Invalid request: ${e.message}`);
    }
}

/** Прокси для запросов к Firestore API с кэшированием и очисткой */
async function proxyFirestore(request, env, ctx) {
    const url = new URL(request.url);
    const firebaseUrl = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents${url.pathname}${url.search}`;

    if (request.method === 'GET') {
        return cacheGetOrSet(request, ctx, () => fetch(new Request(firebaseUrl, request)));
    }

    const response = await fetch(new Request(firebaseUrl, request));

    if (response.ok) {
        const cacheUrlToPurge = `https://${url.hostname}${url.pathname}`;
        ctx.waitUntil(purgeCacheByUrls(env, [cacheUrlToPurge]));

        const parts = url.pathname.split('/').filter(p => p);
        if ((request.method === 'POST' || request.method === 'DELETE' || request.method === 'PUT') && parts.length > 0) {
             const listUrlToPurge = `https://${url.hostname}/${parts[0]}`;
             console.log(`Purging parent list cache as well: ${listUrlToPurge}`);
             ctx.waitUntil(purgeCacheByUrls(env, [listUrlToPurge]));
        }
    }

    return new Response(response.body, response);
}

// ====================================================================================
// 5. ГЛАВНЫЙ ОБРАБОТЧИК FETCH (РОУТЕР)
// ====================================================================================

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return handleCors(request);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    const isFileRequest = request.method === 'GET' && /\.(jpg|jpeg|png|webp|gif|svg|pdf|doc|docx)$/i.test(path);
    if (isFileRequest) {
      return handleGetImage(request, env, ctx);
    }

    if (path.startsWith('/upload')) {
      return withAuth(handleUpload)(request, env, ctx);
    }
    if (path.startsWith('/delete-image')) {
      return withAuth(handleDeleteImage)(request, env, ctx);
    }

    if (request.method !== 'GET') {
      return withAuth(proxyFirestore)(request, env, ctx);
    } else {
      return proxyFirestore(request, env, ctx);
    }
  }
}