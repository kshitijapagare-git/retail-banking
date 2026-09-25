import { useHashRoute } from './lib/useHashRoute'
import { AccountsPage } from './pages/AccountsPage'
import { CustomersPage } from './pages/CustomersPage'
import { useBanking } from './state/BankingContext'
import { Sidebar } from './ui/Sidebar'

export function App() {
  const route = useHashRoute()
  const banking = useBanking()

  return (
    <div className="layout">
      <Sidebar current={route} />
      <main className="content">
        {banking.loadError && (
          <div className="banner banner-alert" role="alert">
            <span>Saved data could not be loaded and was reset: {banking.loadError}</span>
            <button type="button" className="btn-ghost" onClick={banking.dismissLoadError}>
              Dismiss
            </button>
          </div>
        )}
        {route === 'accounts' ? <AccountsPage /> : <CustomersPage />}
      </main>
    </div>
  )
}
