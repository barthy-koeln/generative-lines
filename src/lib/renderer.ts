import { createAnimationController } from './renderer/animation.ts'
import { createDrawingController } from './renderer/drawing.ts'
import { createStateController } from './renderer/state.ts'
import type { RenderState } from './config.ts'

const REBUILD_PROPERTIES = ['distance', 'amplitude', 'thickness', 'lines', 'paddingX', 'paddingY', 'perspective', 'easing']
const RESTYLE_PROPERTIES = ['background', 'thickness', 'lineCap', 'lineJoin']
const ANIMATION_PROPERTIES = ['animationDuration', 'animationEasing']

export function useRenderer (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
  const {
    initialize,
    getConfig,
    mergeConfig,
    getState,
    mergeState,
    rerollLines,
    rerollColors,
    rebuildLines
  } = createStateController({
    canvas,
    context
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
    createTween,
    replaceTweens,
    updateAnimation,
  } = createAnimationController({
    getConfig,
    clearCanvas,
    drawSegment
  })

  canvas.addEventListener('lines-canvas:config-changed', event => {
    const { update } = event.detail

    let needsRebuild = false
    let needsRestyle = false
    let needsAnimationUpdate = false
    for (const [key, value] of Object.entries(update)) {
      if (value === undefined) {
        continue
      }

      if (key == 'colors') {
        rerollColors()
        continue
      }

      if (key == 'steps') {
        rerollLines()
        continue
      }

      if (REBUILD_PROPERTIES.includes(key)) {
        needsRebuild = true
      }

      if (RESTYLE_PROPERTIES.includes(key)) {
        needsRestyle = true
      }

      if (ANIMATION_PROPERTIES.includes(key)) {
        // No need to trigger a full redraw for animation config changes
        needsAnimationUpdate = true
      }
    }

    applyUpdate(needsRestyle, needsRebuild, needsAnimationUpdate)
  })

  canvas.addEventListener('lines-canvas:state-changed', event => {
    const { update } = event.detail

    let needsRebuild = false
    let needsRestyle = false
    let needsAnimationUpdate = false
    for (const [key, value] of Object.entries(update)) {
      if (value === undefined) {
        continue
      }

      if (key == 'size') {
        needsRebuild = true
        needsRestyle = true
        needsAnimationUpdate = true
      }

      if (key == 'colors') {
        needsRestyle = true
      }

      if (key == 'steps') {
        needsRebuild = true
      }
    }

    applyUpdate(needsRestyle, needsRebuild, needsAnimationUpdate)
  })

  function applyUpdate (needsRestyle: boolean, needsRebuild: boolean, needsAnimationUpdate: boolean) {
    if (!needsRestyle && !needsRebuild && !needsAnimationUpdate) {
      return
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
    createTween,
    replaceTweens,
  }
}

export type Renderer = ReturnType<typeof useRenderer>