import { Dimension, Entity, GameMode, RawMessage, Vector3 } from "@minecraft/server";

jest.mock('@minecraft/server', () => {
  const entities: Record<string, Entity> = {};
  const mockEvent = {
    subscribe: jest.fn(),
  }
  /**
   * A class that keeps track of native method calls.
   */
  class MockNative {
    private nativeCount: Record<string, number> = {};
    /**
     * Increments the count of a native method call.
     * @param name The name of the native method.
     */
    incCount(name: string): void {
      if (this.nativeCount[name] === undefined) {
        this.nativeCount[name] = 0;
      }
      this.nativeCount[name]++;
    }
    /**
     * Resets the count of all native method calls.
     */
    resetCounters(): void {
      this.nativeCount = {};
    }
    /**
     * Gets the count of a native method call.
     * @param name The name of the native method.
     * @returns The count of the native method call.
     */
    getCount(name: string): number {
      return this.nativeCount[name] || 0;
    }
  }
  /**
   * A class that adds dynamic properties to the mock.
   */
  class MockDynamicProperties extends MockNative {
    private properties: Record<string, boolean | number | string | Vector3> = {};
    getDynamicProperty(identifier: string): boolean | number | string | Vector3 | undefined {
      this.incCount('getDynamicProperty');
      return this.properties[identifier];
    }
    setDynamicProperty(identifier: string, value: boolean | number | string | Vector3 | undefined): void {
      this.incCount('setDynamicProperty');
      if (value === undefined) {
        delete this.properties[identifier];
      } else {
        this.properties[identifier] = value;
      }
    }
  }
  /**
   * A class that represents a dimension.
   */
  class MockDimension extends MockNative {
    constructor(public readonly id: string) {
      super();
    }
  }
  /**
   * A map of dimensions.
   */
  const dimensions: Record<string, MockDimension> = {
    "minecraft:overworld": new MockDimension("minecraft:overworld"),
    "minecraft:nether": new MockDimension("minecraft:nether"),
    "minecraft:the_end": new MockDimension("minecraft:the_end"),
  };
  /**
   * A class that represents an entity.
   */
  class MockEntity extends MockDynamicProperties {
    private _dimension: Dimension;
    constructor(public readonly typeId: string, public readonly id: string) {
      super();
      this._dimension = dimensions["minecraft:overworld"] as any;
    }
    // cache-layer uses this method to check if the object is an entity.
    addEffect(): void {
      throw new Error('Method not implemented.');
    }
    remove(): void {
      delete entities[this.id];
    }
    get dimension(): Dimension {
      this.incCount('dimension');
      return this._dimension;
    }
  }
  /**
   * A class that represents a player.
   */
  class MockPlayer extends MockEntity {
    private gameMode: GameMode;
    constructor(id: string) {
      super('minecraft:player', id);
      this.gameMode = 'survival' as GameMode;
    }
    getGameMode(): GameMode {
      this.incCount('getGameMode');
      return this.gameMode;
    }
    setGameMode(gameMode: GameMode): void {
      this.incCount('setGameMode');
      this.gameMode = gameMode;
    }
  }
  /**
   * A class that represents the world.
   */
  class MockWorld extends MockDynamicProperties {
    public readonly afterEvents = {
      playerDimensionChange: mockEvent,
      playerGameModeChange: mockEvent,
    };
    constructor() {
      super();
      const id = Math.floor(Math.random() * 1000000).toString();
      entities[id] = new MockPlayer(id) as any;
    }
    sendMessage(message: (RawMessage | string)[] | RawMessage | string): void {
      console.log(message);
    }
    getAllPlayers(): Entity[] {
      this.incCount('getAllPlayers');
      return Object.values(entities).filter((e) => e.typeId === 'minecraft:player') as any;
    }
    getEntity(id: string): Entity | undefined {
      this.incCount('getEntity');
      if (entities[id] === undefined) {
        entities[id] = new MockEntity('minecraft:dummy', id) as any;
      }
      return entities[id];
    }
    getDimension(id: string): MockDimension {
      this.incCount('getDimension');
      return dimensions[id];
    }
  }

  return {
    Direction: {
      Down: 'Down',
      East: 'East',
      North: 'North',
      South: 'South',
      Up: 'Up',
      West: 'West',
    },
    GameMode: {
      creative: 'creative',
      survival: 'survival',
      adventure: 'adventure',
      spectator: 'spectator',
    },
    system: {
      afterEvents: {
        scriptEventReceive: mockEvent,
      },
      clearRun: (id:number) => {
        clearInterval(id);
        clearTimeout(id);
      },
      run: (callback: () => void) => {
        return setTimeout(callback, 50);
      },
      runInterval: (callback: () => void, tickInterval?: number): number => {
        return setInterval(callback, tickInterval || 1)[Symbol.toPrimitive]();
      },
      runTimeout: (callback: () => void, tickDelay?: number): number => {
        return setTimeout(callback, tickDelay || 1)[Symbol.toPrimitive]();
      },
    },
    world: new MockWorld() as any,
    Player: MockPlayer,
    Entity: MockEntity,
    World: MockWorld,
  };
}, { virtual: true });