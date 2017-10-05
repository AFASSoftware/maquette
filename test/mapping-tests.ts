import { expect } from './test-utilities';
import { createMapping } from '../src/index';

let addAllPermutations = (results: number[][], result: number[], unusedNumbers: number[], numbersToAdd: number) => {
  if (numbersToAdd === 0) {
    results.push(result);
  }
  for (let i = 0; i < unusedNumbers.length; i++) {
    let newResult = result.slice();
    newResult.push(unusedNumbers[i]);
    let newUnusedNumbers = unusedNumbers.slice();
    newUnusedNumbers.splice(i, 1);
    addAllPermutations(results, newResult, newUnusedNumbers, numbersToAdd - 1);
  }
};

let createPermutations = () => {
  // returns an array of all possible arrays with numbers 0..4
  let results = [] as number[][];
  for (let length = 0; length <= 4; length++) {
    let unusedNumbers = [0, 1, 2, 3];
    let result = [] as number[];
    addAllPermutations(results, result, unusedNumbers, length);
  }
  return results;
};

interface Target {
  source: number;
  updateCount: number;
  alreadyPresent?: boolean;
}

let createTarget = (source: number) => {
  return {
    source: source,
    updateCount: 0,
    alreadyPresent: undefined as boolean | undefined
  };
};

let updateTarget = (source: number, target: Target) => {
  expect(source).to.equal(target.source);
  target.updateCount++;
};

let checkInitialMapping = (results: Target[], sources: number[]) => {
  results.forEach((target, index) => {
    expect(target.source).to.equal(sources[index]);
    expect(target.updateCount).to.equal(0);
  });
};

let checkNextMapping = (results: Target[], sources: number[], previousSources: number[]) => {
  results.forEach((target, index) => {
    expect(target.source).to.equal(sources[index]);
    if (previousSources.indexOf(target.source) >= 0) {
      expect(target.alreadyPresent).to.be.true;
      expect(target.updateCount).to.equal(1);
    } else {
      expect(target.alreadyPresent).to.be.undefined;
      expect(target.updateCount).to.equal(0);
    }
  });
};

describe('Mapping', () => {
  it('works correctly for all permutations of 4 items to every other permutation of 4 items', () => {
    let permutations = createPermutations();
    for (let permutationI of permutations) {
      for (let permutationJ of permutations) {
        let mapping = createMapping(key => key, createTarget, updateTarget);
        mapping.map(permutationI);
        checkInitialMapping(mapping.results, permutationI);
        mapping.results.forEach(target => { target.alreadyPresent = true; });
        // console.log('--> ', permutations[i], permutations[j]);
        mapping.map(permutationJ);
        checkNextMapping(mapping.results, permutationJ, permutationI);
      }
    }
  });

});
