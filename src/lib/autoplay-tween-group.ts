import { Group, Tween } from '@tweenjs/tween.js'


export class AutoplayTweenGroup extends Group {
  private animationFrame: ReturnType<typeof requestAnimationFrame> | null = null

  constructor () {
    super()
    this.animate = this.animate.bind(this)
  }

  animate (timestamp: DOMHighResTimeStamp) {
    this.update(timestamp)

    if (this.allStopped()) {
      this.stopPlaying()
      return
    }

    this.queueFrame()
  }

  add (...tweens: Tween[]) {
    const wasEmpty = this.getAll().length === 0
    super.add(...tweens)

    if (wasEmpty && tweens.length > 0) {
      this.queueFrame()
    }
  }

  remove (...tweens: Tween[]) {
    super.remove(...tweens)
    if (this.getAll().length === 0) {
      this.stopPlaying()
    }
  }

  removeAll () {
    super.removeAll()
    this.stopPlaying()
  }

  stopPlaying () {
    if (!this.animationFrame) {
      return
    }

    cancelAnimationFrame(this.animationFrame)
    this.animationFrame = null
  }

  queueFrame(){
    this.animationFrame = requestAnimationFrame(this.animate)
  }
}