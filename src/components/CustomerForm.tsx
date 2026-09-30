import { useState, type FormEvent } from 'react'
import { validateCustomerDraft, type FieldErrors } from '../lib/validation'
import type { Customer, CustomerDraft } from '../types'

const EMPTY: CustomerDraft = { firstName: '', lastName: '', email: '', phone: '' }

function toDraft(customer: Customer | null): CustomerDraft {
  if (!customer) return EMPTY
  const { firstName, lastName, email, phone } = customer
  return { firstName, lastName, email, phone }
}

export function CustomerForm({
  editing,
  customers,
  onSubmit,
  onCancel,
}: {
  editing: Customer | null
  customers: Customer[]
  onSubmit: (draft: CustomerDraft) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState<CustomerDraft>(() => toDraft(editing))
  const [errors, setErrors] = useState<FieldErrors>({})

  const set = (field: keyof CustomerDraft) => (event: { target: { value: string } }) => {
    setDraft((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => {
      if (!current[field]) return current
      const { [field]: _removed, ...rest } = current
      return rest
    })
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const validationErrors = validateCustomerDraft(draft, customers, editing?.id)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    onSubmit(draft)
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="customer-firstName">First name</label>
        <input
          id="customer-firstName"
          value={draft.firstName}
          onChange={set('firstName')}
          aria-invalid={errors.firstName ? 'true' : undefined}
          aria-describedby={errors.firstName ? 'customer-firstName-error' : undefined}
        />
        {errors.firstName && (
          <div role="alert" id="customer-firstName-error">
            {errors.firstName}
          </div>
        )}
      </div>

      <div className="field">
        <label htmlFor="customer-lastName">Last name</label>
        <input
          id="customer-lastName"
          value={draft.lastName}
          onChange={set('lastName')}
          aria-invalid={errors.lastName ? 'true' : undefined}
          aria-describedby={errors.lastName ? 'customer-lastName-error' : undefined}
        />
        {errors.lastName && (
          <div role="alert" id="customer-lastName-error">
            {errors.lastName}
          </div>
        )}
      </div>

      <div className="field">
        <label htmlFor="customer-email">Email</label>
        <input
          id="customer-email"
          value={draft.email}
          onChange={set('email')}
          aria-invalid={errors.email ? 'true' : undefined}
          aria-describedby={errors.email ? 'customer-email-error' : undefined}
        />
        {errors.email && (
          <div role="alert" id="customer-email-error">
            {errors.email}
          </div>
        )}
      </div>

      <div className="field">
        <label htmlFor="customer-phone">Phone</label>
        <input
          id="customer-phone"
          value={draft.phone}
          onChange={set('phone')}
          aria-invalid={errors.phone ? 'true' : undefined}
          aria-describedby={errors.phone ? 'customer-phone-error' : undefined}
        />
        {errors.phone && (
          <div role="alert" id="customer-phone-error">
            {errors.phone}
          </div>
        )}
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
