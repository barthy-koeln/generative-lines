import { fillArray } from './array'

describe('fillArray', () => {
  it('creates array with specified length using callback', () => {
    const result = fillArray(3, () => 1)
    expect(result).toEqual([1, 1, 1])
  })

  it('invokes callback for each element', () => {
    let callCount = 0
    const result = fillArray(5, () => ++callCount)
    expect(result).toEqual([1, 2, 3, 4, 5])
    expect(callCount).toBe(5)
  })

  it('returns empty array when length is 0', () => {
    const result = fillArray(0, () => 'test')
    expect(result).toEqual([])
  })

  it('works with object values', () => {
    const result = fillArray(2, () => ({ id: 1 }))
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ id: 1 })
    expect(result[1]).toEqual({ id: 1 })
  })

  it('returns empty array for negative length', () => {
    const result = fillArray(-1, () => 'test')
    expect(result).toEqual([])
  })

  it('returns array of undefined for void callback', () => {
    const result = fillArray(3, () => {})
    expect(result).toEqual([undefined, undefined, undefined])
  })
})
