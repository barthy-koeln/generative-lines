import { type Config, createRenderState, type RawConfig, type RenderState, resolveConfig } from './config.ts'
import { createLines } from './generator.ts'
import { createAnimationController } from './renderer/animation.ts'
import { createDrawingController } from './renderer/drawing.ts'

export function useRenderer (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
  let config: Config
  let state: RenderState

  function getConfig () {
    return config
  }
  function getState () {
    return state
  }

  const {
    clearCanvas,
    drawSegment,
    applyDrawingStyle,
    redrawFull,
  } = createDrawingController({
    getConfig,
    getState,
    context,
  })

  const animator = createAnimationController({
    getConfig,
    applyDrawingStyle,
    clearCanvas,
    drawSegment,
  })

  function rebuildLines () {
    state.lines = createLines(config, state)
  }

  function capture () {
    const currentState = context.getImageData(0, 0, config.renderWidth, config.renderHeight)
    clearCanvas()

    context.fillStyle = config.background.hex()
    context.fillRect(0, 0, config.renderWidth, config.renderHeight)
    applyDrawingStyle()
    drawSegment(0, 1)

    const imageData = canvas.toDataURL('image/png')
    context.putImageData(currentState, 0, 0)

    return imageData
  }

  function configure (raw: RawConfig, existingState?: RenderState) {
    config = resolveConfig(raw)

    canvas.width = config.renderWidth
    canvas.height = config.renderHeight
    context.imageSmoothingEnabled = false
    canvas.style.background = config.background.hex()
    // Precedence: Incoming one, existing one, or new random one if not provided
    state = existingState ?? state ?? createRenderState(config)
    rebuildLines()
  }

  function updateConfig (newConfig: Partial<Config>) {
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

    redrawFull()
  }

  function updateState (newState: Partial<RenderState>) {
    state = {
      ...state,
      ...newState,
    }
    rebuildLines()
  }

  function reroll () {
    state = createRenderState(config)
    rebuildLines()
  }

  return {
    get config () {
      return config
    },
    set config (newConfig) {
      updateConfig(newConfig)
    },
    get state () {
      return state
    },
    set state (newState) {
      updateState(newState)
    },
    configure,
    ...animator,
    updateConfig,
    updateState,
    reroll,
    capture,
    redraw: redrawFull,
    clear: clearCanvas,
  }
}

export type Renderer = ReturnType<typeof useRenderer>