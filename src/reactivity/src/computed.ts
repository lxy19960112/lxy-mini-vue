import { ReactiveEffect } from './effect';
import { trackRefValue, triggerRefValue } from './ref';
import { isFunction, NOOP } from '../../shared';
import { ReactiveFlags} from './reactive';

class ComputedRefImpl {
  public dep = undefined
  private _value!
  private _dirty = true
  public readonly effect

  public readonly __v_isRef = true
  public readonly [ReactiveFlags.IS_READONLY]: boolean
  constructor(getter, private readonly _setter, readonly) {
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true
        triggerRefValue(this)
      }
    })
    this[ReactiveFlags.IS_READONLY] = readonly
  }
  get value () {
    if(this._dirty) {
      this._value = this.effect.run()!
      this._dirty = false
    }
    trackRefValue(this)
    return this._value
  }
  set value (newValue) {
    this._setter(newValue)
  }
}

export function computed(getterOrOptions) {
  let getter, setter
  
  const onlyGetter = isFunction(getterOrOptions)

  if (onlyGetter) {
    getter = getterOrOptions
    setter = NOOP
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter)
  return cRef
}