import { describe, expect, it } from 'vitest'
import { validateAccount, validateCustomer, type AccountFormValues } from '../lib/validation'
import type { CustomerDraft } from '../types'

const VALID_CUSTOMER: CustomerDraft = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: '+1 555 0100',
}

const VALID_ACCOUNT: AccountFormValues = {
  accountNumber: 'ACC-1234',
  customerId: 'cus_1',
  balance: '250.5',
  status: 'ACTIVE',
}

describe('validateCustomer', () => {
  it('accepts a fully valid draft', () => {
    expect(validateCustomer(VALID_CUSTOMER)).toEqual({})
  })

  it('requires a first name', () => {
    expect(validateCustomer({ ...VALID_CUSTOMER, firstName: '   ' }).firstName).toBe('First name is required')
  })

  it('accepts a non-empty first name', () => {
    expect(validateCustomer({ ...VALID_CUSTOMER, firstName: 'Grace' }).firstName).toBeUndefined()
  })

  it('requires a last name', () => {
    expect(validateCustomer({ ...VALID_CUSTOMER, lastName: '' }).lastName).toBe('Last name is required')
  })

  it('accepts a non-empty last name', () => {
    expect(validateCustomer({ ...VALID_CUSTOMER, lastName: 'Hopper' }).lastName).toBeUndefined()
  })

  it('rejects an invalid email', () => {
    expect(validateCustomer({ ...VALID_CUSTOMER, email: 'not-an-email' }).email).toBe('Enter a valid email address')
  })

  it('accepts a valid email', () => {
    expect(validateCustomer({ ...VALID_CUSTOMER, email: 'grace@example.com' }).email).toBeUndefined()
  })

  it('rejects a phone with too few digits', () => {
    expect(validateCustomer({ ...VALID_CUSTOMER, phone: '123456' }).phone).toBe('Enter a valid phone number')
  })

  it('rejects a phone with invalid characters', () => {
    expect(validateCustomer({ ...VALID_CUSTOMER, phone: '555-0100 ext' }).phone).toBe('Enter a valid phone number')
  })

  it('accepts a valid phone', () => {
    expect(validateCustomer({ ...VALID_CUSTOMER, phone: '+1 (555) 010-0000' }).phone).toBeUndefined()
  })
})

describe('validateAccount', () => {
  it('accepts a fully valid set of values', () => {
    expect(validateAccount(VALID_ACCOUNT)).toEqual({})
  })

  it('rejects an account number that does not match the pattern', () => {
    expect(validateAccount({ ...VALID_ACCOUNT, accountNumber: 'ACC-1' }).accountNumber).toBe(
      'Account number must look like ACC-1234',
    )
  })

  it('accepts an account number matching the pattern', () => {
    expect(validateAccount({ ...VALID_ACCOUNT, accountNumber: 'ACC-9999' }).accountNumber).toBeUndefined()
  })

  it('requires a customer to be selected', () => {
    expect(validateAccount({ ...VALID_ACCOUNT, customerId: '' }).customerId).toBe('Select a customer')
  })

  it('accepts a selected customer', () => {
    expect(validateAccount({ ...VALID_ACCOUNT, customerId: 'cus_2' }).customerId).toBeUndefined()
  })

  it('rejects a blank balance', () => {
    expect(validateAccount({ ...VALID_ACCOUNT, balance: '   ' }).balance).toBe('Balance must be zero or more')
  })

  it('rejects a negative balance', () => {
    expect(validateAccount({ ...VALID_ACCOUNT, balance: '-5' }).balance).toBe('Balance must be zero or more')
  })

  it('rejects a non-numeric balance', () => {
    expect(validateAccount({ ...VALID_ACCOUNT, balance: 'abc' }).balance).toBe('Balance must be zero or more')
  })

  it('accepts a zero balance', () => {
    expect(validateAccount({ ...VALID_ACCOUNT, balance: '0' }).balance).toBeUndefined()
  })

  it('requires a status', () => {
    expect(validateAccount({ ...VALID_ACCOUNT, status: '   ' }).status).toBe('Status is required')
  })

  it('accepts a non-empty status', () => {
    expect(validateAccount({ ...VALID_ACCOUNT, status: 'FROZEN' }).status).toBeUndefined()
  })
})
