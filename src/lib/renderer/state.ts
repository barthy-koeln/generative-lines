import { type Config, createRenderState, DEFAULT_CONFIG, type RenderState } from '../config.ts'
import { createLines } from '../generator.ts'
import { fillArray } from '../utils/array.ts'
import { getRandomColor, getRandomFloat } from '../utils/randomness.ts'

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

  function resizeCanvas () {
    canvas.width = config.renderWidth
    canvas.height = config.renderHeight
  }

  function initialize (partialConfig: Partial<Config>, existingState?: RenderState): void {
    config = { ...DEFAULT_CONFIG, ...partialConfig }
    resizeCanvas()

    // Precedence: Incoming one, existing one, or new random one if not provided
    state = existingState ?? state ?? createRenderState(config)
    rebuildLines()
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
    rebuildLines()
  }

  function rerollLines (): void {
    state.steps = fillArray(config.steps, getRandomFloat)
  }

  function rerollColors (): void {
    state.colors = fillArray(config.colors, getRandomColor)
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
    rerollColors,
    rebuildLines,
    resizeCanvas,
  }
}