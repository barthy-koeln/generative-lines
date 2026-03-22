import type { Tween } from '@tweenjs/tween.js'
import { Group } from '@tweenjs/tween.js'

/**
 * Registry of named tween groups.
 * Groups persist for the lifetime of the application.
 */
const tweenGroupRegistry = new Map<string, AutoplayTweenGroup>()

/**
 */
export function getTweenGroup (name?: string): AutoplayTweenGroup | undefined {
  if (name === undefined) {
    return undefined
  }

  if (!tweenGroupRegistry.has(name)) {
    tweenGroupRegistry.set(name, new AutoplayTweenGroup())
  }

  return tweenGroupRegistry.get(name)
}

/**
 * A tween group that automatically starts playing when tweens are added and stops when all tweens are removed.
 */
export class AutoplayTweenGroup extends Group {
  private animationFrame: ReturnType<typeof requestAnimationFrame> | null = null

  constructor () {
    super()
    this.animate = this.animate.bind(this)
  }

  /**
   * Animation frame callback that updates the tween group.
   * Queues the next frame if there are still active tweens, or stops playing if all tweens have completed.
   * @param timestamp
   */
  animate (timestamp: DOMHighResTimeStamp) {
    this.update(timestamp)

    if (this.allStopped()) {
      this.stopPlaying()
      return
    }

    this.queueFrame()
  }

  /**
   * Adds tweens to the group and starts playing if the group was previously empty.
   * @param tweens
   */
  add (...tweens: Tween[]) {
    const wasEmpty = this.getAll().length === 0
    super.add(...tweens)

    if (wasEmpty && tweens.length > 0) {
      this.queueFrame()
    }
  }

  /**
   * Removes tweens from the group and stops playing if the group becomes empty.
   * @param tweens
   */
  remove (...tweens: Tween[]) {
    super.remove(...tweens)
    if (this.getAll().length === 0) {
      this.stopPlaying()
    }
  }

  /**
   * Removes all tweens from the group and stops playing.
   */
  removeAll () {
    super.removeAll()
    this.stopPlaying()
  }

  /**
   * Stops the animation loop if it is currently running.
   * Does nothing if the animation loop is not active.
   */
  stopPlaying () {
    if (!this.animationFrame) {
      return
    }

    cancelAnimationFrame(this.animationFrame)
    this.animationFrame = null
  }

  /**
   * Queues the next animation frame if the animation loop is not already running.
   * Effectively starts the animation loop if it is not already active.
   */
  queueFrame () {
    this.animationFrame = requestAnimationFrame(this.animate)
  }
}