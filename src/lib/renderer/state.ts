import { type Config, type RenderState } from '../config.ts'
import { createLines } from '../generator.ts'
import { fillArray } from '../utils/array.ts'
import { getRandomColor, getRandomFloat } from '../utils/randomness.ts'
import { DEFAULT_CONFIG } from '../config.ts'

export interface StateControllerParams {
  canvas: HTMLCanvasElement
  onConfigChange: (newConfig: Partial<Config>, mergedConfig: Config) => void
}

/**
 * State controller for configuration and state lifecycle management.
 * Handles initialization, updates, and line regeneration.
 */
export function createStateController ({
  canvas,
  onConfigChange
}: StateControllerParams) {
  let config: Config
  let state: RenderState

  function resizeCanvas (): void {
    canvas.width = config.renderWidth
    canvas.height = config.renderHeight
  }

  function initialize (partialConfig: Partial<Config>, incomingState?: Partial<RenderState>): void {
    config = { ...DEFAULT_CONFIG, ...partialConfig }
    resizeCanvas()

    // Precedence: Incoming one, existing one, or new random one if not provided
    const newState: RenderState = {
      ...(state ?? {}),
      ...incomingState
    }

    if (!newState.steps) {
      newState.steps = fillArray(config.steps, getRandomFloat)
    }

    if(!newState.colors) {
      newState.colors = fillArray(config.colors, getRandomColor)
    }

    newState.lines = createLines(config, newState)
    state = newState as RenderState
  }

  function mergeConfig (newConfig: Partial<Config>): void {
    config = {
      ...config,
      ...newConfig,
    }

    onConfigChange(newConfig, config)
  }

  function rebuildLines (): void {
    state.lines = createLines(config, state)
  }

  function mergeState (newState: Partial<RenderState>): void {
    state = {
      ...state,
      ...newState,
    }

    config.colors = state.colors.length
    config.steps = state.steps.length

    rebuildLines()
  }

  function rerollLines (): void {
    state.steps = fillArray(config.steps, getRandomFloat)
  }

  function rerollColors (): void {
    state.colors = fillArray(config.colors, getRandomColor)
  }

  return {
    getConfig (): Config {
      return config
    },
    getState (): RenderState {
      return state
    },
    initialize,
    mergeConfig,
    mergeState,
    rerollLines,
    rerollColors,
    rebuildLines,
    resizeCanvas,
  }
}