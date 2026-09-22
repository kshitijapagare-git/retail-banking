export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

export type CustomerDraft = Omit<Customer, 'id'>

export interface Account {
  id: string
  accountNumber: string
  /** FK -> Customer.id */
  customerId: string
  balance: number
  status: string
}

export type AccountDraft = Omit<Account, 'id'>
