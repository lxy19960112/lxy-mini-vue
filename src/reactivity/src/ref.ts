import { trackEffects, triggerEffects, isTracking } from './effect';
import { reactive } from './reactive';
import { isObject, hasChanged } from '../../shared';
import { createDep } from './dep';

function convert (value) {
  return isObject(value) ? reactive(value) : value
}

class RefImpl {
  private _rawValue: any;
  private _value: any;
  public dep;
  public __v_isRef = true;
  constructor (value) {
    this._rawValue = value
    this._value = convert(value)
  }
  get value () {
    trackRefValue(this)
    return this._value
  }
  set value (newValue) {
    if (hasChanged(newValue, this._rawValue)) {
      this._value = convert(newValue)
      this._rawValue = newValue
      triggerRefValue(this)
    }
  }
}

export function trackRefValue (ref) {
  if(isTracking()) {
    if (!ref.dep) {
      ref.dep = createDep()
    }
    trackEffects(ref.dep)
  }
}

export function triggerRefValue (ref) {
  if (ref.dep) {
    triggerEffects(ref.dep)
  }
}

function createRef (rawValue) {
  if (isRef(rawValue)) {
    return rawValue
  }
  return new RefImpl(rawValue)
}

export function ref (rawValue) {

  return createRef(rawValue)
}

export function isRef (value) {
  return !!value.__v_isRef
}

export function unRef (ref) {
  return isRef(ref) ? ref.value : ref
}

const shallowUnwrapHandlers = {
  get: (target, key, receiver) => unRef(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key]
    if (isRef(oldValue) && !isRef(value)) {
      oldValue.value = value
      return true
    } else {
      return Reflect.set(target, key, value, receiver)
    }
  }
}

export function proxyRefs (objectWithRefs) {
  const proxy = new Proxy(objectWithRefs, shallowUnwrapHandlers)
  return proxy
}