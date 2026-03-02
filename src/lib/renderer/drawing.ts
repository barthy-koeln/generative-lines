import type { Config } from '../config.ts'
import type { RenderState } from '../config.ts'
import { createGradient } from '../utils/colors.ts'

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
  function applyDrawingStyle (): void {
    const config = getConfig()
    const state = getState()

    clearCanvas()

    context.fillStyle = 'transparent'
    context.strokeStyle = state.colors.length > 1
      ? createGradient(context, config.paddingX, config.renderWidth - (2 * config.paddingX), state.colors)
      : state.colors[0].hex()
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
  }

  function clearCanvas (): void {
    const config = getConfig()
    context.clearRect(0, 0, config.renderWidth, config.renderHeight)
  }

  function redrawFull (): void {
    clearCanvas()
    applyDrawingStyle()
    drawSegment(0, 1)
  }

  return {
    applyDrawingStyle,
    drawSegment,
    clearCanvas,
    redrawFull,
  }
}