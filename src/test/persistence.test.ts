import { beforeEach, describe, expect, it } from 'vitest'
import { emptyState } from '../data/bankingStore'
import type { BankingState } from '../data/bankingStore'
import { STORAGE_KEY, loadState, parseState, serialize } from '../data/persistence'
import { resetIds } from '../lib/id'
import type { Account, Customer } from '../types'

const ADA: Customer = {
  id: 'cus_1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: '+1 555 0100',
}

const ACCOUNT: Account = {
  id: 'acc_1',
  accountNumber: 'ACC-1001',
  customerId: 'cus_1',
  balance: 250.5,
  status: 'ACTIVE',
}

beforeEach(() => {
  resetIds()
})

describe('serialize / parseState', () => {
  it('round-trips a banking state', () => {
    const state: BankingState = { customers: [ADA], accounts: [ACCOUNT] }
    const json = serialize(state)
    const parsed = parseState(json)
    expect(parsed).toEqual(state)
  })

  it('rejects invalid JSON', () => {
    expect(() => parseState('{not json')).toThrow('The file is not valid JSON')
  })

  it('rejects a missing or unsupported version', () => {
    expect(() => parseState(JSON.stringify({ customers: [], accounts: [] }))).toThrow(
      'Unsupported data version: undefined',
    )
    expect(() => parseState(JSON.stringify({ version: 2, customers: [], accounts: [] }))).toThrow(
      'Unsupported data version: 2',
    )
  })

  it('rejects a customer missing a required field', () => {
    const bad = {
      version: 1,
      customers: [{ id: 'cus_1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' }],
      accounts: [],
    }
    expect(() => parseState(JSON.stringify(bad))).toThrow('Invalid customer at index 0: phone is missing')
  })

  it('rejects an account missing a required field', () => {
    const bad = {
      version: 1,
      customers: [ADA],
      accounts: [{ id: 'acc_1', accountNumber: 'ACC-1001', customerId: 'cus_1', balance: 250.5 }],
    }
    expect(() => parseState(JSON.stringify(bad))).toThrow('Invalid account at index 0: status is missing')
  })

  it('rejects an account whose balance is not a number', () => {
    const bad = {
      version: 1,
      customers: [ADA],
      accounts: [{ ...ACCOUNT, balance: 'not-a-number' }],
    }
    expect(() => parseState(JSON.stringify(bad))).toThrow('Invalid account at index 0: balance is missing')
  })

  it('rejects duplicate ids across the two lists', () => {
    const bad = {
      version: 1,
      customers: [ADA],
      accounts: [{ ...ACCOUNT, id: 'cus_1' }],
    }
    expect(() => parseState(JSON.stringify(bad))).toThrow('Duplicate id cus_1')
  })

  it('rejects an account referring to a missing customer', () => {
    const bad = {
      version: 1,
      customers: [],
      accounts: [ACCOUNT],
    }
    expect(() => parseState(JSON.stringify(bad))).toThrow(
      'Account ACC-1001 refers to missing customer cus_1',
    )
  })
})

describe('loadState', () => {
  it('returns an empty state when nothing is stored', () => {
    const storage = createStorage()
    expect(loadState(storage)).toEqual({ state: emptyState() })
  })

  it('returns an empty state and the parse error when stored data is corrupt', () => {
    const storage = createStorage()
    storage.setItem(STORAGE_KEY, '{not json')
    const result = loadState(storage)
    expect(result.state).toEqual(emptyState())
    expect(result.error).toBe('The file is not valid JSON')
  })

  it('returns the stored state when it is valid', () => {
    const storage = createStorage()
    storage.setItem(STORAGE_KEY, serialize({ customers: [ADA], accounts: [ACCOUNT] }))
    const result = loadState(storage)
    expect(result.state).toEqual({ customers: [ADA], accounts: [ACCOUNT] })
    expect(result.error).toBeUndefined()
  })
})

function createStorage(): Storage {
  const map = new Map<string, string>()
  return {
    getItem: (key: string) => (map.has(key) ? map.get(key)! : null),
    setItem: (key: string, value: string) => {
      map.set(key, value)
    },
    removeItem: (key: string) => {
      map.delete(key)
    },
    clear: () => map.clear(),
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    get length() {
      return map.size
    },
  }
}
