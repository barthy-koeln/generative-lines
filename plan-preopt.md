# Plan: Shared AutoplayTweenGroup via Renderer Instances

## Problem
Currently, each `useRenderer()` call creates its own `AutoplayTweenGroup` instance (`tweenGroup`). This prevents sharing animations across renderer instances. The requirement is:
1. Multiple renderer instances can run independently (start/stop separately)
2. Same named tween group should be shared when provided via options

## Solution Design

**Create a `TweenGroupRegistry`** (singleton) that manages named tween groups:

| Component | Responsibility |
|-----------|----------------|
| `TweenGroupRegistry` | Singleton that creates/returns named `AutoplayTweenGroup` instances |
| `useRenderer` | Accepts optional `{ tweenGroupName?: string }` in options to share groups |
| `createAnimationController` | Receives optional `AutoplayTweenGroup` from registry instead of creating new |

## Implementation Steps

1. **`src/lib/autoplay-tween-group.ts`**: Export registry helper
   - Add `getTweenGroup(name?: string): AutoplayTweenGroup` function
   - When `name` is provided, return cached group (create if needed)
   - When `name` is `undefined`, return new anonymous instance per call

2. **`src/lib/renderer.ts`**: Accept tween group option
   - Add optional `tweenGroupName` to controller params
   - Pass through to animation controller

3. **`src/lib/renderer/animation.ts`**: Use shared group if provided
   - Accept optional `AutoplayTweenGroup` parameter
   - Use provided group or create new anonymous one

## Key Design Decisions

- **Independent control**: Anonymous (unnamed) groups remain per-instance
- **Shared groups**: Named groups are cached globally and shared across instances
- **Thread safety**: Not needed (single-threaded JS)
- **Cleanup**: Groups auto-stop when empty (existing behavior in `AutoplayTweenGroup`)