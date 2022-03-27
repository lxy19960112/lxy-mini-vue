import { extend } from '../../shared';
import { createDep } from './dep';

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

export function stop(runner) {
  const { effect } = runner
  effect.stop()
}

export class ReactiveEffect {
  deps = []
  active = true
  onStop?: () => void
  constructor (public fn, scheduler?) {}
  run () {
    if (!this.active) {
      return this.fn()
    }
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
  stop () {
    if (this.active) {
      if (this.onStop) {
        this.onStop()
      }
      cleanupEffect(this)
      this.active = false
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
    depsMap.set(key, (dep = createDep()))
  }
  trackEffect(dep)
}

export function trackEffect(dep) {
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect!)
    activeEffect!.deps.push(dep)
  }
}

export function trigger (target, key) {
  let deps: Array<any> = []
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  const dep = depsMap.get(key)
  deps.push(dep)

  const effects: Array<any> = []
  for (const dep of deps) {
    if (dep) {
      effects.push(...dep)
    }
  }
  triggerEffect(createDep(effects))
}

export function triggerEffect (dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler(effect)
    } else {
      effect.run()
    }
  }
}