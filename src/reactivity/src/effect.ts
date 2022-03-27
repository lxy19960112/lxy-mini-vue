let activeEffect
export class ReactiveEffect {
  public deps = []
  public runner
  constructor (public fn, scheduler?) {
    try {
      const effectFn = () => {
        activeEffect = this
        return fn()
      }
      this.runner = effectFn
    } finally {}
  }
  run () {
    this.runner()
  }
}

export function effect (fn, options?) {
  const _effect = new ReactiveEffect(fn)
  if (!options?.lazy) {
    _effect.run()
  }
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
    dep.run()
  })
}