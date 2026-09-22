export interface Entity {
  id: string
}

/** Insertion-ordered in-memory table. All operations return a new table. */
export type Table<T extends Entity> = readonly T[]

export function list<T extends Entity>(table: Table<T>): T[] {
  return [...table]
}

export function get<T extends Entity>(table: Table<T>, id: string): T | undefined {
  return table.find((row) => row.id === id)
}

export function insert<T extends Entity>(table: Table<T>, row: T): Table<T> {
  return [...table, row]
}

export function replace<T extends Entity>(table: Table<T>, id: string, patch: Partial<Omit<T, 'id'>>): Table<T> {
  return table.map((row) => (row.id === id ? { ...row, ...patch } : row))
}

export function remove<T extends Entity>(table: Table<T>, id: string): Table<T> {
  return table.filter((row) => row.id !== id)
}
