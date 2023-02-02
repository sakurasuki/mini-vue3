import { mutableHandler, readonlyHandler } from './baseHandlers'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly'
}
/**响应式对象实现 */
export const createActiveObject = (raw, baseHandlers) => new Proxy(raw, baseHandlers)
export const reactive = raw => createActiveObject(raw, mutableHandler)
export const readonly = raw => createActiveObject(raw, readonlyHandler)

export const isReactive = raw => !!raw[ReactiveFlags.IS_REACTIVE]

export const isReadonly = raw => !!raw[ReactiveFlags.IS_READONLY]
