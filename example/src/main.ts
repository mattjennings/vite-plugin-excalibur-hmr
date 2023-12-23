import * as ex from "excalibur"
import hot from "vite-plugin-excalibur-hmr/hot"
import { loader } from "./resources"
import Level from "./scenes/level"
import Level2 from "./scenes/level2"

const engine = new ex.Engine({
  backgroundColor: ex.Color.fromHex("#5fcde4"),
  width: 600,
  height: 400,
  fixedUpdateFps: 60,
  // Turn off anti-aliasing for pixel art graphics
  antialiasing: false,
})

if (import.meta.env.DEV) {
  hot(engine)
}

// Create collision groups for the game
ex.CollisionGroupManager.create("player")
ex.CollisionGroupManager.create("enemy")
ex.CollisionGroupManager.create("floor")

// Set global gravity, 800 pixels/sec^2
ex.Physics.acc = new ex.Vector(0, 800)

// Setup first level as a custom scene
const level = new Level({ a: true })
engine.add("level", level)
engine.add("level2", new Level2())
engine.goToScene("level")

// Game events to handle
engine.on("hidden", () => {
  console.log("pause")
  engine.stop()
})
engine.on("visible", () => {
  console.log("start")
  engine.start()
})

// Start the engine
engine.start(loader).then(() => {
  console.log("game start")
})

// For test hook
;(window as any).engine = engine
;(window as any).level = level
