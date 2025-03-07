import { system, world } from "@minecraft/server";
import { ReplaceWithProxy } from "./AbstractCache";
import "./Entity";
import "./Player";
import CacheLayer from "./CacheLayer";
import PlayerCache from "./Player";
import EntityCache from "./Entity";

const worldCache = new Proxy(world, new ReplaceWithProxy());
const systemCache = new Proxy(system, new ReplaceWithProxy());

export { worldCache as world, systemCache as system, CacheLayer, EntityCache, PlayerCache };
