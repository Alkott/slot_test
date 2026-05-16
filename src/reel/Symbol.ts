import { Container, Graphics, Text } from 'pixi.js'
import { getSymbolData, randomSymbolIndex } from './symbolData'

export class Symbol extends Container {
  private bg = new Graphics()
  private label = new Text({
    text: '1',
    style: { fill: 0xffffff, fontSize: 32, fontWeight: 'bold', align: 'center' },
  })

  constructor() {
    super()
    this.label.anchor.set(0.5)
    this.addChild(this.bg, this.label)
  }

  randomize(width: number, height: number): void {
    const data = getSymbolData(randomSymbolIndex())
    this.bg.clear()
    this.bg.rect(1, 1, width - 2, height - 2).fill(data.color)
    this.label.text = data.label
    this.label.x = width / 2
    this.label.y = height / 2
  }
}
