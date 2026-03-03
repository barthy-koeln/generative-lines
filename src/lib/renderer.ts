import { createAnimationController } from './renderer/animation.ts'
import { createDrawingController } from './renderer/drawing.ts'
import { createStateController } from './renderer/state.ts'
import type { Config } from './config.ts'

export function useRenderer (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
  const {
    initialize,
    getConfig,
    mergeConfig,
    getState,
    mergeState,
    rerollLines,
    rerollColors,
    rebuildLines,
    resizeCanvas
  } = createStateController({
    canvas,
    context,
    onConfigChange
  })

  const {
    clearCanvas,
    drawSegment,
    applyDrawingStyle,
    drawFull,
    captureImage
  } = createDrawingController({
    getConfig,
    getState,
    context,
  })

  const {
    animate,
    animateIn,
    animateBackOut,
    animateWipeOut,
    animateLoop
  } = createAnimationController({
    getConfig,
    applyDrawingStyle,
    clearCanvas,
    drawSegment,
  })

  function onConfigChange (newConfig: Partial<Config>, config: Config): void {
    let needsRebuild = false
    let needsRestyle = false
    let needsResize = false

    for (const [key, value] of Object.entries(newConfig)) {
      if (value === undefined) {
        continue
      }

      if (key == 'colors') {
        needsRestyle = true
        rerollColors()
        continue
      }

      if(key == 'steps') {
        needsRebuild = true
        rerollLines()
        continue
      }

      if (['renderWidth', 'renderHeight'].includes(key)) {
        needsResize = true
      }

      if (['distance', 'amplitude', 'thickness', 'lines', 'paddingX', 'paddingY', 'perspective', 'easing'].includes(key)) {
        needsRebuild = true
      }

      if (['background', 'thickness', 'line-cap', 'line-join'].includes(key)) {
        needsRestyle = true
      }
    }

    if (needsRestyle) {
      applyDrawingStyle()
    }

    if (needsRebuild) {
      rebuildLines()
    }

    if (needsResize) {
      resizeCanvas()
    }

    drawFull()
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
    initialize,
    mergeConfig,
    mergeState,
    rerollLines,
    rerollColors,
    captureImage,
    drawFull,
    clearCanvas,
    animate,
    animateIn,
    animateBackOut,
    animateWipeOut,
    animateLoop,
  }
}

export type Renderer = ReturnType<typeof useRenderer>