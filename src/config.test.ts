import { describe, it, expect } from 'vitest'
import { ROWS, STRIP_LENGTH, MAX_SPEED, SYMBOL_PALETTE } from './config'
import { SpinState } from './types'

describe('config', () => {
  it('SYMBOL_PALETTE has 9 entries', () => {
    expect(SYMBOL_PALETTE).toHaveLength(9)
  })
  it('ROWS is a positive integer', () => {
    expect(ROWS).toBeGreaterThan(0)
    expect(Number.isInteger(ROWS)).toBe(true)
  })
  it('MAX_SPEED is positive', () => {
    expect(MAX_SPEED).toBeGreaterThan(0)
  })
  it('STRIP_LENGTH is positive', () => {
    expect(STRIP_LENGTH).toBeGreaterThan(0)
  })
})

describe('SpinState', () => {
  it('has all 5 states', () => {
    expect(SpinState.IDLE).toBeDefined()
    expect(SpinState.ACCELERATING).toBeDefined()
    expect(SpinState.SPINNING).toBeDefined()
    expect(SpinState.DECELERATING).toBeDefined()
    expect(SpinState.SNAPPING).toBeDefined()
  })
})
