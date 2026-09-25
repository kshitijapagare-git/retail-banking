import { useState, type FormEvent } from 'react'
import { StoreError } from '../data/bankingStore'
import { validateCustomer, type FieldErrors } from '../lib/validation'
import type { Customer, CustomerDraft } from '../types'

const EMPTY: CustomerDraft = { firstName: '', lastName: '', email: '', phone: '' }

function toDraft(customer: Customer | null): CustomerDraft {
  if (!customer) return EMPTY
  const { firstName, lastName, email, phone } = customer
  return { firstName, lastName, email, phone }
}

const FIELD_IDS: Record<keyof CustomerDraft, string> = {
  firstName: 'customer-firstName',
  lastName: 'customer-lastName',
  email: 'customer-email',
  phone: 'customer-phone',
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
  const [errors, setErrors] = useState<FieldErrors<CustomerDraft>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const set = (field: keyof CustomerDraft) => (event: { target: { value: string } }) => {
    setDraft((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors = validateCustomer(draft)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    try {
      onSubmit(draft)
      setSubmitError(null)
    } catch (error) {
      if (error instanceof StoreError) {
        setSubmitError(error.message)
      } else {
        throw error
      }
    }
  }

  const errorProps = (field: keyof CustomerDraft) => {
    const error = errors[field]
    if (!error) return {}
    const errorId = `${FIELD_IDS[field]}-error`
    return { 'aria-invalid': 'true' as const, 'aria-describedby': errorId }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {submitError && (
        <p role="alert" className="field-error">
          {submitError}
        </p>
      )}

      <div className="field">
        <label htmlFor="customer-firstName">First name</label>
        <input
          id="customer-firstName"
          value={draft.firstName}
          onChange={set('firstName')}
          {...errorProps('firstName')}
        />
        {errors.firstName && (
          <p id="customer-firstName-error" className="field-error">
            {errors.firstName}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="customer-lastName">Last name</label>
        <input
          id="customer-lastName"
          value={draft.lastName}
          onChange={set('lastName')}
          {...errorProps('lastName')}
        />
        {errors.lastName && (
          <p id="customer-lastName-error" className="field-error">
            {errors.lastName}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="customer-email">Email</label>
        <input id="customer-email" value={draft.email} onChange={set('email')} {...errorProps('email')} />
        {errors.email && (
          <p id="customer-email-error" className="field-error">
            {errors.email}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="customer-phone">Phone</label>
        <input id="customer-phone" value={draft.phone} onChange={set('phone')} {...errorProps('phone')} />
        {errors.phone && (
          <p id="customer-phone-error" className="field-error">
            {errors.phone}
          </p>
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
