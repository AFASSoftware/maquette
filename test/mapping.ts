import {expect} from './utilities';
import {createMapping, Mapping} from '../src/maquette';

let addAllPermutations = function(results: number[][], result: number[], unusedNumbers: number[], numbersToAdd: number) {
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

let createPermutations = function() {
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

let createTarget = function(source: number) {
  return {
    source: source,
    updateCount: 0
  };
};

let updateTarget = function(source: number, target: Target) {
  expect(source).to.equal(target.source);
  target.updateCount++;
};

let checkInitialMapping = function(results: Target[], sources: number[]) {
  results.forEach(function(target, index) {
    expect(target.source).to.equal(sources[index]);
    expect(target.updateCount).to.equal(0);
  });
};

let checkNextMapping = function(results: Target[], sources: number[], previousSources: number[]) {
  results.forEach(function(target, index) {
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

describe('Mapping', function() {

  it('works correctly for all permutations of 4 items to every other permutation of 4 items', () => {
    let permutations = createPermutations();
    for (let i = 0; i < permutations.length; i++) {
      for (let j = 0; j < permutations.length; j++) {
        let mapping = createMapping(function(key) { return key; }, createTarget, updateTarget);
        mapping.map(permutations[i]);
        checkInitialMapping(mapping.results, permutations[i]);
        mapping.results.forEach(function(target: Target) { target.alreadyPresent = true; });
        // console.log('--> ', permutations[i], permutations[j]);
        mapping.map(permutations[j]);
        checkNextMapping(mapping.results, permutations[j], permutations[i]);

      }
    }
  });

});
