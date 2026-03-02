# Renderer

The `renderer` module provides a canvas-based animation system for rendering generative line art. It wraps the Canvas 2D
API with a higher-level interface that handles configuration, line generation, animation, and image capture.

## Module Location

`src/lib/renderer.ts`

## Dependencies

| Module                    | Purpose                                              |
|---------------------------|------------------------------------------------------|
| `config.ts`               | Configuration resolution and render state management |
| `generator.ts`            | Line point generation and easing application         |
| `types.ts`                | Type definitions (Line, EasingFunction, etc.)        |
| `autoplay-tween-group.ts` | Custom Tween.js Group with auto-animation            |
| `utils/colors.ts`         | Gradient creation from color array                   |

## Core API

### `useRenderer(canvas, context)`

Factory function that returns a renderer controller.

**Parameters:**

| Name      | Type                       | Description               |
|-----------|----------------------------|---------------------------|
| `canvas`  | `HTMLCanvasElement`        | Canvas element to draw on |
| `context` | `CanvasRenderingContext2D` | 2D rendering context      |

**Returns:**

```typescript
interface Renderer {
  // Getters/Setters
  config: Config
  state: RenderState

  // Initialization
  configure (rawConfig: RawConfig, existingState?: RenderState): void

  // Animation
  animate (animationConfig: AnimationConfig): Promise<void>

  animateIn (): Promise<void>

  animateBackOut (): Promise<void>

  animateWipeOut (): Promise<void>

  animateLoop (
    holdAfterIn?: Milliseconds,
    holdAfterOut?: Milliseconds,
    inConfig?: AnimationConfig,
    outConfig?: AnimationConfig
  ): void

  // State Management
  updateConfig (newConfig: Partial<Config>): void

  updateState (newState: Partial<RenderState>): void

  reroll (): void

  // Rendering
  redraw (): void

  clear (): void

  // Export
  capture (): string
}
```

## Configuration Flow

1. **RawConfig** - User-provided configuration with string values for easing/background
2. **resolveConfig()** - Converts RawConfig to Config (parses easing strings, creates color objects)
3. **createRenderState()** - Generates random steps and colors based on Config

## Animation Modes

| Method             | Description                                  | Tween Range                 |
|--------------------|----------------------------------------------|-----------------------------|
| `animateIn()`      | Draw lines from left to right                | `[0, 0] → [0, 1]`           |
| `animateBackOut()` | Erase lines from right to left               | `[0, 1] → [0, 0]`           |
| `animateWipeOut()` | Erase lines from left to right               | `[0, 1] → [1, 1]`           |
| `animateLoop()`    | Continuous loop with hold periods and config | `[0, 0]→[0, 1]→0→[0, 0]...` |

## State Management

When updating config, the renderer determines what needs to be rebuilt:

| Config Change                              | Action                       |
|--------------------------------------------|------------------------------|
| `renderWidth`, `renderHeight`              | Resize canvas                |
| `background`                               | Update canvas background     |
| `steps`, `colors`                          | Reroll state + rebuild lines |
| `distance`, `amplitude`, `thickness`, etc. | Rebuild lines only           |
| `animationDuration`, `animationEasing`     | TODO: restart animation      |