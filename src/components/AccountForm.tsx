import { useState, type FormEvent } from 'react'
import { StoreError } from '../data/bankingStore'
import { validateAccount, type AccountFormValues, type FieldErrors } from '../lib/validation'
import type { Account, AccountDraft, Customer } from '../types'

const EMPTY: AccountFormValues = { accountNumber: '', customerId: '', balance: '', status: '' }

function toValues(account: Account | null): AccountFormValues {
  if (!account) return EMPTY
  return {
    accountNumber: account.accountNumber,
    customerId: account.customerId,
    balance: String(account.balance),
    status: account.status,
  }
}

const FIELD_IDS: Record<keyof AccountFormValues, string> = {
  accountNumber: 'account-number',
  customerId: 'account-customer',
  balance: 'account-balance',
  status: 'account-status',
}

export function AccountForm({
  editing,
  customers,
  onSubmit,
  onCancel,
}: {
  editing: Account | null
  customers: Customer[]
  onSubmit: (draft: AccountDraft) => void
  onCancel: () => void
}) {
  const [values, setValues] = useState<AccountFormValues>(() => toValues(editing))
  const [errors, setErrors] = useState<FieldErrors<AccountFormValues>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const set = (field: keyof AccountFormValues) => (event: { target: { value: string } }) => {
    setValues((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors = validateAccount(values)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    try {
      onSubmit({
        accountNumber: values.accountNumber,
        customerId: values.customerId,
        balance: Number(values.balance.trim()) || 0,
        status: values.status,
      })
      setSubmitError(null)
    } catch (error) {
      if (error instanceof StoreError) {
        setSubmitError(error.message)
      } else {
        throw error
      }
    }
  }

  const errorProps = (field: keyof AccountFormValues) => {
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
        <label htmlFor="account-number">Account number</label>
        <input
          id="account-number"
          value={values.accountNumber}
          onChange={set('accountNumber')}
          {...errorProps('accountNumber')}
        />
        {errors.accountNumber && (
          <p id="account-number-error" className="field-error">
            {errors.accountNumber}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="account-customer">Customer</label>
        <select
          id="account-customer"
          value={values.customerId}
          onChange={set('customerId')}
          {...errorProps('customerId')}
        >
          <option value="">Select a customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.firstName} {customer.lastName}
            </option>
          ))}
        </select>
        {errors.customerId && (
          <p id="account-customer-error" className="field-error">
            {errors.customerId}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="account-balance">Balance</label>
        <input
          id="account-balance"
          type="number"
          step="0.01"
          value={values.balance}
          onChange={set('balance')}
          {...errorProps('balance')}
        />
        {errors.balance && (
          <p id="account-balance-error" className="field-error">
            {errors.balance}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="account-status">Status</label>
        <input id="account-status" value={values.status} onChange={set('status')} {...errorProps('status')} />
        {errors.status && (
          <p id="account-status-error" className="field-error">
            {errors.status}
          </p>
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
