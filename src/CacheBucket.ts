export class IdBucket {
  // bucket -> entityId -> key -> value
  private cache: Map<string, Map<string, Map<string, CacheEntry>>> = new Map();

  get<T>(bucket: string, entityId: string, key: string, getter: () => T): T {
    if (!this.cache.has(bucket)) {
      this.cache.set(bucket, new Map());
    }
    const bucketMap = this.cache.get(bucket)!;
    if (!bucketMap.has(entityId)) {
      bucketMap.set(entityId, new Map());
    }
    const entityMap = bucketMap.get(entityId)!;
    if (!entityMap.has(key)) {
      entityMap.set(key, {value: getter()});
    }
    return entityMap.get(key)!.value;
  }

  set(bucket: string, entityId: string, key: string, value: any): void {
    if (!this.cache.has(bucket)) {
      this.cache.set(bucket, new Map());
    }
    const bucketMap = this.cache.get(bucket)!;
    if (!bucketMap.has(entityId)) {
      bucketMap.set(entityId, new Map());
    }
    bucketMap.get(entityId)!.set(key, {value});
  }

  clear(bucket: string, entityId: string): void {
    if (!this.cache.has(bucket)) {
      return;
    }
    const bucketMap = this.cache.get(bucket)!;
    bucketMap.delete(entityId);
  }
}
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

  clear(bucket: string): void {
    this.cache.delete(bucket);
  }
}

interface CacheEntry {
  value: any;
}