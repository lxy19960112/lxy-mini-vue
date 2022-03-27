import { extend } from '../../shared';

let activeEffect: ReactiveEffect | undefined
const effectStack: ReactiveEffect[] = []

function cleanupEffect (effect) {
  const { deps } = effect
  if (deps.length) {
    for(let i = 0; i < effect.deps.length; i++) {
      const dep = effect.deps[i]
      dep.delete(effect)
    }
    effect.deps.length = 0
  }
}

export class ReactiveEffect {
  deps = []
  constructor (public fn, scheduler?) {}
  run () {
    if (!effectStack.includes(this)) {
      try {
        cleanupEffect(this)
        enableTracking()
        effectStack.push(activeEffect = this)
        return this.fn()
      } finally {
        resetTracking()
        effectStack.pop()
        const len = effectStack.length
        activeEffect = len > 0 ? effectStack[len - 1] : undefined
      }
    }
  }
}

export function effect (fn, options?) {
  const _effect = new ReactiveEffect(fn)
  if(options) {
    extend(_effect, options)
  }
  if (!options?.lazy) {
    _effect.run()
  }
  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

let shouldTrack: boolean
const trackStack: boolean[] = []

export function isTracking () {
  return shouldTrack && activeEffect !== undefined
}

export function enableTracking () {
  trackStack.push(shouldTrack = true)
}

export function resetTracking () {
  const last = trackStack.pop()
  shouldTrack = last === undefined ? true : last
}

const targetMap = new WeakMap()
export function track (target, key) {
  if (!isTracking()) {
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  activeEffect.deps.push(dep)
  dep.add(activeEffect!)
}

export function trigger (target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  const deps = depsMap.get(key)
  if (!deps) {
    return
  }
  const depsToRun = new Set(deps)
  depsToRun.forEach(dep => {
    if (dep.scheduler) {
      dep.scheduler(dep)
    } else {
      dep.run()
    }
  })
}