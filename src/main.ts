import { Application } from 'pixi.js'
import { SlotGame } from './SlotGame'
import { Controls } from './ui/Controls'

async function main(): Promise<void> {
  const app = new Application()
  await app.init({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x1a1a2e,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  })
  document.body.insertBefore(app.canvas, document.body.firstChild)

  const game = new SlotGame(app)
  game.addReel()

  const controls = new Controls({
    onAdd: () => {
      game.addReel()
      controls.update(game.reelCount, game.isSpinning)
    },
    onRemove: () => {
      game.removeReel()
      controls.update(game.reelCount, game.isSpinning)
    },
    onSpin: () => {
      game.spin(() => controls.update(game.reelCount, game.isSpinning))
      controls.update(game.reelCount, game.isSpinning)
    },
  })

  controls.update(game.reelCount, game.isSpinning)
}

main()
