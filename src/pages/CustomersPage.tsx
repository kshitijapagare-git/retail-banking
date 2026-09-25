import { useState } from 'react'
import { CustomerForm } from '../components/CustomerForm'
import { usePagination } from '../lib/usePagination'
import { useBanking } from '../state/BankingContext'
import type { Customer, CustomerDraft } from '../types'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { Modal } from '../ui/Modal'
import { PageHeader } from '../ui/PageHeader'
import { Pagination } from '../ui/Pagination'
import { RowActions } from '../ui/RowActions'

type Dialog =
  | { mode: 'create' }
  | { mode: 'edit'; customer: Customer }
  | { mode: 'delete'; customer: Customer }
  | null

export function CustomersPage() {
  const banking = useBanking()
  const [dialog, setDialog] = useState<Dialog>(null)
  const { page, pageCount, visible, setPage } = usePagination(banking.customers)

  const submit = (draft: CustomerDraft) => {
    if (dialog?.mode === 'edit') banking.updateCustomer(dialog.customer.id, draft)
    else banking.createCustomer(draft)
    setDialog(null)
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
                    onDelete={() => setDialog({ mode: 'delete', customer })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageCount={pageCount} onChange={setPage} />

      {dialog && dialog.mode !== 'delete' && (
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

      {dialog && dialog.mode === 'delete' && (() => {
        const { customer } = dialog
        const accounts = banking.accountsForCustomer(customer.id)
        const name = `${customer.firstName} ${customer.lastName}`
        const n = accounts.length

        if (n === 0) {
          return (
            <ConfirmDialog
              title="Delete customer"
              message={`Delete ${name}? This cannot be undone.`}
              confirmLabel="Delete"
              onConfirm={() => {
                banking.deleteCustomer(customer.id)
                setDialog(null)
              }}
              onCancel={() => setDialog(null)}
            />
          )
        }

        const accountNumbers = accounts.map((account) => account.accountNumber).join(', ')
        return (
          <ConfirmDialog
            title="Delete customer"
            message={`${name} has ${n} account(s): ${accountNumbers}. Deleting the customer also deletes these accounts.`}
            confirmLabel={`Delete customer and ${n} account(s)`}
            onConfirm={() => {
              banking.deleteCustomerWithAccounts(customer.id)
              setDialog(null)
            }}
            onCancel={() => setDialog(null)}
          />
        )
      })()}
    </>
  )
}
