import type { Config, RenderState } from './config.ts'
import type { EasingFunction, Line } from './types'

/**
 * Transform generated points into renderable points by applying easing function to the y-axis.
 * @param points - The points to transform, where each point is a tuple of [x, y] coordinates.
 * @param pixelsPerStep - The distance in pixels between each step on the x-axis.
 * @param steps - The total number of steps to generate between each pair of points.
 * @param easingFunction - The easing function to apply to the y-axis config
 */
function getEasedCurvePoints (points: Line, pixelsPerStep: number, steps: number, easingFunction: EasingFunction): Line {
  const renderPoints: Line = []

  for (let index = 0; index < points.length - 1; index++) {
    const start = points[index]
    const target = points[index + 1]
    const distance = target[1] - start[1]

    for (let step = 0; step < steps; step++) {
      const linearFactor = step / steps
      const easedFactor = easingFunction(linearFactor)
      const x = start[0] + linearFactor * pixelsPerStep
      const y = start[1] + easedFactor * distance

      renderPoints.push([x, y])
    }
  }

  return renderPoints
}

export function createLines (
  config: Config,
  state: RenderState,
  width: number,
  height: number,
) {
  const innerWidth = width - 2 * config.paddingX
  const innerHeight = height - 2 * config.paddingY
  const pixelsPerStep = innerWidth / (state.steps.length - 1)

  const totalHeight = config.distance * (config.lines - 1) + config.amplitude
  const centerOffset = (innerHeight - totalHeight) / 2

  /**
   * Distribute generated points along the x-axis, and apply amplitude to the y-axis.
   * These points will be used as the base for each line before applying transforms and easing.
   */
  const baseLine: Line = state.steps.map((amplitudeFactor, index) => {
    const pointX = index * pixelsPerStep
    const pointY = amplitudeFactor * config.amplitude

    return [pointX, pointY]
  })

  /**
   * Actual lines to be rendered
   */
  const lines: Line[] = []

  for (let lineIndex = 0; lineIndex < config.lines; lineIndex++) {
    const scale = 1 - lineIndex * config.perspective
    const scaledPixelsPerStep = scale * pixelsPerStep
    const offsetX = config.paddingX + (innerWidth - scale * innerWidth) / 2
    const offsetY = centerOffset + config.paddingY + lineIndex * config.distance

    const offsetPoints: Line = baseLine.map(([x, y]) => [
      offsetX + scale * x,
      offsetY + y,
    ])

    lines.push(
      getEasedCurvePoints(
        offsetPoints,
        scaledPixelsPerStep,
        pixelsPerStep,
        config.easing,
      ),
    )
  }

  return lines
}
