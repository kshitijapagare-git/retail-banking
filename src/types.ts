export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

export type CustomerDraft = Omit<Customer, 'id'>

export interface AccountType {
  id: string
  name: string
}

export type AccountTypeDraft = Omit<AccountType, 'id'>

export interface Branch {
  id: string
  name: string
}

export type BranchDraft = Omit<Branch, 'id'>

export interface Account {
  id: string
  accountNumber: string
  /** FK -> Customer.id */
  customerId: string
  /** FK -> AccountType.id */
  accountTypeId: string
  /** FK -> Branch.id */
  branchId: string
  balance: number
  status: string
  /** Defaults to today on create; never a future date. */
  openedOn: Date
}

export type AccountDraft = Omit<Account, 'id'>

export type TransactionType = 'DEBIT' | 'CREDIT' | 'TRANSFER'

export interface Transaction {
  id: string
  reference: string
  /** FK -> Account.id */
  accountId: string
  type: TransactionType
  /** Expected > 0; enforced by the form/store, not the type itself. */
  amount: number
  /** Never a future date. */
  transactedAt: Date
  /** Optional; max 255 chars enforced by the form. */
  description?: string
}

export type TransactionDraft = Omit<Transaction, 'id'>
