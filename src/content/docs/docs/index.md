---
title: "Start"
description: "Documentation for the generative-lines library."
---

- [Renderer](/docs/renderer) — Core rendering system and drawing primitives.
- [Lines Canvas](/docs/lines-canvas) — Interactive canvas component for drawing generative lines.

## Quickstart

```shell
npm install --save generative-lines
```

```javascript
import { LinesCanvas } from 'generative-lines/lines-canvas'

customElements.define('lines-canvas', LinesCanvas)
```

```html

<lines-canvas
  lines="10"
  colors="5"
/>
```

## Links

- [Playground](/) — Interactive playground for testing configurations.
- [Demo: Scrolling](/demo) — Scroll-through demos showcasing different configurations and styles.
- [Demo: Agentic Chat](/agent) — Agentic chat "thinking" animation demo
- [Source Code](https://github.com/barthy-koeln/generative-lines) — View the full source code on GitHub.