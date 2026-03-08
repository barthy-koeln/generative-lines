import type { CSSColor, Pixels } from '../types'

export function useCachedGradient () {

  /**
   * Store reference to array as cache key.
   * Gradient will be recreated if the array is recreated, not if the array contents change.
   */
  let currentCacheKey: CSSColor[] = []
  let currentGradient: CanvasGradient | null = null

  function createGradient (context: CanvasRenderingContext2D, start: Pixels, width: Pixels, colors: CSSColor[]) {
    if (currentCacheKey === colors && currentGradient) {
      return currentGradient
    }

    const colorDistance = 1 / (colors.length - 1)
    const gradient = context.createLinearGradient(start, 0, width, 0)

    for (let index = 0; index < colors.length; index++) {
      const color = colors[index]
      gradient.addColorStop(index * colorDistance, color)
    }

    currentCacheKey = colors
    currentGradient = gradient

    return currentGradient
  }

  return {
    createGradient,
  }
}