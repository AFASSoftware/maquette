/* globals describe,it */
var maquette = require("../dist/maquette.js");
var assert = require("assert");

describe('Maquette', function () {
  describe('#createCache()', function () {
    it('should execute calculate() on the first invocation', function () {
      var cache = maquette.createCache();
      var calculationCalled = false;
      var calculate = function () {
        calculationCalled = true;
        return "calculation result";
      };
      var result = cache.result([1], calculate);
      assert.equal(true, calculationCalled);
      assert.equal("calculation result", result);
    });

    it('should only execute calculate() on next invocations when the inputs are equal', function () {
      var cache = maquette.createCache();
      var calculationCount = 0;
      var calculate = function () {
        calculationCount++;
        return "calculation result";
      };
      cache.result([1], calculate);
      assert.equal(1, calculationCount);
      var result = cache.result([1], calculate);
      assert.equal(1, calculationCount);
      assert.equal("calculation result", result);
    });

  });
});
