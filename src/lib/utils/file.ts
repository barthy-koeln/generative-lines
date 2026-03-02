import type { LinesCanvas } from '../lines-canvas.ts'

export function download (linesCanvas: LinesCanvas) {
  const link = document.createElement('a')

  const valueString = btoa(JSON.stringify(linesCanvas.renderer.config))

  link.href = linesCanvas.renderer.captureImage()
  link.download = `generative_lines-${valueString}.png`
  link.click()
}