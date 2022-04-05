import {
  reactive,
  ReactiveFlags,
  toRaw,
  isReadonly,
  readonly
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
  extend,
  isArray
} from '../../shared'
import { TriggerOpTypes } from './operations';

const get = createGetter(false, false)
const shallowGet = createGetter(false, true)
const readonlyGet = createGetter(true, false)
const shallowReadonlyGet = createGetter(true, true)

const arrayInstrumentations = {}
;['includes', 'indexOf', 'lastIndexOf'].forEach(key => {
  const method = Array.prototype[key]
  arrayInstrumentations[key] = function (...args) {
    let res = method.apply(this, args)
    for (let i = 0; i < this.length; i++) {
      track(toRaw(this), i + '')
    }
    if (!res || res === -1) {
      res = method.apply(toRaw(this), args)
    }
    return res
  }
})

function createGetter(isReadonly = false, shallow = false) {
  return function get (target, key: string | symbol, receiver: object) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    } else if (key === ReactiveFlags.RAW) {
      return target
    }
    if (isArray(target) && hasOwn(arrayInstrumentations, key)) {
      return Reflect.get(arrayInstrumentations, key, receiver)
    }
    const res = Reflect.get(target, key, receiver)
    if (!isReadonly && typeof key !== 'symbol') {
      track(target, key)
    }
    if (shallow) {
      return res
    }
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }
    return res
  }
}

const set = createSetter()
const shallowSet = createSetter(true)

function createSetter(shallow = false) {
  return function set (target, key, value, receiver) {
    const oldValue = target[key]
    const hadKey = isArray(target) ? Number(key) < target.length : hasOwn(target, key)
    const res = Reflect.set(target, key, value, receiver)
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
  track(target, isArray(target) ? 'length' : ITERATE_KEY)
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

export const shallowReadonlyHandlers = extend(
  {},
  readonlyHandlers,
  {
    get: shallowReadonlyGet
  }
)
