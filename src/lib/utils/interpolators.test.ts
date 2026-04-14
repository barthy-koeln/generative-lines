import { createStepsInterpolator } from './interpolators'
import { Easing } from '@tweenjs/tween.js'

describe('createStepsInterpolator', () => {
  it('generates random from and to values when not provided', () => {
    const interpolator = createStepsInterpolator(3)

    const result = interpolator(0.5)

    expect(result).toHaveLength(3)
    result.forEach(value => {
      expect(typeof value).toBe('number')
    })
  })

  it('uses provided from and to arrays', () => {
    const from = [0, 10, 20]
    const to = [100, 110, 120]
    const interpolator = createStepsInterpolator(3, from, to, Easing.Linear.None)

    const result = interpolator(0.5)

    expect(result).toEqual([50, 60, 70])
  })

  it('throws error when from and to arrays have different lengths', () => {
    expect(() =>
      createStepsInterpolator(3, [0, 10], [100, 110, 120], Easing.Linear.None)
    ).toThrow('invalid count and sizes')
  })

  it('throws error when array length does not match count', () => {
    expect(() =>
      createStepsInterpolator(5, [0, 10, 20], [100, 110, 120], Easing.Linear.None)
    ).toThrow('invalid count and sizes')
  })

  it('interpolates correctly at t=0', () => {
    const from = [0, 50, 100]
    const to = [100, 150, 200]
    const interpolator = createStepsInterpolator(3, from, to, Easing.Linear.None)

    const result = interpolator(0)

    expect(result).toEqual([0, 50, 100])
  })

  it('interpolates correctly at t=1', () => {
    const from = [0, 50, 100]
    const to = [100, 150, 200]
    const interpolator = createStepsInterpolator(3, from, to, Easing.Linear.None)

    const result = interpolator(1)

    expect(result).toEqual([100, 150, 200])
  })

  it('interpolates correctly at t=0.5 with linear easing', () => {
    const from = [0, 50, 100]
    const to = [100, 150, 200]
    const interpolator = createStepsInterpolator(3, from, to, Easing.Linear.None)

    const result = interpolator(0.5)

    expect(result).toEqual([50, 100, 150])
  })

  it('applies custom easing function', () => {
    const from = [0]
    const to = [100]
    const customEasing = (t: number) => t * t
    const interpolator = createStepsInterpolator(1, from, to, customEasing)

    const result = interpolator(0.5)

    expect(result[0]).toBe(25)
  })

  it('returns array of correct length', () => {
    const from = [0, 1, 2, 3, 4]
    const to = [10, 20, 30, 40, 50]
    const interpolator = createStepsInterpolator(5, from, to, Easing.Linear.None)

    const result = interpolator(0.5)

    expect(result).toHaveLength(5)
  })

  it('handles negative values', () => {
    const from = [-100, -50]
    const to = [100, 50]
    const interpolator = createStepsInterpolator(2, from, to, Easing.Linear.None)

    const result = interpolator(0.5)

    expect(result).toEqual([0, 0])
  })

  it('handles decimal values', () => {
    const from = [0.1, 0.2]
    const to = [0.9, 1.0]
    const interpolator = createStepsInterpolator(2, from, to, Easing.Linear.None)

    const result = interpolator(0.5)

    expect(result[0]).toBeCloseTo(0.5, 5)
    expect(result[1]).toBeCloseTo(0.6, 5)
  })

  it('calls interpolator function multiple times with different t values', () => {
    const from = [0]
    const to = [100]
    const interpolator = createStepsInterpolator(1, from, to, Easing.Linear.None)

    const result1 = interpolator(0.25)
    const result2 = interpolator(0.75)

    expect(result1[0]).toBe(25)
    expect(result2[0]).toBe(75)
  })
})
