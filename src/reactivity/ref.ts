import { trackEffects, triggerEffects, isTracking } from './effect'
import { reactive } from './reactive'
import { hasChanged, isObject } from '../shared'
/**对象转换为reactive对象 */
const convert = val => (isObject(val) ? reactive(val) : val)

class RefImpl {
  private _value: any
  public dep
  private _rawValue: any
  public __v_isRef = true
  constructor(value) {
    this._rawValue = value
    this._value = convert(value)

    this.dep = new Set()
  }
  get value() {
    tarckRefValue(this)
    return this._value
  }
  set value(newVal) {
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal
      this._value = convert(newVal)
      triggerEffects(this.dep)
    }
  }
}

const tarckRefValue = ref => {
  if (isTracking()) trackEffects(ref.dep)
}

export const ref = value => new RefImpl(value)

export const isRef = ref => !!ref.__v_isRef

export const unRef = ref => (isRef(ref) ? ref.value : ref)

export const proxyRefs = objectWithRefs => {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key))
    },
    set(target, key, val) {
      if (isRef(target[key]) && !isRef(val)) return (target[key].value = val)
      else return Reflect.set(target, key, val)
    }
  })
}
