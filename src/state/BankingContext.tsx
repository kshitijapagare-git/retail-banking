import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import * as store from '../data/bankingStore'
import type { BankingState } from '../data/bankingStore'
import type { Account, AccountDraft, Customer, CustomerDraft } from '../types'

export interface BankingApi {
  customers: Customer[]
  accounts: Account[]
  getCustomer: (id: string) => Customer | undefined
  getAccount: (id: string) => Account | undefined
  createCustomer: (draft: CustomerDraft) => void
  updateCustomer: (id: string, patch: Partial<CustomerDraft>) => void
  deleteCustomer: (id: string) => void
  createAccount: (draft: AccountDraft) => void
  updateAccount: (id: string, patch: Partial<AccountDraft>) => void
  deleteAccount: (id: string) => void
}

const BankingContext = createContext<BankingApi | null>(null)

export function BankingProvider({
  children,
  initialState = store.emptyState(),
}: {
  children: ReactNode
  initialState?: BankingState
}) {
  const [state, setState] = useState<BankingState>(initialState)

  const api = useMemo<BankingApi>(
    () => ({
      customers: store.listCustomers(state),
      accounts: store.listAccounts(state),
      getCustomer: (id) => store.getCustomer(state, id),
      getAccount: (id) => store.getAccount(state, id),
      createCustomer: (draft) => {
        const next = store.createCustomer(state, draft)
        setState(next)
      },
      updateCustomer: (id, patch) => {
        const next = store.updateCustomer(state, id, patch)
        setState(next)
      },
      deleteCustomer: (id) => setState((s) => store.deleteCustomer(s, id)),
      createAccount: (draft) => {
        const next = store.createAccount(state, draft)
        setState(next)
      },
      updateAccount: (id, patch) => {
        const next = store.updateAccount(state, id, patch)
        setState(next)
      },
      deleteAccount: (id) => setState((s) => store.deleteAccount(s, id)),
    }),
    [state],
  )

  return <BankingContext.Provider value={api}>{children}</BankingContext.Provider>
}

export function useBanking(): BankingApi {
  const api = useContext(BankingContext)
  if (!api) throw new Error('useBanking must be used inside a BankingProvider')
  return api
}
