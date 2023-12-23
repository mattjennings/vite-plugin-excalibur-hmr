# vite-plugin-excalibur-hmr

Adds scene hot reloading to [Excalibur.js](https://excaliburjs.com/) games.

This does not support hot reloading of actors, only scenes. When you make a change that affects a scene it will reload it without restarting the game.

It's mainly a proof-of-concept, but so there's probably issues, but it should work well enough for most cases.

## Installation

```bash
npm install -d vite-plugin-excalibur-hmr
```

## Usage

1. Add the plugin to your vite config:

```ts
import { defineConfig } from "vite"
import hmr from "vite-plugin-excalibur-hmr"

export default defineConfig({
  plugins: [hmr()],
})
```

2. Mark your engine as hot reloadable:

```ts
import hot from "vite-plugin-excalibur-hmr/hot"

const engine = new ex.Engine({
  // ...
})

if (import.meta.env.DEV) {
  hot(engine)
}
```

## Making Scenes Hot Reloadable

In order for Scenes to be hot-reloadable, they must a default export in a file that is either under a `scenes` directory or ends with a `.scene.ts` or `.scene.js` extension.

Example:

```ts
// src/scenes/level1.ts or src/level1.scene.ts
import { Scene } from "excalibur"

export default class Level1 extends Scene {
  // ...
}
```

Whenever changes are made to the scene or any of its imported modules the scene will be hot reloaded in the engine. If that scene is currently active then it will restart.
