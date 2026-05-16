import { Container, Graphics, Text } from 'pixi.js'
import { getSymbolData, randomSymbolIndex } from './symbolData'

export class Symbol extends Container {
  private bg = new Graphics()
  private labelText = new Text({
    text: '1',
    style: { fill: 0xffffff, fontSize: 32, fontWeight: 'bold', align: 'center' },
  })

  constructor() {
    super()
    this.labelText.anchor.set(0.5)
    this.addChild(this.bg, this.labelText)
  }

  randomize(width: number, height: number): void {
    const data = getSymbolData(randomSymbolIndex())
    this.bg.clear()
    this.bg.rect(1, 1, width - 2, height - 2).fill(data.color)
    this.labelText.text = data.label
    this.labelText.x = width / 2
    this.labelText.y = height / 2
  }
}
