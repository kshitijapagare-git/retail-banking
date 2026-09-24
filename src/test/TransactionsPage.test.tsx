import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import * as store from '../data/bankingStore'
import { StoreError, type BankingState } from '../data/bankingStore'
import { startOfToday, toIsoDate } from '../lib/date'
import { addTransaction, gotoTransactions, renderAppWithState, transactionRow } from './utils'

const ADA = { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', phone: '+1 555 0100' }

/** Seeds a customer, account type, branch and one account so the Transaction
 * form's Account Select has a live option to source, matching how the
 * Transactions screen itself would be reached in practice. */
function seedWithAccount(accountNumber = 'ACC-1001'): { state: BankingState; accountId: string } {
  let state = store.createCustomer(store.emptyState(), ADA)
  const customerId = store.listCustomers(state)[0].id
  state = store.createAccountType(state, { name: 'Checking' })
  const accountTypeId = store.listAccountTypes(state)[0].id
  state = store.createBranch(state, { name: 'Downtown' })
  const branchId = store.listBranches(state)[0].id
  state = store.createAccount(state, {
    accountNumber,
    customerId,
    accountTypeId,
    branchId,
    balance: 100,
    status: 'ACTIVE',
    openedOn: startOfToday(),
  })
  const accountId = store.listAccounts(state).find((account) => account.accountNumber === accountNumber)!.id
  return { state, accountId }
}

function seedWithTwoAccounts(): { state: BankingState; firstAccountId: string; secondAccountId: string } {
  const first = seedWithAccount('ACC-1001')
  const withSecond = store.createAccount(first.state, {
    accountNumber: 'ACC-1002',
    customerId: store.listCustomers(first.state)[0].id,
    accountTypeId: store.listAccountTypes(first.state)[0].id,
    branchId: store.listBranches(first.state)[0].id,
    balance: 0,
    status: 'ACTIVE',
    openedOn: startOfToday(),
  })
  const secondAccountId = store.listAccounts(withSecond).find((account) => account.accountNumber === 'ACC-1002')!.id
  return { state: withSecond, firstAccountId: first.accountId, secondAccountId }
}

describe('transactions', () => {
  it('offers exactly the three transaction types', async () => {
    const { state } = seedWithAccount()
    const { user } = renderAppWithState(state)
    await gotoTransactions(user)
    await user.click(screen.getByRole('button', { name: '+ Add transaction' }))

    const options = within(screen.getByLabelText('Type')).getAllByRole('option')
    expect(options.map((option) => option.textContent)).toEqual(['DEBIT', 'CREDIT', 'TRANSFER'])
  })

  it('blocks submit for a zero or negative amount and enables it once positive', async () => {
    const { state } = seedWithAccount()
    const { user } = renderAppWithState(state)
    await gotoTransactions(user)
    await user.click(screen.getByRole('button', { name: '+ Add transaction' }))

    await user.type(screen.getByLabelText('Reference'), 'TXN-1')
    await user.selectOptions(screen.getByLabelText('Account'), 'ACC-1001')

    const submit = screen.getByRole('button', { name: 'Add transaction' })
    // Amount defaults to 0, which must not be a valid submission.
    expect(submit).toBeDisabled()

    await user.clear(screen.getByLabelText('Amount'))
    await user.type(screen.getByLabelText('Amount'), '-5')
    expect(submit).toBeDisabled()

    await user.clear(screen.getByLabelText('Amount'))
    await user.type(screen.getByLabelText('Amount'), '10')
    expect(submit).toBeEnabled()
  })

  it('caps transacted-on at today', async () => {
    const { state } = seedWithAccount()
    const { user } = renderAppWithState(state)
    await gotoTransactions(user)
    await user.click(screen.getByRole('button', { name: '+ Add transaction' }))

    const today = toIsoDate(startOfToday())
    const transactedOn = screen.getByLabelText('Transacted on')
    expect(transactedOn).toHaveValue(today)
    expect(transactedOn).toHaveAttribute('max', today)
  })

  it('allows the same reference to be reused on a different account', async () => {
    const { state } = seedWithTwoAccounts()
    const { user } = renderAppWithState(state)
    await gotoTransactions(user)

    await addTransaction(user, {
      reference: 'TXN-1',
      accountLabel: 'ACC-1001',
      type: 'DEBIT',
      amount: '10',
    })
    await addTransaction(user, {
      reference: 'TXN-1',
      accountLabel: 'ACC-1002',
      type: 'CREDIT',
      amount: '20',
    })

    const rows = within(screen.getByRole('table', { name: 'Transactions' })).getAllByRole('row', {
      name: /TXN-1/,
    })
    expect(rows).toHaveLength(2)
    expect(within(rows[0]).getByText('ACC-1001')).toBeInTheDocument()
    expect(within(rows[1]).getByText('ACC-1002')).toBeInTheDocument()
  })

  it('rejects a duplicate reference on the same account', () => {
    const { state, accountId } = seedWithAccount()
    const withFirst = store.createTransaction(state, {
      reference: 'TXN-1',
      accountId,
      type: 'DEBIT',
      amount: 10,
      transactedAt: startOfToday(),
    })

    expect(() =>
      store.createTransaction(withFirst, {
        reference: 'TXN-1',
        accountId,
        type: 'CREDIT',
        amount: 20,
        transactedAt: startOfToday(),
      }),
    ).toThrow(StoreError)
  })

  it('creates, edits and deletes a transaction, gating delete behind a confirmation', async () => {
    const { state } = seedWithAccount()
    const { user } = renderAppWithState(state)
    await gotoTransactions(user)

    await addTransaction(user, {
      reference: 'TXN-1',
      accountLabel: 'ACC-1001',
      type: 'CREDIT',
      amount: '150.25',
      description: 'Payroll',
    })

    const row = transactionRow(/TXN-1/)
    expect(within(row).getByText('ACC-1001')).toBeInTheDocument()
    expect(within(row).getByText('CREDIT')).toBeInTheDocument()
    expect(within(row).getByText('150.25')).toBeInTheDocument()
    expect(within(row).getByText('Payroll')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Edit TXN-1' }))
    await user.clear(screen.getByLabelText('Amount'))
    await user.type(screen.getByLabelText('Amount'), '200')
    await user.click(screen.getByRole('button', { name: 'Save transaction' }))

    expect(within(transactionRow(/TXN-1/)).getByText('200')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete TXN-1' }))
    const dialog = screen.getByRole('dialog', { name: 'Delete transaction' })
    expect(dialog).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(transactionRow(/TXN-1/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete TXN-1' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Confirm' }))

    expect(screen.getByText('No transactions yet.')).toBeInTheDocument()
  })
})
