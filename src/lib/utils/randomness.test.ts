import { getRandomColor, getRandomFloat } from './randomness'

describe('getRandomColor', () => {
  it('returns a string', () => {
    const result = getRandomColor()

    expect(typeof result).toBe('string')
  })

  it('returns HSL format', () => {
    const result = getRandomColor()

    expect(result).toMatch(/^hsl\(\d+ 100% 50%\)$/)
  })

  it('generates hue value between 0 and 359', () => {
    const result = getRandomColor()
    const match = result.match(/^hsl\((\d+) 100% 50%\)$/)

    expect(match).toBeTruthy()
    const hue = parseInt(match![1], 10)
    expect(hue).toBeGreaterThanOrEqual(0)
    expect(hue).toBeLessThan(360)
  })

  it('always uses 100% saturation', () => {
    const result = getRandomColor()

    expect(result).toContain('100%')
  })

  it('always uses 50% lightness', () => {
    const result = getRandomColor()

    expect(result).toContain('50%')
  })

  it('generates different colors on multiple calls', () => {
    const colors = new Set()
    for (let i = 0; i < 100; i++) {
      colors.add(getRandomColor())
    }

    expect(colors.size).toBeGreaterThan(10)
  })
})

describe('getRandomFloat', () => {
  it('returns a number', () => {
    const result = getRandomFloat()

    expect(typeof result).toBe('number')
  })

  it('returns value between -1 and 1', () => {
    const result = getRandomFloat()

    expect(result).toBeGreaterThanOrEqual(-1)
    expect(result).toBeLessThanOrEqual(1)
  })

  it('generates values across the range', () => {
    const values = []
    for (let i = 0; i < 1000; i++) {
      values.push(getRandomFloat())
    }

    const hasNegative = values.some(v => v < 0)
    const hasPositive = values.some(v => v > 0)

    expect(hasNegative).toBe(true)
    expect(hasPositive).toBe(true)
  })

  it('generates different values on multiple calls', () => {
    const values = new Set()
    for (let i = 0; i < 100; i++) {
      values.add(getRandomFloat())
    }

    expect(values.size).toBeGreaterThan(10)
  })

  it('can return zero or near zero', () => {
    let foundNearZero = false
    for (let i = 0; i < 10000; i++) {
      const value = getRandomFloat()
      if (Math.abs(value) < 0.01) {
        foundNearZero = true
        break
      }
    }

    expect(foundNearZero).toBe(true)
  })
})
