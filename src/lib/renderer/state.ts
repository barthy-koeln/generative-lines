import { type Config, createRenderState, type RawConfig, type RenderState, resolveConfig } from '../config.ts'
import { createLines } from '../generator.ts'
import type { Line } from '../types.ts'

export interface StateControllerParams {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
}

/**
 * State controller for configuration and state lifecycle management.
 * Handles initialization, updates, and line regeneration.
 */
export function createStateController ({
  canvas,
  context,
}: StateControllerParams) {
  let config: Config
  let state: RenderState

  function initialize (rawConfig: RawConfig, existingState?: RenderState): void {
    config = resolveConfig(rawConfig)

    canvas.width = config.renderWidth
    canvas.height = config.renderHeight
    context.imageSmoothingEnabled = false
    canvas.style.background = config.background.hex()
    // Precedence: Incoming one, existing one, or new random one if not provided
    state = existingState ?? state ?? createRenderState(config)
    rebuildLines()
  }

  function mergeConfig (newConfig: Partial<Config>): void {
    config = {
      ...config,
      ...newConfig,
    }

    let needsReroll = false
    let needsRebuild = false
    for (const [key, value] of Object.entries(newConfig)) {
      if (value === undefined) {
        continue
      }

      if (['renderWidth', 'renderHeight'].includes(key)) {
        canvas.width = config.renderWidth
        canvas.height = config.renderHeight
      }

      if (['steps', 'colors'].includes(key)) {
        needsReroll = true
        needsRebuild = true
      }

      if (['background'].includes(key)) {
        canvas.style.background = config.background.hex()
      }

      if (['distance', 'amplitude', 'thickness', 'lines', 'paddingX', 'paddingY', 'perspective', 'easing'].includes(key)) {
        needsRebuild = true
      }

      if (['animationDuration', 'animationEasing'].includes(key)) {
        // TODO restart animation
      }
    }

    if (needsReroll) {
      state = createRenderState(config)
    }

    if (needsRebuild) {
      rebuildLines()
    }
  }

  function rebuildLines (): void {
    state.lines = createLines(config, state)
  }

  function mergeState (newState: Partial<RenderState>): void {
    state = {
      ...state,
      ...newState,
    }
    rebuildLines()
  }

  function rerollLines (): void {
    state = createRenderState(config)
    rebuildLines()
  }

  return {
    getConfig () {
      return config
    },
    getState () {
      return state
    },
    initialize,
    mergeConfig,
    mergeState,
    rerollLines,
  }
}