import { seedIds } from '../lib/id'
import { StoreError, emptyState } from './bankingStore'
import type { BankingState } from './bankingStore'
import type { Account, Customer } from '../types'

export const STORAGE_KEY = 'retail-banking:v1'

const CUSTOMER_STRING_FIELDS: (keyof Customer)[] = ['id', 'firstName', 'lastName', 'email', 'phone']
const ACCOUNT_STRING_FIELDS: (keyof Account)[] = ['id', 'accountNumber', 'customerId', 'status']

export function serialize(state: BankingState): string {
  return JSON.stringify({
    version: 1,
    customers: state.customers,
    accounts: state.accounts,
  })
}

export function parseState(json: string): BankingState {
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    throw new StoreError('The file is not valid JSON')
  }

  const data = (raw ?? {}) as { version?: unknown; customers?: unknown; accounts?: unknown }

  if (data.version !== 1) {
    throw new StoreError(`Unsupported data version: ${data.version}`)
  }

  const rawCustomers = Array.isArray(data.customers) ? data.customers : []
  const rawAccounts = Array.isArray(data.accounts) ? data.accounts : []

  const customers: Customer[] = rawCustomers.map((entry, index) => {
    const candidate = (entry ?? {}) as Record<string, unknown>
    for (const field of CUSTOMER_STRING_FIELDS) {
      if (typeof candidate[field] !== 'string') {
        throw new StoreError(`Invalid customer at index ${index}: ${field} is missing`)
      }
    }
    return {
      id: candidate.id as string,
      firstName: candidate.firstName as string,
      lastName: candidate.lastName as string,
      email: candidate.email as string,
      phone: candidate.phone as string,
    }
  })

  const accounts: Account[] = rawAccounts.map((entry, index) => {
    const candidate = (entry ?? {}) as Record<string, unknown>
    for (const field of ACCOUNT_STRING_FIELDS) {
      if (typeof candidate[field] !== 'string') {
        throw new StoreError(`Invalid account at index ${index}: ${field} is missing`)
      }
    }
    if (typeof candidate.balance !== 'number') {
      throw new StoreError(`Invalid account at index ${index}: balance is missing`)
    }
    return {
      id: candidate.id as string,
      accountNumber: candidate.accountNumber as string,
      customerId: candidate.customerId as string,
      status: candidate.status as string,
      balance: candidate.balance as number,
    }
  })

  const seenIds = new Set<string>()
  for (const customer of customers) {
    if (seenIds.has(customer.id)) throw new StoreError(`Duplicate id ${customer.id}`)
    seenIds.add(customer.id)
  }
  for (const account of accounts) {
    if (seenIds.has(account.id)) throw new StoreError(`Duplicate id ${account.id}`)
    seenIds.add(account.id)
  }

  const customerIds = new Set(customers.map((customer) => customer.id))
  for (const account of accounts) {
    if (!customerIds.has(account.customerId)) {
      throw new StoreError(`Account ${account.accountNumber} refers to missing customer ${account.customerId}`)
    }
  }

  seedIds([...customers.map((customer) => customer.id), ...accounts.map((account) => account.id)])

  return { customers, accounts }
}

export function loadState(storage: Storage): { state: BankingState; error?: string } {
  const raw = storage.getItem(STORAGE_KEY)
  if (raw === null) {
    return { state: emptyState() }
  }

  try {
    return { state: parseState(raw) }
  } catch (err) {
    const message = err instanceof StoreError ? err.message : String(err)
    return { state: emptyState(), error: message }
  }
}
