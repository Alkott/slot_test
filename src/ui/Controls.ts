export interface ControlCallbacks {
  onAddMachine: () => void
  onRemoveMachine: () => void
  onSpin: () => void
}

export class Controls {
  private btnAddMachine = document.getElementById('btn-add-machine') as HTMLButtonElement
  private btnRemoveMachine = document.getElementById('btn-remove-machine') as HTMLButtonElement
  private btnSpin = document.getElementById('btn-spin') as HTMLButtonElement
  private machineCount = document.getElementById('machine-count') as HTMLSpanElement
  private maskCount = document.getElementById('mask-count') as HTMLSpanElement

  constructor(callbacks: ControlCallbacks) {
    if (!this.btnAddMachine || !this.btnRemoveMachine || !this.btnSpin) {
      throw new Error('Controls: btn-add-machine, btn-remove-machine, btn-spin must exist in the DOM')
    }
    this.btnAddMachine.addEventListener('click', callbacks.onAddMachine)
    this.btnRemoveMachine.addEventListener('click', callbacks.onRemoveMachine)
    this.btnSpin.addEventListener('click', callbacks.onSpin)
  }

  update(machineCount: number, isSpinning: boolean, maskCount: number): void {
    this.btnRemoveMachine.disabled = machineCount <= 1
    this.btnSpin.disabled = isSpinning
    this.machineCount.textContent = `Machines: ${machineCount}`
    this.maskCount.textContent = `Masks: ${maskCount}`
  }
}
