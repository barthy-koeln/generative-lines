import type { CSSColor, Pixels } from '../types'

export function createGradient (context: CanvasRenderingContext2D, start: Pixels, width: Pixels, colors: CSSColor[]) {
  const colorDistance = 1 / (colors.length - 1)
  const gradient = context.createLinearGradient(start, 0, width, 0)

  for (let i = 0; i < colors.length; i++) {
    const color = colors[i]
    const index = colors.indexOf(color)
    gradient.addColorStop(index * colorDistance, color)
  }

  return gradient
}