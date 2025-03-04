# cache-layer

> [!CAUTION]
> This library is still in development and may contain bugs or incomplete features.
> Additionally, the API may completely change in the future.
> Use at your own risk.

A layer on top of the vanilla objects from Minecraft Bedrock Edition Script API that provides a simple cache mechanism.

## Usage

Currently, the library is not published to any package managers. To use it, you will need to clone the repository, build it, and then link it to your project.

```bash
git clone https://github.com/Bedrock-OSS/cache-layer.git
cd cache-layer
npm install
npm run build
npm link
```

Then, in your project, you can use the library by linking it to your project.

```bash
npm link @bedrock-oss/cache-layer
```

Now instead of importing `world` or `system` from `@minecraft/server`, you can import it from `@bedrock-oss/cache-layer`.

```ts
import { world } from "@bedrock-oss/cache-layer";

world.sendMessage("Hello, world!");
```

## How it works

The library uses a combination of proxies and buckets to cache the values of objects. When an object is accessed, the library checks if it has a specific cache mechanism for that object.

## Currently support cache

Currently, the library supports caching for the following properties and methods:
 - `Player.getGameMode()`
 - `Player.setGameMode()`
 - `Entity.getDynamicProperty()`
 - `Entity.setDynamicProperty()`
 - `Entity.dimension`

The support right now is limited while the API is being developed.

## Contributing

Feel free to raise an issue or submit a pull request if you have any improvements or features to suggest.

## License

This project is licensed under the MIT License.