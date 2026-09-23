import { useState, type FormEvent } from 'react'
import type { Account, AccountDraft, AccountStatus, Customer } from '../types'
import { ACCOUNT_STATUSES } from '../types'

interface FormValues {
  accountNumber: string
  customerId: string
  balance: string
  status: AccountStatus
}

const EMPTY: FormValues = { accountNumber: '', customerId: '', balance: '', status: 'ACTIVE' }

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
  onSubmit,
  onCancel,
}: {
  editing: Account | null
  customers: Customer[]
  onSubmit: (draft: AccountDraft) => void
  onCancel: () => void
}) {
  const [values, setValues] = useState<FormValues>(() => toValues(editing))

  const set = (field: keyof FormValues) => (event: { target: { value: string } }) =>
    setValues((current) => ({ ...current, [field]: event.target.value as FormValues[typeof field] }))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit({
      accountNumber: values.accountNumber,
      customerId: values.customerId,
      balance: Number(values.balance) || 0,
      status: values.status,
    })
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="account-number">Account number</label>
        <input id="account-number" value={values.accountNumber} onChange={set('accountNumber')} />
      </div>

      <div className="field">
        <label htmlFor="account-customer">Customer</label>
        <select id="account-customer" value={values.customerId} onChange={set('customerId')}>
          <option value="">Select a customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.firstName} {customer.lastName}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="account-balance">Balance</label>
        <input id="account-balance" type="number" step="0.01" value={values.balance} onChange={set('balance')} />
      </div>

      <div className="field">
        <label htmlFor="account-status">Status</label>
        <select id="account-status" value={values.status} onChange={(event) => set('status')({ target: { value: event.target.value } })}>
          {ACCOUNT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
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
