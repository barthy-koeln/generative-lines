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

    context.fillStyle = 'transparent'
    context.strokeStyle = state.colors.length > 1
      ? createGradient(context, config.paddingX, config.renderWidth - (2 * config.paddingX), state.colors)
      : state.colors[0].hex()
    context.lineWidth = config.thickness
    context.lineCap = config.lineCap
    context.lineJoin = config.lineJoin
  }

  function _createTween (from: number , to: number): Tween {
    const tween: Tween = new Tween({ factor: from })
      .to({ factor: to })
      .duration(config.animationDuration)
      .easing(config.animationEasing)

    tween
      .onUpdate(({ factor }: { factor: number }) => {
        clear()
        _draw(0, factor)
      })

    return tween
  }

  function _draw (from: number, to: number) {
    for (const points of lines) {
      const pixels: number = points.length - 1
      const fromPixel = Math.floor(from * pixels)
      const toPixel = Math.floor(to * pixels)

      context.beginPath()
      context.moveTo(points[fromPixel][0], points[fromPixel][1])

      for (let pixel = fromPixel; pixel < toPixel; pixel++) {
        const targetPoint = points[pixel + 1]
        context.lineTo(targetPoint[0], targetPoint[1])
      }

      context.stroke()
    }
  }

  function _animate(from: number, to: number): Promise<void> {
    _setDrawingStyle()

    return new Promise((resolve) => {
      const tween = _createTween(from, to)
      tweenGroup.removeAll()
      tweenGroup.add(tween)

      tween
        .onComplete(() => resolve())
        .start()
    })
  }

  function animateIn (): Promise<void> {
    return _animate(0, 1)
  }

  function animateBackOut (): Promise<void> {
    return _animate(1, 0)
  }

  function animateWipeOut (): Promise<void> {
    return _animate(0, 2)
  }

  function animateLoop (holdAfterIn: Milliseconds = 1000, holdAfterOut: Milliseconds = 300) {
    _setDrawingStyle()

    const animateIn = _createTween(0, 1)
    const animateOut = _createTween(1, 0)
    const animateInFollow = _createTween(0, 1)

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
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  function redraw () {
    clear()
    _setDrawingStyle()
    _draw(0, 1)
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