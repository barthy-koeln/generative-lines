import type { Color } from 'chroma-js'
import { type Config, createRenderState, type RawConfig, type RenderState, resolveConfig } from './config.ts'
import { createLines } from './generator.ts'
import type { Line, Milliseconds, Pixels } from './types'

export function useRenderer(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
  let animation: ReturnType<typeof requestAnimationFrame>
  let lines: Line[]
  let config: Config
  let state: RenderState

  function createGradient(width: Pixels, colors: Color[]) {
    const colorDistance = 1 / (colors.length - 1)
    const gradient = context.createLinearGradient(0, 0, width, 0)

    for (let i = 0; i < colors.length; i++) {
      const color = colors[i]
      const index = colors.indexOf(color)
      gradient.addColorStop(index * colorDistance, color.hex())
    }

    return gradient
  }

  function rebuildLines() {
    lines = createLines(config, state, canvas.width, canvas.height)
  }

  function animateIn(): Promise<void> {
    cancelAnimationFrame(animation)
    context.fillStyle = config.background.hex()
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.strokeStyle = createGradient(canvas.offsetWidth - (2 * config.paddingX), state.colors)
    context.lineWidth = config.thickness
    context.lineCap = 'square'

    return new Promise((resolve) => {
      const startTime = performance.now()
      let currentStep = 0
      const pointsPerLine = lines[0].length

      function frame(timestamp: number) {
        const elapsed = timestamp - startTime
        const timeFactor = config.animationDuration === 0 ? 1 : config.animationEasing(elapsed / config.animationDuration)

        const stepsToRender =
          config.animationDuration === 0
            ? pointsPerLine - 1
            : Math.max(0, Math.min(
              Math.floor(timeFactor * pointsPerLine) - currentStep,
              pointsPerLine - currentStep - 2,
            ))

        if (stepsToRender > 0) {
          for (const points of lines) {
            context.beginPath()
            context.moveTo(points[currentStep][0], points[currentStep][1])

            const loopStart = currentStep + 1

            for (let index = loopStart; index < loopStart + stepsToRender - 1; index++) {
              const startPoint = points[index]
              const targetPoint = points[index + 1]
              context.quadraticCurveTo(startPoint[0], startPoint[1], targetPoint[0], targetPoint[1])
            }

            context.stroke()
          }
        }

        currentStep += stepsToRender

        if (currentStep >= pointsPerLine - 2) {
          // All steps rendered
          resolve()

          return
        }

        animation = requestAnimationFrame(frame)
      }

      animation = requestAnimationFrame(frame)
    })
  }

  function animateOut(): Promise<void> {
    cancelAnimationFrame(animation)
    context.fillStyle = config.background.hex()

    return new Promise((resolve) => {
      const startTime = performance.now()

      function frame(timestamp: number) {
        const elapsed = Math.max(0.0, timestamp - startTime)
        const timeFactor = config.animationDuration === 0 ? 1 : config.animationEasing(elapsed / config.animationDuration)
        const wipeWidth = timeFactor * canvas.width

        context.clearRect(0, 0, wipeWidth, canvas.height)
        context.fillRect(0, 0, wipeWidth, canvas.height)

        if (elapsed >= config.animationDuration) {
          // Wipe complete
          resolve()

          return
        }

        animation = requestAnimationFrame(frame)
      }

      animation = requestAnimationFrame(frame)
    })
  }

  async function animateLoop(holdAfterIn: Milliseconds = 1000, holdAfterOut: Milliseconds = 300) {
    await animateIn()
    await new Promise(resolve => setTimeout(resolve, holdAfterIn))
    await animateOut()
    await new Promise(resolve => setTimeout(resolve, holdAfterOut))
    reroll()
    return animateLoop(holdAfterIn, holdAfterOut)
  }

  function configure(raw: RawConfig, existingState?: RenderState) {
    config = resolveConfig(raw)

    canvas.width = config.renderWidth
    canvas.height = config.renderHeight

    // Precedence: Incoming one, existing one, or new random one if not provided
    state = existingState ?? state ?? createRenderState(config)
    rebuildLines()
  }

  function updateConfig(newConfig: Partial<Config>) {
    config = {
      ...config,
      ...newConfig,
    }
  }

  function updateState(newState: Partial<RenderState>) {
    state = {
      ...state,
      ...newState,
    }
    rebuildLines()
  }

  function reroll() {
    state = createRenderState(config)
    rebuildLines()
  }

  return {
    get config() {
      return config
    },
    set config(newConfig) {
      updateConfig(newConfig)
    },
    get state() {
      return state
    },
    set state(newState) {
      updateState(newState)
    },
    configure,
    updateConfig,
    updateState,
    reroll,
    animateIn,
    animateOut,
    animateLoop
  }
}