// Packs src/assets/blur/*.png into public/blur-atlas.{png,json}
// Uses shelf-bin algorithm; atlas is nearest power-of-two height.
import { readdir, writeFile, mkdir } from 'fs/promises'
import { join, basename } from 'path'
import sharp from 'sharp'

const SRC   = 'src/assets/blur'
const OUT   = 'public'
const NAME  = 'blur-atlas'
const PAD   = 2          // pixel gap between sprites
const MAX_W = 2048       // atlas max width

async function main() {
  const files = (await readdir(SRC))
    .filter(f => f.endsWith('.png'))
    .sort()

  // ── 1. read all image metadata ────────────────────────────────────────────
  const images = await Promise.all(
    files.map(async f => {
      const { width, height } = await sharp(join(SRC, f)).metadata()
      return { name: basename(f, '.png'), file: join(SRC, f), width, height }
    })
  )

  // ── 2. shelf packing (sort by height desc → fewer wasted rows) ────────────
  const sorted = [...images].sort((a, b) => b.height - a.height)
  let x = 0, y = 0, shelfH = 0
  const placed = []

  for (const img of sorted) {
    if (x + img.width > MAX_W) {
      y += shelfH + PAD
      x = 0
      shelfH = 0
    }
    placed.push({ ...img, x, y })
    x += img.width + PAD
    shelfH = Math.max(shelfH, img.height)
  }

  const rawH = y + shelfH
  let atlasH = 1
  while (atlasH < rawH) atlasH <<= 1   // nearest power of two

  // ── 3. composite onto transparent canvas ─────────────────────────────────
  const compositeOps = placed.map(({ file, x, y }) => ({
    input: file, left: x, top: y,
  }))

  await mkdir(OUT, { recursive: true })

  await sharp({
    create: { width: MAX_W, height: atlasH, channels: 4,
               background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(compositeOps)
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, `${NAME}.png`))

  // ── 4. write PixiJS spritesheet JSON ─────────────────────────────────────
  const frames = {}
  for (const { name, x, y, width, height } of placed) {
    frames[name] = {
      frame:            { x, y, w: width, h: height },
      rotated:          false,
      trimmed:          false,
      spriteSourceSize: { x: 0, y: 0, w: width, h: height },
      sourceSize:       { w: width, h: height },
    }
  }

  const json = {
    frames,
    meta: {
      app: 'pack-atlas',
      version: '1.0',
      image: `${NAME}.png`,
      format: 'RGBA8888',
      size: { w: MAX_W, h: atlasH },
      scale: '1',
    },
  }

  await writeFile(join(OUT, `${NAME}.json`), JSON.stringify(json, null, 2))

  console.log(`✓  ${NAME}.png  ${MAX_W}×${atlasH}  (${placed.length} sprites)`)
  for (const { name, x, y, width, height } of placed)
    console.log(`   ${name.padEnd(28)} ${String(width).padStart(4)}×${String(height).padEnd(4)}  @(${x},${y})`)
}

main().catch(err => { console.error(err); process.exit(1) })
