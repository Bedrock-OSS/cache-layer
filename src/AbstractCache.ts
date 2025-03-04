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

interface ProxyConstructor<T extends object> {
  handlerConstructor: (obj: T) => AbstractCache<T>;
  predicate: (obj: any) => boolean;
  id: string;
}

const proxies: ProxyConstructor<any>[] = [];
const replaceWithProxy = new ReplaceWithProxy();

/**
 * Registers a proxy for a specific type of object.
 * @param id The id of the proxy.
 * @param predicate A function that takes an object and returns true if it's a proxy for the given type.
 * @param handlerConstructor A function that takes an object and returns an instance of the proxy.
 */
export function registerProxy<T extends object>(
  id: string,
  predicate: (obj: any) => boolean,
  handlerConstructor: (obj: T) => AbstractCache<T>
) {
  proxies.push({ predicate, handlerConstructor, id });
}

/**
 * Proxifies an object, replacing it with a proxy if necessary.
 * @param obj The object to proxify.
 * @param thisObj The object that the proxified object will be bound to.
 * @returns The proxified object.
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
 * Checks if an object is a proxy.
 * @param obj The object to check.
 * @returns True if the object is a proxy, false otherwise.
 */
export function isProxy(obj: any): boolean {
  return !!obj.__originalInstance__;
}

/**
 * Returns the original instance of the object, if it's a proxy.
 * @param obj The object to get the original instance of.
 * @returns The original instance of the object.
 */
export function getOriginalInstance<T>(obj: T): T {
  const orig = (obj as any).__originalInstance__;
  if (orig === undefined) {
    return obj;
  }
  return orig;
}
