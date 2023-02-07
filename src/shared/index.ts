export const extend = Object.assign

export const isObject = val => val !== null && typeof val === 'object'

export const hasChanged = (newVal, val) => !Object.is(val, newVal)

export const hasOwn = (raw, key) => Object.prototype.hasOwnProperty.call(raw, key)
