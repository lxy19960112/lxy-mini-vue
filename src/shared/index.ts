export const isObject = obj => typeof obj === 'object' && obj !== null

export const hasChanged = (value: any, oldValue: any): boolean => {
  return !Object.is(value, oldValue)
}

export const extend = Object.assign