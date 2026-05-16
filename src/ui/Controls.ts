export interface ControlCallbacks {
  onAdd: () => void
  onRemove: () => void
  onSpin: () => void
}

export class Controls {
  private btnAdd = document.getElementById('btn-add') as HTMLButtonElement
  private btnRemove = document.getElementById('btn-remove') as HTMLButtonElement
  private btnSpin = document.getElementById('btn-spin') as HTMLButtonElement

  constructor(callbacks: ControlCallbacks) {
    this.btnAdd.addEventListener('click', callbacks.onAdd)
    this.btnRemove.addEventListener('click', callbacks.onRemove)
    this.btnSpin.addEventListener('click', callbacks.onSpin)
  }

  update(reelCount: number, isSpinning: boolean): void {
    this.btnRemove.disabled = reelCount <= 1
    this.btnSpin.disabled = isSpinning
  }
}
