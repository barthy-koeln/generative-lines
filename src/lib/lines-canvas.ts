import { ATTRIBUTE_TO_KEY, parseAllAttributes, parseSingleAttribute, } from './config-schema.ts'
import { useRenderer } from './renderer.ts'
import { DEFAULT_RAW_CONFIG, type RawConfig } from './config.ts'

export interface LinesCanvasAttributes extends RawConfig {
  autoplay?: 'true' | 'false' | 'loop'
}

export class LinesCanvas extends HTMLElement {
  public static observedAttributes = [...ATTRIBUTE_TO_KEY.keys()]

  private isBatchUpdating: boolean = false

  public canvas: HTMLCanvasElement
  public ctx: CanvasRenderingContext2D
  public renderer: ReturnType<typeof useRenderer>
  public isMounted: boolean = false

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
      ...DEFAULT_RAW_CONFIG,
      renderWidth: this.offsetWidth,
      renderHeight: this.offsetHeight
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
      console.info(`Unknown attribute "${name}" changed, skipping update.`)
      return
    }

    this.renderer.updateConfig(update)
  }

  public startBatchUpdate() {
    this.isBatchUpdating = true
  }

  public endBatchUpdate() {
    this.isBatchUpdating = false
    this.renderer.configure(parseAllAttributes(this, {
      ...DEFAULT_RAW_CONFIG,
      renderWidth: this.offsetWidth,
      renderHeight: this.offsetHeight
    }))
  }
}