import { useHashRoute } from './lib/useHashRoute'
import { AccountsPage } from './pages/AccountsPage'
import { CustomersPage } from './pages/CustomersPage'
import { Sidebar } from './ui/Sidebar'

export function App() {
  const route = useHashRoute()

  return (
    <div className="layout">
      <Sidebar current={route} />
      <main className="content">{route === 'accounts' ? <AccountsPage /> : <CustomersPage />}</main>
    </div>
  )
}
