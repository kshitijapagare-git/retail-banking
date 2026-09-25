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

  it('rejects creating a customer with a duplicate email', () => {
    const { state } = withAda()
    expect(() => store.createCustomer(state, { ...GRACE, email: 'ada@example.com' })).toThrow(
      /Email ada@example.com is already in use/,
    )
  })

  it('rejects creating a customer with a duplicate email in a different case', () => {
    const { state } = withAda()
    expect(() => store.createCustomer(state, { ...GRACE, email: 'ADA@EXAMPLE.COM' })).toThrow(StoreError)
  })

  it('rejects updating a customer to another customer email', () => {
    const { state, customerId } = withAda()
    const next = store.createCustomer(state, GRACE)
    const graceId = store.listCustomers(next).find((c) => c.firstName === 'Grace')!.id

    expect(() => store.updateCustomer(next, graceId, { email: 'ada@example.com' })).toThrow(
      /Email ada@example.com is already in use/,
    )
    expect(customerId).toBeTruthy()
  })

  it('allows a customer to keep its own email on update', () => {
    const { state, customerId } = withAda()
    const next = store.updateCustomer(state, customerId, { email: 'ada@example.com', phone: '+1 555 0999' })

    expect(store.getCustomer(next, customerId)).toMatchObject({ email: 'ada@example.com', phone: '+1 555 0999' })
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

  it('rejects creating an account with a duplicate account number', () => {
    const { state, customerId } = withAda()
    const next = store.createAccount(state, {
      accountNumber: 'ACC-1',
      customerId,
      balance: 0,
      status: 'ACTIVE',
    })

    expect(() =>
      store.createAccount(next, { accountNumber: 'ACC-1', customerId, balance: 10, status: 'ACTIVE' }),
    ).toThrow(/Account number ACC-1 already exists/)
  })

  it('rejects updating an account to another account number', () => {
    const { state, customerId } = withAda()
    let next = store.createAccount(state, { accountNumber: 'ACC-1', customerId, balance: 0, status: 'ACTIVE' })
    next = store.createAccount(next, { accountNumber: 'ACC-2', customerId, balance: 0, status: 'ACTIVE' })
    const secondId = store.listAccounts(next).find((a) => a.accountNumber === 'ACC-2')!.id

    expect(() => store.updateAccount(next, secondId, { accountNumber: 'ACC-1' })).toThrow(
      /Account number ACC-1 already exists/,
    )
  })

  it('allows an account to keep its own number on update', () => {
    const { state, customerId } = withAda()
    const next = store.createAccount(state, { accountNumber: 'ACC-1', customerId, balance: 0, status: 'ACTIVE' })
    const accountId = store.listAccounts(next)[0].id
    const updated = store.updateAccount(next, accountId, { accountNumber: 'ACC-1', balance: 42 })

    expect(store.getAccount(updated, accountId)).toMatchObject({ accountNumber: 'ACC-1', balance: 42 })
  })
})
