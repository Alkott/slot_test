const WINDOW = 30

export function rollingAverage(samples: number[], newSample: number): number {
  const buf = [...samples, newSample]
  if (buf.length > WINDOW) buf.shift()
  return buf.reduce((sum, v) => sum + v, 0) / buf.length
}
