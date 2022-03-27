let activeEffect

export function effect (fn, options?) {
  try {
    const effectFn = () => {
      activeEffect = fn
      return fn()
    }
    effectFn()
  } finally {
    // activeEffect = null
  }
}

const targetMap = new WeakMap()
export function track (target, key) {
  let maps = targetMap.get(target)
  if (!maps) {
    targetMap.set(target, (maps = new Map()))
  }
  let deps = maps.get(key)
  if (!deps) {
    maps.set(key, (deps = new Set()))
  }
  console.log('activeEffect :>> ', activeEffect);
  deps.add(activeEffect)
}

export function trigger (target, key) {
  const maps = targetMap.get(target)
  if (!maps) {
    return
  }
  const deps = maps.get(key)
  if (!deps) {
    return
  }
  deps.forEach(dep => {
    dep()
  })
}