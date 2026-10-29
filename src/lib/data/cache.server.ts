type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const store = new Map<string, CacheEntry<any>>();

/**
 * Retrieve cached value if present and not expired
 */
export function getCached<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

/**
 * Store value in cache with a TTL in seconds (default: 60s)
 */
export function setCached<T>(key: string, data: T, ttlSeconds = 60): T {
  store.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
  return data;
}

/**
 * Invalidate a specific key or all keys matching a prefix
 */
export function invalidateCache(prefix?: string): void {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of Array.from(store.keys())) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}
