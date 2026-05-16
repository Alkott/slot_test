import { Application, Container } from 'pixi.js'
import { Reel } from './reel/Reel'
import { FpsCounter } from './ui/FpsCounter'
import { ROWS, SYMBOL_SIZE } from './config'
import { computeLayout } from './layout'

export class SlotGame {
  private reels: Reel[] = []
  private reelContainer = new Container()
  private fpsCounter: FpsCounter
  private app: Application
  private rows: number = ROWS

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
    const reel = new Reel(this.rows)
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

  addRow(): void {
    this.rows++
    this.layout()
  }

  removeRow(): void {
    if (this.rows <= 1) return
    this.rows--
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

  get rowCount(): number {
    return this.rows
  }

  get isSpinning(): boolean {
    return !this.reels.every((r) => r.isIdle)
  }

  private layout(): void {
    const w = this.app.screen.width
    const h = this.app.screen.height
    const layouts = computeLayout(w, h, this.reels.length, SYMBOL_SIZE)
    this.reels.forEach((reel, i) => {
      const l = layouts[i]
      reel.resize({ rows: this.rows, symbolWidth: l.size, symbolHeight: l.size, x: l.x, y: l.y })
    })
  }
}
