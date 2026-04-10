import { createAnimationController } from './renderer/animation.ts'
import { createDrawingController } from './renderer/drawing.ts'
import { createStateController } from './renderer/state.ts'
import type { RenderState } from './config.ts'

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
    resizeCanvas,
    addConfigChangeListener,
    removeConfigChangeListener
  } = createStateController({
    canvas
  })

  const {
    clearCanvas,
    drawSegment,
    applyDrawingStyle,
    drawFull,
    captureImage,
    getCurrentSegment
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
    animateLoop,
    replaceTweens,
    updateAnimation,
  } = createAnimationController({
    getConfig,
    clearCanvas,
    drawSegment
  })

  addConfigChangeListener((update) => {
    let needsRebuild = false
    let needsRestyle = false
    let needsResize = false
    let needsAnimationUpdate = false
    for (const [key, value] of Object.entries(update)) {
      if (value === undefined) {
        continue
      }

      if (key == 'colors') {
        needsRestyle = true
        rerollColors()
        continue
      }

      if (key == 'steps') {
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

      if (['background', 'thickness', 'lineCap', 'lineJoin'].includes(key)) {
        needsRestyle = true
      }

      if (['animationDuration', 'animationEasing'].includes(key)) {
        // No need to trigger a full redraw for animation config changes
        needsAnimationUpdate = true
      }
    }

    if (needsResize) {
      resizeCanvas()
      // resize resets context
      needsRestyle = true
    }

    if (needsRestyle) {
      applyDrawingStyle()
    }

    if (needsRebuild) {
      rebuildLines()
    }

    if (needsAnimationUpdate) {
      updateAnimation()
    }

    clearCanvas()
    drawSegment(...getCurrentSegment())
  })

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
    set state (newState: Partial<RenderState>) {
      mergeState(newState)
    },
    initialize,
    mergeConfig,
    mergeState,
    rerollLines,
    rerollColors,
    drawFull,
    clearCanvas,
    captureImage,
    drawSegment,
    getCurrentSegment,
    animate,
    animateIn,
    animateBackOut,
    animateWipeOut,
    animateLoop,
    replaceTweens,
    addConfigChangeListener,
    removeConfigChangeListener
  }
}

export type Renderer = ReturnType<typeof useRenderer>