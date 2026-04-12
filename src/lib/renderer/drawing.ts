import type { Config, RenderState } from '../config.ts'
import { useCachedGradient } from '../utils/colors.ts'

export interface DrawingControllerParams {
  getConfig: () => Config
  getState: () => RenderState
  context: CanvasRenderingContext2D
}

/**
 * Drawing controller for canvas rendering operations.
 * Handles style application, line drawing, and canvas clearing.
 */
export function createDrawingController ({
  getConfig,
  getState,
  context,
}: DrawingControllerParams) {
  let currentSegment: [from: number, to: number] = [0, 0]

  const { createGradient } = useCachedGradient()

  function applyDrawingStyle (): void {
    const config = getConfig()
    const state = getState()
    context.fillStyle = config.background
    context.strokeStyle = state.colors.length > 1
      ? createGradient(context, config.paddingX, state.size.x - (2 * config.paddingX), state.colors)
      : state.colors[0]
    context.lineWidth = config.thickness
    context.lineCap = config.lineCap
    context.lineJoin = config.lineJoin
  }

  function drawSegment (from: number, to: number): void {
    const state = getState()

    for (const points of state.lines) {
      const pixels = points.length - 1
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

    currentSegment = [from, to]
  }

  function getCurrentSegment (): [number, number] {
    return currentSegment
  }

  function clearCanvas (): void {
    const state = getState()
    context.clearRect(0, 0, state.size.x, state.size.y)
    context.fillRect(0, 0, state.size.x, state.size.y)
  }

  function drawFull (): void {
    clearCanvas()
    drawSegment(0, 1)
  }

  function captureImage (): string {
    const state = getState()
    const currentState = context.getImageData(0, 0, state.size.x, state.size.y)

    clearCanvas()
    drawSegment(0, 1)

    const imageData = context.canvas.toDataURL('image/png')
    context.putImageData(currentState, 0, 0)

    return imageData
  }

  return {
    applyDrawingStyle,
    drawSegment,
    clearCanvas,
    drawFull,
    captureImage,
    getCurrentSegment
  }
}