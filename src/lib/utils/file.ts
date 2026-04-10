import type { LinesCanvas } from '../lines-canvas.ts'

export function download (linesCanvas: LinesCanvas) {
  const link = document.createElement('a')
  const uuid = (new Crypto()).randomUUID()

  link.href = linesCanvas.renderer.captureImage()
  link.download = `generative_lines-${uuid}.png`
  link.click()
}