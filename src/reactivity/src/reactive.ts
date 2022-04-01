import { isObject, hasChanged, hasOwn } from '../../shared';
import { track, trigger, ITERATE_KEY, } from './effect';
import { TriggerOpTypes } from './operations';
import { mutableHandlers, shallowReactiveHandlers, readonlyHandlers } from './baseHandlers';

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

function createReactiveObject (target, baseHandlers, proxyMap) {
  if (!isObject(target)) {
    return target
  }
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  const proxy = new Proxy(target, baseHandlers)
  proxyMap.set(target, proxy)
  return proxy
}

const reactiveMap = new WeakMap()
const shallowReactiveMap = new WeakMap()
const readonlyMap = new WeakMap()
export function reactive(target) {
  return createReactiveObject(target, mutableHandlers, reactiveMap)
}
export function shallowReactive(target) {
  return createReactiveObject(target, shallowReactiveHandlers, shallowReactiveMap)
}
export function readonly(target) {
  return createReactiveObject(target, readonlyHandlers, readonlyMap)
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

