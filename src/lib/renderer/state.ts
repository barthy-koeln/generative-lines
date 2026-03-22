import { type Config, DEFAULT_CONFIG, type RenderState } from '../config.ts'
import { createLines } from '../generator.ts'
import { fillArray } from '../utils/array.ts'
import { getRandomColor, getRandomFloat } from '../utils/randomness.ts'

export type ConfigChangeCallback = (update: Partial<Config>, config: Config) => void

export interface StateControllerParams {
  canvas: HTMLCanvasElement
}

/**
 * State controller for configuration and state lifecycle management.
 * Handles initialization, updates, and line regeneration.
 */
export function createStateController ({
  canvas
}: StateControllerParams) {
  let config: Config
  let state: RenderState
  const configChangeListeners: Set<ConfigChangeCallback> = new Set()

  function resizeCanvas (): void {
    canvas.width = config.renderWidth
    canvas.height = config.renderHeight
  }

  function notifyConfigChange (update: Partial<Config>, config: Config): void {
    for (const listener of configChangeListeners) {
      listener(update, config)
    }
  }

  function initialize (partialConfig: Partial<Config>, incomingState?: Partial<RenderState>): void {
    config = { ...DEFAULT_CONFIG, ...partialConfig }
    resizeCanvas()

    const newState: RenderState = {
      ...(state ?? {}),
      ...incomingState
    }

    if (!newState.steps) {
      newState.steps = fillArray(config.steps, getRandomFloat)
    }

    if (!newState.colors) {
      newState.colors = fillArray(config.colors, getRandomColor)
    }

    newState.lines = createLines(config, newState)
    state = newState as RenderState

    notifyConfigChange({}, config)
  }

  function mergeConfig (update: Partial<Config>): void {
    config = {
      ...config,
      ...update,
    }

    notifyConfigChange(update, config)
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

  function addConfigChangeListener (callback: ConfigChangeCallback): () => void {
    configChangeListeners.add(callback)
    return () => configChangeListeners.delete(callback)
  }

  function removeConfigChangeListener (callback: ConfigChangeCallback): void {
    configChangeListeners.delete(callback)
  }

  function getConfig (): Config {
    return config
  }

  function getState (): RenderState {
    return state
  }

  return {
    addConfigChangeListener,
    removeConfigChangeListener,
    getConfig,
    getState,
    initialize,
    mergeConfig,
    mergeState,
    rerollLines,
    rerollColors,
    rebuildLines,
    resizeCanvas,
  }
}
