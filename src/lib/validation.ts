import type { Account, AccountDraft, Customer, CustomerDraft } from '../types'

export type FieldErrors = Record<string, string>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateCustomerDraft(
  draft: CustomerDraft,
  customers: Customer[],
  editingId?: string,
): FieldErrors {
  const errors: FieldErrors = {}

  const firstName = draft.firstName.trim()
  const lastName = draft.lastName.trim()
  const email = draft.email.trim()
  const phone = draft.phone.trim()

  if (!firstName) errors.firstName = 'First name is required.'
  if (!lastName) errors.lastName = 'Last name is required.'
  if (!phone) errors.phone = 'Phone is required.'

  if (!email) {
    errors.email = 'Email is required.'
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'Enter a valid email address.'
  } else {
    const normalized = email.toLowerCase()
    const duplicate = customers.some(
      (customer) => customer.id !== editingId && customer.email.trim().toLowerCase() === normalized,
    )
    if (duplicate) errors.email = 'A customer with this email already exists.'
  }

  return errors
}

export function validateAccountDraft(
  draft: AccountDraft,
  accounts: Account[],
  editingId?: string,
): FieldErrors {
  const errors: FieldErrors = {}

  const accountNumber = draft.accountNumber.trim()
  const customerId = draft.customerId.trim()
  const status = draft.status.trim()

  if (!customerId) errors.customerId = 'Customer is required.'
  if (!status) errors.status = 'Status is required.'

  if (!accountNumber) {
    errors.accountNumber = 'Account number is required.'
  } else {
    const duplicate = accounts.some(
      (account) => account.id !== editingId && account.accountNumber.trim() === accountNumber,
    )
    if (duplicate) errors.accountNumber = 'An account with this account number already exists.'
  }

  return errors
}
