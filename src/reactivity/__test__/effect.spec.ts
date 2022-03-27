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

  it('test nested set', () => {
    let state = reactive({
      count: 1
    })
    let _count
    effect(() => {
      state.count++
      _count = state.count
    })
    expect(state.count).toBe(2)
  })

  it("should observe multiple properties", () => {
    let dummy;
    const counter = reactive({ num1: 0, num2: 0 });
    effect(() => (dummy = counter.num1 + counter.num1 + counter.num2));

    expect(dummy).toBe(0);
    counter.num1 = counter.num2 = 7;
    expect(dummy).toBe(21);
  });

  it("should handle multiple effects", () => {
    let dummy1, dummy2;
    const counter = reactive({ num: 0 });
    effect(() => (dummy1 = counter.num));
    effect(() => (dummy2 = counter.num));

    expect(dummy1).toBe(0);
    expect(dummy2).toBe(0);
    counter.num++;
    expect(dummy1).toBe(1);
    expect(dummy2).toBe(1);
  });

  it('same value', () => {
    const state = reactive({
      value: 1
    })
    let count = 1
    effect(() => {
      state.value
      count++
    })
    expect(count).toBe(2)
    state.value = 1
    expect(count).toBe(2)
  })

  it("should observe multiple properties", () => {
    let dummy;
    const counter = reactive({ num1: 0, num2: 0 });
    effect(() => (dummy = counter.num1 + counter.num1 + counter.num2));

    expect(dummy).toBe(0);
    counter.num1 = counter.num2 = 7;
    expect(dummy).toBe(21);
  });

  it("should observe nested properties", () => {
    let dummy;
    const counter = reactive({ nested: { num: 0 } });
    effect(() => (dummy = counter.nested.num));

    expect(dummy).toBe(0);
    counter.nested.num = 8;
    expect(dummy).toBe(8);
  });

  it("should observe function call chains", () => {
    let dummy;
    const counter = reactive({ num: 0 });
    effect(() => (dummy = getNum()));

    function getNum() {
      return counter.num;
    }

    expect(dummy).toBe(0);
    counter.num = 2;
    expect(dummy).toBe(2);
  });

  it('lazy', () => {
    const fnSpy = jest.fn(() => {});
    effect(fnSpy, {
      lazy: true
    });
    expect(fnSpy).toHaveBeenCalledTimes(0);

    const obj = reactive({ foo: 1 })
    let dummy
    const runner = effect(() => (dummy = obj.foo), { lazy: true })
    expect(dummy).toBe(undefined)
    expect(runner()).toBe(1)
    expect(dummy).toBe(1)
    obj.foo = 2
    expect(dummy).toBe(2)
  })

  it('clean up', () => {
    const state = reactive({
      flag: true,
      value: 1
    })
    let count = 1
    effect(() => {
      state.flag ? state.value : 'ok'
      count++
    })
    expect(count).toBe(2)
    state.flag = false
    expect(count).toBe(3)
    state.value = 5
    expect(count).toBe(3)
  })
})
