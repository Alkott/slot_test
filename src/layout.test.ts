import { describe, it, expect } from 'vitest'
import { computeLayout, computeMachineLayout, computeRowBounds, computeTightMachineLayout } from './layout'

describe('computeLayout', () => {
  it('symbols are square and width-constrained when viewport is taller than wide', () => {
    // W=300, H=600, N=3, rows=1, maxSize=150 → size=min(100,600,150)=100
    // xOffset=(300-300)/2=0, yOffset=(600-100)/2=250
    const layouts = computeLayout(300, 600, 3, 1, 150)
    expect(layouts).toHaveLength(3)
    expect(layouts[0]).toEqual({ x: 0, y: 250, symbolWidth: 100, symbolHeight: 100 })
    expect(layouts[1]).toEqual({ x: 100, y: 250, symbolWidth: 100, symbolHeight: 100 })
    expect(layouts[2]).toEqual({ x: 200, y: 250, symbolWidth: 100, symbolHeight: 100 })
  })

  it('symbols are capped at maxSize and centered when viewport is large', () => {
    // W=600, N=2, maxSize=150 → size=150; xOffset=(600-300)/2=150, yOffset=(600-150)/2=225
    const layouts = computeLayout(600, 600, 2, 1, 150)
    expect(layouts[0].symbolWidth).toBe(150)
    expect(layouts[0]).toEqual({ x: 150, y: 225, symbolWidth: 150, symbolHeight: 150 })
    expect(layouts[1].x).toBe(300)
  })

  it('symbols fill viewport exactly when size divides evenly', () => {
    // W=300, H=400, N=3, rows=4, maxSize=200 → size=min(100,100,200)=100; offsets=0
    const layouts = computeLayout(300, 400, 3, 4, 200)
    expect(layouts[0].symbolHeight).toBe(100)
    expect(layouts[0].x).toBe(0)
    expect(layouts[0].y).toBe(0)
  })

  it('aspect ratio is preserved when width is the tighter constraint', () => {
    // W=300, H=600, N=3, rows=1, maxSize=150 → size=100 (width-limited), not 150
    const layouts = computeLayout(300, 600, 3, 1, 150)
    expect(layouts[0].symbolWidth).toBe(layouts[0].symbolHeight) // always square
    expect(layouts[0].symbolWidth).toBe(100)
  })

  it('all reels in a row share the same y (centered vertically)', () => {
    // W=400, H=600, N=4, rows=2, maxSize=200 → size=min(100,300,200)=100; yOffset=(600-200)/2=200
    const layouts = computeLayout(400, 600, 4, 2, 200)
    expect(layouts.every(l => l.y === layouts[0].y)).toBe(true)
    expect(layouts[0].y).toBe(200)
    expect(layouts[3].x).toBe(layouts[0].x + layouts[3].symbolWidth * 3)
  })

  it('single reel is centered within the viewport', () => {
    // W=360, H=640, N=1, rows=1, maxSize=150 → size=150; xOffset=(360-150)/2=105, yOffset=(640-150)/2=245
    const layouts = computeLayout(360, 640, 1, 1, 150)
    expect(layouts).toHaveLength(1)
    expect(layouts[0].x).toBe(105)
    expect(layouts[0].y).toBe(245)
    expect(layouts[0].symbolWidth).toBe(150)
    expect(layouts[0].symbolHeight).toBe(150)
  })

  it('many reels scale down to fit width, x positions reflect uniform size', () => {
    // W=300, N=10 → size=30; xOffset=0, yOffset=(600-30)/2=285
    const layouts = computeLayout(300, 600, 10, 1, 150)
    expect(layouts[0].symbolWidth).toBe(30)
    expect(layouts[0].symbolWidth).toBe(layouts[0].symbolHeight) // square
    expect(layouts[9].x).toBe(270)
  })
})

describe('computeMachineLayout', () => {
  it('single machine fills full screen when preferred dimensions exceed screen', () => {
    // preferredWidth=500 > W=400 and preferredHeight=700 > H=600 → fills available space
    const layouts = computeMachineLayout(400, 600, 1, 500, 700)
    expect(layouts).toHaveLength(1)
    expect(layouts[0]).toEqual({ x: 0, y: 0, width: 400, height: 600 })
  })

  it('centers single machine of preferred size', () => {
    // W=400, H=400, preferred 200x150 → centered: x=100, y=125
    const layouts = computeMachineLayout(400, 400, 1, 200, 150)
    expect(layouts[0]).toEqual({ x: 100, y: 125, width: 200, height: 150 })
  })

  it('two machines side by side centered horizontally and vertically', () => {
    // W=400, H=600, N=2, preferred 150x300 → perRow=2, startX=50, startY=150
    const layouts = computeMachineLayout(400, 600, 2, 150, 300)
    expect(layouts).toHaveLength(2)
    expect(layouts[0]).toEqual({ x: 50, y: 150, width: 150, height: 300 })
    expect(layouts[1]).toEqual({ x: 200, y: 150, width: 150, height: 300 })
  })

  it('wraps to second row when machines exceed width', () => {
    // preferredWidth=300, W=400 → perRow=1, rowCount=2, machineHeight=300
    const layouts = computeMachineLayout(400, 600, 2, 300, 300)
    expect(layouts[0].y).toBe(0)
    expect(layouts[1].y).toBe(300)
  })

  it('centers partial last row', () => {
    // W=600, preferredWidth=200 → perRow=3; 4 machines → row0: 3, row1: 1
    const layouts = computeMachineLayout(600, 600, 4, 200, 300)
    // row1 has 1 machine out of 3 per row → offset = (3-1)*200/2 = 200
    expect(layouts[3].x).toBe(200)
    expect(layouts[3].y).toBe(300)
  })

  it('full last row has no offset', () => {
    const layouts = computeMachineLayout(600, 600, 6, 200, 300)
    expect(layouts[3].x).toBe(0) // row1, col0, no offset
    expect(layouts[5].x).toBe(400) // row1, col2
  })
})

describe('computeRowBounds', () => {
  it('single machine that fills screen produces one row covering full area', () => {
    const bounds = computeRowBounds(400, 600, 1, 500, 700)
    expect(bounds).toHaveLength(1)
    expect(bounds[0]).toEqual({ x: 0, y: 0, width: 400, height: 600 })
  })

  it('two machines in one row produce a single centered band', () => {
    // W=400, N=2, preferred 150x300 → perRow=2, startX=50, startY=150
    const bounds = computeRowBounds(400, 600, 2, 150, 300)
    expect(bounds).toHaveLength(1)
    expect(bounds[0]).toEqual({ x: 50, y: 150, width: 300, height: 300 })
  })

  it('machines spanning two rows produce two bounds', () => {
    // W=400, preferredWidth=300 → perRow=1, 2 rows
    const bounds = computeRowBounds(400, 600, 2, 300, 300)
    expect(bounds).toHaveLength(2)
    expect(bounds[0].y).toBe(0)
    expect(bounds[1].y).toBe(300)
  })

  it('partial last row is centered within its band', () => {
    // W=600, preferred 200x300 → perRow=3; 4 machines → row1 has 1 machine
    const bounds = computeRowBounds(600, 600, 4, 200, 300)
    expect(bounds).toHaveLength(2)
    expect(bounds[0]).toEqual({ x: 0, y: 0, width: 600, height: 300 })
    // row1: rowLen=1, rowOffsetX=(3-1)*200/2=200, width=200
    expect(bounds[1]).toEqual({ x: 200, y: 300, width: 200, height: 300 })
  })

  it('mask count equals row count not machine count', () => {
    // 6 machines in 2 full rows of 3 → 2 row bounds
    const bounds = computeRowBounds(600, 600, 6, 200, 300)
    expect(bounds).toHaveLength(2)
    // 3 machines in one row → 3 row bounds
    const bounds2 = computeRowBounds(200, 600, 3, 300, 300)
    expect(bounds2).toHaveLength(3)
  })
})

describe('computeTightMachineLayout', () => {
  it('machine size equals symbol area — no internal gaps', () => {
    // 1 machine, W=400, H=400, reelCount=1, rows=1, maxSize=150
    // perRow=2 (400/150=2), rowCount=1, symbolSize=min(400/2,400/1,150)=150
    // machineW=150, startX=(400-2*150)/2=50, but rowLen=1, rowOffsetX=75 → x=125
    const { layouts, symbolSize } = computeTightMachineLayout(400, 400, 1, 1, 1, 150)
    expect(layouts[0].width).toBe(symbolSize)
    expect(layouts[0].height).toBe(symbolSize)
  })

  it('two machines in a row are directly adjacent with no gap', () => {
    // W=300, H=200, N=2, reelCount=1, rows=1, maxSize=150
    // perRow=floor(300/150)=2, rowCount=1, symbolSize=min(300/2,200/1,150)=150
    // startX=(300-2*150)/2=0 → machines at x=0,150
    const { layouts } = computeTightMachineLayout(300, 200, 2, 1, 1, 150)
    expect(layouts[1].x).toBe(layouts[0].x + layouts[0].width) // no gap
  })

  it('scales symbol down to fit when screen is smaller than natural size', () => {
    // W=200, H=150, N=2, reelCount=1, rows=1, maxSize=150
    // perRow=floor(200/150)=1, rowCount=2, symbolSize=min(200,150/2,150)=min(200,75,150)=75
    const { layouts, symbolSize } = computeTightMachineLayout(200, 150, 2, 1, 1, 150)
    expect(symbolSize).toBe(75)
    expect(layouts[0].width).toBe(75)
    expect(layouts[0].height).toBe(75)
    expect(layouts[1].y).toBe(layouts[0].y + 75) // second row directly below
  })

  it('row bounds cover the exact symbol area for each row', () => {
    // W=300, H=200, N=2, reelCount=1, rows=1, maxSize=150 → machines adjacent at (0,25) and (150,25)
    const { rowBounds, layouts } = computeTightMachineLayout(300, 200, 2, 1, 1, 150)
    expect(rowBounds).toHaveLength(1)
    expect(rowBounds[0].x).toBe(layouts[0].x)
    expect(rowBounds[0].y).toBe(layouts[0].y)
    expect(rowBounds[0].width).toBe(layouts[0].width + layouts[1].width) // two adjacent machines
  })

  it('partial last row is centred within the grid', () => {
    // W=450, H=300, N=4, reelCount=1, rows=1, maxSize=150
    // perRow=floor(450/150)=3, rowCount=2, symbolSize=min(450/3,300/2,150)=min(150,150,150)=150
    // row1 has 1 machine, rowOffsetX=(3-1)*150/2=150
    const { layouts, rowBounds } = computeTightMachineLayout(450, 300, 4, 1, 1, 150)
    expect(rowBounds).toHaveLength(2)
    expect(layouts[3].x).toBe(rowBounds[1].x) // lone machine aligns with row band
  })
})
