import {
  GameMode,
  Player,
  PlayerGameModeChangeAfterEvent,
  world,
} from "@minecraft/server";
import EntityCache from "./Entity";
import { isProxy, registerProxy } from "./AbstractCache";

export default class PlayerCache extends EntityCache<Player> {
  protected static readonly _cache = EntityCache._cache;

  protected constructor(player: Player) {
    super(player);
  }

  /**
   * Gets the cached version of a player.
   * @param player The player to get the cached version of.
   * @returns The cached version of the player.
   */
  public static get(player: Player): Player {
    if (isProxy(player)) {
      return player;
    }
    return new Proxy(player, new PlayerCache(player));
  }

  // Static initialization
  static {
    registerProxy<Player>(
      "Player",
      (obj) => obj.addEffect && obj.typeId === 'minecraft:player',
      (obj) => new PlayerCache(obj)
    );
  }

  //#region GameMode

  /**
   * When the script gets or sets the game mode of a player, it will register a listener, to keep the cache up to date.
   */

  private static readonly GameModeBucket = "gameMode";
  private static gameModeListener:
    | ((arg0: PlayerGameModeChangeAfterEvent) => void)
    | undefined;
  private static registerGameModeListener() {
    if (this.gameModeListener !== undefined) {
      return;
    }
    this.gameModeListener = world.afterEvents.playerGameModeChange.subscribe(
      (e) => {
        EntityCache._cache.set(
          PlayerCache.GameModeBucket,
          e.player.id,
          e.toGameMode
        );
      }
    );
  }

  getGameMode(): GameMode {
    PlayerCache.registerGameModeListener();
    return PlayerCache._cache.get(
      PlayerCache.GameModeBucket,
      this.id,
      () => this.entity.getGameMode()
    ) as GameMode;
  }

  setGameMode(gameMode: GameMode): void {
    PlayerCache.registerGameModeListener();
    PlayerCache._cache.set(PlayerCache.GameModeBucket, this.id, gameMode);
    this.entity.setGameMode(gameMode);
  }

  //#endregion

}
