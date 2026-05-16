import { Container, Sprite, Texture } from 'pixi.js'
import { SYMBOL_TEXTURE_NAMES } from './symbolTextures'

export class Symbol extends Container {
  private sprite: Sprite

  constructor() {
    super()
    this.sprite = new Sprite()
    this.addChild(this.sprite)
  }

  randomize(width: number, height: number): void {
    const name = SYMBOL_TEXTURE_NAMES[Math.floor(Math.random() * SYMBOL_TEXTURE_NAMES.length)]
    this.sprite.texture = Texture.from(name)
    this.sprite.width = width
    this.sprite.height = height
  }
}
