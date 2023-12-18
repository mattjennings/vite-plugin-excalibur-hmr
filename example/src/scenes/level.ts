import * as ex from "excalibur"
import { Baddie } from "../actors/baddie"
import { Bot } from "../actors/bot"
import { Floor } from "../actors/floor"
import { NPC } from "../actors/npc"

export default class Level extends ex.Scene {
  constructor(args) {
    console.log("args", args)
    super()
  }

  onActivate() {
    const engine = this.engine

    // Compose actors in scene
    const actor = new Bot(
      engine.halfDrawWidth + 100,
      engine.halfDrawHeight - 100
    )

    const baddie = new Baddie(engine.halfDrawWidth - 200, 300 - 30, 1)
    const baddie2 = new Baddie(engine.halfDrawWidth + 200, 300 - 30, -1)

    const npc = new NPC(400, 170)

    const floor = new Floor(0, 300, 15, 1)
    const otherFloor = new Floor(engine.halfDrawWidth + 50, 200, 5, 1)

    this.add(actor)
    this.add(npc)
    this.add(baddie)
    this.add(baddie2)
    this.add(floor)
    this.add(otherFloor)

    // For the test harness to be predicable
    if (!(window as any).__TESTING) {
      // Create camera strategy
      this.camera.clearAllStrategies()
      this.camera.strategy.elasticToActor(actor, 0.05, 0.1)
    }
  }
}
