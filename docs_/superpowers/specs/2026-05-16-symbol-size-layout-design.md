# Configurable Symbol Size + Row-Wrapping Layout Design

## Goal

Add a configurable symbol size (default 150×150px). When the total width of all reels exceeds the screen width, wrap reels onto additional rows. If rows overflow screen height, shrink symbols to fit. On resize, rescale to always fill screen width.

## Architecture

Four files change — no new files, no new classes.

| File | Change |
|---|---|
| `src/config.ts` | Add `SYMBOL_SIZE = 150` |
| `src/types.ts` | Add `y: number` to `ReelConfig` |
| `src/reel/Reel.ts` | Add `this.y = cfg.y` in `resize()` |
| `src/SlotGame.ts` | Replace `layout()` with new algorithm; extract pure function to `src/layout.ts` |

`Reel` remains unaware of multi-row layout — it renders at whatever `(x, y)` it receives. All wrapping logic lives in `SlotGame.layout()`, backed by a pure function in `src/layout.ts`.

## Layout Algorithm

```
W = screen width, H = screen height, N = reel count

reelsPerRow = max(1, floor(W / SYMBOL_SIZE))
size        = W / reelsPerRow
rowCount    = ceil(N / reelsPerRow)

if rowCount * size > H:
    size        = H / rowCount
    reelsPerRow = max(1, floor(W / size))
    size        = W / reelsPerRow   // stretch to fill width again

for each reel i:
    x = (i % reelsPerRow) * size
    y = floor(i / reelsPerRow) * size
    reel.resize({ rows: ROWS, symbolWidth: size, symbolHeight: size, x, y })
```

`ROWS` (symbols per reel) stays 1. The "rows" introduced here are reel rows — multiple reels stacked vertically — not symbol rows within a single reel.

On every window `resize` event, `layout()` reruns with the new `W`/`H`, so rescaling is automatic with no extra wiring.

## Pure Layout Function

Extract the algorithm to `src/layout.ts`:

```typescript
export interface ReelLayout { x: number; y: number; size: number }

export function computeLayout(W: number, H: number, N: number, symbolSize: number): ReelLayout[]
```

This makes the math unit-testable without PixiJS.

## Test Cases

| Scenario | Input | Expected |
|---|---|---|
| All fit in one row | W=450, H=600, N=3, size=150 | 3 reels × 1 row, size=150 |
| Wraps to 2 rows | W=450, H=600, N=4, size=150 | 3+1 layout, size=150 |
| 2×2 grid | W=300, H=300, N=4, size=150 | 2 cols × 2 rows, size=150 |
| Height overflow triggers shrink | W=300, H=200, N=6, size=150 | 2 cols × 3 rows, size shrunk |
| Single reel always fits | W=any, H=any, N=1, size=150 | 1 reel at (0,0) |

## Constraints

- Symbols remain square (width = height = computed size).
- `SYMBOL_SIZE` in `config.ts` is the preferred/maximum size; actual rendered size may be smaller when shrinking is needed.
- The `ROWS` constant (symbol rows per reel) is orthogonal to this feature and stays unchanged.
