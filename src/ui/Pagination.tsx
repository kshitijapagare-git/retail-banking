export function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number
  pageCount: number
  onChange: (page: number) => void
}) {
  return (
    <div className="pagination">
      <span className="page-label">Page {page}</span>
      <div className="page-buttons">
        <button
          type="button"
          className="icon-btn"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          {'‹'}
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label="Next page"
          disabled={page >= pageCount}
          onClick={() => onChange(page + 1)}
        >
          {'›'}
        </button>
      </div>
    </div>
  )
}
