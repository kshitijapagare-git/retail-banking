import type { CustomerDraft } from '../types'

export type FieldErrors<T> = Partial<Record<keyof T, string>>

export interface AccountFormValues {
  accountNumber: string
  customerId: string
  balance: string
  status: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[\d\s+\-()]+$/
const ACCOUNT_NUMBER_PATTERN = /^ACC-\d{4}$/

export function validateCustomer(draft: CustomerDraft): FieldErrors<CustomerDraft> {
  const errors: FieldErrors<CustomerDraft> = {}

  if (!draft.firstName.trim()) {
    errors.firstName = 'First name is required'
  }

  if (!draft.lastName.trim()) {
    errors.lastName = 'Last name is required'
  }

  if (!EMAIL_PATTERN.test(draft.email)) {
    errors.email = 'Enter a valid email address'
  }

  const digitCount = (draft.phone.match(/\d/g) ?? []).length
  if (!PHONE_PATTERN.test(draft.phone) || digitCount < 7) {
    errors.phone = 'Enter a valid phone number'
  }

  return errors
}

export function validateAccount(values: AccountFormValues): FieldErrors<AccountFormValues> {
  const errors: FieldErrors<AccountFormValues> = {}

  if (!ACCOUNT_NUMBER_PATTERN.test(values.accountNumber)) {
    errors.accountNumber = 'Account number must look like ACC-1234'
  }

  if (!values.customerId) {
    errors.customerId = 'Select a customer'
  }

  const balance = Number(values.balance.trim())
  if (!values.balance.trim() || !Number.isFinite(balance) || balance < 0) {
    errors.balance = 'Balance must be zero or more'
  }

  if (!values.status.trim()) {
    errors.status = 'Status is required'
  }

  return errors
}
