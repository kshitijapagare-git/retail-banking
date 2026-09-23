export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

export type CustomerDraft = Omit<Customer, 'id'>

export type AccountStatus = 'ACTIVE' | 'DORMANT' | 'FROZEN' | 'CLOSED'

export const ACCOUNT_STATUSES: AccountStatus[] = ['ACTIVE', 'DORMANT', 'FROZEN', 'CLOSED']

export interface Account {
  id: string
  accountNumber: string
  /** FK -> Customer.id */
  customerId: string
  balance: number
  status: AccountStatus
}

export type AccountDraft = Omit<Account, 'id'>
