export function RowActions({
  label,
  onEdit,
  onDelete,
}: {
  label: string
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="row-actions">
      <button type="button" className="icon-btn" aria-label={`Edit ${label}`} onClick={onEdit}>
        <span aria-hidden="true">{'✏️'}</span>
      </button>
      <button type="button" className="icon-btn" aria-label={`Delete ${label}`} onClick={onDelete}>
        <span aria-hidden="true">{'\u{1F5D1}️'}</span>
      </button>
    </div>
  )
}
