const counters = new Map<string, number>()

/** Monotonic, per-prefix id generator. Deterministic ordering keeps tests stable. */
export function nextId(prefix: string): string {
  const next = (counters.get(prefix) ?? 0) + 1
  counters.set(prefix, next)
  return `${prefix}_${next}`
}

/** Test helper: reset every sequence so ids are predictable per test. */
export function resetIds(): void {
  counters.clear()
}

/**
 * Advance each prefix's counter past the highest number seen in `ids`, so
 * ids loaded from storage or an import never collide with newly generated ones.
 * Ids that don't match the `prefix_number` pattern are ignored.
 */
export function seedIds(ids: string[]): void {
  for (const id of ids) {
    const separatorIndex = id.lastIndexOf('_')
    if (separatorIndex === -1) continue

    const prefix = id.slice(0, separatorIndex)
    const suffix = id.slice(separatorIndex + 1)
    if (!/^\d+$/.test(suffix)) continue

    const number = Number(suffix)
    const current = counters.get(prefix) ?? 0
    counters.set(prefix, Math.max(current, number))
  }
}
