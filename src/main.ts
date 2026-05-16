import { Application } from 'pixi.js'
import { ROWS } from './config'
import { Reel } from './reel/Reel'
import { FpsCounter } from './ui/FpsCounter'

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

  const reel = new Reel(ROWS)
  app.stage.addChild(reel)

  const fps = new FpsCounter()
  app.stage.addChild(fps)

  function layout(): void {
    reel.resize({
      rows: ROWS,
      symbolWidth: app.screen.width,
      symbolHeight: app.screen.height / ROWS,
      x: 0,
    })
  }
  layout()

  const btnSpin = document.getElementById('btn-spin') as HTMLButtonElement
  ;(document.getElementById('btn-add') as HTMLButtonElement).style.display = 'none'
  ;(document.getElementById('btn-remove') as HTMLButtonElement).style.display = 'none'

  btnSpin.addEventListener('click', () => {
    if (!reel.isIdle) return
    btnSpin.disabled = true
    reel.spin()
  })

  app.ticker.add((ticker) => {
    reel.update(ticker.deltaTime)
    fps.update(ticker.deltaMS)
    if (reel.isIdle) btnSpin.disabled = false
  })

  window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight)
    layout()
  })
}

main()
