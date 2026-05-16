import { Container, Text } from 'pixi.js'
import { rollingAverage } from './fpsAverage'

export class FpsCounter extends Container {
  private labelText: Text
  private samples: number[] = []

  constructor() {
    super()
    this.labelText = new Text({
      text: 'FPS: --',
      style: { fill: 0x00ff88, fontSize: 18, fontWeight: 'bold' },
    })
    this.labelText.x = 8
    this.labelText.y = 8
    this.addChild(this.labelText)
  }

  update(deltaMS: number): void {
    if (deltaMS <= 0) return
    const fps = 1000 / deltaMS
    const avg = rollingAverage(this.samples, fps)
    this.samples.push(fps)
    if (this.samples.length > 30) this.samples.shift()
    this.labelText.text = `FPS: ${Math.round(avg)}`
  }
}
