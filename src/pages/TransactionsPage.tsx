import { useState } from 'react'
import { TransactionForm } from '../components/TransactionForm'
import { toIsoDate } from '../lib/date'
import { usePagination } from '../lib/usePagination'
import { useBanking } from '../state/BankingContext'
import type { Transaction, TransactionDraft } from '../types'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { Modal } from '../ui/Modal'
import { PageHeader } from '../ui/PageHeader'
import { Pagination } from '../ui/Pagination'
import { RowActions } from '../ui/RowActions'

type Dialog = { mode: 'create' } | { mode: 'edit'; transaction: Transaction } | null

export function TransactionsPage() {
  const banking = useBanking()
  const [dialog, setDialog] = useState<Dialog>(null)
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null)
  const { page, pageCount, visible, setPage } = usePagination(banking.transactions)

  const submit = (draft: TransactionDraft) => {
    if (dialog?.mode === 'edit') banking.updateTransaction(dialog.transaction.id, draft)
    else banking.createTransaction(draft)
    setDialog(null)
  }

  return (
    <>
      <PageHeader
        title="Transactions"
        actionLabel="Add transaction"
        onAction={() => setDialog({ mode: 'create' })}
      />

      <div className="card">
        <table aria-label="Transactions">
          <thead>
            <tr>
              <th scope="col">Reference</th>
              <th scope="col">Account</th>
              <th scope="col">Type</th>
              <th scope="col">Amount</th>
              <th scope="col">Transacted on</th>
              <th scope="col">Description</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td className="empty" colSpan={7}>
                  No transactions yet.
                </td>
              </tr>
            )}
            {visible.map((transaction) => {
              const account = banking.getAccount(transaction.accountId)
              return (
                <tr key={transaction.id}>
                  <td>{transaction.reference}</td>
                  <td>{account?.accountNumber ?? 'Unknown'}</td>
                  <td>{transaction.type}</td>
                  <td>{transaction.amount}</td>
                  <td>{toIsoDate(transaction.transactedAt)}</td>
                  <td>{transaction.description}</td>
                  <td>
                    <RowActions
                      label={transaction.reference}
                      onEdit={() => setDialog({ mode: 'edit', transaction })}
                      onDelete={() => setPendingDelete(transaction)}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageCount={pageCount} onChange={setPage} />

      {dialog && (
        <Modal
          title={dialog.mode === 'edit' ? 'Edit transaction' : 'New transaction'}
          onClose={() => setDialog(null)}
        >
          <TransactionForm
            editing={dialog.mode === 'edit' ? dialog.transaction : null}
            accounts={banking.accounts}
            onSubmit={submit}
            onCancel={() => setDialog(null)}
          />
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete transaction"
          message={`Are you sure you want to delete transaction ${pendingDelete.reference}?`}
          onConfirm={() => {
            banking.deleteTransaction(pendingDelete.id)
            setPendingDelete(null)
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  )
}
