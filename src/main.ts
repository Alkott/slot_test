import { Application } from 'pixi.js'
import { SlotGame } from './SlotGame'
import { Controls } from './ui/Controls'
import { FpsCounter } from './ui/FpsCounter'
import { computeMachineLayout } from './layout'
import { MAX_SYMBOL_SIZE } from './config'

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
    if (machines.length === 0) return
    const W = app.screen.width
    const H = app.screen.height
    const preferredWidth = machines[0].reelCount * MAX_SYMBOL_SIZE
    const layouts = computeMachineLayout(W, H, machines.length, preferredWidth)
    machines.forEach((m, i) => m.setViewport(layouts[i].x, layouts[i].y, layouts[i].width, layouts[i].height))
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
    controls?.update(machines.length, machines.some((m) => m.isSpinning))
  }

  controls = new Controls({
    onAddMachine: () => { addMachine(); sync() },
    onRemoveMachine: () => { removeMachine(); sync() },
    onSpin: () => { machines.forEach((m) => m.spin(sync)); sync() },
  })

  sync()
}

main().catch(console.error)
