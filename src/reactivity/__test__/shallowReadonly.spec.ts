import { effect } from "../src";
import { isReactive, reactive, isReadonly, readonly, shallowReadonly } from "../src/reactive";

describe("shallowReadonly", () => {
  test("should not make non-reactive properties reactive", () => {
    const props = shallowReadonly({ n: { foo: 1 } });
    expect(isReactive(props.n)).toBe(false);
  });
  test('should NOT make nested properties readonly', () => {
    const props = shallowReadonly({ n: { foo: 1 } })
    // @ts-ignore
    props.n.foo = 2
    expect(props.n.foo).toBe(2)
  })
  // test("should differentiate from normal readonly calls", async () => {
  //   const original = { foo: {} };
  //   const shallowProxy = shallowReadonly(original);
  //   const reactiveProxy = readonly(original);
  //   expect(shallowProxy).not.toBe(reactiveProxy);
  //   expect(isReadonly(shallowProxy.foo)).toBe(false);
  //   expect(isReadonly(reactiveProxy.foo)).toBe(true);

  //   const state = shallowReadonly({
  //     foo: 1,
  //     nested: {
  //       bar: 2
  //     }
  //   })
  //   const fn = jest.fn(() => {
  //     state.foo
  //     state.nested.bar
  //   })
  //   effect(fn)
  //   expect(isReadonly(state)).toBe(true);
  //   expect(isReadonly(state.nested)).toBe(false);
  //   expect(isReactive(state.nested)).toBe(true);
  //   expect(fn).toHaveBeenCalledTimes(1);
  //   state.foo++
  //   expect(fn).toHaveBeenCalledTimes(1);
  //   state.nested.bar++
  //   expect(fn).toHaveBeenCalledTimes(2);
  // });
});
