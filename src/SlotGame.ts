import { Application, Container, Ticker } from 'pixi.js'
import { Reel } from './reel/Reel'
import { ROWS, MAX_SYMBOL_SIZE } from './config'
import { computeLayout } from './layout'

export class SlotGame {
  private reels: Reel[] = []
  private reelContainer = new Container()
  private app: Application
  private rows: number = ROWS
  private viewport = { x: 0, width: 0, height: 0 }
  private spinCompleteCallback: (() => void) | null = null
  private readonly tickerFn: (ticker: Ticker) => void

  constructor(app: Application) {
    this.app = app
    app.stage.addChild(this.reelContainer)

    this.tickerFn = (ticker) => {
      for (const reel of this.reels) reel.update(ticker.deltaTime)
      if (this.spinCompleteCallback && this.reels.every((r) => r.isIdle)) {
        this.spinCompleteCallback()
        this.spinCompleteCallback = null
      }
    }
    app.ticker.add(this.tickerFn)
  }

  setViewport(x: number, width: number, height: number): void {
    this.viewport = { x, width, height }
    this.layout()
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
    reel.destroy({ children: true })
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

  destroy(): void {
    this.app.ticker.remove(this.tickerFn)
    this.app.stage.removeChild(this.reelContainer)
    this.reelContainer.destroy({ children: true })
  }

  get reelCount(): number { return this.reels.length }
  get rowCount(): number { return this.rows }
  get isSpinning(): boolean { return !this.reels.every((r) => r.isIdle) }

  private layout(): void {
    const { x, width, height } = this.viewport
    if (width === 0 || height === 0) return
    this.reelContainer.x = x
    const layouts = computeLayout(width, height, this.reels.length, this.rows, MAX_SYMBOL_SIZE)
    this.reels.forEach((reel, i) => {
      const l = layouts[i]
      reel.resize({ rows: this.rows, symbolWidth: l.symbolWidth, symbolHeight: l.symbolHeight, x: l.x, y: l.y })
    })
  }
}
