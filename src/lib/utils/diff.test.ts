import { diff } from './diff'

describe('diff', () => {
  it('returns empty object when objects are identical', () => {
    const base = { a: 1, b: 2 }
    const incoming = { a: 1, b: 2 }

    const result = diff(base, incoming)

    expect(result).toEqual({})
  })

  it('returns object with changed values', () => {
    const base = { a: 1, b: 2 }
    const incoming = { a: 1, b: 3 }

    const result = diff(base, incoming)

    expect(result).toEqual({ b: 3 })
  })

  it('returns all changed values when multiple properties differ', () => {
    const base = { a: 1, b: 2, c: 3 }
    const incoming = { a: 10, b: 20, c: 30 }

    const result = diff(base, incoming)

    expect(result).toEqual({ a: 10, b: 20, c: 30 })
  })

  it('includes unchanged values that are the same', () => {
    const base = { a: 1, b: 2 }
    const incoming = { a: 1, b: 2 }

    const result = diff(base, incoming)

    expect(result).not.toHaveProperty('a')
    expect(result).not.toHaveProperty('b')
  })

  it('handles array reference changes', () => {
    const base = { items: [1, 2, 3] }
    const incoming = { items: [1, 2, 3] }

    const result = diff(base, incoming)

    expect(result).toEqual({ items: [1, 2, 3] })
  })

  it('handles nested object reference changes', () => {
    const base = { nested: { x: 1 } }
    const incoming = { nested: { x: 1 } }

    const result = diff(base, incoming)

    expect(result).toEqual({ nested: { x: 1 } })
  })

  it('handles string values', () => {
    const base = { name: 'hello', value: 'world' }
    const incoming = { name: 'hello', value: 'changed' }

    const result = diff(base, incoming)

    expect(result).toEqual({ value: 'changed' })
  })

  it('handles boolean values', () => {
    const base = { enabled: true, visible: false }
    const incoming = { enabled: false, visible: false }

    const result = diff(base, incoming)

    expect(result).toEqual({ enabled: false })
  })

  it('handles null and undefined values', () => {
    type TestObject = { [k: string]: string | null | undefined }
    const base: TestObject = { a: null, b: undefined, c: 'value' }
    const incoming: TestObject = { a: 'not null', b: undefined, c: 'value' }

    const result = diff(base, incoming)

    expect(result).toEqual({ a: 'not null' })
  })

  it('handles empty objects', () => {
    const base = {}
    const incoming = {}

    const result = diff(base, incoming)

    expect(result).toEqual({})
  })

  it('handles new properties in incoming object', () => {
    const base = { a: 1 }
    const incoming = { a: 1, b: 2 }

    const result = diff(base, incoming)

    expect(result).toEqual({ b: 2 })
  })

  it('handles number zero values', () => {
    const base = { count: 0, score: 10 }
    const incoming = { count: 0, score: 10 }

    const result = diff(base, incoming)

    expect(result).toEqual({})
  })

  it('handles mixed types', () => {
    type TestObject = { [k: string]: string | null | undefined | boolean | number }
    const base: TestObject = { a: 1, b: 'text', c: true, d: null }
    const incoming: TestObject = { a: 1, b: 'text', c: false, d: 'not null' }

    const result = diff(base, incoming)

    expect(result).toEqual({ c: false, d: 'not null' })
  })
})
