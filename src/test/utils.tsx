import { render, screen, within, type RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../App'
import * as store from '../data/bankingStore'
import type { BankingState } from '../data/bankingStore'
import { BankingProvider } from '../state/BankingContext'

type User = ReturnType<typeof userEvent.setup>

export const CHECKING = { id: 'accttype_1', name: 'Checking' }
export const SAVINGS = { id: 'accttype_2', name: 'Savings' }

export const DOWNTOWN = { id: 'branch_1', name: 'Downtown' }
export const UPTOWN = { id: 'branch_2', name: 'Uptown' }

/** Every test renders against this seeded state so the account-type/branch
 * Selects have a live list to source options from, matching how the
 * AccountType/Branch screens themselves would populate them. */
function seededState(): BankingState {
  return {
    ...store.emptyState(),
    accountTypes: [CHECKING, SAVINGS],
    branches: [DOWNTOWN, UPTOWN],
  }
}

export function renderApp(): RenderResult & { user: User } {
  const user = userEvent.setup()
  const result = render(
    <BankingProvider initialState={seededState()}>
      <App />
    </BankingProvider>,
  )
  return { ...result, user }
}

/** For scenarios that need to seed data the UI itself has no way to create,
 * e.g. an account whose accountTypeId/branchId no longer resolves. */
export function renderAppWithState(state: BankingState): RenderResult & { user: User } {
  const user = userEvent.setup()
  const result = render(
    <BankingProvider initialState={state}>
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
  account: {
    accountNumber: string
    customerName: string
    accountTypeName: string
    branchName: string
    balance: string
    status: string
  },
) {
  await user.click(screen.getByRole('button', { name: '+ Add account' }))
  await user.type(screen.getByLabelText('Account number'), account.accountNumber)
  await user.selectOptions(screen.getByLabelText('Customer'), account.customerName)
  await user.selectOptions(screen.getByLabelText('Account type'), account.accountTypeName)
  await user.selectOptions(screen.getByLabelText('Branch'), account.branchName)
  await user.clear(screen.getByLabelText('Balance'))
  await user.type(screen.getByLabelText('Balance'), account.balance)
  await user.selectOptions(screen.getByLabelText('Status'), account.status)
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
  accountTypeName: 'Checking',
  branchName: 'Downtown',
  balance: '250.5',
  status: 'ACTIVE',
}
