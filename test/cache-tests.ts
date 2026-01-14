import { createCache } from "../src/index";
import { describe, expect, it, vi } from "./test-utilities";

describe("Cache", () => {
  it("should execute calculate() on the first invocation", () => {
    let cache = createCache();
    let calculate = vi.fn().mockReturnValue("calculation result");
    let result = cache.result([1], calculate);
    expect(calculate).toHaveBeenCalledTimes(1);
    expect(result).toBe("calculation result");
  });

  it("should only execute calculate() on next invocations when the inputs are different", () => {
    let cache = createCache();
    let calculate = vi.fn().mockReturnValue("calculation result");
    cache.result([1], calculate);
    expect(calculate).toHaveBeenCalledTimes(1);
    cache.result([1], calculate);
    expect(calculate).toHaveBeenCalledTimes(1);
    cache.result([2], calculate);
    expect(calculate).toHaveBeenCalledTimes(2);
  });

  it("can handle any inputs", () => {
    let cache = createCache();
    let calculate = vi.fn().mockReturnValue("calculation result");
    let cacheKey1: boolean | string | null | undefined;
    cache.result([cacheKey1, 1], calculate);
    expect(calculate).toHaveBeenCalledTimes(1);
    cache.result([cacheKey1, 1], calculate);
    expect(calculate).toHaveBeenCalledTimes(1);
    cacheKey1 = false;
    cache.result([cacheKey1, 1], calculate);
    expect(calculate).toHaveBeenCalledTimes(2);
  });

  it("can be invalidated manually", () => {
    let cache = createCache();
    let calculate = vi.fn().mockReturnValue("calculation result");
    cache.result([1], calculate);
    cache.invalidate();
    cache.result([1], calculate);
    expect(calculate).toHaveBeenCalledTimes(2);
  });
});
