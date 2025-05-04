// src/utils/cache.ts

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const CACHE_PREFIX = 'hn_clone_cache_';

/**
 * Sets an item in localStorage with an expiry time.
 * @param key The cache key.
 * @param data The data to store.
 * @param ttlMinutes Time to live in minutes.
 */
export const setCache = <T>(key: string, data: T, ttlMinutes: number): void => {
  const fullKey = CACHE_PREFIX + key;
  const expiry = Date.now() + ttlMinutes * 60 * 1000;
  const entry: CacheEntry<T> = { data, expiry };
  try {
    localStorage.setItem(fullKey, JSON.stringify(entry));
    console.log(`[Cache SET] Key: ${key}, TTL: ${ttlMinutes} mins`);
  } catch (error) {
    console.error(`[Cache Error] Failed to set item for key ${key}:`, error);
    // Handle potential storage quota exceeded errors
    // Maybe implement a cache eviction strategy here if needed
  }
};

/**
 * Gets an item from localStorage if it exists and hasn't expired.
 * @param key The cache key.
 * @returns The cached data or null if not found or expired.
 */
export const getCache = <T>(key: string): T | null => {
  const fullKey = CACHE_PREFIX + key;
  try {
    const item = localStorage.getItem(fullKey);
    if (!item) {
      console.log(`[Cache MISS] Key: ${key} (Not found)`);
      return null;
    }

    const entry: CacheEntry<T> = JSON.parse(item);

    if (Date.now() > entry.expiry) {
      console.log(`[Cache MISS] Key: ${key} (Expired)`);
      localStorage.removeItem(fullKey); // Clean up expired item
      return null;
    }

    console.log(`[Cache HIT] Key: ${key}`);
    return entry.data;
  } catch (error) {
    console.error(`[Cache Error] Failed to get or parse item for key ${key}:`, error);
    // If parsing fails, remove the corrupted item
    localStorage.removeItem(fullKey);
    return null;
  }
};

/**
 * Removes an item from the cache.
 * @param key The cache key.
 */
export const removeCache = (key: string): void => {
  const fullKey = CACHE_PREFIX + key;
  localStorage.removeItem(fullKey);
  console.log(`[Cache REMOVE] Key: ${key}`);
};

/**
 * Clears all items managed by this cache utility.
 */
export const clearCache = (): void => {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
  console.log('[Cache CLEAR] All HN Clone cache cleared.');
};