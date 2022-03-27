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
})
