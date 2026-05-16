import { Application, Container } from 'pixi.js'
import { Reel } from './reel/Reel'
import { FpsCounter } from './ui/FpsCounter'
import { ROWS } from './config'

export class SlotGame {
  private reels: Reel[] = []
  private reelContainer = new Container()
  private fpsCounter: FpsCounter
  private app: Application

  private spinCompleteCallback: (() => void) | null = null

  constructor(app: Application) {
    this.app = app
    app.stage.addChild(this.reelContainer)

    this.fpsCounter = new FpsCounter()
    app.stage.addChild(this.fpsCounter)

    app.ticker.add((ticker) => {
      for (const reel of this.reels) reel.update(ticker.deltaTime)
      this.fpsCounter.update(ticker.deltaMS)
      if (this.spinCompleteCallback && this.reels.every((r) => r.isIdle)) {
        this.spinCompleteCallback()
        this.spinCompleteCallback = null
      }
    })

    window.addEventListener('resize', () => {
      app.renderer.resize(window.innerWidth, window.innerHeight)
      this.layout()
    })
  }

  addReel(): void {
    const reel = new Reel(ROWS)
    this.reelContainer.addChild(reel)
    this.reels.push(reel)
    this.layout()
  }

  removeReel(): void {
    if (this.reels.length <= 1) return
    const reel = this.reels.pop()!
    this.reelContainer.removeChild(reel)
    reel.destroy()
    this.layout()
  }

  spin(onComplete: () => void): void {
    if (!this.reels.every((r) => r.isIdle)) return
    this.spinCompleteCallback = onComplete
    for (const reel of this.reels) reel.spin()
  }

  get reelCount(): number {
    return this.reels.length
  }

  get isSpinning(): boolean {
    return !this.reels.every((r) => r.isIdle)
  }

  private layout(): void {
    const w = this.app.screen.width
    const h = this.app.screen.height
    const symbolWidth = w / this.reels.length
    const symbolHeight = h / ROWS
    this.reels.forEach((reel, i) => {
      reel.resize({ rows: ROWS, symbolWidth, symbolHeight, x: i * symbolWidth })
    })
  }
}
