import { useState, type FormEvent } from 'react'
import type { Account, AccountDraft, AccountType, Branch, Customer } from '../types'
import { CurrencyInput } from './CurrencyInput'
import { DatePicker } from './DatePicker'
import { Select } from './Select'
import { startOfToday } from '../lib/date'

const STATUS_OPTIONS = ['ACTIVE', 'DORMANT', 'FROZEN', 'CLOSED']

interface FormValues {
  accountNumber: string
  customerId: string
  accountTypeId: string
  branchId: string
  balance: number
  status: string
  openedOn: Date
}

function toValues(account: Account | null): FormValues {
  if (!account) {
    return {
      accountNumber: '',
      customerId: '',
      accountTypeId: '',
      branchId: '',
      balance: 0,
      status: 'ACTIVE',
      openedOn: startOfToday(),
    }
  }
  return {
    accountNumber: account.accountNumber,
    customerId: account.customerId,
    accountTypeId: account.accountTypeId,
    branchId: account.branchId,
    balance: account.balance,
    status: account.status,
    openedOn: account.openedOn,
  }
}

export function AccountForm({
  editing,
  customers,
  accountTypes,
  branches,
  onSubmit,
  onCancel,
}: {
  editing: Account | null
  customers: Customer[]
  accountTypes: AccountType[]
  branches: Branch[]
  onSubmit: (draft: AccountDraft) => void
  onCancel: () => void
}) {
  const [values, setValues] = useState<FormValues>(() => toValues(editing))

  const set = (field: keyof FormValues) => (event: { target: { value: string } }) =>
    setValues((current) => ({ ...current, [field]: event.target.value }))

  const canSubmit = values.accountTypeId !== '' && values.branchId !== ''

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit({
      accountNumber: values.accountNumber,
      customerId: values.customerId,
      accountTypeId: values.accountTypeId,
      branchId: values.branchId,
      balance: values.balance,
      status: values.status,
      openedOn: values.openedOn,
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

      <Select
        id="account-type"
        label="Account type"
        value={values.accountTypeId}
        placeholder="Select an account type"
        options={accountTypes.map((accountType) => ({ value: accountType.id, label: accountType.name }))}
        onChange={(value) => setValues((current) => ({ ...current, accountTypeId: value }))}
      />

      <Select
        id="account-branch"
        label="Branch"
        value={values.branchId}
        placeholder="Select a branch"
        options={branches.map((branch) => ({ value: branch.id, label: branch.name }))}
        onChange={(value) => setValues((current) => ({ ...current, branchId: value }))}
      />

      <CurrencyInput
        id="account-balance"
        label="Balance"
        value={values.balance}
        onChange={(value) => setValues((current) => ({ ...current, balance: value }))}
      />

      <Select
        id="account-status"
        label="Status"
        value={values.status}
        options={STATUS_OPTIONS.map((status) => ({ value: status, label: status }))}
        onChange={(value) => setValues((current) => ({ ...current, status: value }))}
      />

      <DatePicker
        id="account-opened-on"
        label="Opened on"
        value={values.openedOn}
        max={startOfToday()}
        onChange={(value) => setValues((current) => ({ ...current, openedOn: value }))}
      />

      <div className="modal-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={!canSubmit}>
          {editing ? 'Save account' : 'Add account'}
        </button>
      </div>
    </form>
  )
}
