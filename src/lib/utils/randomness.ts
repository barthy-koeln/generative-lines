import chroma, { type Color } from 'chroma-js'
import type { Normalized, Pixels } from '../types'
import { createLines } from '../generator.ts'

export function getRandomColor(): Color {
  return chroma.random().set('hsl.l', 0.6).saturate(2)
}

export function getRandomFloat(): Normalized {
  return (Math.random() - 0.5) * 2.0
}