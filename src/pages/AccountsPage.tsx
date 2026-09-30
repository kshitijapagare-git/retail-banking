import { useState } from 'react'
import { AccountForm } from '../components/AccountForm'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { usePagination } from '../lib/usePagination'
import { useBanking } from '../state/BankingContext'
import type { Account, AccountDraft } from '../types'
import { Modal } from '../ui/Modal'
import { PageHeader } from '../ui/PageHeader'
import { Pagination } from '../ui/Pagination'
import { RowActions } from '../ui/RowActions'

type Dialog = { mode: 'create' } | { mode: 'edit'; account: Account } | null

export function AccountsPage() {
  const banking = useBanking()
  const [dialog, setDialog] = useState<Dialog>(null)
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null)
  const { page, pageCount, visible, setPage } = usePagination(banking.accounts)

  const submit = (draft: AccountDraft) => {
    if (dialog?.mode === 'edit') banking.updateAccount(dialog.account.id, draft)
    else banking.createAccount(draft)
    setDialog(null)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    banking.deleteAccount(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <>
      <PageHeader title="Accounts" actionLabel="Add account" onAction={() => setDialog({ mode: 'create' })} />

      <div className="card">
        <table aria-label="Accounts">
          <thead>
            <tr>
              <th scope="col">Account number</th>
              <th scope="col">Customer</th>
              <th scope="col">Balance</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td className="empty" colSpan={5}>
                  No accounts yet.
                </td>
              </tr>
            )}
            {visible.map((account) => {
              const owner = banking.getCustomer(account.customerId)
              return (
                <tr key={account.id}>
                  <td>{account.accountNumber}</td>
                  <td>{owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown'}</td>
                  <td>{account.balance}</td>
                  <td>{account.status}</td>
                  <td>
                    <RowActions
                      label={account.accountNumber}
                      onEdit={() => setDialog({ mode: 'edit', account })}
                      onDelete={() => setDeleteTarget(account)}
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
        <Modal title={dialog.mode === 'edit' ? 'Edit account' : 'New account'} onClose={() => setDialog(null)}>
          <AccountForm
            editing={dialog.mode === 'edit' ? dialog.account : null}
            customers={banking.customers}
            onSubmit={submit}
            onCancel={() => setDialog(null)}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete account"
          message={`Are you sure you want to delete account ${deleteTarget.accountNumber}? This cannot be undone.`}
          actions={[{ label: 'Delete account', onClick: confirmDelete }]}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  )
}
