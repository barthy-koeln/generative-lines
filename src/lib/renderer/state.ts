import { type Config, DEFAULT_CONFIG, type RenderState } from '../config.ts'
import { createLines } from '../generator.ts'
import { fillArray } from '../utils/array.ts'
import { getRandomColor, getRandomFloat } from '../utils/randomness.ts'

export interface StateControllerParams {
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D
}

/**
 * State controller for configuration and state lifecycle management.
 * Handles initialization, updates, and line regeneration.
 */
export function createStateController ({
  canvas,
  context
}: StateControllerParams) {
  let config: Config
  let state: RenderState
  const resizeObserver: ResizeObserver = new ResizeObserver(onResize)

  function onResize (entries: ResizeObserverEntry[]) {
    for (const { target } of entries) {
      if (target !== canvas) {
        continue
      }

      resizeCanvas()
      return
    }
  }

  function resizeCanvas (): void {
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(canvas.offsetWidth * dpr)
    canvas.height = Math.floor(canvas.offsetHeight * dpr)
    context.scale(window.devicePixelRatio, window.devicePixelRatio)
    mergeState({
      size: {
        x: canvas.offsetWidth,
        y: canvas.offsetHeight
      },
    })
  }

  function notifyConfigChange (update: Partial<Config>): void {
    if (!state.isInitialized) {
      return
    }

    canvas.dispatchEvent(new CustomEvent('lines-canvas:config-changed', { detail: { update, config } }))
  }

  function notifyStateChange (update: Partial<RenderState>): void {
    if (!state.isInitialized) {
      return
    }

    canvas.dispatchEvent(new CustomEvent('lines-canvas:state-changed', { detail: { update, state } }))
  }

  function initialize (partialConfig: Partial<Config>, incomingState?: Partial<RenderState>): void {
    if (state?.isInitialized) {
      return
    }

    config = { ...DEFAULT_CONFIG, ...partialConfig }
    state = { ...(state ?? {}), ...incomingState }

    resizeCanvas()
    resizeObserver.observe(canvas)

    if (!state.steps) {
      state.steps = fillArray(config.steps, getRandomFloat)
    }

    if (!state.colors) {
      state.colors = fillArray(config.colors, getRandomColor)
    }

    state.lines = createLines(config, state)
    state.isInitialized = true

    notifyConfigChange(config)
    notifyStateChange(state)
  }

  function mergeConfig (update: Partial<Config>): void {
    config = {
      ...config,
      ...update,
    }

    notifyConfigChange(update)
  }

  function mergeState (newState: Partial<RenderState>): void {
    state = {
      ...state,
      ...newState,
    }

    const newColorCount = newState.colors?.length ?? 0
    const newStepsCount = newState.steps?.length ?? 0
    const update: Partial<Config> = {}
    if (newColorCount && config.colors !== newColorCount) {
      update.colors = newColorCount
    }
    if (newStepsCount && config.steps !== newStepsCount) {
      update.steps = newStepsCount
    }

    if (Object.keys(update).length) {
      mergeConfig(update)
    }

    notifyStateChange(newState)
  }

  function rebuildLines (): void {
    mergeState({
      lines: createLines(config, state)
    })
  }

  function rerollLines (): void {
    mergeState({
      steps: fillArray(config.steps, getRandomFloat)
    })
  }

  function rerollColors (): void {
    mergeState({
      colors: fillArray(config.colors, getRandomColor)
    })
  }

  function getConfig (): Config {
    return config
  }

  function getState (): RenderState {
    return state
  }

  return {
    getConfig,
    getState,
    initialize,
    mergeConfig,
    mergeState,
    rerollLines,
    rerollColors,
    rebuildLines,
  }
}
