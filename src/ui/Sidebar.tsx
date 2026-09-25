import { useRef, useState, type ChangeEvent } from 'react'
import { parseState, serialize } from '../data/persistence'
import { StoreError } from '../data/bankingStore'
import type { Route } from '../lib/useHashRoute'
import { useBanking } from '../state/BankingContext'

const NAV: { route: Route; icon: string; label: string }[] = [
  { route: 'customers', icon: '\u{1F464}', label: 'Customers' },
  { route: 'accounts', icon: '\u{1F4B3}', label: 'Accounts' },
]

export function Sidebar({ current }: { current: Route }) {
  const banking = useBanking()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const handleExport = () => {
    const json = serialize({ customers: banking.customers, accounts: banking.accounts })
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'retail-banking-export.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const text = await file.text()
      const parsed = parseState(text)
      banking.replaceState(parsed)
      setImportError(null)
      setImportMessage(
        `Imported ${parsed.customers.length} customer(s) and ${parsed.accounts.length} account(s)`,
      )
    } catch (error) {
      setImportMessage(null)
      setImportError(error instanceof StoreError ? error.message : String(error))
    }
  }

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

      <div className="sidebar-data-actions">
        <button type="button" className="btn-ghost" onClick={handleExport}>
          Export data
        </button>
        <button type="button" className="btn-ghost" onClick={handleImportClick}>
          Import data
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          aria-label="Import data file"
          style={{ display: 'none' }}
          onChange={handleImportChange}
        />
      </div>

      {importMessage && <p role="status">{importMessage}</p>}
      {importError && <p role="alert">{importError}</p>}
    </aside>
  )
}
