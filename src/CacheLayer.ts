import { getOriginalInstance, isProxy } from "./AbstractCache";
import EntityCache from "./Entity";

export default class CacheLayer {
  /**
   * Resets the cache of all objects.
   */
  public static resetCache(): void {
    EntityCache.resetCache();
  }
  
  /**
   * Checks if an object is a proxy.
   * @param obj The object to check.
   * @returns True if the object is a proxy, false otherwise.
   */
  public static isProxy(obj: any): boolean {
    return isProxy(obj);
  }

  /**
   * Returns the original instance of the object, if it's a proxy or the object itself otherwise.
   * @param obj The object to get the original instance of.
   * @returns The original instance of the object.
   */
  public static getOriginalInstance<T>(obj: T): T {
    return getOriginalInstance<T>(obj);
  }
}