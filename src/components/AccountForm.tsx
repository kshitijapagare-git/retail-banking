import { useState, type FormEvent } from 'react'
import { validateAccountDraft, type FieldErrors } from '../lib/validation'
import type { Account, AccountDraft, Customer } from '../types'

interface FormValues {
  accountNumber: string
  customerId: string
  balance: string
  status: string
}

const EMPTY: FormValues = { accountNumber: '', customerId: '', balance: '', status: '' }

function toValues(account: Account | null): FormValues {
  if (!account) return EMPTY
  return {
    accountNumber: account.accountNumber,
    customerId: account.customerId,
    balance: String(account.balance),
    status: account.status,
  }
}

export function AccountForm({
  editing,
  customers,
  accounts,
  onSubmit,
  onCancel,
}: {
  editing: Account | null
  customers: Customer[]
  accounts: Account[]
  onSubmit: (draft: AccountDraft) => void
  onCancel: () => void
}) {
  const [values, setValues] = useState<FormValues>(() => toValues(editing))
  const [errors, setErrors] = useState<FieldErrors>({})

  const set = (field: keyof FormValues) => (event: { target: { value: string } }) => {
    setValues((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => {
      if (!current[field]) return current
      const { [field]: _removed, ...rest } = current
      return rest
    })
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const draft: AccountDraft = {
      accountNumber: values.accountNumber,
      customerId: values.customerId,
      balance: Number(values.balance) || 0,
      status: values.status,
    }
    const validationErrors = validateAccountDraft(draft, accounts, editing?.id)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    onSubmit(draft)
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="account-number">Account number</label>
        <input
          id="account-number"
          value={values.accountNumber}
          onChange={set('accountNumber')}
          aria-invalid={errors.accountNumber ? 'true' : undefined}
          aria-describedby={errors.accountNumber ? 'account-accountNumber-error' : undefined}
        />
        {errors.accountNumber && (
          <div role="alert" id="account-accountNumber-error">
            {errors.accountNumber}
          </div>
        )}
      </div>

      <div className="field">
        <label htmlFor="account-customer">Customer</label>
        <select
          id="account-customer"
          value={values.customerId}
          onChange={set('customerId')}
          aria-invalid={errors.customerId ? 'true' : undefined}
          aria-describedby={errors.customerId ? 'account-customerId-error' : undefined}
        >
          <option value="">Select a customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.firstName} {customer.lastName}
            </option>
          ))}
        </select>
        {errors.customerId && (
          <div role="alert" id="account-customerId-error">
            {errors.customerId}
          </div>
        )}
      </div>

      <div className="field">
        <label htmlFor="account-balance">Balance</label>
        <input id="account-balance" type="number" step="0.01" value={values.balance} onChange={set('balance')} />
      </div>

      <div className="field">
        <label htmlFor="account-status">Status</label>
        <input
          id="account-status"
          value={values.status}
          onChange={set('status')}
          aria-invalid={errors.status ? 'true' : undefined}
          aria-describedby={errors.status ? 'account-status-error' : undefined}
        />
        {errors.status && (
          <div role="alert" id="account-status-error">
            {errors.status}
          </div>
        )}
      </div>

      <div className="modal-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {editing ? 'Save account' : 'Add account'}
        </button>
      </div>
    </form>
  )
}
