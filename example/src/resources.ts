import * as ex from "excalibur"

const Resources = {
  bot: new ex.ImageSource("/excalibot.png"),
  botRed: new ex.ImageSource("/excalibot-red.png"),
  baddie: new ex.ImageSource("/baddie.png"),
  block: new ex.ImageSource("/block.png"),
  npc: new ex.ImageSource("/npc.png"),
  jump: new ex.Sound("/jump.wav"),
  hit: new ex.Sound("/hurt.wav"),
  gotEm: new ex.Sound("/gottem.wav"),
}

const loader = new ex.Loader()

const botSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.bot,
  grid: {
    columns: 8,
    rows: 1,
    spriteWidth: 32,
    spriteHeight: 32,
  },
})
const botRedSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.botRed,
  grid: {
    columns: 8,
    rows: 1,
    spriteWidth: 32,
    spriteHeight: 32,
  },
})
const baddieSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.baddie,
  grid: {
    columns: 6,
    rows: 1,
    spriteWidth: 32,
    spriteHeight: 32,
  },
})
const blockSprite = Resources.block.toSprite()
const npcSprite = Resources.npc.toSprite()

for (const res in Resources) {
  loader.addResource((Resources as any)[res])
}

export {
  Resources,
  loader,
  botSpriteSheet,
  botRedSpriteSheet,
  baddieSpriteSheet,
  blockSprite,
  npcSprite,
}
