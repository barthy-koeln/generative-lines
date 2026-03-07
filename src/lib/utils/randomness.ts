import type { Normalized } from '../types'

function getRandomInt (max: number) {
  return Math.floor(Math.random() * max)
}

export function getRandomColor (): string {
  return `hsl(${getRandomInt(360)} 100% 50%)`
}

export function getRandomFloat (): Normalized {
  return (Math.random() - 0.5) * 2.0
}