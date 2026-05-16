export interface ControlCallbacks {
  onAdd: () => void
  onRemove: () => void
  onAddRow: () => void
  onRemoveRow: () => void
  onAddMachine: () => void
  onRemoveMachine: () => void
  onSpin: () => void
}

export class Controls {
  private btnAdd = document.getElementById('btn-add') as HTMLButtonElement
  private btnRemove = document.getElementById('btn-remove') as HTMLButtonElement
  private btnAddRow = document.getElementById('btn-add-row') as HTMLButtonElement
  private btnRemoveRow = document.getElementById('btn-remove-row') as HTMLButtonElement
  private btnAddMachine = document.getElementById('btn-add-machine') as HTMLButtonElement
  private btnRemoveMachine = document.getElementById('btn-remove-machine') as HTMLButtonElement
  private btnSpin = document.getElementById('btn-spin') as HTMLButtonElement

  constructor(callbacks: ControlCallbacks) {
    const btns = [this.btnAdd, this.btnRemove, this.btnAddRow, this.btnRemoveRow,
                  this.btnAddMachine, this.btnRemoveMachine, this.btnSpin]
    if (btns.some((b) => !b)) {
      throw new Error('Controls: one or more required buttons missing from the DOM')
    }
    this.btnAdd.addEventListener('click', callbacks.onAdd)
    this.btnRemove.addEventListener('click', callbacks.onRemove)
    this.btnAddRow.addEventListener('click', callbacks.onAddRow)
    this.btnRemoveRow.addEventListener('click', callbacks.onRemoveRow)
    this.btnAddMachine.addEventListener('click', callbacks.onAddMachine)
    this.btnRemoveMachine.addEventListener('click', callbacks.onRemoveMachine)
    this.btnSpin.addEventListener('click', callbacks.onSpin)
  }

  update(machineCount: number, reelCount: number, rowCount: number, isSpinning: boolean): void {
    this.btnRemove.disabled = reelCount <= 1
    this.btnRemoveRow.disabled = rowCount <= 1
    this.btnRemoveMachine.disabled = machineCount <= 1
    this.btnSpin.disabled = isSpinning
  }
}
