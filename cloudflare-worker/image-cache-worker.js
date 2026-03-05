// Cloudflare Worker для BelAutoCenter – ОПТИМИЗИРОВАННАЯ ВЕРСИЯ v3.0 (ИСПРАВЛЕННАЯ)
// Обновлено: точечная очистка кэша, ISR совместимость, парсинг Firestore (flatten), обход кэша для Админки

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
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
// 2.5. ПАРСЕР FIRESTORE В ПЛОСКИЙ JSON
// ====================================================================================

function parseFirestoreValue(valueObj) {
  if (!valueObj) return null;
  if ('stringValue' in valueObj) return valueObj.stringValue;
  if ('integerValue' in valueObj) return parseInt(valueObj.integerValue, 10);
  if ('doubleValue' in valueObj) return parseFloat(valueObj.doubleValue);
  if ('booleanValue' in valueObj) return valueObj.booleanValue;
  if ('timestampValue' in valueObj) return valueObj.timestampValue;
  if ('arrayValue' in valueObj) {
    return (valueObj.arrayValue.values || []).map(parseFirestoreValue);
  }
  if ('mapValue' in valueObj) {
    const result = {};
    for (const key in valueObj.mapValue.fields) {
      result[key] = parseFirestoreValue(valueObj.mapValue.fields[key]);
    }
    return result;
  }
  if ('nullValue' in valueObj) return null;
  return null;
}

function flattenFirestoreDocument(doc) {
  if (!doc || !doc.name) return doc;
  const result = {
    id: doc.name.split('/').pop(),
  };

  if (doc.fields) {
    for (const key in doc.fields) {
      result[key] = parseFirestoreValue(doc.fields[key]);
    }
  }
  return result;
}

function flattenFirestoreResponse(data) {
  if (data.documents) {
    return {
      documents: data.documents.map(flattenFirestoreDocument),
      nextPageToken: data.nextPageToken
    };
  } else if (data.name && data.fields) {
    return flattenFirestoreDocument(data);
  }
  return data;
}

// ====================================================================================
// 3. ХЕЛПЕРЫ ДЛЯ КЭША И ОЧИСТКИ
// ====================================================================================

function cacheKey(request) { const url = new URL(request.url); url.hash = ""; return new Request(url.toString(), { headers: request.headers, method: 'GET' }); }

// [!!! НАША ИСПРАВЛЕННАЯ, РАБОЧАЯ ВЕРСИЯ !!!]
async function cacheGetOrSet(request, ctx, computeResponse) {
    const key = cacheKey(request);
    const cache = caches.default;
    const cachedResponse = await cache.match(key);

    if (cachedResponse) {
        console.log(`[CACHE HIT] ${request.url}`);
        return cachedResponse;
    }

    console.log(`[CACHE MISS] ${request.url}`);
    const freshResponse = await computeResponse();

    if (freshResponse.ok) {
        // Мы читаем тело ответа от Firestore (Google) как JSON
        const rawData = await freshResponse.json();
        // Преобразуем его в плоский и удобный JSON для Next.js
        const flatData = flattenFirestoreResponse(rawData);
        const bodyText = JSON.stringify(flatData);

        const headers = new Headers(freshResponse.headers);
        headers.set("Cache-Control", `public, max-age=${API_CACHE_TTL_SECONDS}`);
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Content-Type', 'application/json; charset=utf-8');

        const finalResponse = new Response(bodyText, {
            status: freshResponse.status,
            statusText: freshResponse.statusText,
            headers: headers
        });

        ctx.waitUntil(cache.put(key, finalResponse.clone()));
        return finalResponse;
    }

    return freshResponse;
}

// [УЛУЧШЕННАЯ ВЕРСИЯ ОТ РАЗРАБОТЧИКА]
async function purgeCacheByUrls(env, urls = []) {
  if (!urls.length) {
    console.log('[CACHE PURGE] No URLs provided, skipping');
    return;
  }

  if (!env.CLOUDFLARE_API_TOKEN || !env.CLOUDFLARE_ZONE_ID) {
    console.warn('[CACHE PURGE] Missing Cloudflare credentials, skipping');
    return;
  }

  try {
    console.log(`[CACHE PURGE] Purging ${urls.length} URLs:`, urls);

    const endpoint = `https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/purge_cache`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ files: urls })
    });

    const result = await response.json();

    if (response.ok) {
      console.log('[CACHE PURGE] Success:', result);
    } else {
      console.error('[CACHE PURGE] Failed:', result);
    }
  } catch (e) {
    console.error('[CACHE PURGE] Error:', e);
  }
}

// ====================================================================================
// 4. БИЗНЕС-ЛОГИКА (R2 + FIRESTORE PROXY)
// ====================================================================================

async function handleGetImage(request, env, ctx) {
    const cache = caches.default;
    const url = new URL(request.url);
    const path = url.pathname.slice(1);
    if (!path) return error(400, "File path is missing");
    const key = new Request(request.url, request);
    let response = await cache.match(key);
    if (response) {
        console.log(`Cache HIT for image: ${path}`);
        return response;
    }
    console.log(`Cache MISS for image: ${path}`);
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
    response = new Response(object.body, { headers });
    ctx.waitUntil(cache.put(key, response.clone()));
    return response;
}

async function handleUpload(request, env) {
    if (request.method !== 'POST') return error(405, 'Method Not Allowed');
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const path = formData.get('path');

        if (!file || !path) return error(400, 'Требуются поля "file" и "path"');
        let finalPath = path;
        let fileBodyToUpload = file.stream();
        let finalContentType = file.type;

        await env.IMAGE_BUCKET.put(finalPath, fileBodyToUpload, {
            httpMetadata: { contentType: finalContentType },
        });

        const url = new URL(request.url);

        return json({
            success: true,
            path: finalPath,
            url: `${url.origin}/${finalPath}`,
            key: finalPath,
            originalType: file.type,
            savedAs: finalContentType,
        });
    } catch (e) {
        return error(500, `Upload failed: ${e.message}`);
    }
}

async function handleDeleteImage(request, env) {
    if (request.method !== 'POST') return error(405, 'Method Not Allowed');
    try {
        const { path, key } = await request.json();
        const deleteTarget = path || key;
        if (!deleteTarget) return error(400, 'Требуется поле "path" или "key"');
        await env.IMAGE_BUCKET.delete(deleteTarget);
        console.log(`Deleted file from R2: ${deleteTarget}`);
        return json({ success: true, path: deleteTarget, key: deleteTarget });
    } catch(e) {
        return error(400, `Invalid delete request: ${e.message}`);
    }
}

// [!!! НАША ИСПРАВЛЕННАЯ, РАБОЧАЯ ВЕРСИЯ !!!]
async function proxyFirestore(request, env, ctx) {
    const url = new URL(request.url);

    // Убираем возможный префикс /v1/projects/... (на случай если фронтенд пришлет полный путь)
    let cleanPath = url.pathname;
    if (cleanPath.startsWith('/v1/projects/')) {
        const parts = cleanPath.split('/');
        // Ожидаем /v1/projects/{projectId}/databases/(default)/documents/{collection}
        cleanPath = '/' + parts.slice(7).join('/');
    }

    const firebaseUrl = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents${cleanPath}${url.search}`;

    console.log(`[FIRESTORE PROXY] ${request.method} ${firebaseUrl}`);

    if (request.method === 'GET') {
        const authHeader = request.headers.get("Authorization");
        const isAuthorizedRequest = authHeader && authHeader.startsWith("Bearer ");

        if (isAuthorizedRequest) {
            console.log(`[FIRESTORE PROXY] Direct fetch (Bypass Cache) for ${firebaseUrl}`);
            const originResponse = await fetch(new Request(firebaseUrl, {
                method: 'GET',
                headers: request.headers
            }));

            const responseHeaders = new Headers(originResponse.headers);
            responseHeaders.set('Access-Control-Allow-Origin', '*');
            responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

            if (originResponse.ok && originResponse.headers.get('content-type')?.includes('application/json')) {
                const data = await originResponse.json();
                return new Response(JSON.stringify(flattenFirestoreResponse(data)), {
                    status: originResponse.status,
                    statusText: originResponse.statusText,
                    headers: responseHeaders
                });
            }
            return new Response(originResponse.body, {
                status: originResponse.status,
                statusText: originResponse.statusText,
                headers: responseHeaders
            });
        } else {
            // Для публичных запросов - через кэш
            return cacheGetOrSet(request, ctx, () => fetch(new Request(firebaseUrl, { method: 'GET' })));
        }
    }

    // Для мутаций (POST, PATCH, DELETE)
    const response = await fetch(new Request(firebaseUrl, request));
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    if (response.ok) {
        console.log(`[FIRESTORE PROXY] Mutation successful, purging cache...`);
        const urlsToPurge = [];

        // 1. Очищаем конкретный документ
        const docUrl = `https://${url.hostname}${url.pathname}`;
        urlsToPurge.push(docUrl);

        // 2. Очищаем коллекцию (логика от разработчика)
        const parts = url.pathname.split('/').filter(p => p);
        if (parts.length >= 1) {
            const collectionUrl = `https://${url.hostname}/${parts[parts.length - 1]}`;
            if (!urlsToPurge.includes(collectionUrl)) {
                 urlsToPurge.push(collectionUrl);
            }
        }
        console.log(`[CACHE PURGE] Will purge:`, urlsToPurge);
        ctx.waitUntil(purgeCacheByUrls(env, urlsToPurge));

        // Если мутация возвращает JSON, нужно его распарсить (чтобы фронт получил плоский JSON)
        if (response.headers.get('content-type')?.includes('application/json')) {
            const data = await response.json();
            return new Response(JSON.stringify(flattenFirestoreResponse(data)), {
                status: response.status,
                statusText: response.statusText,
                headers: responseHeaders
            });
        }
    }

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
    });
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
