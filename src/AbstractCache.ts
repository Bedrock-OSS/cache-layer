import { system, world } from "@minecraft/server";

export default abstract class AbstractCache<T extends object>
  implements ProxyHandler<T>
{
  get(target: T, p: string | symbol) {
    if (p === "__originalInstance__") {
      return target;
    }
    if (Reflect.has(this, p)) {
      const value = Reflect.get(this, p, this);
      // If the value is a function, bind it to the handler instance.
      if (typeof value === "function") {
        return value.bind(this);
      }
      return proxify(value, target);
    }
    return proxify(Reflect.get(target, p, target), target);
  }
}

export class ReplaceWithProxy<T extends object> implements ProxyHandler<T> {
  get(target: T, p: string | symbol) {
    if (p === "__originalInstance__") {
      return target;
    }
    return proxify(Reflect.get(target, p, target), target);
  }
}

/**
 * Represents the configuration for creating a proxy of an object using a cache mechanism.
 *
 * @template T - The type of the object to be proxied.
 *
 * @property handlerConstructor A function that receives an object of type T and returns an instance of AbstractCache<T>.
 * @property predicate A function to test if a given object meets the criteria to be proxied.
 * @property id A unique identifier for this proxy configuration.
 */
interface ProxyConstructor<T extends object> {
  handlerConstructor: (obj: T) => AbstractCache<T>;
  predicate: (obj: any) => boolean;
  id: string;
}

const proxies: ProxyConstructor<any>[] = [];
const replaceWithProxy = new ReplaceWithProxy();

/**
 * Registers a proxy that associates a unique identifier with a predicate and a handler constructor.
 *
 * This function adds a new proxy configuration that can later be used to determine if a given object
 * should be handled by the associated cache and to instantiate the appropriate cache handler.
 *
 * @template T - The type of objects that the cache and its corresponding handler will manage.
 * @param id - A unique identifier for the proxy.
 * @param predicate - A function that takes an object as input and returns true if the object meets the criteria
 *                    for this proxy, and false otherwise.
 * @param handlerConstructor - A function that, given an object of type T, returns an instance of AbstractCache<T>
 *                             configured to handle that object.
 */
export function registerProxy<T extends object>(
  id: string,
  predicate: (obj: any) => boolean,
  handlerConstructor: (obj: T) => AbstractCache<T>
) {
  proxies.push({ predicate, handlerConstructor, id });
}

/**
 * Recursively wraps the target object or function in a proxy to enable customized behavior through handlers.
 *
 * - When the target is null or undefined, it is returned as-is.
 * - If the target is already a proxy, the original proxy is returned to prevent double-wrapping.
 * - For objects:
 *   - If the object is an array, each element is processed with proxify.
 *   - If a registered proxy predicate matches the object, a new proxy is created using its corresponding handler.
 *   - Otherwise, a default proxy handler is applied.
 * - For functions:
 *   - A new function is returned that proxies all its received arguments.
 *   - The result of invoking the original function is also processed with proxify.
 *
 * @param obj - The object or function to be proxified.
 * @param thisObj - The context to bind when invoking functions.
 * @returns The proxified object or function.
 */
function proxify(obj: any, thisObj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (isProxy(obj)) {
    return obj;
  }
  const type = typeof obj;
  if (type === "object") {
    // Check if it's an array
    if (Array.isArray(obj)) {
      // If so, map all elements to proxies
      return obj.map((x) => proxify(x, thisObj));
    }
    for (const proxy of proxies) {
      if (proxy.predicate(obj)) {
        return new Proxy(obj, proxy.handlerConstructor(obj));
      }
    }
    return new Proxy(obj, replaceWithProxy);
  } else if (type === "function") {
    // If it's a function, create a new function that proxies all args and results
    return function (this: any, ...args: any[]) {
      // we want to go through all args we get and replace them with proxies
      args = args.map((arg) => proxify(arg, thisObj));
      return proxify(obj.apply(thisObj, args), thisObj);
    };
  }
  return obj;
}

/**
 * Determines whether the given object is a proxy.
 *
 * This function checks if the provided object contains the '__originalInstance__' property,
 * which is used as an indicator that the object is a proxy of another instance.
 *
 * @param obj - The object to inspect.
 * @returns True if the object is a proxy (i.e., contains the '__originalInstance__' property), false otherwise.
 */
export function isProxy(obj: any): boolean {
  return !!obj.__originalInstance__;
}

/**
 * Returns the original instance of the provided object if it was wrapped.
 *
 * This function examines the given object for the presence of an `__originalInstance__`
 * property. If this property is defined, its value is returned, indicating that the object
 * is a wrapper around the actual instance. If not, the original object itself is returned.
 *
 * @param obj - The object that may contain an original instance.
 * @returns The original instance if it exists; otherwise, the provided object.
 */
export function getOriginalInstance<T>(obj: T): T {
  const orig = (obj as any).__originalInstance__;
  if (orig === undefined) {
    return obj;
  }
  return orig;
}

const worldCache = proxify(world, world);
const systemCache = proxify(system, system);

export { worldCache as world, systemCache as system };