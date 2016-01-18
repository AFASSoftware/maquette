/* globals describe,it */
import {createCache} from '../src/maquette';
import {expect} from './utilities';

describe('Cache', function() {

  it('should execute calculate() on the first invocation', function() {
    let cache = createCache();
    let calculationCalled = false;
    let calculate = function() {
      calculationCalled = true;
      return 'calculation result';
    };
    let result = cache.result([1], calculate);
    expect(calculationCalled).to.be.true;
    expect(result).to.equal('calculation result');
  });

  it('should only execute calculate() on next invocations when the inputs are equal', function() {
    let cache = createCache();
    let calculationCount = 0;
    let calculate = function() {
      calculationCount++;
      return 'calculation result';
    };
    cache.result([1], calculate);
    expect(calculationCount).to.equal(1);
    let result = cache.result([1], calculate);
    expect(calculationCount).to.equal(1);
    expect(result).to.equal('calculation result');
  });

});
