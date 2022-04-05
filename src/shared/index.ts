export const isObject = obj => typeof obj === 'object' && obj !== null

export const hasChanged = (value: any, oldValue: any): boolean => !Object.is(value, oldValue)

export const extend = Object.assign

export const isArray = Array.isArray

export const isFunction = object => typeof object === 'function'

export const NOOP = () => void 0

const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (val, key) => hasOwnProperty.call(val, key)

export const isString = (val: unknown): val is string => typeof val === 'string'
export const isIntegerKey = (key: unknown) =>
  isString(key) &&
  key !== 'NaN' &&
  key[0] !== '-' &&
  '' + parseInt(key, 10) === key
