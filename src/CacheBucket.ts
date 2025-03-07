export class Bucket {
  // bucket -> key -> value
  private cache: Map<string, Map<string, CacheEntry>> = new Map();

  /**
   * Retrieves a value of type T from the specified cache bucket.
   *
   * If the bucket does not exist, it creates a new one. Similarly, if the key is not found
   * within the bucket, it uses the provided getter function to generate and cache the value.
   *
   * @typeParam T - The type of the value being cached.
   * @param bucket - The identifier of the cache bucket.
   * @param key - The key within the bucket associated with the cached value.
   * @param getter - A function that produces a value of type T if the key is not present in the cache.
   * @returns The value stored in the cache, either previously generated or newly computed.
   */
  get<T>(bucket: string, key: string, getter: () => T): T {
    if (!this.cache.has(bucket)) {
      this.cache.set(bucket, new Map());
    }
    const bucketMap = this.cache.get(bucket)!;
    if (!bucketMap.has(key)) {
      bucketMap.set(key, {value: getter()});
    }
    return bucketMap.get(key)!.value;
  }

  /**
   * Stores a value in the specified cache bucket under the given key.
   *
   * If the bucket does not exist, it is created and initialized as a new Map.
   * The provided value is then wrapped in an object and stored in the corresponding bucket.
   *
   * @param bucket - The name of the cache bucket.
   * @param key - The identifier key for the cached value.
   * @param value - The value to be cached.
   */
  set(bucket: string, key: string, value: any): void {
    if (!this.cache.has(bucket)) {
      this.cache.set(bucket, new Map());
    }
    this.cache.get(bucket)!.set(key, {value});
  }

  /**
   * Clears the cache bucket.
   *
   * If no bucket name is provided, the entire cache is cleared.
   * Otherwise, only the specified bucket is removed from the cache.
   *
   * @param bucket - Optional. The name of the bucket to clear. If omitted, all buckets are cleared.
   */
  clear(bucket?: string): void {
    if (bucket === undefined) {
      this.cache.clear();
      return;
    }
    this.cache.delete(bucket);
  }
}

/**
 * Represents an entry in the cache that holds a value of any type.
 *
 * @remarks
 * This interface is used to encapsulate data items for caching purposes.
 *
 * @property value - The data stored in the cache entry.
 */
interface CacheEntry {
  value: any;
}