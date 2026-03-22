/// <reference lib="DOM" />

import {
  CONFIG_ATTRIBUTE_TO_KEY,
  CONFIG_SCHEMA,
  parseAllConfigAttributes,
  parseAllStateAttributes,
  parseSingleConfigAttribute,
  parseSingleStateAttribute,
  STATE_ATTRIBUTES,
} from './config-schema.ts'
import { type Renderer, useRenderer } from './renderer.ts'
import { DEFAULT_CONFIG } from './config.ts'

export class LinesCanvas extends HTMLElement {
  public static observedAttributes = [...CONFIG_ATTRIBUTE_TO_KEY.keys(), ...STATE_ATTRIBUTES]
  public canvas: HTMLCanvasElement
  public context: CanvasRenderingContext2D
  public renderer: Renderer
  public isMounted: boolean = false
  private isBatchUpdating: boolean = false
  private isSyncingAttributes: boolean = false

  constructor () {
    super()
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')!
    this.renderer = useRenderer(this.canvas, this.context)

    Object.assign(this.canvas.style, {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    })

    this.insertAdjacentElement('afterbegin', this.canvas)
  }

  connectedCallback () {
    this.renderer.initialize(
      parseAllConfigAttributes(this, {
        ...DEFAULT_CONFIG,
        renderWidth: this.offsetWidth,
        renderHeight: this.offsetHeight
      }),
      parseAllStateAttributes(this)
    )

    this.renderer.addConfigChangeListener((update) => {
      if (this.isSyncingAttributes) {
        return
      }

      this.isSyncingAttributes = true
      this.syncAttributesToConfig(update)
      this.isSyncingAttributes = false
    })

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
      return
    }

    if (CONFIG_ATTRIBUTE_TO_KEY.has(name)) {
      if (this.isBatchUpdating) {
        return
      }

      if (this.isSyncingAttributes) {
        return
      }

      const update = parseSingleConfigAttribute(this, name)
      if (!update) {
        return
      }

      this.renderer.mergeConfig(update)
      return
    }

    if (STATE_ATTRIBUTES.includes(name)) {
      this.renderer.mergeState(parseSingleStateAttribute(this, name))
    }
  }

  public startBatchUpdate () {
    this.isBatchUpdating = true
  }

  public endBatchUpdate () {
    this.isBatchUpdating = false
    this.renderer.initialize(parseAllConfigAttributes(this, {
      ...DEFAULT_CONFIG,
      renderWidth: this.offsetWidth,
      renderHeight: this.offsetHeight
    }))
  }

  private syncAttributesToConfig (update: Partial<Record<string, any>>): void {
    for (const [key, value] of Object.entries(update)) {
      const schemaEntry = CONFIG_SCHEMA[key as keyof typeof CONFIG_SCHEMA]
      const attr = schemaEntry.attribute
      this.setAttribute(attr, String(value))
    }
  }
}
