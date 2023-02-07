import { isObject } from '../shared/index'
import { mutableHandler, readonlyHandler, shallowReadonlyHandlers } from './baseHandlers'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly'
}
/**响应式对象实现 */
export const createReactiveObject = (raw, baseHandlers) => {
  if (!isObject(raw)) {
    console.warn(`target ${raw} 必须是一个对象`)
    return raw
  }
  return new Proxy(raw, baseHandlers)
}

export const reactive = raw => createReactiveObject(raw, mutableHandler)
export const readonly = raw => createReactiveObject(raw, readonlyHandler)

export const isReactive = raw => !!raw[ReactiveFlags.IS_REACTIVE]
export const isReadonly = raw => !!raw[ReactiveFlags.IS_READONLY]
export const isProxy = raw => isReactive(raw) || isReadonly(raw)

export const shallowReadonly = raw => createReactiveObject(raw, shallowReadonlyHandlers)
