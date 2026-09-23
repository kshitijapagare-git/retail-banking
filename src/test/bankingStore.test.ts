import { beforeEach, describe, expect, it } from 'vitest'
import * as store from '../data/bankingStore'
import { StoreError, type BankingState } from '../data/bankingStore'
import { resetIds } from '../lib/id'

const ADA = { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', phone: '+1 555 0100' }
const GRACE = { firstName: 'Grace', lastName: 'Hopper', email: 'grace@example.com', phone: '+1 555 0111' }

function withAda(): { state: BankingState; customerId: string } {
  const state = store.createCustomer(store.emptyState(), ADA)
  return { state, customerId: store.listCustomers(state)[0].id }
}

beforeEach(() => resetIds())

describe('customers', () => {
  it('creates a customer with a generated id', () => {
    const state = store.createCustomer(store.emptyState(), ADA)
    const customers = store.listCustomers(state)

    expect(customers).toHaveLength(1)
    expect(customers[0]).toMatchObject(ADA)
    expect(customers[0].id).toBe('cus_1')
  })

  it('does not mutate the previous state', () => {
    const before = store.emptyState()
    const after = store.createCustomer(before, ADA)

    expect(store.listCustomers(before)).toHaveLength(0)
    expect(store.listCustomers(after)).toHaveLength(1)
  })

  it('lists customers in insertion order', () => {
    let state = store.createCustomer(store.emptyState(), ADA)
    state = store.createCustomer(state, GRACE)

    expect(store.listCustomers(state).map((c) => c.firstName)).toEqual(['Ada', 'Grace'])
  })

  it('gets a customer by id and returns undefined for a miss', () => {
    const { state, customerId } = withAda()

    expect(store.getCustomer(state, customerId)?.email).toBe('ada@example.com')
    expect(store.getCustomer(state, 'nope')).toBeUndefined()
  })

  it('updates only the patched fields', () => {
    const { state, customerId } = withAda()
    const next = store.updateCustomer(state, customerId, { phone: '+1 555 0999' })

    expect(store.getCustomer(next, customerId)).toMatchObject({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      phone: '+1 555 0999',
    })
  })

  it('rejects updates to an unknown customer', () => {
    expect(() => store.updateCustomer(store.emptyState(), 'nope', { phone: '1' })).toThrow(StoreError)
  })

  it('deletes a customer', () => {
    const { state, customerId } = withAda()

    expect(store.listCustomers(store.deleteCustomer(state, customerId))).toHaveLength(0)
  })

  it('rejects deleting an unknown customer', () => {
    expect(() => store.deleteCustomer(store.emptyState(), 'cus_404')).toThrow(StoreError)
  })
})

describe('accounts', () => {
  it('creates an account linked to an existing customer', () => {
    const { state, customerId } = withAda()
    const next = store.createAccount(state, {
      accountNumber: 'ACC-1',
      customerId,
      balance: 250.5,
      status: 'ACTIVE',
    })
    const accounts = store.listAccounts(next)

    expect(accounts).toHaveLength(1)
    expect(accounts[0]).toMatchObject({ accountNumber: 'ACC-1', customerId, balance: 250.5, status: 'ACTIVE' })
    expect(accounts[0].id).toBe('acc_1')
  })

  it('enforces the foreign key on create', () => {
    expect(() =>
      store.createAccount(store.emptyState(), {
        accountNumber: 'ACC-1',
        customerId: 'ghost',
        balance: 0,
        status: 'ACTIVE',
      }),
    ).toThrow(/No customer with id ghost/)
  })

  it('enforces the foreign key when reassigning an account', () => {
    const { state, customerId } = withAda()
    const next = store.createAccount(state, {
      accountNumber: 'ACC-1',
      customerId,
      balance: 0,
      status: 'ACTIVE',
    })
    const accountId = store.listAccounts(next)[0].id

    expect(() => store.updateAccount(next, accountId, { customerId: 'ghost' })).toThrow(StoreError)
  })

  it('gets an account by id and returns undefined for a miss', () => {
    const { state, customerId } = withAda()
    const next = store.createAccount(state, {
      accountNumber: 'ACC-1',
      customerId,
      balance: 5,
      status: 'ACTIVE',
    })
    const accountId = store.listAccounts(next)[0].id

    expect(store.getAccount(next, accountId)?.accountNumber).toBe('ACC-1')
    expect(store.getAccount(next, 'nope')).toBeUndefined()
  })

  it('updates only the patched fields', () => {
    const { state, customerId } = withAda()
    const next = store.createAccount(state, {
      accountNumber: 'ACC-1',
      customerId,
      balance: 0,
      status: 'ACTIVE',
    })
    const accountId = store.listAccounts(next)[0].id
    const updated = store.updateAccount(next, accountId, { balance: 99, status: 'FROZEN' })

    expect(store.getAccount(updated, accountId)).toMatchObject({
      accountNumber: 'ACC-1',
      customerId,
      balance: 99,
      status: 'FROZEN',
    })
  })

  it('lists accounts in insertion order', () => {
    const { state, customerId } = withAda()
    let next = store.createAccount(state, { accountNumber: 'A-1', customerId, balance: 1, status: 'ACTIVE' })
    next = store.createAccount(next, { accountNumber: 'A-2', customerId, balance: 2, status: 'ACTIVE' })

    expect(store.listAccounts(next).map((a) => a.accountNumber)).toEqual(['A-1', 'A-2'])
  })

  it('deletes an account', () => {
    const { state, customerId } = withAda()
    const next = store.createAccount(state, {
      accountNumber: 'ACC-1',
      customerId,
      balance: 0,
      status: 'ACTIVE',
    })
    const accountId = store.listAccounts(next)[0].id

    expect(store.listAccounts(store.deleteAccount(next, accountId))).toHaveLength(0)
  })

  it('rejects deleting an unknown account', () => {
    expect(() => store.deleteAccount(store.emptyState(), 'acc_404')).toThrow(StoreError)
  })
})

describe('transactions', () => {
  it('records deposit then withdrawal and updates balance (100 + 50.25 - 20.10 = 130.15)', () => {
    let state = store.emptyState()
    const customerState = store.createCustomer(state, ADA)
    state = customerState
    const customerId = store.listCustomers(state)[0].id

    state = store.createAccount(state, {
      accountNumber: 'ACC-1',
      customerId,
      balance: 100,
      status: 'ACTIVE',
    })

    const accountId = store.listAccounts(state)[0].id

    state = store.recordTransaction(state, {
      accountId,
      type: 'DEPOSIT',
      amount: 50.25,
      description: '',
    })

    state = store.recordTransaction(state, {
      accountId,
      type: 'WITHDRAWAL',
      amount: 20.1,
      description: '',
    })

    expect(store.listTransactions(state).map((t) => t.id)).toEqual(['txn_1', 'txn_2'])
    expect(store.getAccount(state, accountId)?.balance).toBe(130.15)
  })

  it('throws and does not mutate state when account id is unknown', () => {
    const before = store.emptyState()
    expect(() =>
      store.recordTransaction(before, {
        accountId: 'acc_nope',
        type: 'DEPOSIT',
        amount: 1,
        description: '',
      }),
    ).toThrow('No account with id acc_nope')

    expect(store.listTransactions(before)).toHaveLength(0)
  })

  it('throws and does not mutate state when amount is not greater than zero', () => {
    const { state, customerId } = withAda()
    const next = store.createAccount(state, {
      accountNumber: 'ACC-1',
      customerId,
      balance: 10,
      status: 'ACTIVE',
    })
    const accountId = store.listAccounts(next)[0].id

    const before = next
    expect(() =>
      store.recordTransaction(before, {
        accountId,
        type: 'DEPOSIT',
        amount: 0,
        description: '',
      }),
    ).toThrow('Amount must be greater than zero')

    expect(store.getAccount(before, accountId)?.balance).toBe(10)
    expect(store.listTransactions(before)).toHaveLength(0)
  })

  it('throws and does not mutate state when account is not active', () => {
    const { state, customerId } = withAda()
    const next = store.createAccount(state, {
      accountNumber: 'ACC-1',
      customerId,
      balance: 10,
      status: 'FROZEN',
    })
    const accountId = store.listAccounts(next)[0].id

    const before = next
    expect(() =>
      store.recordTransaction(before, {
        accountId,
        type: 'DEPOSIT',
        amount: 5,
        description: '',
      }),
    ).toThrow('Account ACC-1 is not active')

    expect(store.getAccount(before, accountId)?.balance).toBe(10)
    expect(store.listTransactions(before)).toHaveLength(0)
  })

  it('throws and does not mutate state when withdrawal is larger than balance', () => {
    const { state, customerId } = withAda()
    const next = store.createAccount(state, {
      accountNumber: 'ACC-1',
      customerId,
      balance: 10,
      status: 'ACTIVE',
    })
    const accountId = store.listAccounts(next)[0].id

    const before = next
    expect(() =>
      store.recordTransaction(before, {
        accountId,
        type: 'WITHDRAWAL',
        amount: 20,
        description: '',
      }),
    ).toThrow('Insufficient funds in ACC-1')

    expect(store.getAccount(before, accountId)?.balance).toBe(10)
    expect(store.listTransactions(before)).toHaveLength(0)
  })

  it("deleting an account removes its transactions", () => {
    let state = store.emptyState()
    state = store.createCustomer(state, ADA)
    const customerId = store.listCustomers(state)[0].id

    state = store.createAccount(state, {
      accountNumber: 'ACC-1',
      customerId,
      balance: 10,
      status: 'ACTIVE',
    })
    const accountId = store.listAccounts(state)[0].id

    state = store.recordTransaction(state, {
      accountId,
      type: 'DEPOSIT',
      amount: 5,
      description: '',
    })

    expect(store.listTransactions(state)).toHaveLength(1)

    state = store.deleteAccount(state, accountId)

    expect(store.listTransactions(state)).toHaveLength(0)
  })
})
