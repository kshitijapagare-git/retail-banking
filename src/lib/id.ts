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
