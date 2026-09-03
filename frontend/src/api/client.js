const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// In-memory cache: survives page/tab transitions within the SPA,
// but automatically resets on full browser refresh (F5/reload)
const memoryCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Clear any leftover storage from previous versions
try {
  Object.keys(sessionStorage).forEach((k) => {
    if (k.startsWith('eg_cache_') || k === 'eg_server_awake') {
      sessionStorage.removeItem(k);
    }
  });
} catch {
  // Ignore error
}

function getFromMemoryCache(key) {
  if (memoryCache.has(key)) {
    const entry = memoryCache.get(key);
    if (Date.now() - entry.timestamp < CACHE_TTL_MS) {
      return entry.data;
    }
    memoryCache.delete(key);
  }
  return null;
}

function setToMemoryCache(key, data) {
  memoryCache.set(key, { data, timestamp: Date.now() });
}

export function clearSessionCache() {
  memoryCache.clear();
}

export async function apiRequest(endpoint, options = {}) {
  const isGet = !options.method || options.method.toUpperCase() === 'GET';
  const useCache = isGet && !options.skipCache;
  const cacheKey = endpoint;

  if (useCache) {
    const cached = getFromMemoryCache(cacheKey);
    if (cached !== null) {
      return cached;
    }
  }

  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(`API request failed: ${response.status} ${response.statusText}`);
    error.response = { data: errorData, status: response.status };
    throw error;
  }

  const data = await response.json();
  markServerAwake();

  if (useCache) {
    setToMemoryCache(cacheKey, data);
  }

  return data;
}

let serverKnownAwake = false;

export function isServerKnownAwake() {
  return serverKnownAwake;
}

export function markServerAwake() {
  serverKnownAwake = true;
}

export function getCachedData(endpoint) {
  return getFromMemoryCache(endpoint);
}

export async function getHealth() {
  // Health check should bypass cache to reflect true live connectivity
  const res = await apiRequest('/health', { skipCache: true });
  if (res?.status === 'ok') {
    markServerAwake();
  }
  return res;
}