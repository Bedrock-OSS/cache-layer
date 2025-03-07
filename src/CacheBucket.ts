export class Bucket {
  // bucket -> key -> value
  private cache: Map<string, Map<string, CacheEntry>> = new Map();

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

  set(bucket: string, key: string, value: any): void {
    if (!this.cache.has(bucket)) {
      this.cache.set(bucket, new Map());
    }
    this.cache.get(bucket)!.set(key, {value});
  }

  clear(bucket?: string): void {
    if (bucket === undefined) {
      this.cache.clear();
      return;
    }
    this.cache.delete(bucket);
  }
}

interface CacheEntry {
  value: any;
}