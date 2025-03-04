import { system, world } from "@minecraft/server";
import { ReplaceWithProxy } from "./AbstractCache";
import "./Entity";
import "./Player";

const worldCache = new Proxy(world, new ReplaceWithProxy());
const systemCache = new Proxy(system, new ReplaceWithProxy());

export { worldCache as world, systemCache as system };
