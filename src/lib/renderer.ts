import { type Config, createRenderState, type RawConfig, type RenderState, resolveConfig } from './config.ts'
import { createLines } from './generator.ts'
import type { Line, Milliseconds } from './types'
import { Tween } from '@tweenjs/tween.js'
import { createGradient } from './utils/colors.ts'
import { AutoplayTweenGroup } from './autoplay-tween-group.ts'

export function useRenderer (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
  const tweenGroup = new AutoplayTweenGroup()

  let lines: Line[]
  let config: Config
  let state: RenderState

  function rebuildLines () {
    lines = createLines(config, state, canvas.width, canvas.height)
  }

  function _setDrawingStyle () {
    clear()

    context.strokeStyle = state.colors.length > 1
      ? createGradient(context, config.paddingX, config.renderWidth - (2 * config.paddingX), state.colors)
      : state.colors[0].hex()
    context.lineWidth = config.thickness
    context.lineCap = config.lineCap
  }

  function _setClearingStyle () {
    context.fillStyle = config.background.hex()
    context.strokeStyle = config.background.hex()
    context.lineWidth = config.thickness + 2
    context.lineCap = config.lineCap
  }

  function _createTween (style: () => void): Tween {
    let previousFactor: number = 0

    const tween: Tween = new Tween({ factor: 0 })
      .to({ factor: 1 })
      .duration(config.animationDuration)
      .easing(config.animationEasing)

    tween
      .onEveryStart(style)
      .onComplete(() => {
        previousFactor = 0
      })
      .onUpdate(({ factor }: { factor: number }) => {
        _draw(previousFactor, factor)
        previousFactor = factor
      })

    return tween
  }

  function _draw (from: number, to: number) {
    for (const points of lines) {
      context.beginPath()

      const pixels: number = points.length - 1
      const fromPixel = Math.floor(from * pixels)
      const toPixel = Math.floor(to * pixels)

      for (let pixel = fromPixel; pixel < toPixel; pixel++) {
        const startPoint = points[pixel]
        const targetPoint = points[pixel + 1]
        context.moveTo(startPoint[0], startPoint[1])
        context.quadraticCurveTo(startPoint[0], startPoint[1], targetPoint[0], targetPoint[1])
      }

      context.stroke()
    }
  }

  function animateIn (): Promise<void> {
    return new Promise((resolve) => {
      const tween = _createTween(_setDrawingStyle)
      tweenGroup.removeAll()
      tweenGroup.add(tween)

      tween
        .onComplete(() => resolve())
        .start()
    })
  }

  function animateOut (): Promise<void> {
    return new Promise((resolve) => {
      const tween = _createTween(_setClearingStyle)
      tweenGroup.removeAll()
      tweenGroup.add(tween)

      tween
        .onComplete(() => resolve())
        .start()
    })
  }

  function animateLoop (holdAfterIn: Milliseconds = 1000, holdAfterOut: Milliseconds = 300) {
    const animateIn = _createTween(_setDrawingStyle)
    const animateOut = _createTween(_setClearingStyle)
    const animateInFollow = _createTween(_setDrawingStyle)

    animateIn
      .chain(animateOut)
    animateOut
      .delay(holdAfterIn)
      .chain(animateInFollow)
    animateInFollow
      .delay(holdAfterOut)
      .chain(animateOut)

    tweenGroup.removeAll()
    tweenGroup.add(animateIn, animateOut, animateInFollow)

    animateIn.start()
  }

  function clear () {
    context.fillStyle = 'transparent'
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  function redraw () {
    clear()
    _setDrawingStyle()
    _draw(0, lines[0].length)
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
      console.info('rebuilding lines due to config change', newConfig)
      rebuildLines()
    }

    redraw()
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
    animateIn,
    animateOut,
    animateLoop,
    updateConfig,
    updateState,
    reroll,
    redraw,
    clear,
  }
}