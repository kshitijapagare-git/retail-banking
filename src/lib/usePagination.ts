import { useMemo, useState } from 'react'

export const PAGE_SIZE = 10

export function usePagination<T>(items: T[], pageSize = PAGE_SIZE) {
  const [requested, setRequested] = useState(1)

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  // Clamp rather than store a corrected page, so deleting the last row of the
  // final page falls back instead of showing an empty table.
  const page = Math.min(requested, pageCount)

  const visible = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  )

  return { page, pageCount, visible, setPage: setRequested }
}
