import { useState } from 'react'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { CustomerForm } from '../components/CustomerForm'
import { usePagination } from '../lib/usePagination'
import { useBanking } from '../state/BankingContext'
import type { Customer, CustomerDraft } from '../types'
import { Modal } from '../ui/Modal'
import { PageHeader } from '../ui/PageHeader'
import { Pagination } from '../ui/Pagination'
import { RowActions } from '../ui/RowActions'

type Dialog = { mode: 'create' } | { mode: 'edit'; customer: Customer } | null

export function CustomersPage() {
  const banking = useBanking()
  const [dialog, setDialog] = useState<Dialog>(null)
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)
  const { page, pageCount, visible, setPage } = usePagination(banking.customers)

  const submit = (draft: CustomerDraft) => {
    if (dialog?.mode === 'edit') banking.updateCustomer(dialog.customer.id, draft)
    else banking.createCustomer(draft)
    setDialog(null)
  }

  const deleteTargetAccountCount = deleteTarget
    ? banking.accounts.filter((account) => account.customerId === deleteTarget.id).length
    : 0

  const confirmDeleteOnly = () => {
    if (!deleteTarget) return
    banking.deleteCustomer(deleteTarget.id)
    setDeleteTarget(null)
  }

  const confirmDeleteCascade = () => {
    if (!deleteTarget) return
    banking.deleteCustomer(deleteTarget.id, { cascade: true })
    setDeleteTarget(null)
  }

  return (
    <>
      <PageHeader title="Customers" actionLabel="Add customer" onAction={() => setDialog({ mode: 'create' })} />

      <div className="card">
        <table aria-label="Customers">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Phone</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td className="empty" colSpan={4}>
                  No customers yet.
                </td>
              </tr>
            )}
            {visible.map((customer) => (
              <tr key={customer.id}>
                <td>
                  {customer.firstName} {customer.lastName}
                </td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td>
                  <RowActions
                    label={`${customer.firstName} ${customer.lastName}`}
                    onEdit={() => setDialog({ mode: 'edit', customer })}
                    onDelete={() => setDeleteTarget(customer)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageCount={pageCount} onChange={setPage} />

      {dialog && (
        <Modal
          title={dialog.mode === 'edit' ? 'Edit customer' : 'New customer'}
          onClose={() => setDialog(null)}
        >
          <CustomerForm
            editing={dialog.mode === 'edit' ? dialog.customer : null}
            onSubmit={submit}
            onCancel={() => setDialog(null)}
          />
        </Modal>
      )}

      {deleteTarget && deleteTargetAccountCount === 0 && (
        <ConfirmDialog
          title="Delete customer"
          message={`Are you sure you want to delete ${deleteTarget.firstName} ${deleteTarget.lastName}? This cannot be undone.`}
          actions={[{ label: 'Delete customer', onClick: confirmDeleteOnly }]}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {deleteTarget && deleteTargetAccountCount > 0 && (
        <ConfirmDialog
          title="Delete customer"
          message={`This customer has ${deleteTargetAccountCount} account(s). Choose whether to delete the customer only or delete customer and all accounts.`}
          actions={[
            { label: 'Delete customer only', onClick: confirmDeleteOnly, disabled: true },
            { label: 'Delete customer and all accounts', onClick: confirmDeleteCascade },
          ]}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  )
}
