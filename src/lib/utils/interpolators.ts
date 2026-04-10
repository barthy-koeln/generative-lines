import { getRandomFloat } from './randomness.ts'
import { fillArray } from './array.ts'
import type { EasingFunction } from '../types'
import { Easing } from '@tweenjs/tween.js'

export function createStepsInterpolator (count: number, from: number[] = [], to: number[] = [], interpolation: EasingFunction = Easing.Linear.None) {
  if (from.length == 0) {
    from.push(...fillArray(count, getRandomFloat))
  }

  if (to.length == 0) {
    to.push(...fillArray(count, getRandomFloat))
  }

  if (from.length !== to.length || from.length !== count) {
    throw new Error('invalid count and sizes')
  }

  function interpolate (start: number, end: number, t: number) {
    return start + ((end - start) * interpolation(t))
  }

  const interpolators: Array<EasingFunction> = []
  for (let i = 0; i < count; i++) {
    interpolators.push((t: number) => interpolate(from[i], to[i], t))
  }

  return (t: number) => {
    return interpolators.map(x => x(t))
  }
}