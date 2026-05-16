export interface ReelLayout {
  x: number
  y: number
  symbolWidth: number
  symbolHeight: number
}

export function computeLayout(W: number, H: number, N: number, rows: number, maxSize: number): ReelLayout[] {
  const symbolWidth = Math.min(W / N, maxSize)
  const symbolHeight = Math.min(H / rows, maxSize)
  return Array.from({ length: N }, (_, i) => ({
    x: i * symbolWidth,
    y: 0,
    symbolWidth,
    symbolHeight,
  }))
}

export interface MachineLayout {
  x: number
  y: number
  width: number
  height: number
}

export function computeMachineLayout(W: number, H: number, N: number, preferredWidth: number): MachineLayout[] {
  const perRow = Math.max(1, Math.floor(W / preferredWidth))
  const rowCount = Math.ceil(N / perRow)
  const machineWidth = W / perRow
  const machineHeight = H / rowCount

  return Array.from({ length: N }, (_, i) => {
    const row = Math.floor(i / perRow)
    const col = i % perRow
    const rowLen = Math.min(perRow, N - row * perRow)
    const offsetX = ((perRow - rowLen) * machineWidth) / 2
    return {
      x: offsetX + col * machineWidth,
      y: row * machineHeight,
      width: machineWidth,
      height: machineHeight,
    }
  })
}
