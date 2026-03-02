import { createAnimationController } from './renderer/animation.ts'
import { createDrawingController } from './renderer/drawing.ts'
import { createStateController } from './renderer/state.ts'

export function useRenderer (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
  const {
    initialize,
    getConfig,
    mergeConfig,
    getState,
    mergeState,
    rerollLines
  } = createStateController({
    canvas,
    context,
  })

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

  function capture () {
    const config = getConfig()
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

  return {
    get config () {
      return getConfig()
    },
    set config (newConfig) {
      mergeConfig(newConfig)
    },
    get state () {
      return getState()
    },
    set state (newState) {
      mergeState(newState)
    },
    configure: initialize,
    ...animator,
    updateConfig: mergeConfig,
    updateState: mergeState,
    reroll: rerollLines,
    capture,
    redraw: redrawFull,
    clear: clearCanvas,
  }
}

export type Renderer = ReturnType<typeof useRenderer>