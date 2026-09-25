import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as store from '../data/bankingStore'
import type { BankingState } from '../data/bankingStore'
import { loadState, serialize, STORAGE_KEY } from '../data/persistence'
import type { Account, AccountDraft, Customer, CustomerDraft } from '../types'

export interface BankingApi {
  customers: Customer[]
  accounts: Account[]
  loadError: string | null
  getCustomer: (id: string) => Customer | undefined
  getAccount: (id: string) => Account | undefined
  createCustomer: (draft: CustomerDraft) => void
  updateCustomer: (id: string, patch: Partial<CustomerDraft>) => void
  deleteCustomer: (id: string) => void
  createAccount: (draft: AccountDraft) => void
  updateAccount: (id: string, patch: Partial<AccountDraft>) => void
  deleteAccount: (id: string) => void
  replaceState: (state: BankingState) => void
  dismissLoadError: () => void
}

const BankingContext = createContext<BankingApi | null>(null)

export function BankingProvider({
  children,
  initialState,
  storage = window.localStorage,
}: {
  children: ReactNode
  initialState?: BankingState
  storage?: Storage
}) {
  const [state, setState] = useState<BankingState>(() => {
    if (initialState) return initialState
    return loadState(storage).state
  })
  const [loadError, setLoadError] = useState<string | null>(() => {
    if (initialState) return null
    return loadState(storage).error ?? null
  })

  useEffect(() => {
    try {
      storage.setItem(STORAGE_KEY, serialize(state))
    } catch {
      // Ignore storage/serialization failures; persistence is best-effort.
    }
  }, [state, storage])

  const api = useMemo<BankingApi>(
    () => ({
      customers: store.listCustomers(state),
      accounts: store.listAccounts(state),
      loadError,
      getCustomer: (id) => store.getCustomer(state, id),
      getAccount: (id) => store.getAccount(state, id),
      createCustomer: (draft) => setState((s) => store.createCustomer(s, draft)),
      updateCustomer: (id, patch) => setState((s) => store.updateCustomer(s, id, patch)),
      deleteCustomer: (id) => setState((s) => store.deleteCustomer(s, id)),
      createAccount: (draft) => setState((s) => store.createAccount(s, draft)),
      updateAccount: (id, patch) => setState((s) => store.updateAccount(s, id, patch)),
      deleteAccount: (id) => setState((s) => store.deleteAccount(s, id)),
      replaceState: (next) => setState(next),
      dismissLoadError: () => setLoadError(null),
    }),
    [state, loadError],
  )

  return <BankingContext.Provider value={api}>{children}</BankingContext.Provider>
}

export function useBanking(): BankingApi {
  const api = useContext(BankingContext)
  if (!api) throw new Error('useBanking must be used inside a BankingProvider')
  return api
}
