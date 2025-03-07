import { GameMode } from "@minecraft/server";
import { CacheLayer, world } from ".";

describe("Entity", () => {

  beforeEach(() => {
    CacheLayer.resetCache();
  });

  test("setGameMode", () => {
    const entity = world.getAllPlayers()[0]!;
    const value = GameMode.creative;
    (entity as any).resetCounters();
    // Set value
    entity.setGameMode(value);
    // Ensure, that the value is set
    expect(entity.getGameMode()).toBe(value);
    // Ensure, that the cache is used
    expect((entity as any).getCount("setGameMode")).toBe(1);
    expect((entity as any).getCount("getGameMode")).toBe(0);
  });

  test("getGameMode", () => {
    const entity = world.getAllPlayers()[0]!;
    const value = GameMode.creative;
    (entity as any).resetCounters();
    // Ensure, that the value is set
    expect(entity.getGameMode()).toBe(value);
    // Ensure, that the cache is used
    expect((entity as any).getCount("getGameMode")).toBe(1);
  });
});
