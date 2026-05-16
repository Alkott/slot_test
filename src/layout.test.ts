import { describe, it, expect } from 'vitest'
import { computeLayout, computeMachineLayout } from './layout'

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

describe('computeMachineLayout', () => {
  it('single machine fills full screen when preferred width exceeds W', () => {
    // preferredWidth=500 > W=400 → perRow=1, machineWidth=400, no centering offset
    const layouts = computeMachineLayout(400, 600, 1, 500)
    expect(layouts).toHaveLength(1)
    expect(layouts[0]).toEqual({ x: 0, y: 0, width: 400, height: 600 })
  })

  it('two machines side by side when they fit in one row', () => {
    const layouts = computeMachineLayout(400, 600, 2, 150)
    expect(layouts).toHaveLength(2)
    expect(layouts[0]).toEqual({ x: 0, y: 0, width: 200, height: 600 })
    expect(layouts[1]).toEqual({ x: 200, y: 0, width: 200, height: 600 })
  })

  it('wraps to second row when machines exceed width', () => {
    // preferredWidth=300, W=400 → perRow=1, rowCount=2
    const layouts = computeMachineLayout(400, 600, 2, 300)
    expect(layouts[0].y).toBe(0)
    expect(layouts[1].y).toBe(300) // 600/2
  })

  it('centers partial last row', () => {
    // W=600, preferredWidth=200 → perRow=3; 4 machines → row0: 3, row1: 1
    const layouts = computeMachineLayout(600, 600, 4, 200)
    // row1 has 1 machine out of 3 per row → offset = (3-1)*200/2 = 200
    expect(layouts[3].x).toBe(200)
    expect(layouts[3].y).toBe(300)
  })

  it('full last row has no offset', () => {
    const layouts = computeMachineLayout(600, 600, 6, 200)
    expect(layouts[3].x).toBe(0) // row1, col0, no offset
    expect(layouts[5].x).toBe(400) // row1, col2
  })
})
