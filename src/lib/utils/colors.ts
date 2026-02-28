import type { Pixels } from '../types'
import type { Color } from 'chroma-js'

export function createGradient (context: CanvasRenderingContext2D, width: Pixels, colors: Color[]) {
  const colorDistance = 1 / (colors.length - 1)
  const gradient = context.createLinearGradient(0, 0, width, 0)

  for (let i = 0; i < colors.length; i++) {
    const color = colors[i]
    const index = colors.indexOf(color)
    gradient.addColorStop(index * colorDistance, color.hex())
  }

  return gradient
}