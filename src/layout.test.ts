import { describe, it, expect } from 'vitest'
import { computeLayout } from './layout'

describe('computeLayout', () => {
  it('3 reels fit in one row at exactly SYMBOL_SIZE', () => {
    const layouts = computeLayout(450, 600, 3, 150)
    expect(layouts).toHaveLength(3)
    expect(layouts[0]).toEqual({ x: 0, y: 0, size: 150 })
    expect(layouts[1]).toEqual({ x: 150, y: 0, size: 150 })
    expect(layouts[2]).toEqual({ x: 300, y: 0, size: 150 })
  })

  it('4th reel wraps to second row', () => {
    const layouts = computeLayout(450, 600, 4, 150)
    expect(layouts).toHaveLength(4)
    expect(layouts[3]).toEqual({ x: 0, y: 150, size: 150 })
  })

  it('2x2 grid when screen is exactly 2 symbols wide and tall', () => {
    const layouts = computeLayout(300, 300, 4, 150)
    expect(layouts[0]).toEqual({ x: 0, y: 0, size: 150 })
    expect(layouts[1]).toEqual({ x: 150, y: 0, size: 150 })
    expect(layouts[2]).toEqual({ x: 0, y: 150, size: 150 })
    expect(layouts[3]).toEqual({ x: 150, y: 150, size: 150 })
  })

  it('height overflow triggers shrink — all reels fit within H', () => {
    // W=300, N=6, symbolSize=150 → reelsPerRow=2, size=150, rowCount=3
    // 3*150=450 > 200 → shrink: size=200/3≈66.67, reelsPerRow=floor(300/66.67)=4, size=300/4=75
    const layouts = computeLayout(300, 200, 6, 150)
    expect(layouts).toHaveLength(6)
    expect(layouts[0].size).toBeLessThan(150)
    expect(layouts[0].size).toBeGreaterThan(0)
    const maxBottom = Math.max(...layouts.map(l => l.y + l.size))
    expect(maxBottom).toBeLessThanOrEqual(200 + 0.01) // float tolerance
  })

  it('single reel at origin', () => {
    const layouts = computeLayout(360, 640, 1, 150)
    expect(layouts).toHaveLength(1)
    expect(layouts[0].x).toBe(0)
    expect(layouts[0].y).toBe(0)
    expect(layouts[0].size).toBeGreaterThan(0)
  })

  it('reels per row is at least 1 when symbolSize exceeds screen width', () => {
    const layouts = computeLayout(100, 800, 3, 150)
    expect(layouts).toHaveLength(3)
    // Only 1 reel per row fits; all x values should be 0
    expect(layouts[0].x).toBe(0)
    expect(layouts[1].x).toBe(0)
    expect(layouts[2].x).toBe(0)
  })

  it('shrink holds when narrow screen cannot gain columns', () => {
    // W=100, N=3, symbolSize=100 → reelsPerRow=1, size=100, rowCount=3
    // 3*100=300 > 200 → shrink: size=66.67, reelsPerRow still 1 → size stays 66.67
    const layouts = computeLayout(100, 200, 3, 100)
    expect(layouts).toHaveLength(3)
    const maxBottom = Math.max(...layouts.map(l => l.y + l.size))
    expect(maxBottom).toBeLessThanOrEqual(200 + 0.01)
  })
})
