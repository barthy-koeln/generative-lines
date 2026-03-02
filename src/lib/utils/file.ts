import type { LinesCanvas } from '../lines-canvas.ts'

export function download (linesCanvas: LinesCanvas) {
  const link = document.createElement('a')

  const valueString = Object
    .entries(linesCanvas.renderer.config)
    .map(([name, value]) => `${value}_${name}`)
    .join('-')

  link.href = linesCanvas.renderer.capture()
  link.download = `generative_lines-${valueString}.png`
  link.click()
}