import type { Config, RenderState } from './config.ts'
import type { EasingFunction, Line } from './types'

/**
 * Transform generated points into renderable points by applying easing function to the y-axis.
 * @param points - The points to transform, where each point is a tuple of [x, y] coordinates.
 * @param easingFunction - The easing function to apply to the y-axis config
 */
function getEasedCurvePoints (points: Line, easingFunction: EasingFunction): Line {
  const renderPoints: Line = []

  for (let index = 0; index < points.length - 1; index++) {
    const start = points[index]
    const target = points[index + 1]
    const distance = target[1] - start[1]
    const pixels = target[0] - start[0]

    for (let pixel = 0; pixel < pixels; pixel++) {
      const linearFactor = pixel / pixels
      const easedFactor = easingFunction(linearFactor)
      const x = start[0] + linearFactor * pixels
      const y = start[1] + easedFactor * distance

      renderPoints.push([x, y])
    }
  }

  return renderPoints
}

function clamp (x: number, y: number, z: number) {
  return Math.max(x, Math.min(y, z))
}

function getScale (perspective: number, lineIndex: number, lineCount: number): number {
  const min = 1 / lineCount
  if (perspective == 0) {
    return 1
  }

  if (perspective > 0) {
    return clamp(min, 1.0, 1 - lineIndex * perspective)
  }

  return clamp(min, 1.0, 1 - (lineCount - lineIndex) * perspective * -1)
}

/**
 * Generate lines based on the provided configuration and render state.
 * First generates base points for each line, then applies perspective scaling and easing to create the final renderable lines.
 *
 * The output is an array of lines, where each line is an array of points, and each point is a tuple of [x, y] coordinates.
 * Each line has exactly as many points as pixels it renders horizontally, ensuring smooth rendering when animating.
 *
 * @param config
 * @param state
 */
export function createLines (
  config: Config,
  state: Omit<RenderState, 'lines'>
) {
  const innerWidth = state.size.x - 2 * config.paddingX
  const innerHeight = state.size.y - 2 * config.paddingY
  const pixelsPerStep = Math.floor(innerWidth / (state.steps.length - 1))

  const totalHeight = config.distance * (config.lines - 1) + config.amplitude
  const centerOffset = (innerHeight - totalHeight) / 2

  /**
   * Distribute generated points along the x-axis, and apply amplitude to the y-axis.
   * These points will be used as the base for each line before applying transforms and easing.
   */
  const baseLine: Line = state.steps.map((amplitudeFactor, index) => {
    const pointX = index * pixelsPerStep
    const pointY = Math.floor(amplitudeFactor * config.amplitude)

    return [pointX, pointY]
  })

  /**
   * Actual lines to be rendered
   */
  const lines: Line[] = []

  for (let lineIndex = 0; lineIndex < config.lines; lineIndex++) {
    const scale = getScale(config.perspective, lineIndex, config.lines)
    const scaledPixelsPerStep = scale * pixelsPerStep

    /**
     * Offset the line to center it horizontally.
     * We center this within the original innerWidth.
     */
    const offsetX = config.paddingX + (innerWidth - scaledPixelsPerStep * (state.steps.length - 1)) / 2
    const offsetY = centerOffset + config.paddingY + lineIndex * config.distance

    const offsetPoints: Line = baseLine.map(([x, y]) => [
      offsetX + scale * x,
      offsetY + y,
    ])

    lines.push(
      getEasedCurvePoints(
        offsetPoints,
        config.easing,
      ),
    )
  }

  return lines
}
