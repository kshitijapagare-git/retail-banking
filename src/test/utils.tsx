import { render, screen, within, type RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../App'
import { BankingProvider } from '../state/BankingContext'

type User = ReturnType<typeof userEvent.setup>

export function renderApp(): RenderResult & { user: User } {
  const user = userEvent.setup()
  const result = render(
    <BankingProvider>
      <App />
    </BankingProvider>,
  )
  return { ...result, user }
}

export const ADA = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: '+1 555 0100',
}

export const GRACE = {
  firstName: 'Grace',
  lastName: 'Hopper',
  email: 'grace@example.com',
  phone: '+1 555 0111',
}

export async function gotoAccounts(user: User) {
  await user.click(screen.getByRole('link', { name: /Accounts/ }))
}

export async function gotoCustomers(user: User) {
  await user.click(screen.getByRole('link', { name: /Customers/ }))
}

export async function addCustomer(user: User, customer: typeof ADA) {
  await user.click(screen.getByRole('button', { name: '+ Add customer' }))
  await user.type(screen.getByLabelText('First name'), customer.firstName)
  await user.type(screen.getByLabelText('Last name'), customer.lastName)
  await user.type(screen.getByLabelText('Email'), customer.email)
  await user.type(screen.getByLabelText('Phone'), customer.phone)
  await user.click(screen.getByRole('button', { name: 'Add customer' }))
}

export async function addAccount(
  user: User,
  account: { accountNumber: string; customerName: string; balance: string; status: string },
) {
  await user.click(screen.getByRole('button', { name: '+ Add account' }))
  await user.type(screen.getByLabelText('Account number'), account.accountNumber)
  await user.selectOptions(screen.getByLabelText('Customer'), account.customerName)
  await user.type(screen.getByLabelText('Balance'), account.balance)
  await user.type(screen.getByLabelText('Status'), account.status)
  await user.click(screen.getByRole('button', { name: 'Add account' }))
}

export function customerRow(name: RegExp) {
  return within(screen.getByRole('table', { name: 'Customers' })).getByRole('row', { name })
}

export function accountRow(name: RegExp) {
  return within(screen.getByRole('table', { name: 'Accounts' })).getByRole('row', { name })
}

export const ACC = {
  accountNumber: 'ACC-1001',
  customerName: 'Ada Lovelace',
  balance: '250.5',
  status: 'ACTIVE',
}
