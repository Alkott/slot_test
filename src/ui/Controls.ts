export interface ControlCallbacks {
  onAdd: () => void
  onRemove: () => void
  onAddRow: () => void
  onRemoveRow: () => void
  onSpin: () => void
}

export class Controls {
  private btnAdd = document.getElementById('btn-add') as HTMLButtonElement
  private btnRemove = document.getElementById('btn-remove') as HTMLButtonElement
  private btnAddRow = document.getElementById('btn-add-row') as HTMLButtonElement
  private btnRemoveRow = document.getElementById('btn-remove-row') as HTMLButtonElement
  private btnSpin = document.getElementById('btn-spin') as HTMLButtonElement

  constructor(callbacks: ControlCallbacks) {
    if (!this.btnAdd || !this.btnRemove || !this.btnAddRow || !this.btnRemoveRow || !this.btnSpin) {
      throw new Error('Controls: btn-add, btn-remove, btn-add-row, btn-remove-row, btn-spin must exist in the DOM')
    }
    this.btnAdd.addEventListener('click', callbacks.onAdd)
    this.btnRemove.addEventListener('click', callbacks.onRemove)
    this.btnAddRow.addEventListener('click', callbacks.onAddRow)
    this.btnRemoveRow.addEventListener('click', callbacks.onRemoveRow)
    this.btnSpin.addEventListener('click', callbacks.onSpin)
  }

  update(reelCount: number, rowCount: number, isSpinning: boolean): void {
    this.btnRemove.disabled = reelCount <= 1
    this.btnRemoveRow.disabled = rowCount <= 1
    this.btnSpin.disabled = isSpinning
  }
}
