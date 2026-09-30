import type { ReactNode } from 'react'
import { Modal } from '../ui/Modal'

export interface ConfirmDialogAction {
  label: string
  onClick: () => void
  disabled?: boolean
}

export function ConfirmDialog({
  title,
  message,
  actions,
  onClose,
}: {
  title: string
  message: ReactNode
  actions: ConfirmDialogAction[]
  onClose: () => void
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <p>{message}</p>
      <div className="modal-actions">
        <button type="button" className="btn-ghost" onClick={onClose}>
          Cancel
        </button>
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className="btn-primary"
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.label}
          </button>
        ))}
      </div>
    </Modal>
  )
}
