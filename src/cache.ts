import { CalculationCache } from "./interfaces";

/**
 * Creates a {@link CalculationCache} object, useful for caching {@link VNode} trees.
 * In practice, caching of {@link VNode} trees is not needed, because achieving 60 frames per second is almost never a problem.
 * For more information, see {@link CalculationCache}.
 *
 * @param <Result> The type of the value that is cached.
 */
export let createCache = <Result>(): CalculationCache<Result> => {
  let cachedInputs: unknown[] | undefined;
  let cachedOutcome: Result | undefined;

  return {
    invalidate: () => {
      cachedOutcome = undefined;
      cachedInputs = undefined;
    },

    result: (inputs: unknown[], calculation: () => Result) => {
      if (cachedInputs) {
        for (let i = 0; i < inputs.length; i++) {
          if (cachedInputs[i] !== inputs[i]) {
            cachedOutcome = undefined;
          }
        }
      }
      if (!cachedOutcome) {
        cachedOutcome = calculation();
        cachedInputs = inputs;
      }
      return cachedOutcome;
    },
  };
};
