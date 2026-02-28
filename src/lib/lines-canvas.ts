import { ATTRIBUTE_TO_KEY, parseAllAttributes, parseSingleAttribute, } from './config-schema.ts'
import { useRenderer } from './renderer.ts'
import type { RawConfig } from './config.ts'

export interface LinesCanvasAttributes extends RawConfig {
  autoplay?: 'true' | 'false' | 'loop'
}

export class LinesCanvas extends HTMLElement {
  static observedAttributes = [...ATTRIBUTE_TO_KEY.keys()]

  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  renderer: ReturnType<typeof useRenderer>
  isMounted: boolean = false

  constructor () {
    super()
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!
    this.renderer = useRenderer(this.canvas, this.ctx)

    Object.assign(this.canvas.style, {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    })

    this.insertAdjacentElement('afterbegin', this.canvas)
  }

  connectedCallback () {
    this.renderer.configure(parseAllAttributes(this, {
      renderWidth: this.offsetWidth,
      renderHeight: this.offsetHeight,
      steps: 12,
      colors: 3,
      distance: 12,
      amplitude: 32,
      thickness: 2,
      lines: 12,
      paddingX: 20,
      paddingY: 20,
      background: 'transparent',
      perspective: -0.02,
      easing: 'Cubic.InOut',
      animationDuration: 0,
      animationEasing: 'Cubic.InOut',
    }))

    this.isMounted = true

    const autoplay: string | null = this.getAttribute('autoplay')
    if (!autoplay || autoplay == 'false') {
      return
    }

    if (autoplay === 'loop') {
      this.renderer.animateLoop()
      return
    }

    this.renderer.animateIn().then(() => {
      this.dispatchEvent(new CustomEvent('animated-in'))
    })
  }

  attributeChangedCallback (name: string, _oldValue: unknown, _newValue: unknown) {
    if (!this.isMounted) {
      // Not mounted yet, skip
      return
    }

    const update = parseSingleAttribute(this, name)
    if (!update) {
      // Unknown attribute
      return
    }

    this.renderer.updateConfig(update)
    this.renderer.animateLoop()
  }
}