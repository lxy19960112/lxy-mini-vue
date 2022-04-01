import { isObject, hasChanged, hasOwn } from '../../shared';
import { track, trigger, ITERATE_KEY, } from './effect';
import { TriggerOpTypes } from './operations';
import { mutableHandlers } from './baseHandlers';

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
  const proxy = new Proxy(target, mutableHandlers)
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

