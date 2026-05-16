import { Application } from 'pixi.js'
import { SlotGame } from './SlotGame'
import { Controls } from './ui/Controls'

async function main(): Promise<void> {
  const app = new Application()
  await app.init({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x1a1a2e,
    resolution: window.devicePixelRatio,
    autoDensity: true,
  })
  app.ticker.maxFPS = 60
  document.body.insertBefore(app.canvas, document.body.firstChild)

  const game = new SlotGame(app)
  game.addReel()

  const sync = () => controls.update(game.reelCount, game.rowCount, game.isSpinning)

  const controls = new Controls({
    onAdd: () => { game.addReel(); sync() },
    onRemove: () => { game.removeReel(); sync() },
    onAddRow: () => { game.addRow(); sync() },
    onRemoveRow: () => { game.removeRow(); sync() },
    onSpin: () => { game.spin(sync); sync() },
  })

  sync()
}

main().catch(console.error)
