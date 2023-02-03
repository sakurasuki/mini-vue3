import { ReactiveEffect } from './effect'
class ComputedRefImpl {
  private _getter: any
  private _dirty: boolean = true
  private _value: any
  private _effect: any
  constructor(getter) {
    this._getter = getter
    this._effect = new ReactiveEffect(
      getter,
      /* 响应式对象更新
       * _dirty私有变量标记转true 表示需要重新获取新的计算结果
       */
      () => {
        if (!this._dirty) this._dirty = true
      }
    )
  }
  get value() {
    /**缓存操作
     * 通过_dirty私有变量标记判断是否被调用过
     * 调用过 直接返回缓存的上次调用结果
     * 没调用过 _dirty转false 保留调用结果
     */
    if (this._dirty) {
      this._dirty = false
      this._value = this._effect.run()
    }
    return this._value
  }
}
export const computed = getter => {
  return new ComputedRefImpl(getter)
}
