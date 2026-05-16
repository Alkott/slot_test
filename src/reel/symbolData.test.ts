import { describe, it, expect } from 'vitest'
import { getSymbolData } from './symbolData'
import { SYMBOL_PALETTE } from '../config'

describe('getSymbolData', () => {
  it('label cycles 1–9', () => {
    expect(getSymbolData(0).label).toBe('1')
    expect(getSymbolData(8).label).toBe('9')
    expect(getSymbolData(9).label).toBe('1')
  })
  it('color comes from SYMBOL_PALETTE and cycles', () => {
    expect(getSymbolData(0).color).toBe(SYMBOL_PALETTE[0])
    expect(getSymbolData(9).color).toBe(SYMBOL_PALETTE[0])
  })
  it('returns valid data for any non-negative index', () => {
    const data = getSymbolData(Math.floor(Math.random() * 1000))
    expect(typeof data.color).toBe('number')
    expect(typeof data.label).toBe('string')
  })
})
