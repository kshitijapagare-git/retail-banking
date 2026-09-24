import { useState, type FormEvent } from 'react'
import type { Account, Transaction, TransactionDraft, TransactionType } from '../types'
import { DatePicker } from './DatePicker'
import { Select } from './Select'
import { Textarea } from './Textarea'
import { startOfToday } from '../lib/date'

const TYPE_OPTIONS: TransactionType[] = ['DEBIT', 'CREDIT', 'TRANSFER']

const DESCRIPTION_MAX_LENGTH = 255

interface FormValues {
  reference: string
  accountId: string
  type: TransactionType
  amount: string
  transactedAt: Date
  description: string
}

function toValues(transaction: Transaction | null): FormValues {
  if (!transaction) {
    return {
      reference: '',
      accountId: '',
      type: 'DEBIT',
      amount: '0',
      transactedAt: startOfToday(),
      description: '',
    }
  }
  return {
    reference: transaction.reference,
    accountId: transaction.accountId,
    type: transaction.type,
    amount: String(transaction.amount),
    transactedAt: transaction.transactedAt,
    description: transaction.description ?? '',
  }
}

export function TransactionForm({
  editing,
  accounts,
  onSubmit,
  onCancel,
}: {
  editing: Transaction | null
  accounts: Account[]
  onSubmit: (draft: TransactionDraft) => void
  onCancel: () => void
}) {
  const [values, setValues] = useState<FormValues>(() => toValues(editing))

  const set = (field: 'reference') => (event: { target: { value: string } }) =>
    setValues((current) => ({ ...current, [field]: event.target.value }))

  const amount = Number(values.amount)

  const canSubmit =
    values.reference.trim() !== '' &&
    values.accountId !== '' &&
    Number.isFinite(amount) &&
    amount > 0 &&
    values.description.trim().length <= DESCRIPTION_MAX_LENGTH

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    const description = values.description.trim()
    onSubmit({
      reference: values.reference,
      accountId: values.accountId,
      type: values.type,
      amount,
      transactedAt: values.transactedAt,
      description: description === '' ? undefined : description,
    })
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="transaction-reference">Reference</label>
        <input id="transaction-reference" value={values.reference} onChange={set('reference')} />
      </div>

      <Select
        id="transaction-account"
        label="Account"
        value={values.accountId}
        placeholder="Select an account"
        options={accounts.map((account) => ({ value: account.id, label: account.accountNumber }))}
        onChange={(value) => setValues((current) => ({ ...current, accountId: value }))}
      />

      <Select
        id="transaction-type"
        label="Type"
        value={values.type}
        options={TYPE_OPTIONS.map((type) => ({ value: type, label: type }))}
        onChange={(value) => setValues((current) => ({ ...current, type: value as TransactionType }))}
      />

      <div className="field">
        <label htmlFor="transaction-amount">Amount</label>
        <input
          id="transaction-amount"
          type="text"
          inputMode="decimal"
          value={values.amount}
          onChange={(event) => setValues((current) => ({ ...current, amount: event.target.value }))}
        />
      </div>

      <DatePicker
        id="transaction-transacted-on"
        label="Transacted on"
        value={values.transactedAt}
        max={startOfToday()}
        onChange={(value) => setValues((current) => ({ ...current, transactedAt: value }))}
      />

      <Textarea
        id="transaction-description"
        label="Description"
        value={values.description}
        maxLength={DESCRIPTION_MAX_LENGTH}
        onChange={(value) => setValues((current) => ({ ...current, description: value }))}
      />

      <div className="modal-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={!canSubmit}>
          {editing ? 'Save transaction' : 'Add transaction'}
        </button>
      </div>
    </form>
  )
}
