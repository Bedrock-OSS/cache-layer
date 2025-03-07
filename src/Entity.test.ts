import { CacheLayer, world } from ".";

describe("Entity", () => {

  beforeEach(() => {
    CacheLayer.resetCache();
  });

  test("setDynamicProperty", () => {
    const entity = world.getEntity("0")!;
    const value = Math.random();
    (entity as any).resetCounters();
    // Set value
    entity.setDynamicProperty("test", value);
    // Ensure, that the value is set
    expect(entity.getDynamicProperty("test")).toBe(value);
    // Ensure, that the cache is used
    expect((entity as any).getCount("getDynamicProperty")).toBe(0);
    // Ensure, that the value is natively set
    expect((entity as any).getCount("setDynamicProperty")).toBe(1);
  });

  test("getDynamicProperty", () => {
    const entity = world.getEntity("0")!;
    const value = Math.random();
    // Set value
    entity.setDynamicProperty("test", value);
    // Reset cache and counters
    (entity as any).resetCounters();
    CacheLayer.resetCache();
    // Ensure, that the value is correct
    expect(entity.getDynamicProperty("test")).toBe(value);
    // Ensure, that the value is fetched if it's not cached
    expect((entity as any).getCount("getDynamicProperty")).toBe(1);
  });

  test("dimension", () => {
    const entity = world.getEntity("0")!;
    const value = entity.dimension;
    expect(entity.dimension.id).toBe(value.id);
    expect((entity as any).getCount("dimension")).toBe(1);
  });
});
