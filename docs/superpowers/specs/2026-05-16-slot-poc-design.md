# Slot POC — Design Spec

**Date:** 2026-05-16  
**Goal:** Proof of concept to determine how many reels a low-end Android device can render at 25+ FPS.  
**Stack:** PixiJS, Vite, TypeScript  
**Target device:** Budget Android (~2GB RAM, Snapdragon 4xx, Chrome WebView)

---

## 1. Project Structure

```
slot_test/
├── src/
│   ├── main.ts            # PIXI Application init, mounts SlotGame
│   ├── config.ts          # Constants: STRIP_LENGTH, MAX_SPEED, ACCEL_DURATION, DECEL_DURATION, MIN_SPIN_DURATION, symbol palette
│   ├── types.ts           # Shared interfaces: ReelConfig, SpinState enum
│   ├── SlotGame.ts        # Root controller: owns reel array, layout, spin coordination, resize
│   ├── reel/
│   │   ├── Reel.ts        # Masked container, symbol pool, spin state machine
│   │   └── Symbol.ts      # PIXI.Graphics colored rect + PIXI.Text number label
│   └── ui/
│       ├── Controls.ts    # DOM buttons: addReel, removeReel, spin
│       └── FpsCounter.ts  # PIXI.Text overlay, rolling average FPS via Ticker delta
├── index.html
├── vite.config.ts
└── package.json
```

---

## 2. Canvas & Layout

- PIXI Application fills the full viewport in portrait mode.
- Listens to `window.resize`; updates canvas dimensions and re-runs layout.
- `symbolHeight = canvasHeight / rows` (rows set in `config.ts`, not runtime-adjustable in POC)
- `symbolWidth = canvasWidth / reelCount`
- Reels are spaced evenly across the full canvas width.

---

## 3. Reel & Symbol

### Symbol (`Symbol.ts`)
- `PIXI.Graphics` colored rectangle filled from a fixed palette of 9 colors.
- Centered `PIXI.Text` label showing a number 1–9.
- Reused from pool — only color and label update on recycle. No allocations during spin.

### Reel (`Reel.ts`)
- A `PIXI.Container` clipped by a `PIXI.Graphics` mask (visible area = `rows × symbolHeight`).
- Symbol pool size: `rows + 2` (1 buffer slot above, 1 below for seamless scroll).
- **Spin state machine:**

```
IDLE → ACCELERATING → SPINNING → DECELERATING → SNAPPING → IDLE
```

| State | Behavior |
|---|---|
| ACCELERATING | Velocity ramps up to `MAX_SPEED` via easeIn over `ACCEL_DURATION` ms |
| SPINNING | Constant velocity; symbols recycle when they exit the top of the mask |
| DECELERATING | Velocity ramps down via easeOut over `DECEL_DURATION` ms; triggered after `MIN_SPIN_DURATION` ms |
| SNAPPING | Remaining offset eases to nearest whole symbol boundary |

- Symbol recycle: when a symbol's Y position exits the top of the mask, assign a new random color + number, reposition at the bottom of the pool.
- Exposes `spin()` method and an `isIdle` getter for `SlotGame` to coordinate.

---

## 4. SlotGame (`SlotGame.ts`)

- Owns the `Reel[]` array.
- **addReel**: instantiate new `Reel`, push to array, recalculate layout.
- **removeReel**: call `reel.destroy()` on last reel, pop from array, recalculate layout. Minimum 1 reel enforced.
- **spin**: call `reel.spin()` on all reels simultaneously.
- **Layout recalculation**: updates `x` position and `symbolWidth` of every reel based on current `reelCount` and canvas width.
- Notifies `Controls` when all reels are `IDLE` so Spin button re-enables.

---

## 5. UI Controls (`Controls.ts`)

Three DOM buttons, `position: fixed; bottom: 20px`, centered horizontally over the canvas.

```
[ Add Reel ]  [ Remove Reel ]  [ Spin ]
```

| Button | Enabled condition |
|---|---|
| Add Reel | Always |
| Remove Reel | `reelCount > 1` |
| Spin | All reels are `IDLE` |

- Plain DOM, no framework. Dark semi-transparent background, white text.
- `Controls` receives callbacks from `SlotGame`: `onAdd`, `onRemove`, `onSpin`, `onStateChange`.

---

## 6. FPS Counter (`FpsCounter.ts`)

- `PIXI.Text` rendered in a top-left overlay container, z-ordered above reels.
- Samples `ticker.deltaMS` each frame.
- Displays rolling average over 30 frames: `FPS: 58`.

---

## 7. Config (`config.ts`)

```ts
export const ROWS = 1;               // default rows per reel
export const STRIP_LENGTH = 20;      // logical symbol positions in strip
export const MAX_SPEED = 30;         // px/frame at full spin
export const ACCEL_DURATION = 300;   // ms
export const DECEL_DURATION = 500;   // ms
export const MIN_SPIN_DURATION = 800; // ms before decel starts
export const SYMBOL_PALETTE = [      // one color per symbol number
  0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12,
  0x9b59b6, 0x1abc9c, 0xe67e22, 0x34495e, 0xe91e63,
];
```

---

## 8. Stages

### Stage 1 — Single reel, configurable rows
- Implement `Symbol`, `Reel`, `FpsCounter`, `Controls` (spin only), `config.ts`.
- Verify spin state machine works end-to-end.
- Verify symbol pool recycles correctly during spin.

### Stage 2 — Multi-reel with add/remove
- Implement `SlotGame` layout logic.
- Wire `addReel` / `removeReel` buttons.
- Verify layout recalculates correctly at every reel count.
- Verify all reels spin simultaneously and Spin button disables during spin.

---

## 9. Out of Scope (POC)

- Spine animations (placeholder colored rects only)
- Win detection or paylines
- Sound
- Runtime row count adjustment (requires page reload)
- Upper reel limit (intentionally unbounded to find the FPS cliff)
