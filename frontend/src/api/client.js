const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// In-memory L1 cache + sessionStorage L2 cache
const memoryCache = new Map();
const CACHE_PREFIX = 'eg_cache_';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getFromSessionCache(key) {
  // Check in-memory first
  if (memoryCache.has(key)) {
    const entry = memoryCache.get(key);
    if (Date.now() - entry.timestamp < CACHE_TTL_MS) {
      return entry.data;
    }
    memoryCache.delete(key);
  }

  // Check sessionStorage
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        memoryCache.set(key, parsed);
        return parsed.data;
      }
      sessionStorage.removeItem(CACHE_PREFIX + key);
    }
  } catch {
    // sessionStorage not available or parsing failed
  }
  return null;
}

function setToSessionCache(key, data) {
  const entry = { data, timestamp: Date.now() };
  memoryCache.set(key, entry);
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // sessionStorage quota exceeded or unavailable
  }
}

export function clearSessionCache() {
  memoryCache.clear();
  try {
    Object.keys(sessionStorage).forEach((k) => {
      if (k.startsWith(CACHE_PREFIX)) {
        sessionStorage.removeItem(k);
      }
    });
  } catch {
    // Ignore error
  }
}

export async function apiRequest(endpoint, options = {}) {
  const isGet = !options.method || options.method.toUpperCase() === 'GET';
  const useCache = isGet && !options.skipCache;
  const cacheKey = endpoint;

  if (useCache) {
    const cached = getFromSessionCache(cacheKey);
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

  if (useCache) {
    setToSessionCache(cacheKey, data);
  }

  return data;
}

export async function getHealth() {
  // Health check should bypass cache to reflect true live connectivity
  return apiRequest('/health', { skipCache: true });
}