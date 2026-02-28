import { Easing } from '@tweenjs/tween.js'
import chroma, { type Color } from 'chroma-js'
import { fillArray } from './utils/array.ts'
import { getRandomColor, getRandomFloat } from './utils/randomness.ts'
import type { EasingFunction, Integer, Milliseconds, Normalized, Pixels } from './types'

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
  background: Color
  animationDuration: Milliseconds
  animationEasing: EasingFunction
}

export interface RenderState {
  steps: Normalized[]
  colors: Color[]
}

/**
 * Fields parsed from HTML attributes before resolution.
 * Easing and background are strings at this stage.
 */
export interface RawConfig {
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
  easing: string
  background: string
  animationDuration: Milliseconds
  animationEasing: string
}

function getEasingByString (easing: string): EasingFunction {
  const [type, method] = easing.split('.')
  const easingFunction = (Easing as any)[type]?.[method] as EasingFunction | undefined

  if (!easingFunction) {
    throw new Error(`Invalid easing function: ${easing}`)
  }

  return easingFunction
}

export function resolveConfig (raw: RawConfig): Config {
  return {
    renderWidth: raw.renderWidth,
    renderHeight: raw.renderHeight,
    distance: raw.distance,
    amplitude: raw.amplitude,
    thickness: raw.thickness,
    lines: raw.lines,
    paddingX: raw.paddingX,
    paddingY: raw.paddingY,
    perspective: raw.perspective,
    steps: raw.steps,
    colors: raw.colors,
    easing: getEasingByString(raw.easing),
    background: chroma(raw.background),
    animationDuration: raw.animationDuration,
    animationEasing: getEasingByString(raw.animationEasing),
  }
}

/**
 * Resolves a single raw field into its Config-typed value.
 */
export function resolveField<T extends keyof Config> (key: T, raw: Partial<RawConfig>): Config[T] {
  if (key === 'easing' && typeof raw.easing === 'string') {
    return getEasingByString(raw.easing) as Config[T]
  }

  if (key === 'background' && typeof raw.background === 'string') {
    return chroma(raw.background) as Config[T]
  }

  if (key === 'animationEasing' && typeof raw.animationEasing === 'string') {
    return getEasingByString(raw.animationEasing) as Config[T]
  }

  // Passthrough — value is already the correct type
  return (raw as unknown as Config)[key]
}

export function createRenderState (config: Config): RenderState {
  return {
    steps: fillArray(config.steps, getRandomFloat),
    colors: fillArray(config.colors, getRandomColor),
  }
}
