import NodeCache from 'node-cache';

class CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 600,
      checkperiod: 120,
      useClones: true,
    });
  }

  get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    return value;
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    return ttl ? this.cache.set(key, value, ttl) : this.cache.set(key, value);
  }

  del(keys: string | string[]): number {
    return this.cache.del(keys);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  flushAll(): void {
    this.cache.flushAll();
  }

  getStats(): NodeCache.Stats {
    return this.cache.getStats();
  }
}

export const cacheService = new CacheService();
