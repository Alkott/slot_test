import { Application } from 'pixi.js'
import { SlotGame } from './SlotGame'
import { Controls } from './ui/Controls'
import { FpsCounter } from './ui/FpsCounter'

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

  const fpsCounter = new FpsCounter()
  app.stage.addChild(fpsCounter)
  app.ticker.add((ticker) => fpsCounter.update(ticker.deltaMS))

  const machines: SlotGame[] = []

  function relayout(): void {
    const W = app.screen.width
    const H = app.screen.height
    const w = W / machines.length
    machines.forEach((m, i) => m.setViewport(i * w, w, H))
  }

  function addMachine(): void {
    const machine = new SlotGame(app)
    machine.addReel()
    machines.push(machine)
    relayout()
  }

  function removeMachine(): void {
    if (machines.length <= 1) return
    const machine = machines.pop()!
    machine.destroy()
    relayout()
  }

  window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight)
    relayout()
  })

  addMachine()

  let controls!: Controls

  const sync = (): void => {
    const isSpinning = machines.some((m) => m.isSpinning)
    controls?.update(machines.length, machines[0].reelCount, machines[0].rowCount, isSpinning)
  }

  controls = new Controls({
    onAdd: () => { machines.forEach((m) => m.addReel()); relayout(); sync() },
    onRemove: () => { machines.forEach((m) => m.removeReel()); relayout(); sync() },
    onAddRow: () => { machines.forEach((m) => m.addRow()); relayout(); sync() },
    onRemoveRow: () => { machines.forEach((m) => m.removeRow()); relayout(); sync() },
    onAddMachine: () => { addMachine(); sync() },
    onRemoveMachine: () => { removeMachine(); sync() },
    onSpin: () => { machines.forEach((m) => m.spin(sync)); sync() },
  })

  sync()
}

main().catch(console.error)
