import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { usePagination } from '../lib/usePagination'

const rows = (count: number) => Array.from({ length: count }, (_, index) => index + 1)

describe('usePagination', () => {
  it('reports a single page when the list fits', () => {
    const { result } = renderHook(() => usePagination(rows(4), 10))

    expect(result.current.page).toBe(1)
    expect(result.current.pageCount).toBe(1)
    expect(result.current.visible).toHaveLength(4)
  })

  it('reports one page for an empty list', () => {
    const { result } = renderHook(() => usePagination(rows(0), 10))

    expect(result.current.pageCount).toBe(1)
    expect(result.current.visible).toEqual([])
  })

  it('splits the list across pages', () => {
    const { result } = renderHook(() => usePagination(rows(25), 10))

    expect(result.current.pageCount).toBe(3)
    expect(result.current.visible).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

    act(() => result.current.setPage(3))
    expect(result.current.visible).toEqual([21, 22, 23, 24, 25])
  })

  it('clamps back when the list shrinks under the current page', () => {
    const { result, rerender } = renderHook(({ items }) => usePagination(items, 10), {
      initialProps: { items: rows(25) },
    })

    act(() => result.current.setPage(3))
    expect(result.current.page).toBe(3)

    rerender({ items: rows(5) })
    expect(result.current.page).toBe(1)
    expect(result.current.visible).toEqual([1, 2, 3, 4, 5])
  })
})
