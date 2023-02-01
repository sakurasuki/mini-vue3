import { track, trigger } from './effect'

export const createGetter = (isReadonly = false) => {
  return function get(target, key) {
    const res = Reflect.get(target, key)
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
