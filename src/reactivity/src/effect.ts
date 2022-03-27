let activeEffect: ReactiveEffect | undefined
const effectStack: ReactiveEffect[] = []
export class ReactiveEffect {
  deps = []
  constructor (public fn, scheduler?) {}
  run () {
    if (!effectStack.includes(this)) {
      try {
        effectStack.push(activeEffect = this)
        return this.fn()
      } finally {
        effectStack.pop()
        const len = effectStack.length
        activeEffect = len > 0 ? effectStack[len - 1] : undefined
      }
    }
  }
}

export function effect (fn, options?) {
  const _effect = new ReactiveEffect(fn)
  if (!options?.lazy) {
    _effect.run()
  }

  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

const targetMap = new WeakMap()
export function track (target, key) {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
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
  deps.forEach(dep => {
    dep && dep.run()
  })
}