import { extend, isArray } from '../../shared';
import { createDep } from './dep';
import { TriggerOpTypes } from './operations';

let activeEffect: ReactiveEffect | undefined
const effectStack: ReactiveEffect[] = []

export const ITERATE_KEY = Symbol('')

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
  constructor (public fn, public scheduler?) {}
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

export function pauseTracking () {
  trackStack.push(shouldTrack = false)
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
  trackEffects(dep)
}

export function trackEffects(dep) {
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect!)
    activeEffect!.deps.push(dep)
  }
}

export function trigger (target, type, key?, value?, oldValue?) {
  let deps: Array<any> = []
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  const dep = depsMap.get(key)
  deps.push(dep)

  if (isArray(target) && key === 'length') {
    depsMap.forEach((dep, key) => {
      if (key >= value) {
        deps.push(dep)
      }
    })
  }

  switch (type) {
    case TriggerOpTypes.ADD:
      if (isArray(target)) {
        const lengthDep = depsMap.get('length')
        deps.push(lengthDep)
      } else {
        const iterateDep = depsMap.get(ITERATE_KEY)
        deps.push(iterateDep)
      }
      break;
    case TriggerOpTypes.DELETE:
      const iterateDep = depsMap.get(ITERATE_KEY)
      deps.push(iterateDep)
    default:
      break;
  }

  const effects: Array<any> = []
  for (const dep of deps) {
    if (dep) {
      effects.push(...dep)
    }
  }
  triggerEffects(createDep(effects))
}

export function triggerEffects (dep) {
  for (const effect of (isArray(dep) ? dep : [...dep])) {
    if (effect !== activeEffect) {
      if (effect.scheduler) {
        effect.scheduler(effect)
      } else {
        effect.run()
      }
    }
  }
}
