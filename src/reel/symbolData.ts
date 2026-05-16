import { SYMBOL_PALETTE } from '../config'

export interface SymbolData {
  color: number;
  label: string;
}

export function getSymbolData(index: number): SymbolData {
  const i = ((index % SYMBOL_PALETTE.length) + SYMBOL_PALETTE.length) % SYMBOL_PALETTE.length
  return { color: SYMBOL_PALETTE[i], label: String(i + 1) }
}

export function randomSymbolIndex(): number {
  return Math.floor(Math.random() * SYMBOL_PALETTE.length)
}
