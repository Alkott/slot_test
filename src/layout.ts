export interface ReelLayout {
  x: number
  y: number
  size: number
}

export function computeLayout(W: number, H: number, N: number, symbolSize: number): ReelLayout[] {
  let reelsPerRow = Math.max(1, Math.floor(W / symbolSize))
  let size = W / reelsPerRow
  const rowCount = Math.ceil(N / reelsPerRow)

  if (rowCount * size > H) {
    size = H / rowCount
    reelsPerRow = Math.max(1, Math.floor(W / size))
  }

  return Array.from({ length: N }, (_, i) => ({
    x: (i % reelsPerRow) * size,
    y: Math.floor(i / reelsPerRow) * size,
    size,
  }))
}
