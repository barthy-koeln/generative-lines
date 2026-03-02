import type { Config } from '../config.ts'
import type { AnimationConfig, Milliseconds, NormalizedPositive } from '../types.ts'
import { Tween } from '@tweenjs/tween.js'
import { AutoplayTweenGroup } from '../autoplay-tween-group.ts'

export interface AnimationControllerParams {
  getConfig: () => Config,
  applyDrawingStyle: () => void,
  clearCanvas: () => void,
  drawSegment: (from: NormalizedPositive, to: NormalizedPositive) => void
}

/**
 * Animation controller for rendering line animations.
 * Handles tween creation and animation orchestration.
 */
export function createAnimationController ({
  getConfig,
  applyDrawingStyle,
  clearCanvas,
  drawSegment,
}: AnimationControllerParams) {
  const tweenGroup = new AutoplayTweenGroup()

  function createTween ({ from, to }: AnimationConfig): Tween {
    const config = getConfig()

    const tween: Tween = new Tween({ start: from[0], end: from[1] })
      .to({ start: to[0], end: to[1] })
      .onEveryStart(applyDrawingStyle)
      .duration(config.animationDuration)
      .easing(config.animationEasing)

    tween
      .onUpdate(({ start, end }: { start: NormalizedPositive, end: NormalizedPositive }) => {
        clearCanvas()
        drawSegment(start, end)
      })

    return tween
  }

  function animate (animationConfig: AnimationConfig): Promise<void> {
    return new Promise((resolve) => {
      const tween = createTween(animationConfig)
      tweenGroup.removeAll()
      tweenGroup.add(tween)

      tween
        .onComplete(() => resolve())
        .start()
    })
  }

  function animateIn (): Promise<void> {
    return animate({ from: [0, 0], to: [0, 1] })
  }

  function animateBackOut (): Promise<void> {
    return animate({ from: [0, 1], to: [0, 0] })
  }

  function animateWipeOut (): Promise<void> {
    return animate({ from: [0, 1], to: [1, 1] })
  }

  function animateLoop (
    holdAfterIn: Milliseconds = 1000,
    holdAfterOut: Milliseconds = 300,
    inConfig: AnimationConfig = { from: [0, 0], to: [0, 1] },
    outConfig: AnimationConfig = { from: [0, 1], to: [1, 1] }
  ): void {
    const animationIn = createTween(inConfig)
    const animationOut = createTween(outConfig)
    const animationInFollow = createTween(inConfig)

    animationIn
      .chain(animationOut)
    animationOut
      .delay(holdAfterIn)
      .chain(animationInFollow)
    animationInFollow
      .delay(holdAfterOut)
      .chain(animationOut)

    tweenGroup.removeAll()
    tweenGroup.add(animationIn, animationOut, animationInFollow)

    animationIn.start()
  }

  return {
    animate,
    animateIn,
    animateBackOut,
    animateWipeOut,
    animateLoop
  }
}