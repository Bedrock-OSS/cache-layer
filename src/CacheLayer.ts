import { getOriginalInstance, isProxy } from "./AbstractCache";
import EntityCache from "./Entity";

export default class CacheLayer {
  public static resetCache(): void {
    EntityCache.resetCache();
  }
  public static isProxy(obj: any): boolean {
    return isProxy(obj);
  }

  public static getOriginalInstance<T>(obj: T): T {
    return getOriginalInstance<T>(obj);
  }
}