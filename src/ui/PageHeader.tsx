export function PageHeader({ title, actionLabel, onAction }: { title: string; actionLabel: string; onAction: () => void }) {
  return (
    <header className="page-header">
      <h1>{title}</h1>
      <button type="button" className="btn-primary" onClick={onAction}>
        + {actionLabel}
      </button>
    </header>
  )
}
