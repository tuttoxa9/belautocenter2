// Cloudflare Worker - v2 (Smarter Caching & Parsing)

// ====================================================================================
// 1. HELPERS & CONFIG
// ====================================================================================

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const CACHE_TTL = {
  API: 86400, // 24 hours for API responses
  PURGE: 0,   // No cache for purge actions
};

function jsonResponse(data, init = {}) {
  return new Response(JSON.stringify(data), { headers: JSON_HEADERS, ...init });
}

function errorResponse(status, message) {
  console.error(`Error: ${message}`);
  return jsonResponse({ error: message }, { status });
}

function handleCors() {
  return new Response(null, { headers: JSON_HEADERS });
}


// ====================================================================================
// 2. FIRESTORE DATA PARSING
// ====================================================================================

/**
 * Converts a single Firestore field value to a regular JavaScript type.
 * @param {object} value - The Firestore value object (e.g., { stringValue: 'hello' }).
 * @returns {any} The converted JavaScript value.
 */
function convertFieldValue(value) {
  if (!value) return null;
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(value.integerValue, 10);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.timestampValue !== undefined) return new Date(value.timestampValue);
  if (value.arrayValue !== undefined) {
    return value.arrayValue.values ? value.arrayValue.values.map(convertFieldValue) : [];
  }
  if (value.mapValue !== undefined) {
    const obj = {};
    for (const key in value.mapValue.fields) {
      obj[key] = convertFieldValue(value.mapValue.fields[key]);
    }
    return obj;
  }
  if (value.nullValue !== undefined) return null;
  return null;
}

/**
 * Parses a raw Firestore API response into a clean array of objects or a single object.
 * @param {object} firestoreResponse - The raw JSON response from the Firestore REST API.
 * @returns {object[] | object | null} A clean array of documents or a single document object.
 */
function parseFirestoreResponse(firestoreResponse) {
  // Handle collection response (multiple documents)
  if (firestoreResponse.documents) {
    return firestoreResponse.documents.map(doc => {
      const id = doc.name.split('/').pop();
      const fields = {};
      for (const key in doc.fields) {
        fields[key] = convertFieldValue(doc.fields[key]);
      }
      return { id, ...fields };
    });
  }

  // Handle single document response
  if (firestoreResponse.name && firestoreResponse.fields) {
    const id = firestoreResponse.name.split('/').pop();
    const fields = {};
    for (const key in firestoreResponse.fields) {
      fields[key] = convertFieldValue(firestoreResponse.fields[key]);
    }
    return { id, ...fields };
  }

  // Handle other cases or empty responses
  return firestoreResponse;
}


// ====================================================================================
// 3. CACHING LOGIC
// ====================================================================================

/**
 * Fetches a response, parses it, caches it, and returns it.
 * Bypasses cache if the request is not GET.
 * @param {Request} request - The incoming request.
 * @param {function} fetchAndProcess - An async function that fetches and processes data.
 * @param {number} ttl - The cache Time To Live in seconds.
 * @returns {Promise<Response>}
 */
async function cacheAndRespond(request, fetchAndProcess, ttl) {
  const cache = caches.default;
  const cacheKey = new Request(request.url, { method: 'GET' });

  // Only cache GET requests
  if (request.method !== 'GET') {
    return fetchAndProcess();
  }

  // Try to find the response in cache first
  let cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) {
    // Reconstruct response to ensure headers are fresh
    const body = await cachedResponse.json();
    const response = jsonResponse(body);
    response.headers.set('X-Cache-Status', 'HIT');
    return response;
  }

  // If not in cache, fetch, process, and cache it
  const { response, processedData } = await fetchAndProcess();

  if (response.ok) {
    // Cache the processed data, not the raw response
    const cacheableResponse = jsonResponse(processedData);
    cacheableResponse.headers.set('Cache-Control', `public, max-age=${ttl}`);
    cacheableResponse.headers.set('X-Cache-Status', 'MISS');
    // waitUntil() ensures the caching happens even after the response is sent
    self.waitUntil(cache.put(cacheKey, cacheableResponse.clone()));
    return cacheableResponse;
  } else {
    // If the fetch failed, return the original error response without caching
    return response;
  }
}


// ====================================================================================
// 4. CORE FETCH HANDLER
// ====================================================================================

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return handleCors();
    }

    const url = new URL(request.url);
    const firebaseUrl = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents${url.pathname}`;

    // The function to fetch from Firestore and parse the data
    const fetchAndProcessFirestore = async () => {
      const firestoreRequest = new Request(firebaseUrl, request);
      const firestoreResponse = await fetch(firestoreRequest);

      let processedData = null;
      if (firestoreResponse.ok) {
        const rawData = await firestoreResponse.json();
        processedData = parseFirestoreResponse(rawData);
      }

      // Return both the original response and the processed data
      return { response: firestoreResponse, processedData };
    };

    // All GET requests to Firestore data are cached
    if (request.method === 'GET') {
        return cacheAndRespond(request, fetchAndProcessFirestore, CACHE_TTL.API);
    }

    // For non-GET requests, just proxy them without caching the response.
    // (The worker logic assumes writes should not be cached, but should trigger a purge, which is not implemented here for simplicity)
    const firestoreRequest = new Request(firebaseUrl, request);
    return fetch(firestoreRequest);
  }
};
