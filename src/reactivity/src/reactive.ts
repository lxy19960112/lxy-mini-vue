import { isObject, hasChanged } from '../../shared';
import { track, trigger } from './effect';

export function reactive(target) {
  return createReactiveObj(target)
}

export const enum ReactiveFlags {
  SKIP = '__v_skip',
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  RAW = '__v_raw'
}

function createReactiveObj (target) {
  if (!isObject(target)) {
    return target
  }
  const proxy = new Proxy(target, {
    get (target, key, receiver) {
      const res = Reflect.get(target, key, receiver)
      track(target, key)
      return isObject ? reactive(res) : res
    },
    set (target, key, value, receiver) {
      const oldValue = target[key]
      const res = Reflect.set(target, key, value, receiver)
      if (hasChanged(value, oldValue)) {
        trigger(target, key)
      }
      return res
    }
  })
  return proxy
}

export function isReadonly(value) {
  return !!(value && value[ReactiveFlags.IS_READONLY])
}

