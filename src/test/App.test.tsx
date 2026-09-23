import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  ACC,
  ADA,
  GRACE,
  accountRow,
  addAccount,
  addCustomer,
  addTransaction,
  customerRow,
  gotoAccounts,
  gotoCustomers,
  renderApp,
  transactionRow,
} from './utils'

describe('shell', () => {
  it('lands on Customers with that nav item marked current', () => {
    renderApp()

    expect(screen.getByRole('heading', { name: 'Customers', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Customers/ })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: /Accounts/ })).not.toHaveAttribute('aria-current')
  })

  it('navigates to Accounts and back', async () => {
    const { user } = renderApp()

    await gotoAccounts(user)
    expect(screen.getByRole('heading', { name: 'Accounts', level: 1 })).toBeInTheDocument()
    expect(window.location.hash).toBe('#/accounts')

    await gotoCustomers(user)
    expect(screen.getByRole('heading', { name: 'Customers', level: 1 })).toBeInTheDocument()
  })

  it('shows an empty state in each table', async () => {
    const { user } = renderApp()
    expect(screen.getByText('No customers yet.')).toBeInTheDocument()

    await gotoAccounts(user)
    expect(screen.getByText('No accounts yet.')).toBeInTheDocument()
  })
})

describe('customers', () => {
  it('creates a customer through the dialog and lists it', async () => {
    const { user } = renderApp()
    await addCustomer(user, ADA)

    const row = customerRow(/Ada Lovelace/)
    expect(within(row).getByText('ada@example.com')).toBeInTheDocument()
    expect(within(row).getByText('+1 555 0100')).toBeInTheDocument()
  })

  it('closes the dialog after a create', async () => {
    const { user } = renderApp()
    await addCustomer(user, ADA)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('discards a create when the dialog is cancelled', async () => {
    const { user } = renderApp()

    await user.click(screen.getByRole('button', { name: '+ Add customer' }))
    await user.type(screen.getByLabelText('First name'), 'Ada')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('No customers yet.')).toBeInTheDocument()
  })

  it('lists several customers', async () => {
    const { user } = renderApp()
    await addCustomer(user, ADA)
    await addCustomer(user, GRACE)

    expect(customerRow(/Ada Lovelace/)).toBeInTheDocument()
    expect(customerRow(/Grace Hopper/)).toBeInTheDocument()
  })

  it('edits a customer from the row action', async () => {
    const { user } = renderApp()
    await addCustomer(user, ADA)

    await user.click(screen.getByRole('button', { name: 'Edit Ada Lovelace' }))
    expect(screen.getByLabelText('First name')).toHaveValue('Ada')

    await user.clear(screen.getByLabelText('Phone'))
    await user.type(screen.getByLabelText('Phone'), '+1 555 0999')
    await user.click(screen.getByRole('button', { name: 'Save customer' }))

    expect(screen.getByText('+1 555 0999')).toBeInTheDocument()
    expect(screen.queryByText('+1 555 0100')).not.toBeInTheDocument()
  })

  it('deletes a customer from the row action', async () => {
    const { user } = renderApp()
    await addCustomer(user, ADA)

    await user.click(screen.getByRole('button', { name: 'Delete Ada Lovelace' }))

    expect(screen.getByText('No customers yet.')).toBeInTheDocument()
  })
})

describe('accounts', () => {
  it('opens an account against a customer', async () => {
    const { user } = renderApp()
    await addCustomer(user, ADA)
    await gotoAccounts(user)
    await addAccount(user, ACC)

    const row = accountRow(/ACC-1001/)
    expect(within(row).getByText('Ada Lovelace')).toBeInTheDocument()
    expect(within(row).getByText('250.5')).toBeInTheDocument()
    expect(within(row).getByText('ACTIVE')).toBeInTheDocument()
  })

  it('offers every customer in the owner dropdown', async () => {
    const { user } = renderApp()
    await addCustomer(user, ADA)
    await addCustomer(user, GRACE)
    await gotoAccounts(user)
    await user.click(screen.getByRole('button', { name: '+ Add account' }))

    const options = within(screen.getByLabelText('Customer')).getAllByRole('option')
    expect(options.map((option) => option.textContent)).toEqual([
      'Select a customer',
      'Ada Lovelace',
      'Grace Hopper',
    ])
  })

  it('edits an account', async () => {
    const { user } = renderApp()
    await addCustomer(user, ADA)
    await gotoAccounts(user)
    await addAccount(user, ACC)

    await user.click(screen.getByRole('button', { name: 'Edit ACC-1001' }))
    await user.clear(screen.getByLabelText('Balance'))
    await user.type(screen.getByLabelText('Balance'), '900')
    await user.clear(screen.getByLabelText('Status'))
    await user.type(screen.getByLabelText('Status'), 'FROZEN')
    await user.click(screen.getByRole('button', { name: 'Save account' }))

    const row = accountRow(/ACC-1001/)
    expect(within(row).getByText('900')).toBeInTheDocument()
    expect(within(row).getByText('FROZEN')).toBeInTheDocument()
  })

  it('reassigns an account to another customer', async () => {
    const { user } = renderApp()
    await addCustomer(user, ADA)
    await addCustomer(user, GRACE)
    await gotoAccounts(user)
    await addAccount(user, ACC)

    await user.click(screen.getByRole('button', { name: 'Edit ACC-1001' }))
    await user.selectOptions(screen.getByLabelText('Customer'), 'Grace Hopper')
    await user.click(screen.getByRole('button', { name: 'Save account' }))

    expect(within(accountRow(/ACC-1001/)).getByText('Grace Hopper')).toBeInTheDocument()
  })

  it('deletes an account', async () => {
    const { user } = renderApp()
    await addCustomer(user, ADA)
    await gotoAccounts(user)
    await addAccount(user, ACC)

    await user.click(screen.getByRole('button', { name: 'Delete ACC-1001' }))

    expect(screen.getByText('No accounts yet.')).toBeInTheDocument()
  })
})

describe('transactions', () => {
  it('records a deposit on ACC-1001; ledger shows it and Accounts balance updates', async () => {
    const { user } = renderApp()

    await addCustomer(user, ADA)
    await gotoAccounts(user)
    await addAccount(user, ACC)

    await user.click(screen.getByRole('link', { name: /Transactions/ }))
    expect(screen.getByRole('heading', { name: 'Transactions', level: 1 })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Record transaction' }))
    await user.selectOptions(screen.getByLabelText('Account'), 'ACC-1001')
    await user.selectOptions(screen.getByLabelText('Type'), 'DEPOSIT')
    await user.type(screen.getByLabelText('Amount'), '50.25')
    await user.click(screen.getByRole('button', { name: 'Record transaction' }))

    const row = transactionRow(/ACC-1001/)
    expect(within(row).getByText('DEPOSIT')).toBeInTheDocument()
    expect(within(row).getByText('50.25')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /Accounts/ }))
    const account = accountRow(/ACC-1001/)
    expect(within(account).getByText('300.75')).toBeInTheDocument()
  })

  it('shows insufficient funds error and keeps modal open for withdrawal larger than balance', async () => {
    const { user } = renderApp()

    await addCustomer(user, ADA)
    await gotoAccounts(user)
    await addAccount(user, ACC)

    await user.click(screen.getByRole('link', { name: /Transactions/ }))
    await user.click(screen.getByRole('button', { name: 'Record transaction' }))

    await user.selectOptions(screen.getByLabelText('Account'), 'ACC-1001')
    await user.selectOptions(screen.getByLabelText('Type'), 'WITHDRAWAL')
    await user.type(screen.getByLabelText('Amount'), '1000')
    await user.click(screen.getByRole('button', { name: 'Record transaction' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Insufficient funds in ACC-1001')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('sidebar shows three links and aria-current behavior', () => {
    renderApp()
    expect(screen.getAllByRole('link')).toEqual(expect.any(Array))

    const customersLink = screen.getByRole('link', { name: /Customers/ })
    const accountsLink = screen.getByRole('link', { name: /Accounts/ })
    const transactionsLink = screen.getByRole('link', { name: /Transactions/ })

    expect(customersLink).toHaveAttribute('aria-current', 'page')
    expect(accountsLink).not.toHaveAttribute('aria-current')
    expect(transactionsLink).not.toHaveAttribute('aria-current')
  })
})
