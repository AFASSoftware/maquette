/**
 * A CalculationCache object remembers the previous outcome of a calculation along with the inputs.
 * On subsequent calls the previous outcome is returned if the inputs are identical.
 * This object can be used to bypass both rendering and diffing of a virtual DOM subtree.
 * Instances of CalculationCache can be created using [[createCache]].
 *
 * @param <Result> The type of the value that is cached.
 */
export interface CalculationCache<Result> {
  /**
   * Manually invalidates the cached outcome.
   */
  invalidate(): void;
  /**
   * If the inputs array matches the inputs array from the previous invocation, this method returns the result of the previous invocation.
   * Otherwise, the calculation function is invoked and its result is cached and returned.
   * Objects in the inputs array are compared using ===.
   * @param inputs - Array of objects that are to be compared using === with the inputs from the previous invocation.
   * These objects are assumed to be immutable primitive values.
   * @param calculation - Function that takes zero arguments and returns an object (A [[VNode]] presumably) that can be cached.
   */
  result(inputs: Object[], calculation: () => Result): Result;
}

/**
 * Creates a [[CalculationCache]] object, useful for caching [[VNode]] trees.
 * In practice, caching of [[VNode]] trees is not needed, because achieving 60 frames per second is almost never a problem.
 * For more information, see [[CalculationCache]].
 *
 * @param <Result> The type of the value that is cached.
 */
export let createCache = <Result>(): CalculationCache<Result> => {
  let cachedInputs: Object[] | undefined;
  let cachedOutcome: Result | undefined;

  return {
    invalidate: () => {
      cachedOutcome = undefined;
      cachedInputs = undefined;
    },

    result: (inputs: Object[], calculation: () => Result) => {
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
    }
  };
};
