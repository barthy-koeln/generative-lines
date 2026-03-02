# RFC1: Code Splitting for renderer.ts

## Current Issues

The current `renderer.ts` file mixes several responsibilities:

- **Animation logic** (`_createTween`, `animate*` functions) mixed with **state management** (`configure`,
  `updateConfig`, `updateState`)
- **Drawing operations** (`_draw`, `_setDrawingStyle`, `clear`) mixed with **animation orchestration**
- **Lifecycle management** (`configure`, `reroll`) mixed with **rendering primitives**
- **Line generation** coupling (`createLines`) called from multiple places

## Requirements

Split code should use composition patterns, not classes and inheritance.
Composables should use the param object pattern for configuration and state management, rather than relying on shared
mutable state.

## Proposed Split

### 2. `src/lib/renderer/drawing.ts`

**Responsibility**: Canvas drawing primitives only

- `_setDrawingStyle` → `applyDrawingStyle`
- `_draw` → `drawSegment`
- `clear` → `clearCanvas`
- `redraw` → `drawFull`

### 3. `src/lib/renderer/state.ts`

**Responsibility**: Configuration and state management

- `configure` → `initialize`
- `updateConfig` → `mergeConfig`
- `updateState` → `mergeState`
- `reroll` → `rerollLines`

### 4. `src/lib/renderer/capture.ts`

**Responsibility**: Screenshot functionality

- `capture` → `captureImage`

### 5. `src/lib/renderer.ts` (entry point)

**Responsibility**: Composition only

- Wire together the modules
- Return unified API

## Structure

```
src/lib/renderer/
├── animation.ts    # Tween orchestration
├── drawing.ts      # Canvas operations
├── state.ts        # Config/state lifecycle
├── capture.ts      # Image export
└── index.ts        # Composition (renamed from renderer.ts)
```

## Trade-offs

**Benefits**:

- Each module has a single responsibility
- Modules can be tested independently
- Clearer mental model for contributors

**Costs**:

- More files to navigate
- Additional indirection for simple operations