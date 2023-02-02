import { extend } from '../shared'
let activeEffect, shouldTrack
class ReactiveEffect {
  private _fn: any
  deps = []
  active = true
  onStop?: () => void
  public scheduler: Function | undefined
  constructor(fn, scheduler?: Function) {
    this._fn = fn
    this.scheduler = scheduler
  }
  run() {
    if (!this.active) return this._fn()
    shouldTrack = true
    activeEffect = this
    const result = this._fn()
    shouldTrack = false
    return result
  }
  stop() {
    if (this.active) {
      this.clearupEffect(this)
      if (this.onStop) this.onStop()
      this.active = false
    }
  }
  clearupEffect(effect) {
    effect.deps.forEach((dep: any) => {
      dep.delete(effect)
    })
    effect.deps.length = 0
  }
}

export const effect = (fn, options: any = {}) => {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  extend(_effect, options)
  _effect.run()
  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}
/**依赖收集 */
const targetMap = new Map()
/**是否收集依赖 */
const isTracking = () => shouldTrack && activeEffect !== undefined
export const track = (target, key) => {
  if (!isTracking()) return
  // target -> key -> dep
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }
  if (dep.has(activeEffect)) return
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}
/**触发依赖收集 */
export const trigger = (target, key) => {
  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)
  for (const effect of dep) {
    if (effect.scheduler) effect.scheduler()
    else effect.run()
  }
}

export const stop = runner => {
  runner.effect.stop()
}
