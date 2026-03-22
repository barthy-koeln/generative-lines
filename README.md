# Generative Lines

This is a little experiment packed into a reusable library and web component.

## Links

- [Playground](https://generative-lines.barthy.koeln/docs) — Detailed documentation for the library and web component.
- [Demo](https://generative-lines.barthy.koeln/demo) — Scroll-through demos showcasing different configurations and
  styles.
- [Documentation](https://generative-lines.barthy.koeln/docs) — Detailed documentation for the library and web
  component.

I wrote this to explore:

* [canvas 2d context drawing](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
* [generative art](https://www.reddit.com/r/generative/)
* [web components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
* [atomic design](https://atomicdesign.bradfrost.com/) in [Astro](https://astro.build)

## Quickstart

[NPM Registry](https://www.npmjs.com/package/generative-lines)

```shell
npm install --save generative-lines
```

```javascript
import { LinesCanvas } from 'generative-lines'

customElements.define('lines-canvas', LinesCanvas)
```

```html

<lines-canvas
  lines="10"
  colors="5"
/>
```

## Usage of ML Agent tools

I use the [IntelliJ full-line completion model](https://plugins.jetbrains.com/plugin/14823-full-line-code-completion).

I also use locally ran llama-cpp with models such as:

* [QuantFactory/EuroLLM](https://huggingface.co/QuantFactory/EuroLLM-9B-Instruct-GGUF)
* [unsloth/Qwen3.5](https://huggingface.co/unsloth/Qwen3.5-9B-GGUF)

They assist with documentation, tedious refactoring, etc.

I know every line of code I publish.