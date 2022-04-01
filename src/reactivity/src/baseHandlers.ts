import {
  reactive,
  ReactiveFlags,
  toRaw,
  isReadonly
} from './reactive'
import {
  ITERATE_KEY,
  track,
  trigger
} from './effect'
import {
  isObject,
  hasOwn,
  hasChanged,
  extend
} from '../../shared'
import { TriggerOpTypes } from './operations';

const get = createGetter(false, false)
const shallowGet = createGetter(false, true)
const readonlyGet = createGetter(true, false)

function createGetter(isReadonly = false, shallow = false) {
  return function get (target, key, receiver) {
    const res = Reflect.get(target, key, receiver)
    if (key === ReactiveFlags.RAW) {
      return target
    }
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }
    if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }
    if (!isReadonly) {
      track(target, key)
    }
    if (shallow) {
      return res
    }
    return isObject ? reactive(res) : res
  }
}

const set = createSetter()
const shallowSet = createSetter(true)

function createSetter(shallow = false) {
  return function set (target, key, value, receiver) {
    const hadKey = hasOwn(target, key)
    const oldValue = target[key]
    const res = Reflect.set(target, key, value, receiver)
    if (isReadonly(target)) {
      return true
    }
    if (toRaw(receiver) === target) {
      if (!hadKey) {
        trigger(target, TriggerOpTypes.ADD, key, value)
      } else if (hasChanged(value, oldValue)) {
        trigger(target, TriggerOpTypes.SET, key, value, oldValue)
      }
    }
    return res
  }
}

function has (target, key) {
  track(target, key)
  return Reflect.has(target, key)
}

function ownKeys (target) {
  track(target, ITERATE_KEY)
  return Reflect.ownKeys(target)
}

function deleteProperty (target, key) {
  if (isReadonly(target)) {
    return true
  }
  trigger(target, TriggerOpTypes.DELETE, key)
  return Reflect.deleteProperty(target, key)
}

export const mutableHandlers = {
  get,
  set,
  has,
  ownKeys,
  deleteProperty
}

export const shallowReactiveHandlers = extend(
  {},
  mutableHandlers,
  {
    get: shallowGet,
    set: shallowSet
  }
)

export const readonlyHandlers = {
  get: readonlyGet,
  set() {
    return true
  },
  deleteProperty() {
    return true
  },
}

