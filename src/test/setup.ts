import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'
import { resetIds } from '../lib/id'

beforeEach(() => {
  resetIds()
  // The hash survives between tests in one file; reset so each starts on Customers.
  window.location.hash = ''
})

afterEach(() => {
  cleanup()
})
