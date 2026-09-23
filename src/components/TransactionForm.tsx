import { useState, type FormEvent } from 'react'
import type { Account, TransactionDraft } from '../types'

function normalizeError(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Unknown error'
}

export function TransactionForm({
  accounts,
  onSubmit,
  onCancel,
}: {
  accounts: Account[]
  onSubmit: (draft: TransactionDraft) => void
  onCancel: () => void
}) {
  const [accountId, setAccountId] = useState('')
  const [type, setType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    try {
      onSubmit({
        accountId,
        type,
        amount: Number(amount) || 0,
        description,
      })
      onCancel()
    } catch (e) {
      setError(normalizeError(e))
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="transaction-account">Account</label>
        <select
          id="transaction-account"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        >
          <option value="">Select an account</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.accountNumber}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="transaction-type">Type</label>
        <select id="transaction-type" value={type} onChange={(e) => setType(e.target.value as any)}>
          <option value="DEPOSIT">DEPOSIT</option>
          <option value="WITHDRAWAL">WITHDRAWAL</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="transaction-amount">Amount</label>
        <input
          id="transaction-amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="transaction-description">Description</label>
        <input
          id="transaction-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {error && (
        <div role="alert" style={{ color: 'var(--ink)' }}>
          {error}
        </div>
      )}

      <div className="modal-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Record transaction
        </button>
      </div>
    </form>
  )
}
