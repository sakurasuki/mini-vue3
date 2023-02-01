import { mutableHandler, readonlyHandler } from './baseHandlers'

/**响应式对象实现 */
export const createActiveObject = (raw, baseHandlers) => new Proxy(raw, baseHandlers)
export const reactive = raw => createActiveObject(raw, mutableHandler)
export const readonly = raw => createActiveObject(raw, readonlyHandler)
