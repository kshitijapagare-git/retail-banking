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

function withAdaAccountRefs(): {
  state: BankingState
  customerId: string
  accountTypeId: string
  branchId: string
} {
  const { state: withCustomer, customerId } = withAda()
  const withType = store.createAccountType(withCustomer, { name: 'Checking' })
  const accountTypeId = store.listAccountTypes(withType)[0].id
  const withBranch = store.createBranch(withType, { name: 'Downtown' })
  const branchId = store.listBranches(withBranch)[0].id
  return { state: withBranch, customerId, accountTypeId, branchId }
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
    const { state, customerId, accountTypeId, branchId } = withAdaAccountRefs()
    const next = store.createAccount(state, {
      accountNumber: 'ACC-1',
      customerId,
      accountTypeId,
      branchId,
      balance: 250.5,
      status: 'ACTIVE',
      openedOn: new Date(),
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
        accountTypeId: 'ghost-type',
        branchId: 'ghost-branch',
        balance: 0,
        status: 'ACTIVE',
        openedOn: new Date(),
      }),
    ).toThrow(/No customer with id ghost/)
  })

  it('enforces the foreign key when reassigning an account', () => {
    const { state, customerId, accountTypeId, branchId } = withAdaAccountRefs()
    const next = store.createAccount(state, {
      accountNumber: 'ACC-1',
      customerId,
      accountTypeId,
      branchId,
      balance: 0,
      status: 'ACTIVE',
      openedOn: new Date(),
    })
    const accountId = store.listAccounts(next)[0].id

    expect(() => store.updateAccount(next, accountId, { customerId: 'ghost' })).toThrow(StoreError)
  })

  it('gets an account by id and returns undefined for a miss', () => {
    const { state, customerId, accountTypeId, branchId } = withAdaAccountRefs()
    const next = store.createAccount(state, {
      accountNumber: 'ACC-1',
      customerId,
      accountTypeId,
      branchId,
      balance: 5,
      status: 'ACTIVE',
      openedOn: new Date(),
    })
    const accountId = store.listAccounts(next)[0].id

    expect(store.getAccount(next, accountId)?.accountNumber).toBe('ACC-1')
    expect(store.getAccount(next, 'nope')).toBeUndefined()
  })

  it('updates only the patched fields', () => {
    const { state, customerId, accountTypeId, branchId } = withAdaAccountRefs()
    const next = store.createAccount(state, {
      accountNumber: 'ACC-1',
      customerId,
      accountTypeId,
      branchId,
      balance: 0,
      status: 'ACTIVE',
      openedOn: new Date(),
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
    const { state, customerId, accountTypeId, branchId } = withAdaAccountRefs()
    let next = store.createAccount(state, {
      accountNumber: 'A-1',
      customerId,
      accountTypeId,
      branchId,
      balance: 1,
      status: 'ACTIVE',
      openedOn: new Date(),
    })
    next = store.createAccount(next, {
      accountNumber: 'A-2',
      customerId,
      accountTypeId,
      branchId,
      balance: 2,
      status: 'ACTIVE',
      openedOn: new Date(),
    })

    expect(store.listAccounts(next).map((a) => a.accountNumber)).toEqual(['A-1', 'A-2'])
  })

  it('deletes an account', () => {
    const { state, customerId, accountTypeId, branchId } = withAdaAccountRefs()
    const next = store.createAccount(state, {
      accountNumber: 'ACC-1',
      customerId,
      accountTypeId,
      branchId,
      balance: 0,
      status: 'ACTIVE',
      openedOn: new Date(),
    })
    const accountId = store.listAccounts(next)[0].id

    expect(store.listAccounts(store.deleteAccount(next, accountId))).toHaveLength(0)
  })

  it('rejects deleting an unknown account', () => {
    expect(() => store.deleteAccount(store.emptyState(), 'acc_404')).toThrow(StoreError)
  })
})
