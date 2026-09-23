import { useState } from 'react'
import { TransactionForm } from '../components/TransactionForm'
import { usePagination } from '../lib/usePagination'
import { useBanking } from '../state/BankingContext'
import type { TransactionDraft } from '../types'
import { Modal } from '../ui/Modal'
import { PageHeader } from '../ui/PageHeader'
import { Pagination } from '../ui/Pagination'

type Dialog = null

export function TransactionsPage() {
  const banking = useBanking()
  const [, setDialog] = useState<Dialog>(null)
  const { page, pageCount, visible, setPage } = usePagination(banking.transactions)

  const submit = (draft: TransactionDraft) => {
    banking.recordTransaction(draft)
  }

  return (
    <>
      <PageHeader title="Transactions" actionLabel="Record transaction" onAction={() => setDialog(null)} />

      <div className="card">
        <table aria-label="Transactions">
          <thead>
            <tr>
              <th scope="col">Account number</th>
              <th scope="col">Type</th>
              <th scope="col">Amount</th>
              <th scope="col">Description</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td className="empty" colSpan={4}>
                  No transactions yet.
                </td>
              </tr>
            )}
            {visible.map((transaction) => {
              const owner = banking.getAccount(transaction.accountId)
              return (
                <tr key={transaction.id}>
                  <td>{owner ? owner.accountNumber : 'Unknown'}</td>
                  <td>{transaction.type}</td>
                  <td>{transaction.amount}</td>
                  <td>{transaction.description}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageCount={pageCount} onChange={setPage} />

      <Modal title="Record transaction" onClose={() => setDialog(null)}>
        <TransactionForm accounts={banking.accounts} onSubmit={submit} onCancel={() => setDialog(null)} />
      </Modal>
    </>
  )
}
