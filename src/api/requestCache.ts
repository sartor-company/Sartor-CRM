/**
 * Shared in-flight + TTL cache for GET list endpoints.
 * Prevents duplicate parallel requests across pages/modals.
 */

type CacheEntry = {
  at: number;
  promise: Promise<unknown>;
};

const store = new Map<string, CacheEntry>();

const DEFAULT_TTL_MS = 30_000;

export function cachedRequest<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = DEFAULT_TTL_MS,
): Promise<T> {
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < ttlMs) {
    return hit.promise as Promise<T>;
  }

  const promise = fetcher().catch((err) => {
    store.delete(key);
    throw err;
  });

  store.set(key, { at: Date.now(), promise });
  return promise;
}

export function invalidateRequestCache(prefix?: string) {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
