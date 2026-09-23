import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import * as store from '../data/bankingStore'
import type { BankingState } from '../data/bankingStore'
import type { Account, AccountDraft, Customer, CustomerDraft, Transaction, TransactionDraft } from '../types'

export interface BankingApi {
  customers: Customer[]
  accounts: Account[]
  transactions: Transaction[]
  getCustomer: (id: string) => Customer | undefined
  getAccount: (id: string) => Account | undefined
  createCustomer: (draft: CustomerDraft) => void
  updateCustomer: (id: string, patch: Partial<CustomerDraft>) => void
  deleteCustomer: (id: string) => void
  createAccount: (draft: AccountDraft) => void
  updateAccount: (id: string, patch: Partial<AccountDraft>) => void
  deleteAccount: (id: string) => void
  recordTransaction: (draft: TransactionDraft) => void
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
      transactions: store.listTransactions(state),
      getCustomer: (id) => store.getCustomer(state, id),
      getAccount: (id) => store.getAccount(state, id),
      createCustomer: (draft) => setState((s) => store.createCustomer(s, draft)),
      updateCustomer: (id, patch) => setState((s) => store.updateCustomer(s, id, patch)),
      deleteCustomer: (id) => setState((s) => store.deleteCustomer(s, id)),
      createAccount: (draft) => setState((s) => store.createAccount(s, draft)),
      updateAccount: (id, patch) => setState((s) => store.updateAccount(s, id, patch)),
      deleteAccount: (id) => setState((s) => store.deleteAccount(s, id)),
      recordTransaction: (draft) => setState((s) => store.recordTransaction(s, draft)),
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
