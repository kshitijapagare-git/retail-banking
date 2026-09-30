import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ACC, ADA, GRACE, addAccount, addCustomer, gotoAccounts, gotoCustomers, renderApp } from './utils'

function alertTexts() {
  return screen.getAllByRole('alert').map((el) => el.textContent)
}

describe('customer form validation', () => {
  it('shows inline errors for every required field and keeps the dialog open', async () => {
    const { user } = renderApp()

    await user.click(screen.getByRole('button', { name: '+ Add customer' }))
    await user.click(screen.getByRole('button', { name: 'Add customer' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    const texts = alertTexts()
    expect(texts).toContain('First name is required.')
    expect(texts).toContain('Last name is required.')
    expect(texts).toContain('Email is required.')
    expect(texts).toContain('Phone is required.')

    expect(screen.getByLabelText('First name')).toHaveAttribute('aria-invalid', 'true')
  })

  it('rejects an invalid email format', async () => {
    const { user } = renderApp()

    await user.click(screen.getByRole('button', { name: '+ Add customer' }))
    await user.type(screen.getByLabelText('First name'), 'Ada')
    await user.type(screen.getByLabelText('Last name'), 'Lovelace')
    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.type(screen.getByLabelText('Phone'), '+1 555 0100')
    await user.click(screen.getByRole('button', { name: 'Add customer' }))

    expect(alertTexts()).toContain('Enter a valid email address.')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('clears a field error as soon as it is corrected', async () => {
    const { user } = renderApp()

    await user.click(screen.getByRole('button', { name: '+ Add customer' }))
    await user.click(screen.getByRole('button', { name: 'Add customer' }))

    expect(alertTexts()).toContain('First name is required.')

    await user.type(screen.getByLabelText('First name'), 'Ada')

    expect(alertTexts()).not.toContain('First name is required.')
    expect(alertTexts()).toContain('Last name is required.')
    expect(screen.getByLabelText('First name')).not.toHaveAttribute('aria-invalid')
  })

  it('rejects a duplicate email regardless of casing or surrounding whitespace, and adds no row', async () => {
    const { user } = renderApp()
    await addCustomer(user, ADA)

    await user.click(screen.getByRole('button', { name: '+ Add customer' }))
    await user.type(screen.getByLabelText('First name'), 'Grace')
    await user.type(screen.getByLabelText('Last name'), 'Hopper')
    await user.type(screen.getByLabelText('Email'), '  ADA@EXAMPLE.COM  ')
    await user.type(screen.getByLabelText('Phone'), '+1 555 0111')
    await user.click(screen.getByRole('button', { name: 'Add customer' }))

    expect(alertTexts()).toContain('A customer with this email already exists.')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.queryByText('Grace Hopper')).not.toBeInTheDocument()
  })

  it('allows editing a customer and resubmitting its own unchanged email', async () => {
    const { user } = renderApp()
    await addCustomer(user, ADA)

    await user.click(screen.getByRole('button', { name: 'Edit Ada Lovelace' }))
    await user.clear(screen.getByLabelText('Phone'))
    await user.type(screen.getByLabelText('Phone'), '+1 555 0999')
    await user.click(screen.getByRole('button', { name: 'Save customer' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('+1 555 0999')).toBeInTheDocument()
  })

  it('rejects a duplicate email against another customer when editing', async () => {
    const { user } = renderApp()
    await addCustomer(user, ADA)
    await addCustomer(user, GRACE)

    await user.click(screen.getByRole('button', { name: 'Edit Grace Hopper' }))
    await user.clear(screen.getByLabelText('Email'))
    await user.type(screen.getByLabelText('Email'), ' ada@example.com ')
    await user.click(screen.getByRole('button', { name: 'Save customer' }))

    expect(alertTexts()).toContain('A customer with this email already exists.')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('account form validation', () => {
  it('shows inline errors for every required field and keeps the dialog open', async () => {
    const { user } = renderApp()
    await gotoAccounts(user)

    await user.click(screen.getByRole('button', { name: '+ Add account' }))
    await user.click(screen.getByRole('button', { name: 'Add account' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    const texts = alertTexts()
    expect(texts).toContain('Account number is required.')
    expect(texts).toContain('Customer is required.')
    expect(texts).toContain('Status is required.')

    expect(screen.getByLabelText('Account number')).toHaveAttribute('aria-invalid', 'true')
  })

  it('clears a field error as soon as it is corrected', async () => {
    const { user } = renderApp()
    await gotoAccounts(user)

    await user.click(screen.getByRole('button', { name: '+ Add account' }))
    await user.click(screen.getByRole('button', { name: 'Add account' }))

    expect(alertTexts()).toContain('Account number is required.')

    await user.type(screen.getByLabelText('Account number'), 'ACC-2001')

    expect(alertTexts()).not.toContain('Account number is required.')
    expect(alertTexts()).toContain('Customer is required.')
    expect(screen.getByLabelText('Account number')).not.toHaveAttribute('aria-invalid')
  })

  it('rejects a duplicate account number after trimming, and adds no row', async () => {
    const { user } = renderApp()
    await addCustomer(user, ADA)
    await gotoAccounts(user)
    await addAccount(user, ACC)

    await user.click(screen.getByRole('button', { name: '+ Add account' }))
    await user.type(screen.getByLabelText('Account number'), '  ACC-1001  ')
    await user.selectOptions(screen.getByLabelText('Customer'), 'Ada Lovelace')
    await user.type(screen.getByLabelText('Status'), 'FROZEN')
    await user.click(screen.getByRole('button', { name: 'Add account' }))

    expect(alertTexts()).toContain('An account with this account number already exists.')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(within(screen.getByRole('table', { name: 'Accounts' })).getAllByRole('row')).toHaveLength(2)
  })

  it('allows editing an account and resubmitting its own unchanged account number', async () => {
    const { user } = renderApp()
    await addCustomer(user, ADA)
    await gotoAccounts(user)
    await addAccount(user, ACC)

    await user.click(screen.getByRole('button', { name: 'Edit ACC-1001' }))
    await user.clear(screen.getByLabelText('Status'))
    await user.type(screen.getByLabelText('Status'), 'FROZEN')
    await user.click(screen.getByRole('button', { name: 'Save account' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('FROZEN')).toBeInTheDocument()
  })

  it('rejects a duplicate account number against another account when editing', async () => {
    const { user } = renderApp()
    await addCustomer(user, ADA)
    await gotoAccounts(user)
    await addAccount(user, ACC)
    await addAccount(user, { accountNumber: 'ACC-1002', customerName: 'Ada Lovelace', balance: '10', status: 'ACTIVE' })

    await user.click(screen.getByRole('button', { name: 'Edit ACC-1002' }))
    await user.clear(screen.getByLabelText('Account number'))
    await user.type(screen.getByLabelText('Account number'), 'ACC-1001')
    await user.click(screen.getByRole('button', { name: 'Save account' }))

    expect(alertTexts()).toContain('An account with this account number already exists.')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('still creates a valid, distinct account and closes the dialog', async () => {
    const { user } = renderApp()
    await addCustomer(user, ADA)
    await gotoAccounts(user)
    await addAccount(user, ACC)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await gotoCustomers(user)
    await gotoAccounts(user)
    expect(within(screen.getByRole('table', { name: 'Accounts' })).getAllByRole('row')).toHaveLength(2)
  })
})
