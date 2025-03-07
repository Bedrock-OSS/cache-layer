import {
  Dimension,
  Entity,
  PlayerDimensionChangeAfterEvent,
  TeleportOptions,
  Vector3,
  world,
} from "@minecraft/server";
import { Bucket } from "./CacheBucket";
import AbstractCache, { isProxy, registerProxy } from "./AbstractCache";

export default class EntityCache<T extends Entity> extends AbstractCache<T> {
  private static dynamicPropertiesCache: Bucket = new Bucket();
  protected static _cache: Bucket = new Bucket();
  protected readonly id: string;

  protected constructor(protected readonly entity: T) {
    super();
    this.id = entity.id;
  }

  /**
   * Retrieves a proxied version of the given entity.
   *
   * If the provided entity is already a proxy, it is returned as-is. Otherwise, a new
   * proxy is created for the entity using an instance of `EntityCache` as the proxy handler.
   *
   * @param entity - The entity to be proxied.
   * @returns A proxied version of the input entity.
   */
  public static get(entity: Entity): Entity {
    if (isProxy(entity)) {
      return entity;
    }
    return new Proxy(entity, new EntityCache(entity));
  }

  /**
   * Clears both the primary entity cache and the dynamic properties cache.
   *
   * @remarks
   * This method is used to reset the cache data by removing all cached entries,
   * ensuring that subsequent operations work with a fresh state.
   */
  public static resetCache(): void {
    EntityCache._cache.clear();
    EntityCache.dynamicPropertiesCache.clear();
  }

  // Static initialization
  static {
    registerProxy<Entity>(
      "Entity",
      (obj) => obj.addEffect && obj.typeId !== "minecraft:player",
      (obj) => new EntityCache(obj)
    );
  }

  //#region Dimension

  /**
   * When the script gets or sets the dimension of an entity, it will register a listener, to keep the cache up to date.
   */

  private static readonly DimensionBucket = "dimension";
  private static dimensionListener:
    | ((arg0: PlayerDimensionChangeAfterEvent) => void)
    | undefined;
  private static registerDimensionListener() {
    if (this.dimensionListener !== undefined) {
      return;
    }
    // ? What to do in case of an entity dimension change? 
    // ? Teleport methods are already covered, but entity might cross dimensions through a portal
    this.dimensionListener = world.afterEvents.playerDimensionChange.subscribe(
      (e) => {
        EntityCache._cache.set(
          EntityCache.DimensionBucket,
          e.player.id,
          e.toDimension
        );
      }
    );
  }
  get dimension(): Dimension {
    EntityCache.registerDimensionListener();
    return EntityCache._cache.get(
      EntityCache.DimensionBucket,
      this.id,
      () => this.entity.dimension
    ) as Dimension;
  }

  // Listen to another potential dimension changes

  teleport(location: Vector3, teleportOptions?: TeleportOptions): void {
    this.entity.teleport(location, teleportOptions);
    if (teleportOptions?.dimension) {
      EntityCache._cache.set(
        EntityCache.DimensionBucket,
        this.id,
        teleportOptions.dimension
      );
    }
  }

  tryTeleport(location: Vector3, teleportOptions?: TeleportOptions): boolean {
    const result = this.entity.tryTeleport(location, teleportOptions);
    if (result && teleportOptions?.dimension) {
      EntityCache._cache.set(
        EntityCache.DimensionBucket,
        this.id,
        teleportOptions.dimension
      );
    }
    return result;
  }

  //#endregion

  //#region Dynamic Properties

  getDynamicProperty(
    identifier: string
  ): boolean | number | string | Vector3 | undefined {
    return EntityCache.dynamicPropertiesCache.get(
      this.id,
      identifier,
      () => this.entity.getDynamicProperty(identifier)
    );
  }
  setDynamicProperty(
    identifier: string,
    value?: boolean | number | string | Vector3
  ): void {
    EntityCache.dynamicPropertiesCache.set(
      this.id,
      identifier,
      value
    );
    this.entity.setDynamicProperty(identifier, value);
  }
  clearDynamicProperties(): void {
    EntityCache.dynamicPropertiesCache.clear(this.id);
  }

  //#endregion
}
