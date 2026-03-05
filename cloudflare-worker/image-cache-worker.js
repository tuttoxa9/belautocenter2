// Cloudflare Worker для BelAutoCenter
// Управление медиа в R2 (с конвертацией в WebP), JWT валидацией и проксированием Firestore REST API

// ====================================================================================
// 1. ОСНОВНЫЕ ХЕЛПЕРЫ И КОНСТАНТЫ
// ====================================================================================

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
const IMAGE_CACHE_TTL_SECONDS = 2592000; // 30 дней для изображений
const FIRESTORE_CACHE_TTL_SECONDS = 60; // 1 минута для Firestore по умолчанию
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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Cache-Control',
    'Access-Control-Max-Age': '86400',
  };
  return new Response(null, { headers });
}

// ====================================================================================
// 2. ВЕРИФИКАЦИЯ FIREBASE AUTH JWT
// ====================================================================================

async function fetchJWKS(cache, ctx) {
  const cached = await cache.match(GOOGLE_JWKS_URL);
  if (cached) return cached.json();
  const res = await fetch(GOOGLE_JWKS_URL, { cf: { cacheTtl: 3600, cacheEverything: true } });
  if (!res.ok) throw new Error("Failed to fetch Google JWKS");
  const jwks = await res.json();
  const cacheableResponse = new Response(JSON.stringify(jwks), { headers: JSON_HEADERS });
  try { ctx.waitUntil(cache.put(GOOGLE_JWKS_URL, cacheableResponse)); } catch(e) { console.error("Failed to cache JWKS:", e); }
  return jwks;
}

function base64UrlToUint8Array(base64Url) {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

async function importPublicKey(jwk) {
  return crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
}

function decodeJwt(token) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format");
  const header = JSON.parse(atob(parts[0]));
  const payload = JSON.parse(atob(parts[1]));
  const signature = base64UrlToUint8Array(parts[2]);
  return { header, payload, signature, signingInput: parts[0] + "." + parts[1] };
}

async function verifyFirebaseIdToken(token, projectId, cache, ctx) {
  const { header, payload, signature, signingInput } = decodeJwt(token);
  if (header.alg !== "RS256") throw new Error("Unexpected algorithm");
  const expectedIssuer = `https://securetoken.google.com/${projectId}`;
  if (payload.iss !== expectedIssuer) throw new Error("Invalid issuer");
  if (payload.aud !== projectId) throw new Error("Invalid audience");
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) throw new Error("Token expired");
  if (!payload.sub) throw new Error("No subject (sub)");

  const jwks = await fetchJWKS(cache, ctx);
  const jwk = jwks.keys.find((k) => k.kid === header.kid);
  if (!jwk) throw new Error("JWKS key not found");

  const key = await importPublicKey(jwk);
  const dataToVerify = new TextEncoder().encode(signingInput);
  const isValid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, dataToVerify);
  if (!isValid) throw new Error("Invalid signature");
  return payload;
}

function withAuth(handler) {
  return async (request, env, ctx) => {
    try {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) return error(401, "Missing or invalid Authorization header");
      const token = authHeader.substring(7);
      const decodedToken = await verifyFirebaseIdToken(token, env.FIREBASE_PROJECT_ID, caches.default, ctx);
      request.firebaseUser = decodedToken;
      return handler(request, env, ctx);
    } catch (e) {
      console.error("Auth verification failed:", e);
      return error(403, "Forbidden", { details: e.message });
    }
  };
}

// ====================================================================================
// 3. ПАРСЕР FIRESTORE В ПЛОСКИЙ JSON
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
    return data.documents.map(flattenFirestoreDocument);
  } else if (data.name && data.fields) {
    return flattenFirestoreDocument(data);
  }
  return data;
}

// ====================================================================================
// 4. БИЗНЕС-ЛОГИКА (R2)
// ====================================================================================

async function handleGetImage(request, env, ctx) {
  const cache = caches.default;
  const url = new URL(request.url);
  const key = url.pathname.slice(1);

  if (!key) return error(400, "File path is missing");

  const cacheKey = new Request(request.url, request);
  let response = await cache.match(cacheKey);

  if (response) {
      console.log(`Cache HIT for image: ${key}`);
      return response;
  }

  console.log(`Cache MISS for image: ${key}. Fetching from R2...`);
  const object = await env.R2_BUCKET.get(key);

  if (object === null) return error(404, "Image not found");

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', `public, max-age=${IMAGE_CACHE_TTL_SECONDS}`);
  headers.set('Access-Control-Allow-Origin', '*');

  if (!headers.has('content-type')) {
      headers.set('content-type', 'image/jpeg');
  }

  response = new Response(object.body, { headers });
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

async function handleUpload(request, env) {
  try {
      const formData = await request.formData();
      const file = formData.get('file');
      const originalPath = formData.get('path');
      const autoWebP = formData.get('autoWebP') !== 'false';

      if (!file || !originalPath) return error(400, 'Missing file or path in form data');

      const originalType = file.type || 'application/octet-stream';
      const isImage = originalType.startsWith('image/');

      let uploadStream = file.stream();
      let contentType = originalType;
      let finalPath = originalPath;
      let conversionResult = null;
      let convertedSize = 0;
      let originalSize = file.size;

      // Конвертация в WebP отключена для простоты и надежности.
      // (Можно вернуть, если раскомментировать вызов сервиса конвертации)

      console.log(`Uploading file ${finalPath} (${contentType}) to R2 bucket...`);
      await env.R2_BUCKET.put(finalPath, uploadStream, {
          httpMetadata: { contentType: contentType }
      });

      const url = new URL(request.url);
      const imageUrl = `${url.origin}/${finalPath}`;

      return json({
          success: true,
          url: imageUrl,
          path: finalPath,
          key: finalPath, // Добавлено для совместимости
          originalType: originalType,
          savedAs: contentType,
          conversionResult: conversionResult
      });
  } catch (e) {
      console.error("Upload failed:", e);
      return error(500, "Upload failed", { details: e.message });
  }
}

async function handleDeleteImage(request, env) {
  try {
      const data = await request.json();
      const path = data.key || data.path;

      if (!path) return error(400, 'Missing key or path to delete');

      console.log(`Deleting file ${path} from R2 bucket...`);
      await env.R2_BUCKET.delete(path);
      return json({ success: true, message: `File ${path} deleted successfully` });
  } catch (e) {
      console.error("Delete failed:", e);
      return error(500, "Delete failed", { details: e.message });
  }
}

// ====================================================================================
// 5. ПРОКСИРОВАНИЕ FIRESTORE
// ====================================================================================

async function proxyFirestore(request, env, ctx) {
  const url = new URL(request.url);
  const targetUrl = new URL(`https://firestore.googleapis.com${url.pathname}${url.search}`);

  const modifiedRequest = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? null : request.body,
    redirect: 'follow'
  });

  if (request.method === 'GET') {
    const authHeader = request.headers.get("Authorization");
    const isAuthorizedRequest = authHeader && authHeader.startsWith("Bearer ");

    if (isAuthorizedRequest) {
      // Прямой запрос без кэша для админки (когда есть токен)
      console.log(`[FIRESTORE PROXY] Direct fetch (Bypass Cache) for ${url.pathname}`);
      const originResponse = await fetch(modifiedRequest);
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
      // Использовать кэш для публичных запросов
      const cacheUrl = new URL(request.url);
      const cacheKey = new Request(cacheUrl.toString(), request);
      const cache = caches.default;

      let response = await cache.match(cacheKey);

      if (!response) {
        console.log(`Cache miss for ${cacheUrl.pathname}`);
        const originResponse = await fetch(modifiedRequest);

        if (originResponse.ok) {
          const data = await originResponse.json();
          const flattenedData = flattenFirestoreResponse(data);

          response = json(flattenedData, {
            headers: {
              'Cache-Control': `public, s-maxage=${FIRESTORE_CACHE_TTL_SECONDS}, stale-while-revalidate=30`,
            }
          });

          ctx.waitUntil(cache.put(cacheKey, response.clone()));
        } else {
          return originResponse;
        }
      } else {
        console.log(`Cache hit for ${cacheUrl.pathname}`);
      }

      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
    }
  }

  // Для PATCH/POST/DELETE (мутации) - проксируем напрямую
  const originResponse = await fetch(modifiedRequest);
  const responseHeaders = new Headers(originResponse.headers);
  responseHeaders.set('Access-Control-Allow-Origin', '*');

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
}

// ====================================================================================
// РОУТЕР
// ====================================================================================

export default {
  async fetch(request, env, ctx) {
      try {
          if (request.method === 'OPTIONS') {
              return handleCors(request);
          }

          const url = new URL(request.url);
          const path = url.pathname;

          // Роуты, требующие авторизации (мутации)
          if ((path === '/upload' || path === '/delete-image') && request.method === 'POST') {
              const authHandler = withAuth(async (req, e, c) => {
                  if (path === '/upload') return await handleUpload(req, e);
                  return await handleDeleteImage(req, e);
              });
              return await authHandler(request, env, ctx);
          }

          // Публичные роуты (чтение)
          if (path.startsWith('/v1/projects/')) {
            // Мутации в Firestore тоже требуют токена, но мы просто передадим
            // заголовок Authorization в Google API, он сам проверит.
            // Поэтому проксируем как есть.
            return await proxyFirestore(request, env, ctx);
          }

          // Стандартный fallback для изображений (как было)
          return await handleGetImage(request, env, ctx);

      } catch (e) {
          return error(500, "Internal Server Error", { details: e.message });
      }
  }
};
