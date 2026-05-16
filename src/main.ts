import { Application, Assets, Container, Graphics } from 'pixi.js'
import { SlotGame } from './SlotGame'
import { Controls } from './ui/Controls'
import { FpsCounter } from './ui/FpsCounter'
import { computeTightMachineLayout } from './layout'
import { MAX_SYMBOL_SIZE, ROWS } from './config'
import { ATLAS_URL } from './reel/symbolTextures'

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

  await Assets.load(ATLAS_URL)

  const fpsCounter = new FpsCounter()
  app.stage.addChild(fpsCounter)
  app.ticker.add((ticker) => fpsCounter.update(ticker.deltaMS))

  const machines: SlotGame[] = []
  const rowContainers: Container[] = []
  const rowMasks: Graphics[] = []

  function relayout(): void {
    const W = app.screen.width
    const H = app.screen.height

    // Detach all machine containers so row containers are safe to resize/destroy
    for (const m of machines) m.container.parent?.removeChild(m.container)

    if (machines.length === 0) {
      for (const rc of rowContainers) { rc.mask = null; app.stage.removeChild(rc); rc.destroy({ children: true }) }
      rowContainers.length = 0
      rowMasks.length = 0
      return
    }

    const { layouts, rowBounds, perRow } = computeTightMachineLayout(
      W, H, machines.length, machines[0].reelCount, ROWS, MAX_SYMBOL_SIZE
    )

    // Grow row containers
    while (rowContainers.length < rowBounds.length) {
      const mask = new Graphics()
      const rc = new Container()
      rc.addChild(mask)
      rc.mask = mask
      const fpsIdx = app.stage.children.indexOf(fpsCounter)
      app.stage.addChildAt(rc, fpsIdx >= 0 ? fpsIdx : app.stage.children.length)
      rowContainers.push(rc)
      rowMasks.push(mask)
    }

    // Shrink row containers
    while (rowContainers.length > rowBounds.length) {
      const rc = rowContainers.pop()!
      rowMasks.pop()
      rc.mask = null
      app.stage.removeChild(rc)
      rc.destroy({ children: true })
    }

    // Assign machines to their row container and apply viewport
    for (let i = 0; i < machines.length; i++) {
      const row = Math.floor(i / perRow)
      rowContainers[row].addChild(machines[i].container)
      machines[i].setViewport(layouts[i].x, layouts[i].y, layouts[i].width, layouts[i].height)
    }

    // Machine viewports are exactly symbolSize-based, so row bounds = symbol area: no extra offset
    for (let r = 0; r < rowBounds.length; r++) {
      const b = rowBounds[r]
      rowMasks[r].clear()
      rowMasks[r].rect(b.x, b.y, b.width, b.height).fill(0xffffff)
    }

    app.stage.addChild(fpsCounter)
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
    controls?.update(machines.length, machines.some((m) => m.isSpinning), rowContainers.length)
  }

  controls = new Controls({
    onAddMachine: () => { addMachine(); sync() },
    onRemoveMachine: () => { removeMachine(); sync() },
    onSpin: () => { machines.forEach((m) => m.spin(sync)); sync() },
  })

  sync()
}

main().catch(console.error)
