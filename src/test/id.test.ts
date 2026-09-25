import { describe, expect, it } from 'vitest'
import { nextId, resetIds, seedIds } from '../lib/id'

describe('id', () => {
  it('generates monotonic per-prefix ids', () => {
    resetIds()
    expect(nextId('cus')).toBe('cus_1')
    expect(nextId('cus')).toBe('cus_2')
    expect(nextId('acc')).toBe('acc_1')
  })

  it('seeds counters past the highest number seen so ids never collide', () => {
    resetIds()
    seedIds(['cus_3', 'acc_7'])
    expect(nextId('cus')).toBe('cus_4')
    expect(nextId('acc')).toBe('acc_8')
  })

  it('ignores ids that do not match the prefix_number pattern', () => {
    resetIds()
    seedIds(['not-an-id', 'cus_', 'cus_x', 'weird_id_here'])
    expect(nextId('cus')).toBe('cus_1')
  })

  it('does not lower a counter that is already ahead', () => {
    resetIds()
    nextId('cus')
    nextId('cus')
    nextId('cus')
    seedIds(['cus_1'])
    expect(nextId('cus')).toBe('cus_4')
  })
})
