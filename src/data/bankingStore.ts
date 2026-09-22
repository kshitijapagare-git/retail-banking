import { nextId } from '../lib/id'
import type { Account, AccountDraft, Customer, CustomerDraft } from '../types'
import * as repo from './repository'

export interface BankingState {
  customers: repo.Table<Customer>
  accounts: repo.Table<Account>
}

export class StoreError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StoreError'
  }
}

export function emptyState(): BankingState {
  return { customers: [], accounts: [] }
}

/* ---------- Customers ---------- */

export function listCustomers(state: BankingState): Customer[] {
  return repo.list(state.customers)
}

export function getCustomer(state: BankingState, id: string): Customer | undefined {
  return repo.get(state.customers, id)
}

export function createCustomer(state: BankingState, draft: CustomerDraft): BankingState {
  const customer: Customer = { id: nextId('cus'), ...draft }
  return { ...state, customers: repo.insert(state.customers, customer) }
}

export function updateCustomer(state: BankingState, id: string, patch: Partial<CustomerDraft>): BankingState {
  requireCustomer(state, id)
  return { ...state, customers: repo.replace(state.customers, id, patch) }
}

export function deleteCustomer(state: BankingState, id: string): BankingState {
  requireCustomer(state, id)
  return { ...state, customers: repo.remove(state.customers, id) }
}

/* ---------- Accounts ---------- */

export function listAccounts(state: BankingState): Account[] {
  return repo.list(state.accounts)
}

export function getAccount(state: BankingState, id: string): Account | undefined {
  return repo.get(state.accounts, id)
}

export function createAccount(state: BankingState, draft: AccountDraft): BankingState {
  requireCustomer(state, draft.customerId)
  const account: Account = { id: nextId('acc'), ...draft }
  return { ...state, accounts: repo.insert(state.accounts, account) }
}

export function updateAccount(state: BankingState, id: string, patch: Partial<AccountDraft>): BankingState {
  requireAccount(state, id)
  if (patch.customerId !== undefined) requireCustomer(state, patch.customerId)
  return { ...state, accounts: repo.replace(state.accounts, id, patch) }
}

export function deleteAccount(state: BankingState, id: string): BankingState {
  requireAccount(state, id)
  return { ...state, accounts: repo.remove(state.accounts, id) }
}

/* ---------- FK guards ---------- */

function requireCustomer(state: BankingState, id: string): Customer {
  const customer = repo.get(state.customers, id)
  if (!customer) throw new StoreError(`No customer with id ${id}`)
  return customer
}

function requireAccount(state: BankingState, id: string): Account {
  const account = repo.get(state.accounts, id)
  if (!account) throw new StoreError(`No account with id ${id}`)
  return account
}
