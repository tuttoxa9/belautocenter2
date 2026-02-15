// Cloudflare Worker для BelAutoCenter – ВЕРСИЯ ДЛЯ МЕДИА (R2)
// Обновлено: удалено проксирование Firestore, оставлено только управление изображениями

// ====================================================================================
// 1. ОСНОВНЫЕ ХЕЛПЕРЫ И КОНСТАНТЫ
// ====================================================================================

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
  return new Response(null, { headers });
}

// ====================================================================================
// 2. ВЕРИФИКАЦИЯ FIREBASE AUTH JWT (для защиты загрузки)
// ====================================================================================

async function fetchJWKS(cache, ctx) { const cached = await cache.match(GOOGLE_JWKS_URL); if (cached) return cached.json(); const res = await fetch(GOOGLE_JWKS_URL, { cf: { cacheTtl: 3600, cacheEverything: true } }); if (!res.ok) throw new Error("Failed to fetch Google JWKS"); const jwks = await res.json(); const cacheableResponse = new Response(JSON.stringify(jwks), { headers: JSON_HEADERS }); try { ctx.waitUntil(cache.put(GOOGLE_JWKS_URL, cacheableResponse)); } catch(e) { console.error("Failed to cache JWKS:", e); } return jwks; }
function base64UrlToUint8Array(base64Url) { const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); const raw = atob(base64); const arr = new Uint8Array(raw.length); for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i); return arr; }
async function importPublicKey(jwk) { return crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]); }
function decodeJwt(token) { const parts = token.split("."); if (parts.length !== 3) throw new Error("Invalid JWT format"); const header = JSON.parse(atob(parts[0])); const payload = JSON.parse(atob(parts[1])); const signature = base64UrlToUint8Array(parts[2]); return { header, payload, signature, signingInput: parts[0] + "." + parts[1] }; }
async function verifyFirebaseIdToken(token, projectId, cache, ctx) { const { header, payload, signature, signingInput } = decodeJwt(token); if (header.alg !== "RS256") throw new Error("Unexpected algorithm"); const expectedIssuer = `https://securetoken.google.com/${projectId}`; if (payload.iss !== expectedIssuer) throw new Error("Invalid issuer"); if (payload.aud !== projectId) throw new Error("Invalid audience"); const now = Math.floor(Date.now() / 1000); if (payload.exp && now > payload.exp) throw new Error("Token expired"); if (!payload.sub) throw new Error("No subject (sub)"); const jwks = await fetchJWKS(cache, ctx); const jwk = jwks.keys.find((k) => k.kid === header.kid); if (!jwk) throw new Error("JWKS key not found"); const key = await importPublicKey(jwk); const dataToVerify = new TextEncoder().encode(signingInput); const isValid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, dataToVerify); if (!isValid) throw new Error("Invalid signature"); return payload; }
function withAuth(handler) { return async (request, env, ctx) => { try { const authHeader = request.headers.get("Authorization"); if (!authHeader || !authHeader.startsWith("Bearer ")) return error(401, "Missing or invalid Authorization header"); const token = authHeader.substring(7); const decodedToken = await verifyFirebaseIdToken(token, env.FIREBASE_PROJECT_ID, caches.default, ctx); request.firebaseUser = decodedToken; return handler(request, env, ctx); } catch (e) { console.error("Auth verification failed:", e); return error(403, "Forbidden", { details: e.message }); } }; }

// ====================================================================================
// 3. БИЗНЕС-ЛОГИКА (R2)
// ====================================================================================

/**
 * Обработчик для получения файлов из R2.
 */
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

/**
 * Обработчик для загрузки файлов в R2.
 */
async function handleUpload(request, env) {
    if (request.method !== 'POST') return error(405, 'Method Not Allowed');

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const path = formData.get('path');
        const autoWebP = formData.get('autoWebP') === 'true';

        if (!file || !path) return error(400, 'Требуются поля "file" и "path"');

        const isImage = file.type && file.type.startsWith('image/');
        const canBeConverted = /\.(jpg|jpeg|png|gif|heic|heif)$/i.test(file.name || path);
        const shouldConvertToWebP = autoWebP && isImage && canBeConverted;

        let finalPath = path;
        let fileBodyToUpload = file.stream();
        let finalContentType = file.type;

        if (shouldConvertToWebP) {
            finalPath = path.replace(/\.[^.]+$/, '.webp');
            finalContentType = 'image/webp';

            const conversionRequest = new Request('https://workers.dev/internal-image-processing', {
                method: 'POST',
                headers: { 'Content-Type': file.type },
                body: file,
            });

            const conversionResponse = await fetch(conversionRequest, {
                cf: { image: { format: 'webp', quality: 85 } }
            });

            if (conversionResponse.ok) {
                fileBodyToUpload = conversionResponse.body;
            } else {
                console.warn("WebP conversion failed, using original file");
                finalPath = path;
                finalContentType = file.type;
                fileBodyToUpload = file.stream();
            }
        }

        await env.IMAGE_BUCKET.put(finalPath, fileBodyToUpload, {
            httpMetadata: { contentType: finalContentType },
        });

        return json({
            success: true,
            path: finalPath,
            convertedToWebP: shouldConvertToWebP && finalContentType === 'image/webp',
            savedAs: finalContentType,
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
        return error(400, `Invalid delete request: ${e.message}`);
    }
}

// ====================================================================================
// 4. ГЛАВНЫЙ ОБРАБОТЧИК FETCH (РОУТЕР)
// ====================================================================================

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return handleCors(request);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // 1. Запросы на файлы из R2 (GET)
    if (request.method === 'GET') {
      // Кэшируем любые GET запросы к воркеру как запросы к изображениям в R2
      return handleGetImage(request, env, ctx);
    }

    // 2. API-эндпоинты для управления файлами (защищенные)
    if (path.startsWith('/upload')) {
      return withAuth(handleUpload)(request, env, ctx);
    }
    if (path.startsWith('/delete-image')) {
      return withAuth(handleDeleteImage)(request, env, ctx);
    }

    return error(404, "Not Found");
  }
}
