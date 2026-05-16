export enum SpinState {
  IDLE = 'IDLE',
  ACCELERATING = 'ACCELERATING',
  SPINNING = 'SPINNING',
  DECELERATING = 'DECELERATING',
  SNAPPING = 'SNAPPING',
}

export interface ReelConfig {
  rows: number;
  symbolWidth: number;
  symbolHeight: number;
  x: number;
  y: number;
}
