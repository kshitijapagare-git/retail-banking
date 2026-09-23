import { useState } from 'react'
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
  const [query, setQuery] = useState('')
  const trimmedQuery = query.trim()

  const filtered =
    trimmedQuery === ''
      ? banking.customers
      : banking.customers.filter((customer) => {
          const q = trimmedQuery.toLowerCase()
          const firstName = customer.firstName.toLowerCase()
          const lastName = customer.lastName.toLowerCase()
          const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase()
          const email = customer.email.toLowerCase()
          return firstName.includes(q) || lastName.includes(q) || fullName.includes(q) || email.includes(q)
        })

  const { page, pageCount, visible, setPage } = usePagination(filtered)

  const submit = (draft: CustomerDraft) => {
    if (dialog?.mode === 'edit') banking.updateCustomer(dialog.customer.id, draft)
    else banking.createCustomer(draft)
    setDialog(null)
  }

  return (
    <>
      <PageHeader title="Customers" actionLabel="Add customer" onAction={() => setDialog({ mode: 'create' })} />

      <div className="field">
        <label htmlFor="customer-search">Search customers</label>
        <input
          id="customer-search"
          value={query}
          onChange={(event) => {
            setPage(1)
            setQuery(event.target.value)
          }}
        />
      </div>

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
                  {banking.customers.length === 0
                    ? 'No customers yet.'
                    : `No customers match "${trimmedQuery}"`}
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
                    onDelete={() => banking.deleteCustomer(customer.id)}
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
    </>
  )
}
