import { type Config, createRenderState, type RawConfig, type RenderState, resolveConfig } from './config.ts'
import { createLines } from './generator.ts'
import type { Line, Milliseconds, Pixels } from './types'
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
    context.fillStyle = config.background.hex()
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.strokeStyle = createGradient(context, canvas.offsetWidth - (2 * config.paddingX), state.colors)
    context.lineWidth = config.thickness
    context.lineCap = 'square'
  }

  function _setClearingStyle () {
    context.fillStyle = config.background.hex()
  }

  function _createAnimateInTween(): Tween {
    let previousStep: number = 0

    const tween: Tween = new Tween({ step: 0 })
      .to({ step: lines[0].length })
      .duration(config.animationDuration)
      .easing(config.animationEasing)

    tween
      .onEveryStart(_setDrawingStyle)
      .onComplete(() => {
        previousStep = 0
      })
      .onUpdate(({ step }: { step: number }) => {
        const quantizedStep = Math.floor(step)
        const stepsToRender = quantizedStep - previousStep
        if (stepsToRender <= 0){
          return
        }

        _draw(previousStep, stepsToRender)
        previousStep = quantizedStep
      })

    return tween
  }

  function _createAnimateOutTween(){
    const tween = new Tween({ pixel: 0 })
      .to({ pixel: config.renderWidth })
      .duration(config.animationDuration)
      .easing(config.animationEasing)

    tween
      .onEveryStart(_setClearingStyle)
      .onUpdate(({ pixel }: { pixel: number }) => {
        context.clearRect(0, 0, pixel, canvas.height)
        context.fillRect(0, 0, pixel, canvas.height)
      })

    return tween
  }


  function _draw(from: number, steps: number) {
    for (const points of lines) {
      context.beginPath()
      context.moveTo(points[from][0], points[from][1])

      const loopStart = from + 1
      const loopEnd = Math.min(loopStart + steps - 1, points.length - 1)
      for (let index = loopStart; index < loopEnd; index++) {
        const startPoint = points[index]
        const targetPoint = points[index + 1]
        context.quadraticCurveTo(startPoint[0], startPoint[1], targetPoint[0], targetPoint[1])
      }

      context.stroke()
    }
  }

  function animateIn (): Promise<void> {
    return new Promise((resolve) => {
      const tween = _createAnimateInTween()
      tweenGroup.removeAll()
      tweenGroup.add(tween)

      tween
        .onComplete(() => resolve())
        .start()
    })
  }

  function animateOut (): Promise<void> {
    return new Promise((resolve) => {
      const tween= _createAnimateOutTween()
      tweenGroup.removeAll()
      tweenGroup.add(tween)

      tween
        .onComplete(() => resolve())
        .start()
    })
  }

  function animateLoop (holdAfterIn: Milliseconds = 1000, holdAfterOut: Milliseconds = 300) {
    const animateIn = _createAnimateInTween()
    const animateOut = _createAnimateOutTween()
    const animateInFollow = _createAnimateInTween()

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

  function clear() {
    context.clearRect(0, 0, config.renderWidth, config.renderHeight)
  }

  function redraw() {
    _draw(0, lines[0].length)
  }

  function configure (raw: RawConfig, existingState?: RenderState) {
    config = resolveConfig(raw)

    canvas.width = config.renderWidth
    canvas.height = config.renderHeight

    // Precedence: Incoming one, existing one, or new random one if not provided
    state = existingState ?? state ?? createRenderState(config)
    rebuildLines()
  }

  function updateConfig (newConfig: Partial<Config>) {
    config = {
      ...config,
      ...newConfig,
    }
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