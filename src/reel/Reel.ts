import { Container } from 'pixi.js'
import { Symbol } from './Symbol'
import { SpinState, ReelConfig } from '../types'
import { MAX_SPEED, ACCEL_DURATION, DECEL_DURATION, MIN_SPIN_DURATION, SNAP_DURATION } from '../config'

export class Reel extends Container {
  private symbols: Symbol[] = []
  private symbolContainer = new Container()

  private state: SpinState = SpinState.IDLE
  private velocity = 0
  private elapsed = 0
  private scrollOffset = 0
  private snapStartOffset = 0

  private rows = 1
  private symbolWidth = 100
  private symbolHeight = 100

  constructor(rows: number) {
    super()
    this.rows = rows
    this.addChild(this.symbolContainer)

    for (let i = 0; i < rows + 2; i++) {
      const sym = new Symbol()
      this.symbolContainer.addChild(sym)
      this.symbols.push(sym)
    }
  }

  resize(cfg: ReelConfig): void {
    this.x = cfg.x
    this.y = cfg.y
    this.rows = cfg.rows
    this.symbolWidth = cfg.symbolWidth
    this.symbolHeight = cfg.symbolHeight

    while (this.symbols.length < this.rows + 2) {
      const sym = new Symbol()
      this.symbolContainer.addChild(sym)
      this.symbols.push(sym)
    }
    while (this.symbols.length > this.rows + 2) {
      const sym = this.symbols.pop()!
      this.symbolContainer.removeChild(sym)
      sym.destroy()
    }

    for (const sym of this.symbols) {
      sym.randomize(this.symbolWidth, this.symbolHeight)
    }

    this.scrollOffset = 0
    this.updatePositions()
  }

  spin(): void {
    if (this.state !== SpinState.IDLE) return
    this.state = SpinState.ACCELERATING
    this.elapsed = 0
    this.velocity = 0
  }

  get isIdle(): boolean {
    return this.state === SpinState.IDLE
  }

  update(deltaTime: number): void {
    if (this.state === SpinState.IDLE) return

    const deltaMS = deltaTime * (1000 / 60)

    switch (this.state) {
      case SpinState.ACCELERATING: {
        this.elapsed += deltaMS
        const t = Math.min(this.elapsed / ACCEL_DURATION, 1)
        this.velocity = MAX_SPEED * easeIn(t)
        if (t >= 1) { this.state = SpinState.SPINNING; this.elapsed = 0; this.velocity = MAX_SPEED }
        break
      }
      case SpinState.SPINNING: {
        this.elapsed += deltaMS
        if (this.elapsed >= MIN_SPIN_DURATION) { this.state = SpinState.DECELERATING; this.elapsed = 0 }
        break
      }
      case SpinState.DECELERATING: {
        this.elapsed += deltaMS
        const t = Math.min(this.elapsed / DECEL_DURATION, 1)
        this.velocity = MAX_SPEED * (1 - easeOut(t))
        if (t >= 1) {
          this.velocity = 0
          while (this.scrollOffset >= this.symbolHeight) {
            this.scrollOffset -= this.symbolHeight
            this.recycleTop()
          }
          this.snapStartOffset = this.scrollOffset
          this.state = SpinState.SNAPPING
          this.elapsed = 0
        }
        break
      }
      case SpinState.SNAPPING: {
        this.elapsed += deltaMS
        const t = Math.min(this.elapsed / SNAP_DURATION, 1)
        this.scrollOffset = this.snapStartOffset * (1 - easeOut(t))
        if (t >= 1) { this.scrollOffset = 0; this.state = SpinState.IDLE }
        this.updatePositions()
        return
      }
    }

    this.scrollOffset += this.velocity * deltaTime
    while (this.scrollOffset >= this.symbolHeight) {
      this.scrollOffset -= this.symbolHeight
      this.recycleTop()
    }
    this.updatePositions()
  }

  private recycleTop(): void {
    const bottom = this.symbols.pop()!
    this.symbols.unshift(bottom)
    this.symbolContainer.addChildAt(bottom, 0)
    bottom.randomize(this.symbolWidth, this.symbolHeight)
  }

  private updatePositions(): void {
    for (let i = 0; i < this.symbols.length; i++) {
      this.symbols[i].y = (i - 1) * this.symbolHeight + this.scrollOffset
    }
  }
}

function easeIn(t: number): number { return t * t }
function easeOut(t: number): number { return 1 - (1 - t) * (1 - t) }
