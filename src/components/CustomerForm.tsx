import { useState, type FormEvent } from 'react'
import type { Customer, CustomerDraft } from '../types'

const EMPTY: CustomerDraft = { firstName: '', lastName: '', email: '', phone: '' }

function toDraft(customer: Customer | null): CustomerDraft {
  if (!customer) return EMPTY
  const { firstName, lastName, email, phone } = customer
  return { firstName, lastName, email, phone }
}

export function CustomerForm({
  editing,
  onSubmit,
  onCancel,
}: {
  editing: Customer | null
  onSubmit: (draft: CustomerDraft) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState<CustomerDraft>(() => toDraft(editing))

  const set = (field: keyof CustomerDraft) => (event: { target: { value: string } }) =>
    setDraft((current) => ({ ...current, [field]: event.target.value }))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit(draft)
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="customer-firstName">First name</label>
        <input id="customer-firstName" value={draft.firstName} onChange={set('firstName')} />
      </div>

      <div className="field">
        <label htmlFor="customer-lastName">Last name</label>
        <input id="customer-lastName" value={draft.lastName} onChange={set('lastName')} />
      </div>

      <div className="field">
        <label htmlFor="customer-email">Email</label>
        <input id="customer-email" value={draft.email} onChange={set('email')} />
      </div>

      <div className="field">
        <label htmlFor="customer-phone">Phone</label>
        <input id="customer-phone" value={draft.phone} onChange={set('phone')} />
      </div>

      <div className="modal-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {editing ? 'Save customer' : 'Add customer'}
        </button>
      </div>
    </form>
  )
}
