# Configurable Symbol Size + Row-Wrapping Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a configurable symbol size (default 150×150px) so reels wrap onto new rows when they exceed screen width, and shrink to fit when rows overflow screen height.

**Architecture:** A pure `computeLayout()` function in `src/layout.ts` handles all the math — given screen dimensions, reel count, and symbol size, it returns `(x, y, size)` for each reel. `SlotGame.layout()` calls it and passes results into `reel.resize()`. `Reel` gains a `y` coordinate in its `ReelConfig` and sets `this.y` from it — no other changes to `Reel`.

**Tech Stack:** PixiJS 8, TypeScript 5, Vite 5, Vitest 1

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/config.ts` | Modify | Add `SYMBOL_SIZE = 150` constant |
| `src/types.ts` | Modify | Add `y: number` to `ReelConfig` |
| `src/reel/Reel.ts` | Modify | Read `cfg.y` in `resize()` |
| `src/layout.ts` | Create | Pure `computeLayout()` function |
| `src/layout.test.ts` | Create | Unit tests for `computeLayout()` |
| `src/SlotGame.ts` | Modify | Replace `layout()` to use `computeLayout()` |

---

### Task 1: Add SYMBOL_SIZE, extend ReelConfig, and wire Reel.y

**Files:**
- Modify: `src/config.ts`
- Modify: `src/types.ts`
- Modify: `src/reel/Reel.ts`

No logic change here — just extend the config and types, and add one line to `Reel.resize()`. TypeScript will flag the missing `y` in `SlotGame.layout()` after this; that's expected and will be fixed in Task 3.

- [ ] **Step 1: Add SYMBOL_SIZE to config.ts**

Open `src/config.ts`. It currently ends with `SYMBOL_PALETTE`. Add one line after `SNAP_DURATION`:

```typescript
export const ROWS = 1;
export const STRIP_LENGTH = 20;
export const MAX_SPEED = 30;          // px per normalized frame (60fps baseline)
export const ACCEL_DURATION = 300;    // ms
export const DECEL_DURATION = 500;    // ms
export const MIN_SPIN_DURATION = 800; // ms
export const SNAP_DURATION = 120;     // ms
export const SYMBOL_SIZE = 150;       // preferred symbol side length in px
export const SYMBOL_PALETTE: number[] = [
  0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12,
  0x9b59b6, 0x1abc9c, 0xe67e22, 0x34495e, 0xe91e63,
];
```

- [ ] **Step 2: Add y to ReelConfig in types.ts**

Open `src/types.ts`. Replace the `ReelConfig` interface:

```typescript
export interface ReelConfig {
  rows: number;
  symbolWidth: number;
  symbolHeight: number;
  x: number;
  y: number;
}
```

- [ ] **Step 3: Read cfg.y in Reel.resize()**

Open `src/reel/Reel.ts`. In `resize()`, the first two assignments are:

```typescript
  resize(cfg: ReelConfig): void {
    this.x = cfg.x
    this.rows = cfg.rows
```

Add `this.y = cfg.y` immediately after `this.x = cfg.x`:

```typescript
  resize(cfg: ReelConfig): void {
    this.x = cfg.x
    this.y = cfg.y
    this.rows = cfg.rows
```

- [ ] **Step 4: Verify TypeScript finds the expected error**

Run:
```bash
cd /Users/alkott/Projects/pixi/slot_test && npx tsc --noEmit 2>&1 | head -20
```

Expected: TypeScript reports an error in `SlotGame.ts` about missing `y` in the `reel.resize()` call. No errors in `Reel.ts` or `types.ts`. If there are unexpected errors elsewhere, investigate before continuing.

- [ ] **Step 5: Commit**

```bash
cd /Users/alkott/Projects/pixi/slot_test && git add src/config.ts src/types.ts src/reel/Reel.ts && git commit -m "feat: add SYMBOL_SIZE config, extend ReelConfig with y, wire Reel.y"
```

---

### Task 2: Pure layout function with tests

**Files:**
- Create: `src/layout.ts`
- Create: `src/layout.test.ts`

TDD: write the tests first, watch them fail, then implement.

- [ ] **Step 1: Write the failing tests**

Create `src/layout.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { computeLayout } from './layout'

describe('computeLayout', () => {
  it('3 reels fit in one row at exactly SYMBOL_SIZE', () => {
    const layouts = computeLayout(450, 600, 3, 150)
    expect(layouts).toHaveLength(3)
    expect(layouts[0]).toEqual({ x: 0, y: 0, size: 150 })
    expect(layouts[1]).toEqual({ x: 150, y: 0, size: 150 })
    expect(layouts[2]).toEqual({ x: 300, y: 0, size: 150 })
  })

  it('4th reel wraps to second row', () => {
    const layouts = computeLayout(450, 600, 4, 150)
    expect(layouts).toHaveLength(4)
    expect(layouts[3]).toEqual({ x: 0, y: 150, size: 150 })
  })

  it('2x2 grid when screen is exactly 2 symbols wide and tall', () => {
    const layouts = computeLayout(300, 300, 4, 150)
    expect(layouts[0]).toEqual({ x: 0, y: 0, size: 150 })
    expect(layouts[1]).toEqual({ x: 150, y: 0, size: 150 })
    expect(layouts[2]).toEqual({ x: 0, y: 150, size: 150 })
    expect(layouts[3]).toEqual({ x: 150, y: 150, size: 150 })
  })

  it('height overflow triggers shrink — all reels fit within H', () => {
    // W=300, N=6, symbolSize=150 → reelsPerRow=2, size=150, rowCount=3
    // 3*150=450 > 200 → shrink: size=200/3≈66.67, reelsPerRow=floor(300/66.67)=4, size=300/4=75
    const layouts = computeLayout(300, 200, 6, 150)
    expect(layouts).toHaveLength(6)
    expect(layouts[0].size).toBeLessThan(150)
    expect(layouts[0].size).toBeGreaterThan(0)
    const maxBottom = Math.max(...layouts.map(l => l.y + l.size))
    expect(maxBottom).toBeLessThanOrEqual(200 + 0.01) // float tolerance
  })

  it('single reel at origin', () => {
    const layouts = computeLayout(360, 640, 1, 150)
    expect(layouts).toHaveLength(1)
    expect(layouts[0].x).toBe(0)
    expect(layouts[0].y).toBe(0)
    expect(layouts[0].size).toBeGreaterThan(0)
  })

  it('reels per row is at least 1 when symbolSize exceeds screen width', () => {
    const layouts = computeLayout(100, 800, 3, 150)
    expect(layouts).toHaveLength(3)
    // Only 1 reel per row fits; all x values should be 0
    expect(layouts[0].x).toBe(0)
    expect(layouts[1].x).toBe(0)
    expect(layouts[2].x).toBe(0)
  })
})
```

- [ ] **Step 2: Run to confirm tests fail**

```bash
cd /Users/alkott/Projects/pixi/slot_test && npx vitest run src/layout.test.ts 2>&1
```

Expected: FAIL with `Cannot find module './layout'` or similar. If they pass, something is wrong — investigate.

- [ ] **Step 3: Implement computeLayout**

Create `src/layout.ts`:

```typescript
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
    size = W / reelsPerRow
  }

  return Array.from({ length: N }, (_, i) => ({
    x: (i % reelsPerRow) * size,
    y: Math.floor(i / reelsPerRow) * size,
    size,
  }))
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd /Users/alkott/Projects/pixi/slot_test && npx vitest run src/layout.test.ts 2>&1
```

Expected: All 6 tests PASS. If any fail, re-read the failing test's comment — it explains the expected arithmetic — and fix the implementation.

- [ ] **Step 5: Run full test suite**

```bash
cd /Users/alkott/Projects/pixi/slot_test && npx vitest run 2>&1
```

Expected: All tests PASS (existing tests for `symbolData` and `fpsAverage` should still pass).

- [ ] **Step 6: Commit**

```bash
cd /Users/alkott/Projects/pixi/slot_test && git add src/layout.ts src/layout.test.ts && git commit -m "feat: add computeLayout pure function with tests"
```

---

### Task 3: Wire computeLayout into SlotGame

**Files:**
- Modify: `src/SlotGame.ts`

This task fixes the TypeScript error from Task 1 and replaces the old proportional layout with the new wrapping layout.

- [ ] **Step 1: Update SlotGame.ts imports and layout()**

Open `src/SlotGame.ts`. The current import line is:

```typescript
import { ROWS } from './config'
```

Change it to:

```typescript
import { ROWS, SYMBOL_SIZE } from './config'
```

Also add the layout import at the top (after the existing imports):

```typescript
import { computeLayout } from './layout'
```

Then replace the entire `layout()` method. It currently reads:

```typescript
  private layout(): void {
    const w = this.app.screen.width
    const h = this.app.screen.height
    const symbolWidth = w / this.reels.length
    const symbolHeight = h / ROWS
    this.reels.forEach((reel, i) => {
      reel.resize({ rows: ROWS, symbolWidth, symbolHeight, x: i * symbolWidth })
    })
  }
```

Replace it with:

```typescript
  private layout(): void {
    const w = this.app.screen.width
    const h = this.app.screen.height
    const layouts = computeLayout(w, h, this.reels.length, SYMBOL_SIZE)
    this.reels.forEach((reel, i) => {
      const l = layouts[i]
      reel.resize({ rows: ROWS, symbolWidth: l.size, symbolHeight: l.size, x: l.x, y: l.y })
    })
  }
```

- [ ] **Step 2: Type-check with no errors**

```bash
cd /Users/alkott/Projects/pixi/slot_test && npx tsc --noEmit 2>&1
```

Expected: No errors. If there are errors, read them carefully — they will point to the exact line. Common issues: missing import, wrong property name.

- [ ] **Step 3: Run full test suite**

```bash
cd /Users/alkott/Projects/pixi/slot_test && npx vitest run 2>&1
```

Expected: All tests PASS.

- [ ] **Step 4: Build**

```bash
cd /Users/alkott/Projects/pixi/slot_test && npm run build 2>&1
```

Expected: Build completes with no errors. Output in `dist/`.

- [ ] **Step 5: Smoke test in browser**

```bash
cd /Users/alkott/Projects/pixi/slot_test && npm run dev 2>&1 &
```

Open the URL printed in the terminal. Verify:
1. Game loads with 1 reel at default 150px size (or wider if screen < 150px)
2. Press "Add Reel" repeatedly — reels wrap to a new row after the first row fills
3. Press "Spin" — all reels spin and stop
4. Resize the browser window — reels rescale to fill width

- [ ] **Step 6: Commit**

```bash
cd /Users/alkott/Projects/pixi/slot_test && git add src/SlotGame.ts && git commit -m "feat: wire computeLayout into SlotGame, replacing proportional layout"
```
