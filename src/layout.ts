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
