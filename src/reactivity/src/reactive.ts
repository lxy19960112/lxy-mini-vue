import { isObject, hasChanged, hasOwn } from '../../shared';
import { track, trigger, ITERATE_KEY, } from './effect';
import { TriggerOpTypes } from './operations';

export function reactive(target) {
  return createReactiveObj(target)
}

export const enum ReactiveFlags {
  SKIP = '__v_skip',
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  RAW = '__v_raw'
}

export interface Target {
  [ReactiveFlags.SKIP]?: boolean
  [ReactiveFlags.IS_REACTIVE]?: boolean
  [ReactiveFlags.IS_READONLY]?: boolean
  [ReactiveFlags.RAW]?: any
}

function createReactiveObj (target) {
  if (!isObject(target)) {
    return target
  }
  const proxy = new Proxy(target, {
    get (target, key, receiver) {
      const res = Reflect.get(target, key, receiver)
      if (key === ReactiveFlags.RAW) {
        return target
      }
      if (key === ReactiveFlags.IS_REACTIVE) {
        return true
      }
      track(target, key)
      return isObject ? reactive(res) : res
    },
    set (target, key, value, receiver) {
      const hadKey = hasOwn(target, key)
      const oldValue = target[key]
      const res = Reflect.set(target, key, value, receiver)
      if (toRaw(receiver) === target) {
        if (!hadKey) {
          trigger(target, TriggerOpTypes.ADD, key, value)
        } else if (hasChanged(value, oldValue)) {
          trigger(target, TriggerOpTypes.SET, key, value, oldValue)
        }
      }
      return res
    },
    has (target, key) {
      track(target, key)
      return Reflect.has(target, key)
    },
    ownKeys (target) {
      track(target, ITERATE_KEY)
      return Reflect.ownKeys(target)
    },
    deleteProperty (target, key) {
      trigger(target, TriggerOpTypes.DELETE, key)
      return Reflect.deleteProperty(target, key)
    }
  })
  return proxy
}

export function isReadonly(value) {
  return !!(value && value[ReactiveFlags.IS_READONLY])
}

export function toRaw(observed) {
  const raw = observed && observed[ReactiveFlags.RAW]
  return raw ? toRaw(raw) : observed
}

export function isReactive(value) {
  return !!(value && value[ReactiveFlags.IS_REACTIVE])
}

