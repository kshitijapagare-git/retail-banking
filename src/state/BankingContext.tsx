import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import * as store from '../data/bankingStore'
import type { BankingState } from '../data/bankingStore'
import type { Account, AccountDraft, AccountType, Branch, Customer, CustomerDraft } from '../types'

export interface BankingApi {
  customers: Customer[]
  accounts: Account[]
  accountTypes: AccountType[]
  branches: Branch[]
  getCustomer: (id: string) => Customer | undefined
  getAccount: (id: string) => Account | undefined
  getAccountType: (id: string) => AccountType | undefined
  getBranch: (id: string) => Branch | undefined
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
      accountTypes: store.listAccountTypes(state),
      branches: store.listBranches(state),
      getCustomer: (id) => store.getCustomer(state, id),
      getAccount: (id) => store.getAccount(state, id),
      getAccountType: (id) => store.getAccountType(state, id),
      getBranch: (id) => store.getBranch(state, id),
      createCustomer: (draft) => setState((s) => store.createCustomer(s, draft)),
      updateCustomer: (id, patch) => setState((s) => store.updateCustomer(s, id, patch)),
      deleteCustomer: (id) => setState((s) => store.deleteCustomer(s, id)),
      createAccount: (draft) => setState((s) => store.createAccount(s, draft)),
      updateAccount: (id, patch) => setState((s) => store.updateAccount(s, id, patch)),
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
