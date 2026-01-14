import { vi, expect } from "vitest";
export { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

type MockFn = ReturnType<typeof vi.fn>;

export const sinon = {
  spy: (implementation?: (...args: any[]) => any): MockFn => {
    const fn = vi.fn(implementation);
    // Add sinon-like methods
    Object.defineProperty(fn, "lastCall", {
      get() {
        const calls = fn.mock.calls;
        if (calls.length === 0) return undefined;
        const args = calls[calls.length - 1];
        return {
          args,
          callArg: (n: number) => {
            if (typeof args[n] === "function") args[n]();
          },
        };
      },
    });
    Object.defineProperty(fn, "getCalls", {
      value: () =>
        fn.mock.calls.map((args) => ({
          args,
        })),
    });
    (fn as any).resetHistory = () => fn.mockClear();
    (fn as any).callArg = (n: number) => {
      const calls = fn.mock.calls;
      if (calls.length > 0) {
        const args = calls[calls.length - 1];
        if (typeof args[n] === "function") args[n]();
      }
    };
    (fn as any).yield = (...yielded: any[]) => {
      const calls = fn.mock.calls;
      if (calls.length > 0) {
        for (const args of calls) {
          if (typeof args[0] === "function") args[0](...yielded);
        }
      }
    };
    return fn;
  },
  stub: (): MockFn => {
    const fn = vi.fn() as any;
    fn.returns = (value: any) => {
      fn.mockReturnValue(value);
      return fn;
    };
    fn.throws = (error: any) => {
      fn.mockImplementation(() => {
        throw typeof error === "string" ? new Error(error) : error;
      });
      return fn;
    };
    fn.resetHistory = () => fn.mockClear();
    fn.callArg = (n: number) => {
      const calls = fn.mock.calls;
      if (calls.length > 0) {
        const args = calls[calls.length - 1];
        if (typeof args[n] === "function") args[n]();
      }
    };
    Object.defineProperty(fn, "lastCall", {
      get() {
        const calls = fn.mock.calls;
        if (calls.length === 0) return undefined;
        const args = calls[calls.length - 1];
        return {
          args,
          callArg: (n: number) => {
            if (typeof args[n] === "function") args[n]();
          },
        };
      },
    });
    return fn;
  },
  useFakeTimers: (): { tick: (ms: number) => void; restore: () => void } => {
    vi.useFakeTimers();
    return {
      tick: (ms: number) => vi.advanceTimersByTime(ms),
      restore: () => vi.useRealTimers(),
    };
  },
  match: (matcher: any): any => {
    if (typeof matcher === "object") {
      return expect.objectContaining(matcher);
    }
    return expect.anything();
  },
};

export { vi };
