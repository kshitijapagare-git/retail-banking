import type { Route } from '../lib/useHashRoute'

const NAV: { route: Route; icon: string; label: string }[] = [
  { route: 'customers', icon: '\u{1F464}', label: 'Customers' },
  { route: 'accounts', icon: '\u{1F4B3}', label: 'Accounts' },
  { route: 'transactions', icon: '\u{1F4B8}', label: 'Transactions' },
]

export function Sidebar({ current }: { current: Route }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span aria-hidden="true">{'\u{1F3E6}'}</span> Retail Banking
      </div>
      <nav aria-label="Sections">
        {NAV.map((item) => (
          <a
            key={item.route}
            href={`#/${item.route}`}
            className={item.route === current ? 'nav-item is-active' : 'nav-item'}
            aria-current={item.route === current ? 'page' : undefined}
          >
            <span aria-hidden="true">{item.icon}</span> {item.label}
          </a>
        ))}
      </nav>
    </aside>
  )
}
