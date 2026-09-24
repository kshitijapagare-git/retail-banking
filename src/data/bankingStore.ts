import { nextId } from '../lib/id'
import type {
  Account,
  AccountDraft,
  AccountType,
  AccountTypeDraft,
  Branch,
  BranchDraft,
  Customer,
  CustomerDraft,
} from '../types'
import * as repo from './repository'

export interface BankingState {
  customers: repo.Table<Customer>
  accounts: repo.Table<Account>
  accountTypes: repo.Table<AccountType>
  branches: repo.Table<Branch>
}

export class StoreError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StoreError'
  }
}

export function emptyState(): BankingState {
  return { customers: [], accounts: [], accountTypes: [], branches: [] }
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
  requireAccountType(state, draft.accountTypeId)
  requireBranch(state, draft.branchId)
  const account: Account = { id: nextId('acc'), ...draft }
  return { ...state, accounts: repo.insert(state.accounts, account) }
}

export function updateAccount(state: BankingState, id: string, patch: Partial<AccountDraft>): BankingState {
  requireAccount(state, id)
  if (patch.customerId !== undefined) requireCustomer(state, patch.customerId)
  if (patch.accountTypeId !== undefined) requireAccountType(state, patch.accountTypeId)
  if (patch.branchId !== undefined) requireBranch(state, patch.branchId)
  return { ...state, accounts: repo.replace(state.accounts, id, patch) }
}

export function deleteAccount(state: BankingState, id: string): BankingState {
  requireAccount(state, id)
  return { ...state, accounts: repo.remove(state.accounts, id) }
}

/* ---------- Account types ---------- */

export function listAccountTypes(state: BankingState): AccountType[] {
  return repo.list(state.accountTypes)
}

export function getAccountType(state: BankingState, id: string): AccountType | undefined {
  return repo.get(state.accountTypes, id)
}

export function createAccountType(state: BankingState, draft: AccountTypeDraft): BankingState {
  const accountType: AccountType = { id: nextId('acctype'), ...draft }
  return { ...state, accountTypes: repo.insert(state.accountTypes, accountType) }
}

/* ---------- Branches ---------- */

export function listBranches(state: BankingState): Branch[] {
  return repo.list(state.branches)
}

export function getBranch(state: BankingState, id: string): Branch | undefined {
  return repo.get(state.branches, id)
}

export function createBranch(state: BankingState, draft: BranchDraft): BankingState {
  const branch: Branch = { id: nextId('branch'), ...draft }
  return { ...state, branches: repo.insert(state.branches, branch) }
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

function requireAccountType(state: BankingState, id: string): AccountType {
  const accountType = repo.get(state.accountTypes, id)
  if (!accountType) throw new StoreError(`No account type with id ${id}`)
  return accountType
}

function requireBranch(state: BankingState, id: string): Branch {
  const branch = repo.get(state.branches, id)
  if (!branch) throw new StoreError(`No branch with id ${id}`)
  return branch
}
