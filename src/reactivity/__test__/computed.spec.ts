import { computed, reactive, ref, effect, isReadonly } from "../src";

describe("computed", () => {
  it("happy path", () => {
    const fn = jest.fn(() => {})
    const compute = computed(fn)
    expect(fn).not.toHaveBeenCalled()

    let count = 1
    const foo = reactive({
      value: 1
    })
    const getter = computed(() => {
      count++
      return foo.value
    })
    expect(count).toBe(1)
    expect(getter.value).toBe(1)
    expect(count).toBe(2)
  });

  it("should compute lazily", () => {
    const value = reactive({
      foo: 1,
    });
    const getter = jest.fn(() => {
      return value.foo;
    });
    const cValue = computed(getter);

    // lazy
    expect(getter).not.toHaveBeenCalled();

    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);

    // // should not compute again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(1);

    // should not compute until needed
    value.foo = 2;
    expect(getter).toHaveBeenCalledTimes(1);

    // now it should compute
    expect(cValue.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);

    // should not compute again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(2);
  });

  it("nested effect", () => {
    const foo = ref(1)
    const getter = jest.fn(() => {
      return foo.value
    })
    const cFoo = computed(getter)
    expect(getter).not.toHaveBeenCalled()
    cFoo.value
    expect(getter).toHaveBeenCalledTimes(1)

    const fn = jest.fn(() => {
      cFoo.value
    })
    effect(fn)
    expect(fn).toHaveBeenCalledTimes(1)
    foo.value++
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should support setter', () => {
    const n = ref(1)
    const plusOne = computed({
      get: () => n.value + 1,
      set: val => {
        n.value = val - 1
      }
    })

    expect(plusOne.value).toBe(2)
    n.value++
    expect(plusOne.value).toBe(3)

    plusOne.value = 0
    expect(n.value).toBe(-1)
  })

  it('should be readonly', () => {
    let a = { a: 1 }
    const x = computed(() => a)
    expect(isReadonly(x)).toBe(true)
    expect(isReadonly(x.value)).toBe(false)
    expect(isReadonly(x.value.a)).toBe(false)
    const z = computed({
      get() {
        return a
      },
      set(v) {
        a = v
      }
    })
    expect(isReadonly(z)).toBe(false)
    expect(isReadonly(z.value.a)).toBe(false)
  })
})