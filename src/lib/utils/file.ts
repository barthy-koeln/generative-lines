import type { Config } from '../config.ts'

export function download(config: Config, canvas: HTMLCanvasElement) {
  const link = document.createElement("a");

  const valueString = Object.entries(config).map(([name, value]) => `${value}_${name}`).join('-')

  link.download = `generative_lines-${valueString}.png`;
  link.href = canvas.toDataURL();
  link.click();
}