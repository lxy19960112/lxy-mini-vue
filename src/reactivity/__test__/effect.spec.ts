import { effect, reactive } from "../src";

describe("effect", () => {
  it("should run the passed function once (wrapped by a effect)", () => {
    const fnSpy = jest.fn(() => {});
    effect(fnSpy);
    expect(fnSpy).toHaveBeenCalledTimes(1);
  });

  it("should observe basic properties", () => {
    let dummy;
    const counter = reactive({ num: 0 });
    effect(() => (dummy = counter.num));
    expect(dummy).toBe(0);
    counter.num = 7;
    expect(dummy).toBe(7);
  });

  it("test lazy", () => {
    const fnSpy = jest.fn(() => {});
    effect(fnSpy, {
      lazy: true
    });
    expect(fnSpy).toHaveBeenCalledTimes(0);
  })

  it("it need Reflect change this", () => {
    let obj = {
      _count: 1,
      get count() {
        return this._count
      },
      set count(val) {
        this._count = val
      }
    }
    const state = reactive(obj)
    let count
    effect(() => {
      count = state.count
    })
    expect(count).toBe(1)
    state._count = 2
    expect(count).toBe(2)
  })

  it("test nested effect", () => {
    let state = reactive({
      inner: 'inner',
      outer: 'outer'
    })
    let inner
    let outer
    effect(function fn1() {
      effect(function fn2() {
        inner = state.inner
      })
      outer = state.outer
    })
    expect(inner).toBe('inner')
    expect(outer).toBe('outer')
    state.outer = 'outer2'
    expect(outer).toBe('outer2')
    state.inner = 'inner2'
    expect(inner).toBe('inner2')
  })
})
