import { Easing } from '@tweenjs/tween.js'
import type { CSSColor, EasingFunction, Integer, Line, Milliseconds, Normalized, Pixels } from './types'
import { AutoplayTweenGroup } from './autoplay-tween-group.ts'

export interface Config {
  renderWidth: Pixels
  renderHeight: Pixels
  distance: Pixels
  amplitude: Pixels
  thickness: Pixels
  lines: Integer
  paddingX: Pixels
  paddingY: Pixels
  perspective: Normalized
  steps: Integer
  colors: Integer
  easing: EasingFunction
  background: string
  animationDuration: Milliseconds
  animationEasing: EasingFunction
  lineCap: CanvasLineCap
  lineJoin: CanvasLineJoin,
  tweenGroup: AutoplayTweenGroup
}

export interface RenderState {
  steps: Normalized[]
  colors: CSSColor[]
  lines: Line[]
}

export type EasingString =
  `${keyof Omit<typeof Easing, 'Linear' | 'generatePow'>}.${'In' | 'Out' | 'InOut'}`
  | `Linear.None`

export const EASING_STRINGS: EasingString[] = Object.entries(Easing).flatMap(([easing, group]) => {
  if (easing === 'Linear') {
    return ['Linear.None']
  }

  if (easing === 'generatePow') {
    return []
  }

  return Object.keys(group).map(option => `${easing}.${option}`)
}) as EasingString[]

export function getEasingByString (easing: string): EasingFunction {
  const [type, method] = easing.split('.')
  const easingFunction = (Easing as any)[type]?.[method] as EasingFunction | undefined

  if (!easingFunction) {
    throw new Error(`Invalid easing function: ${easing}`)
  }

  return easingFunction
}

export const DEFAULT_CONFIG: Config = {
  renderWidth: 1024,
  renderHeight: 1024,
  distance: 12,
  amplitude: 32,
  thickness: 2,
  lines: 12,
  paddingX: 20,
  paddingY: 20,
  perspective: -0.02,
  steps: 12,
  colors: 3,
  easing: getEasingByString('Cubic.InOut'),
  background: 'transparent',
  animationDuration: 1_000,
  animationEasing: getEasingByString('Cubic.InOut'),
  lineCap: 'round',
  lineJoin: 'round',
  tweenGroup: new AutoplayTweenGroup()
}