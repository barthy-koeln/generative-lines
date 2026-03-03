---
layout: ../../layouts/DocsLayout.astro
title: "How to Use the LinesCanvas Custom Element"
description: "Guide on using the lines-canvas Web Component for generative line art animations, including registration, attributes, animation modes, and programmatic API."
---

# LinesCanvas Custom Element Usage Guide

The `lines-canvas` element is a Web Component that renders generative line art animations.

## Registration

```javascript
import { LinesCanvas } from 'generative-lines'

customElements.define('lines-canvas', LinesCanvas)
```

## Basic Usage

### HTML Attributes

```html

<lines-canvas
  steps="12"
  colors="3"
  distance="12"
  amplitude="32"
  thickness="2"
  lines="12"
  padding-x="20"
  padding-y="20"
  perspective="-0.02"
  easing="Cubic.InOut"
  background="transparent"
  animation-duration="0"
  animation-easing="Cubic.InOut"
  line-cap="round"
  line-join="round"
  autoplay="true"
/>
```

### Attribute Reference

| Attribute            | Type                      | Default               | Description                                                                                                       |
|----------------------|---------------------------|-----------------------|-------------------------------------------------------------------------------------------------------------------|
| `render-width`       | `int`                     | `canvas.offsetWidth`  | Canvas render width in pixels                                                                                     |
| `render-height`      | `int`                     | `canvas.offsetHeight` | Canvas render height in pixels                                                                                    |
| `steps`              | `int`                     | 12                    | Number of steps in the line                                                                                       |
| `colors`             | `int`                     | 3                     | Number of gradient colors                                                                                         |
| `distance`           | `int`                     | 12                    | Vertical distance between lines                                                                                   |
| `amplitude`          | `int`                     | 32                    | Maximum Y variation                                                                                               |
| `thickness`          | `int`                     | 2                     | Line stroke width                                                                                                 |
| `lines`              | `int`                     | 12                    | Number of parallel lines                                                                                          |
| `padding-x`          | `int`                     | 20                    | Horizontal padding                                                                                                |
| `padding-y`          | `int`                     | 20                    | Vertical padding                                                                                                  |
| `perspective`        | `float`                   | -0.02                 | Perspective scaling factor                                                                                        |
| `easing`             | tween.js easing           | `Cubic.InOut`         | Easing function ([tween.js ref](https://tweenjs.github.io/tween.js/examples/03_graphs.html))                      |
| `background`         | `string`                  | `transparent`         | Background color (hex, named, etc.)                                                                               |
| `animation-duration` | `int`                     | 0                     | Animation duration in ms                                                                                          |
| `animation-easing`   | tween.js easing           | `Cubic.InOut `        | Animation easing function  ([tween.js ref](https://tweenjs.github.io/tween.js/examples/03_graphs.html))           |
| `line-cap`           | `butt`, `round`, `square` | `round`               | Line end cap style ([MDN ref](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineCap)) |
| `line-join`          | `round`, `bevel`, `miter` | `round`               | Line join style ([MDN ref](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin))   |
| `autoplay`           | `true`, `loop`, `false`   | `false`               | Animation mode                                                                                                    |

## Animation Modes

### `autoplay="true"`

Plays a single animation from left to right on mount. Dispatches `animated-in` event when complete.

```html
<lines-canvas
  autoplay="true"
  id="myCanvas"
></lines-canvas>

<script>
  document.getElementById('myCanvas').addEventListener('animated-in', () => {
    console.log('Animation finished')
  })
</script>
```

### `autoplay="loop"`

Continuously loops the animation with hold periods.

```html
<lines-canvas autoplay="loop"></lines-canvas>
```

### `autoplay="false"` or omitted

No animation. Lines are drawn statically.

```html
<lines-canvas autoplay="false"></lines-canvas>
```

## Programmatic API

### Accessing the Element

```javascript
const element = document.querySelector('lines-canvas')
```

### Public Properties

| Property    | Type                       | Description                                     |
|-------------|----------------------------|-------------------------------------------------|
| `canvas`    | `HTMLCanvasElement`        | The underlying canvas element                   |
| `context`   | `CanvasRenderingContext2D` | The 2D rendering context                        |
| `renderer`  | `Renderer`                 | The renderer controller ([ref](/docs/renderer)) |
| `isMounted` | `boolean`                  | Whether the element is connected to DOM         |

### Public Methods

#### `startBatchUpdate()` / `endBatchUpdate()`

Batch multiple attribute changes into a single reconfiguration:

```javascript
element.startBatchUpdate()
element.setAttribute('steps', '20')
element.setAttribute('colors', '5')
element.setAttribute('distance', '10')
element.endBatchUpdate()
```

#### Accessing the Renderer

The renderer provides additional control:

```javascript
const renderer = element.renderer

// Animate
await renderer.animateIn()
await renderer.animateBackOut()
await renderer.animateWipeOut()
renderer.animateLoop()

// Update configuration
renderer.updateConfig({ steps: 20, colors: 5 })

// Reroll random state
renderer.reroll()

// Capture image
const imageData = renderer.capture() // returns data URL
```

## Dynamic Attribute Changes

Changing attributes after mount automatically updates the rendering:

```javascript
const element = document.querySelector('lines-canvas')

// These will trigger automatic updates
element.setAttribute('colors', '5')
element.setAttribute('thickness', '4')
element.setAttribute('easing', 'Quad.InOut')
```

## CSS Styling

The canvas automatically fills its container, unless specified otherwise:

```css
lines-canvas {
  display: block;
  width: 500px;
  height: 500px;
}
```

## Examples

### Static rendering with custom colors

```html

<lines-canvas
  autoplay="false"
  lines="8"
  thickness="3"
  colors="4"
  background="#1a1a2e"
>
</lines-canvas>
```

### Animated loop with slow easing

```html

<lines-canvas
  autoplay="loop"
  animation-duration="2000"
  animation-easing="Quad.InOut"
  steps="16"
  amplitude="48"
>
</lines-canvas>
```

### Listen for animation completion

```html
<lines-canvas id="example" autoplay="true"></lines-canvas>

<script>
  const linesCanvas = document.getElementById('example')

  linesCanvas.addEventListener(
    'animated-in',
    () => {
      linesCanvas.renderer.animateWipeOut()
    },
    { once: true }
  )
</script>