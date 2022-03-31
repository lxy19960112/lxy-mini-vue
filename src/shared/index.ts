export const isObject = obj => typeof obj === 'object' && obj !== null

export const hasChanged = (value: any, oldValue: any): boolean => {
  return !Object.is(value, oldValue)
}

export const extend = Object.assign

export const isArray = Array.isArray

export const isFunction = object => typeof object === 'function'

export const NOOP = () => void 0

const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (val, key) => hasOwnProperty.call(val, key)