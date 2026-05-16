export interface ReelLayout {
  x: number
  y: number
  symbolWidth: number
  symbolHeight: number
}

export function computeLayout(W: number, H: number, N: number, rows: number, maxSize: number): ReelLayout[] {
  const size = Math.min(W / N, H / rows, maxSize)
  const xOffset = (W - N * size) / 2
  const yOffset = (H - rows * size) / 2
  return Array.from({ length: N }, (_, i) => ({
    x: xOffset + i * size,
    y: yOffset,
    symbolWidth: size,
    symbolHeight: size,
  }))
}

export interface MachineLayout {
  x: number
  y: number
  width: number
  height: number
}

export interface RowBounds {
  x: number
  y: number
  width: number
  height: number
}

function layoutParams(W: number, H: number, N: number, preferredWidth: number, preferredHeight: number) {
  const perRow = Math.max(1, Math.floor(W / preferredWidth))
  const rowCount = Math.ceil(N / perRow)
  const machineWidth = Math.min(preferredWidth, W / perRow)
  const machineHeight = Math.min(preferredHeight, H / rowCount)
  const startX = (W - perRow * machineWidth) / 2
  const startY = (H - rowCount * machineHeight) / 2
  return { perRow, rowCount, machineWidth, machineHeight, startX, startY }
}

export function computeMachineLayout(
  W: number, H: number, N: number, preferredWidth: number, preferredHeight: number
): MachineLayout[] {
  const { perRow, machineWidth, machineHeight, startX, startY } = layoutParams(W, H, N, preferredWidth, preferredHeight)
  return Array.from({ length: N }, (_, i) => {
    const row = Math.floor(i / perRow)
    const col = i % perRow
    const rowLen = Math.min(perRow, N - row * perRow)
    const rowOffsetX = ((perRow - rowLen) * machineWidth) / 2
    return {
      x: startX + rowOffsetX + col * machineWidth,
      y: startY + row * machineHeight,
      width: machineWidth,
      height: machineHeight,
    }
  })
}

export function computeRowBounds(
  W: number, H: number, N: number, preferredWidth: number, preferredHeight: number
): RowBounds[] {
  const { perRow, rowCount, machineWidth, machineHeight, startX, startY } = layoutParams(W, H, N, preferredWidth, preferredHeight)
  return Array.from({ length: rowCount }, (_, r) => {
    const rowLen = Math.min(perRow, N - r * perRow)
    const rowOffsetX = ((perRow - rowLen) * machineWidth) / 2
    return {
      x: startX + rowOffsetX,
      y: startY + r * machineHeight,
      width: rowLen * machineWidth,
      height: machineHeight,
    }
  })
}

export interface TightLayout {
  layouts: MachineLayout[]
  rowBounds: RowBounds[]
  symbolSize: number
  perRow: number
}

/**
 * Layout that packs all machines with no gaps: machine size equals the actual
 * symbol area (reelCount × symbolSize by rows × symbolSize), with the whole
 * grid centred on screen.
 */
export function computeTightMachineLayout(
  W: number, H: number, N: number,
  reelCount: number, rows: number, maxSize: number
): TightLayout {
  const perRow = Math.max(1, Math.floor(W / (reelCount * maxSize)))
  const rowCount = Math.ceil(N / perRow)
  const symbolSize = Math.min(W / (perRow * reelCount), H / (rowCount * rows), maxSize)
  const machineW = reelCount * symbolSize
  const machineH = rows * symbolSize
  const startX = (W - perRow * machineW) / 2
  const startY = (H - rowCount * machineH) / 2

  const layouts: MachineLayout[] = Array.from({ length: N }, (_, i) => {
    const row = Math.floor(i / perRow)
    const col = i % perRow
    const rowLen = Math.min(perRow, N - row * perRow)
    const rowOffsetX = ((perRow - rowLen) * machineW) / 2
    return {
      x: startX + rowOffsetX + col * machineW,
      y: startY + row * machineH,
      width: machineW,
      height: machineH,
    }
  })

  const rowBounds: RowBounds[] = Array.from({ length: rowCount }, (_, r) => {
    const rowLen = Math.min(perRow, N - r * perRow)
    const rowOffsetX = ((perRow - rowLen) * machineW) / 2
    return {
      x: startX + rowOffsetX,
      y: startY + r * machineH,
      width: rowLen * machineW,
      height: machineH,
    }
  })

  return { layouts, rowBounds, symbolSize, perRow }
}
