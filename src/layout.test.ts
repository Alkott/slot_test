import { describe, it, expect } from 'vitest'
import { computeLayout } from './layout'

describe('computeLayout', () => {
  it('symbol width fills screen when N reels fit within maxSize', () => {
    const layouts = computeLayout(300, 600, 3, 1, 150)
    expect(layouts).toHaveLength(3)
    expect(layouts[0]).toEqual({ x: 0, y: 0, symbolWidth: 100, symbolHeight: 150 })
    expect(layouts[1]).toEqual({ x: 100, y: 0, symbolWidth: 100, symbolHeight: 150 })
    expect(layouts[2]).toEqual({ x: 200, y: 0, symbolWidth: 100, symbolHeight: 150 })
  })

  it('symbol width is capped at maxSize when reels are few', () => {
    const layouts = computeLayout(600, 600, 2, 1, 150)
    expect(layouts[0].symbolWidth).toBe(150)
    expect(layouts[1].x).toBe(150)
  })

  it('symbol height fills screen height divided by rows', () => {
    const layouts = computeLayout(300, 400, 3, 4, 200)
    expect(layouts[0].symbolHeight).toBe(100) // 400/4 = 100, under maxSize
  })

  it('symbol height is capped at maxSize', () => {
    const layouts = computeLayout(300, 600, 3, 1, 150)
    expect(layouts[0].symbolHeight).toBe(150) // 600/1=600 > 150, capped
  })

  it('all reels in a single row at y=0', () => {
    const layouts = computeLayout(400, 600, 4, 2, 200)
    expect(layouts.every(l => l.y === 0)).toBe(true)
    expect(layouts[3].x).toBe(layouts[3].symbolWidth * 3)
  })

  it('single reel at origin', () => {
    const layouts = computeLayout(360, 640, 1, 1, 150)
    expect(layouts).toHaveLength(1)
    expect(layouts[0].x).toBe(0)
    expect(layouts[0].y).toBe(0)
    expect(layouts[0].symbolWidth).toBeGreaterThan(0)
    expect(layouts[0].symbolHeight).toBeGreaterThan(0)
  })

  it('many reels scale down to fit width', () => {
    const layouts = computeLayout(300, 600, 10, 1, 150)
    expect(layouts[0].symbolWidth).toBe(30) // 300/10
    expect(layouts[9].x).toBe(270)
  })
})
