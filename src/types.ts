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
