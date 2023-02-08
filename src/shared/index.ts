export const extend = Object.assign

export const isObject = val => val !== null && typeof val === 'object'

export const hasChanged = (newVal, val) => !Object.is(val, newVal)

export const hasOwn = (raw, key) => Object.prototype.hasOwnProperty.call(raw, key)

/**
 * event事件key转换
 * @param str
 * @returns add-foo ->addFoo
 */
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : ''
  })
}
/**
 * event事件key转换
 * @param str
 * @returns add -> Add
 */
export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

/**
 * event事件key转换
 * @param str
 * @returns  key -> onKey
 */
export const toHandlerKey = (str: string) => (str ? 'on' + capitalize(str) : '')
