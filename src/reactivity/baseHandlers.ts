import { track, trigger } from './effect'
import { isObject, extend } from '../shared/index'
import { reactive, ReactiveFlags, readonly, shallowReadonly } from './reactive'
export const createGetter = (isReadonly = false, shallow = false) => {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) return !isReadonly
    else if (key === ReactiveFlags.IS_READONLY) return isReadonly
    const res = Reflect.get(target, key)
    if (shallow) return res
    /**判断res是否是复杂数据类型 */
    if (isObject(res)) return isReadonly ? readonly(res) : reactive(res)
    if (!isReadonly) track(target, key)
    return res
  }
}
export const createSetter = () => {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value)
    trigger(target, key)
    return res
  }
}

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)
export const mutableHandler = {
  get,
  set
}

export const readonlyHandler = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`${key} set失败，因为target是readonly`, target)
    return true
  }
}
export const shallowReadonlyHandlers = extend({}, readonlyHandler, {
  get: shallowReadonlyGet
})
