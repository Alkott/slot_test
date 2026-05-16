import { describe, it, expect } from 'vitest'
import { rollingAverage } from './fpsAverage'

describe('rollingAverage', () => {
  it('returns 60 when all samples are 60', () => {
    expect(rollingAverage(Array(30).fill(60), 60)).toBeCloseTo(60)
  })
  it('includes the new sample in the average', () => {
    const avg = rollingAverage([60, 60, 60], 30)
    expect(avg).toBeLessThan(60)
    expect(avg).toBeGreaterThan(30)
  })
  it('drops oldest when over window', () => {
    const samples = Array(30).fill(60)
    const avg = rollingAverage(samples, 30)
    // 29 samples of 60 + 1 sample of 30 = (29*60 + 30) / 30
    expect(avg).toBeCloseTo((29 * 60 + 30) / 30, 1)
  })
  it('works with empty samples', () => {
    expect(rollingAverage([], 60)).toBe(60)
  })
})
