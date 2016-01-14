import {expect} from './utilities';
import {createMapping, Mapping} from '../src/maquette';

var addAllPermutations = function(results: number[][], result: number[], unusedNumbers: number[], numbersToAdd: number) {
  if (numbersToAdd === 0) {
    results.push(result);
  }
  for (var i = 0; i < unusedNumbers.length; i++) {
    var newResult = result.slice();
    newResult.push(unusedNumbers[i]);
    var newUnusedNumbers = unusedNumbers.slice();
    newUnusedNumbers.splice(i, 1);
    addAllPermutations(results, newResult, newUnusedNumbers, numbersToAdd - 1);
  }
};

var createPermutations = function() {
  // returns an array of all possible arrays with numbers 0..4
  var results = [] as number[][];
  for (var length = 0; length <= 4; length++) {
    var unusedNumbers = [0, 1, 2, 3];
    var result = [] as number[];
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

let checkMapping = function(mapping: Mapping<number, Target>, sources: number[]) {
  mapping.results.forEach(function(target, index) {
    expect(target.source).to.equal(sources[index]);
    if (target.alreadyPresent) {
      expect(target.updateCount).to.equal(1);
    } else {
      expect(target.updateCount).to.equal(0);
    }
  });
};

describe("Maquette", function() {
  describe("#createMapping", function() {
    it("works correctly for all permutations of 4 items to every other permutation of 4 items", function() {
      var permutations = createPermutations();
      for (var i = 0; i < permutations.length; i++) {
        for (var j = 0; j < permutations.length; j++) {
          var mapping = createMapping(function(key) { return key; }, createTarget, updateTarget);
          mapping.map(permutations[i]);
          checkMapping(mapping, permutations[i]);
          mapping.results.forEach(function(target: Target) { target.alreadyPresent = true; });
          // console.log("--> ", permutations[i], permutations[j]);
          mapping.map(permutations[j]);
          checkMapping(mapping, permutations[j]);
        }
      }
    });
  });
})
